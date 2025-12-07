import { Token, TokenType } from './lexer';
import * as AST from './ast';

export class Parser {
  private tokens: Token[];
  private position: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private current(): Token {
    return this.tokens[this.position];
  }

  private peek(offset: number = 1): Token {
    return this.tokens[this.position + offset];
  }

  private advance(): Token {
    return this.tokens[this.position++];
  }

  private expect(type: TokenType): Token {
    const token = this.current();
    if (token.type !== type) {
      throw new Error(
        `Expected ${type} but got ${token.type} at line ${token.line}, column ${token.column}`
      );
    }
    return this.advance();
  }

  private match(...types: TokenType[]): boolean {
    return types.includes(this.current().type);
  }

  public parse(): AST.ProgramNode {
    const body: AST.ASTNode[] = [];

    while (!this.match(TokenType.EOF)) {
      body.push(this.parseStatement());
    }

    return { type: 'Program', body };
  }

  private parseStatement(): AST.ASTNode {
    // Variable/Function declaration with @
    if (this.match(TokenType.AT)) {
      return this.parseDeclaration();
    }

    // Export declaration with #
    if (this.match(TokenType.HASH)) {
      return this.parseExportDeclaration();
    }

    // Subscribe with %
    if (this.match(TokenType.PERCENT)) {
      return this.parseSubscribe();
    }

    // Trigger with &
    if (this.match(TokenType.AMPERSAND)) {
      return this.parseTrigger();
    }

    // Expression statement (must end with semicolon in block context)
    const expr = this.parseExpression();
    if (this.match(TokenType.SEMICOLON)) {
      this.advance();
    }
    return expr;
  }

  private parseDeclaration(): AST.ASTNode {
    this.advance(); // consume @

    const name = this.expect(TokenType.IDENTIFIER).value;
    
    // Check for multiple variable declarations: @var1, @var2, @var3
    const names: string[] = [name];
    while (this.match(TokenType.COMMA)) {
      this.advance(); // consume ,
      this.expect(TokenType.AT); // expect @ before each additional name
      names.push(this.expect(TokenType.IDENTIFIER).value);
    }

    // Check if this is a function declaration by looking ahead for =>
    // We need to scan ahead to see if there's an arrow before a semicolon
    const savedPosition = this.position;
    let isFunction = false;
    
    // Only single names can be functions
    if (names.length === 1 && this.match(TokenType.IDENTIFIER)) {
      // Skip potential parameters
      while (this.match(TokenType.IDENTIFIER) || this.match(TokenType.COMMA) || this.match(TokenType.COLON)) {
        this.advance();
      }
      
      if (this.match(TokenType.ARROW)) {
        isFunction = true;
      }
    }
    
    // Restore position
    this.position = savedPosition;
    
    if (isFunction) {
      // Function declaration
      const params = this.parseParameters();
      this.advance(); // consume =>
      const { body, returnValues } = this.parseFunctionBody();
      this.expect(TokenType.SEMICOLON);

      return {
        type: 'FunctionDeclaration',
        name,
        parameters: params,
        body,
        returnValues,
      };
    } else {
      // Variable declaration with value expression
      const value = this.parseExpression();
      this.expect(TokenType.SEMICOLON);

      if (names.length > 1) {
        // Multiple variable declaration (destructuring)
        return {
          type: 'VariableDeclaration',
          name: names[0],  // Keep first name for backwards compatibility
          names,
          value,
        };
      } else {
        // Single variable declaration
        return {
          type: 'VariableDeclaration',
          name,
          value,
        };
      }
    }
  }

  private parseExportDeclaration(): AST.ASTNode {
    this.advance(); // consume #

    const moduleName = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.AT);

    const name = this.expect(TokenType.IDENTIFIER).value;
    const params = this.parseParameters();

    if (this.match(TokenType.ARROW)) {
      // Function export
      this.advance(); // consume =>
      const { body, returnValues } = this.parseFunctionBody();
      this.expect(TokenType.SEMICOLON);

      return {
        type: 'FunctionDeclaration',
        name,
        parameters: params,
        body,
        returnValues,
        exports: moduleName,
      };
    } else {
      // Variable export
      const value = this.parseExpression();
      this.expect(TokenType.SEMICOLON);

      return {
        type: 'VariableDeclaration',
        name,
        value,
        exports: moduleName,
      };
    }
  }

  private parseParameters(): AST.ParameterNode[] {
    const params: AST.ParameterNode[] = [];

    while (!this.match(TokenType.ARROW, TokenType.SEMICOLON, TokenType.EOF)) {
      const paramName = this.expect(TokenType.IDENTIFIER).value;

      let typeAnnotation: AST.TypeAnnotationNode | undefined;
      if (this.match(TokenType.COLON)) {
        this.advance(); // consume :
        typeAnnotation = this.parseTypeAnnotation();
      }

      params.push({
        type: 'Parameter',
        name: paramName,
        typeAnnotation,
      });

      if (this.match(TokenType.COMMA)) {
        this.advance(); // consume ,
      } else {
        break;
      }
    }

    return params;
  }

  private parseTypeAnnotation(): AST.TypeAnnotationNode {
    const name = this.expect(TokenType.IDENTIFIER).value;
    return { type: 'TypeAnnotation', name };
  }

  private parseFunctionBody(): { body: AST.ASTNode; returnValues: AST.ASTNode[] } {
    if (this.match(TokenType.LBRACE)) {
      // Multi-line block
      this.advance(); // consume {
      const statements: AST.ASTNode[] = [];

      while (!this.match(TokenType.RBRACE)) {
        statements.push(this.parseStatement());
      }

      this.advance(); // consume }

      // Last statement is the return value(s)
      const lastStmt = statements[statements.length - 1];
      const body: AST.BlockExpressionNode = {
        type: 'BlockExpression',
        body: statements,
      };

      return { body, returnValues: [lastStmt] };
    } else {
      // Single expression, possibly multiple return values
      const returnValues: AST.ASTNode[] = [];

      returnValues.push(this.parseExpression());

      // Check for multiple return values
      while (this.match(TokenType.COMMA) && !this.match(TokenType.SEMICOLON)) {
        this.advance(); // consume ,
        if (!this.match(TokenType.SEMICOLON)) {
          returnValues.push(this.parseExpression());
        }
      }

      return { body: returnValues[0], returnValues };
    }
  }

  private parseExpression(): AST.ASTNode {
    return this.parseComparison();
  }

  private parseComparison(): AST.ASTNode {
    let left = this.parseAdditive();

    while (this.match(TokenType.EQUALS, TokenType.NOT_EQUALS, TokenType.GT, TokenType.LT, TokenType.GTE, TokenType.LTE)) {
      const operator = this.advance().value;
      const right = this.parseAdditive();
      left = {
        type: 'BinaryExpression',
        operator,
        left,
        right,
      };
    }

    return left;
  }

  private parseAdditive(): AST.ASTNode {
    let left = this.parseMultiplicative();

    while (this.match(TokenType.PLUS, TokenType.MINUS)) {
      const operator = this.advance().value;
      const right = this.parseMultiplicative();
      left = {
        type: 'BinaryExpression',
        operator,
        left,
        right,
      };
    }

    return left;
  }

  private parseMultiplicative(): AST.ASTNode {
    let left = this.parseUnary();

    while (this.match(TokenType.ASTERISK, TokenType.SLASH)) {
      const operator = this.advance().value;
      const right = this.parseUnary();
      left = {
        type: 'BinaryExpression',
        operator,
        left,
        right,
      };
    }

    return left;
  }

  private parseUnary(): AST.ASTNode {
    // Await with $
    if (this.match(TokenType.DOLLAR)) {
      this.advance(); // consume $
      const argument = this.parsePostfix();
      return {
        type: 'AwaitExpression',
        argument,
      };
    }

    // Recursion with *
    if (this.match(TokenType.ASTERISK)) {
      this.advance(); // consume *
      const argument = this.parsePostfix();
      return {
        type: 'UnaryExpression',
        operator: '*',
        argument,
      };
    }

    return this.parsePostfix();
  }

  private parsePostfix(): AST.ASTNode {
    let expr = this.parsePrimary();

    while (true) {
      // Member access with .
      if (this.match(TokenType.DOT)) {
        this.advance(); // consume .
        const property = this.expect(TokenType.IDENTIFIER).value;
        expr = {
          type: 'MemberExpression',
          object: expr,
          property,
        };
      }
      // Function call with (
      else if (this.match(TokenType.LPAREN)) {
        this.advance(); // consume (
        const args: AST.ASTNode[] = [];

        if (!this.match(TokenType.RPAREN)) {
          args.push(this.parseExpression());
          
          while (this.match(TokenType.COMMA)) {
            this.advance(); // consume ,
            if (!this.match(TokenType.RPAREN)) {
              args.push(this.parseExpression());
            }
          }
        }

        this.expect(TokenType.RPAREN);
        expr = {
          type: 'CallExpression',
          callee: expr,
          arguments: args,
        };
      } else {
        break;
      }
    }

    return expr;
  }

  private parsePrimary(): AST.ASTNode {
    // Literals
    if (this.match(TokenType.NUMBER)) {
      const token = this.advance();
      return {
        type: 'Literal',
        value: parseFloat(token.value),
        raw: token.value,
      };
    }

    if (this.match(TokenType.STRING)) {
      const token = this.advance();
      return {
        type: 'Literal',
        value: token.value,
        raw: `"${token.value}"`,
      };
    }

    if (this.match(TokenType.TRUE, TokenType.FALSE)) {
      const token = this.advance();
      return {
        type: 'Literal',
        value: token.value === 'true',
        raw: token.value,
      };
    }

    if (this.match(TokenType.NULL)) {
      const token = this.advance();
      return {
        type: 'Literal',
        value: null,
        raw: token.value,
      };
    }

    // Array
    if (this.match(TokenType.LBRACKET)) {
      return this.parseArrayOrMap();
    }

    // Grouped expression or multi-parameter lambda
    if (this.match(TokenType.LPAREN)) {
      this.advance(); // consume (
      
      // Check if this is a lambda: (params) => body
      if (this.match(TokenType.IDENTIFIER)) {
        const savedPos = this.position;
        const firstName = this.advance().value;
        
        // Check for lambda pattern: (id, id, ...) =>
        if (this.match(TokenType.COMMA) || (this.match(TokenType.RPAREN) && this.peek().type === TokenType.ARROW)) {
          // This looks like a lambda
          this.position = savedPos;
          const params: AST.ParameterNode[] = [];
          
          // Parse all parameters
          if (!this.match(TokenType.RPAREN)) {
            params.push({ type: 'Parameter', name: this.expect(TokenType.IDENTIFIER).value });
            
            while (this.match(TokenType.COMMA)) {
              this.advance(); // consume ,
              params.push({ type: 'Parameter', name: this.expect(TokenType.IDENTIFIER).value });
            }
          }
          
          this.expect(TokenType.RPAREN);
          this.expect(TokenType.ARROW);
          const body = this.parseExpression();
          
          return {
            type: 'LambdaExpression',
            parameters: params,
            body,
          };
        } else {
          // Just a grouped expression
          this.position = savedPos;
          const expr = this.parseExpression();
          this.expect(TokenType.RPAREN);
          return expr;
        }
      } else if (this.match(TokenType.RPAREN) && this.peek().type === TokenType.ARROW) {
        // Zero-parameter lambda: () => body
        this.advance(); // consume )
        this.expect(TokenType.ARROW);
        const body = this.parseExpression();
        return {
          type: 'LambdaExpression',
          parameters: [],
          body,
        };
      } else {
        // Regular grouped expression
        const expr = this.parseExpression();
        this.expect(TokenType.RPAREN);
        return expr;
      }
    }

    // Block expression
    if (this.match(TokenType.LBRACE)) {
      this.advance(); // consume {
      const body: AST.ASTNode[] = [];

      while (!this.match(TokenType.RBRACE)) {
        body.push(this.parseStatement());
      }

      this.advance(); // consume }
      return {
        type: 'BlockExpression',
        body,
      };
    }

    // Single-parameter lambda or Identifier  
    if (this.match(TokenType.IDENTIFIER)) {
      // Look ahead to check if this is a single-param lambda: x => body
      const savedPosition = this.position;
      const name = this.advance().value;
      
      if (this.match(TokenType.ARROW)) {
        // Single parameter lambda: x => body
        this.advance(); // consume =>
        const body = this.parseExpression();
        return {
          type: 'LambdaExpression',
          parameters: [{ type: 'Parameter', name }],
          body,
        };
      } else {
        // Just an identifier
        this.position = savedPosition;
        const token = this.advance();
        return {
          type: 'Identifier',
          name: token.value,
        };
      }
    }

    const token = this.current();
    throw new Error(
      `Unexpected token ${token.type} at line ${token.line}, column ${token.column}`
    );
  }

  private parseArrayOrMap(): AST.ASTNode {
    this.advance(); // consume [

    // Check if empty
    if (this.match(TokenType.RBRACKET)) {
      this.advance();
      return { type: 'ArrayExpression', elements: [] };
    }

    // Look ahead to determine if it's a map or array
    // Map: [ key: value, ... ]
    // Array: [ value, ... ]
    const firstExpr = this.parseExpression();

    if (this.match(TokenType.COLON)) {
      // It's a map
      this.advance(); // consume :
      const firstValue = this.parseExpression();

      const properties: { key: string; value: AST.ASTNode }[] = [];

      // First key must be an identifier
      if (firstExpr.type !== 'Identifier') {
        throw new Error('Map keys must be identifiers');
      }
      properties.push({ key: firstExpr.name, value: firstValue });

      while (this.match(TokenType.COMMA)) {
        this.advance(); // consume ,
        if (this.match(TokenType.RBRACKET)) break;

        const keyExpr = this.parseExpression();
        if (keyExpr.type !== 'Identifier') {
          throw new Error('Map keys must be identifiers');
        }
        this.expect(TokenType.COLON);
        const valueExpr = this.parseExpression();

        properties.push({ key: keyExpr.name, value: valueExpr });
      }

      this.expect(TokenType.RBRACKET);
      return { type: 'MapExpression', properties };
    } else {
      // It's an array
      const elements: AST.ASTNode[] = [firstExpr];

      while (this.match(TokenType.COMMA)) {
        this.advance(); // consume ,
        if (this.match(TokenType.RBRACKET)) break;
        elements.push(this.parseExpression());
      }

      this.expect(TokenType.RBRACKET);
      return { type: 'ArrayExpression', elements };
    }
  }

  private parseSubscribe(): AST.ASTNode {
    this.advance(); // consume %
    const name = this.expect(TokenType.IDENTIFIER).value;

    // Parse handler parameters
    const params = this.parseParameters();
    this.expect(TokenType.ARROW);
    const { body } = this.parseFunctionBody();
    this.expect(TokenType.SEMICOLON);

    const handler: AST.FunctionDeclarationNode = {
      type: 'FunctionDeclaration',
      name: '__handler',
      parameters: params,
      body,
      returnValues: [body],
    };

    return {
      type: 'SubscribeExpression',
      name,
      handler,
    };
  }

  private parseTrigger(): AST.ASTNode {
    this.advance(); // consume &
    const name = this.expect(TokenType.IDENTIFIER).value;
    const value = this.parseExpression();
    this.expect(TokenType.SEMICOLON);

    return {
      type: 'TriggerExpression',
      name,
      value,
    };
  }
}
