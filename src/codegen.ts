import * as AST from './ast';

export class CodeGenerator {
  private indentLevel: number = 0;
  private functionDepth: number = 0;
  private currentFunctionName: string = '';

  private indent(): string {
    return '  '.repeat(this.indentLevel);
  }

  public generate(node: AST.ProgramNode): string {
    let code = '';
    
    // Import runtime library with commonly used functions
    code += `const { funcy } = require('../dist/runtime');\n`;
    code += `const { exists, log, map, filter, reduce, length, at, append } = funcy;\n`;
    code += `const Map = funcy.Map;\n`;
    code += `const String = funcy.String;\n`;
    code += `const Array = funcy.Array;\n`;
    code += `const Number = funcy.Number;\n`;
    code += `const IO = funcy.IO;\n`;
    code += `const { z } = require('zod');\n\n`;
    
    // Check if any top-level statement uses await
    const hasTopLevelAsync = node.body.some(stmt => this.containsAwait(stmt));
    
    // Generate body
    let bodyCode = '';
    for (const statement of node.body) {
      bodyCode += this.generateStatement(statement);
    }
    
    // Wrap in async IIFE if needed
    if (hasTopLevelAsync) {
      code += `(async function() {\n`;
      code += bodyCode;
      code += `})().catch(err => { console.error(err); process.exit(1); });\n`;
    } else {
      code += bodyCode;
    }
    
    return code;
  }

  private generateStatement(node: AST.ASTNode): string {
    switch (node.type) {
      case 'VariableDeclaration':
        return this.generateVariableDeclaration(node);
      case 'FunctionDeclaration':
        return this.generateFunctionDeclaration(node);
      case 'ImportDeclaration':
        return this.generateImportDeclaration(node);
      case 'CallExpression':
      case 'BinaryExpression':
      case 'Identifier':
      case 'Literal':
      case 'ArrayExpression':
      case 'MapExpression':
      case 'BlockExpression':
      case 'IfExpression':
      case 'AwaitExpression':
      case 'MemberExpression':
      case 'UnaryExpression':
        return this.indent() + this.generateExpression(node) + ';\n';
      case 'SubscribeExpression':
        return this.generateSubscribe(node);
      case 'TriggerExpression':
        return this.generateTrigger(node);
      default:
        throw new Error(`Unknown statement type: ${(node as any).type}`);
    }
  }

  private generateVariableDeclaration(node: AST.VariableDeclarationNode): string {
    const value = this.generateExpression(node.value);
    
    // Handle multiple variable declarations (destructuring)
    if (node.names && node.names.length > 1) {
      const names = node.names.join(', ');
      return this.indent() + `const [${names}] = ${value};\n`;
    }
    
    if (node.exports) {
      return this.indent() + `const ${node.name} = ${value};\nmodule.exports.${node.name} = ${node.name};\n`;
    }
    
    return this.indent() + `const ${node.name} = ${value};\n`;
  }

  private generateFunctionDeclaration(node: AST.FunctionDeclarationNode): string {
    const oldFunctionName = this.currentFunctionName;
    this.currentFunctionName = node.name;
    this.functionDepth++;

    const params = node.parameters.map(p => p.name).join(', ');
    
    // Generate type validation code if parameters have type annotations
    const hasTypes = node.parameters.some(p => p.typeAnnotation);
    let typeValidation = '';
    
    if (hasTypes) {
      typeValidation = this.generateTypeValidation(node.parameters);
    }
    
    let body: string;
    
    // Check if function uses recursion
    const usesRecursion = this.containsRecursion(node.body);
    
    if (usesRecursion) {
      // Generate optimized recursive function with while loop
      body = typeValidation + this.generateRecursiveFunction(node);
    } else {
      // Generate normal function
      if (node.returnValues.length > 1) {
        // Multiple return values
        const returns = node.returnValues.map(r => this.generateExpression(r)).join(', ');
        body = typeValidation + `  return [${returns}];\n`;
      } else {
        const returnExpr = this.generateExpression(node.body);
        body = typeValidation + `  return ${returnExpr};\n`;
      }
    }

    this.functionDepth--;
    this.currentFunctionName = oldFunctionName;

    // Check if function contains await expressions
    const isAsync = this.containsAwait(node.body);
    const asyncKeyword = isAsync ? 'async ' : '';

    const funcCode = `${this.indent()}const ${node.name} = ${asyncKeyword}function(${params}) {\n${body}${this.indent()}};\n`;
    
    if (node.exports) {
      return funcCode + `module.exports.${node.name} = ${node.name};\n`;
    }
    
    return funcCode;
  }

  private containsRecursion(node: AST.ASTNode): boolean {
    if (node.type === 'UnaryExpression' && node.operator === '*') {
      return true;
    }
    
    // Recursively check children
    switch (node.type) {
      case 'BinaryExpression':
        return this.containsRecursion(node.left) || this.containsRecursion(node.right);
      case 'CallExpression':
        return this.containsRecursion(node.callee) || node.arguments.some(arg => this.containsRecursion(arg));
      case 'BlockExpression':
        return node.body.some(stmt => this.containsRecursion(stmt));
      case 'IfExpression':
        return this.containsRecursion(node.condition) || 
               this.containsRecursion(node.consequent) || 
               (node.alternate ? this.containsRecursion(node.alternate) : false);
      case 'ArrayExpression':
        return node.elements.some(el => this.containsRecursion(el));
      case 'MapExpression':
        return node.properties.some(prop => this.containsRecursion(prop.value));
      default:
        return false;
    }
  }

  private containsAwait(node: AST.ASTNode): boolean {
    if (node.type === 'AwaitExpression') {
      return true;
    }
    
    // Recursively check children
    switch (node.type) {
      case 'VariableDeclaration':
        return this.containsAwait(node.value);
      case 'BinaryExpression':
        return this.containsAwait(node.left) || this.containsAwait(node.right);
      case 'UnaryExpression':
        return this.containsAwait(node.argument);
      case 'CallExpression':
        return this.containsAwait(node.callee) || node.arguments.some(arg => this.containsAwait(arg));
      case 'BlockExpression':
        return node.body.some(stmt => this.containsAwait(stmt));
      case 'IfExpression':
        return this.containsAwait(node.condition) || 
               this.containsAwait(node.consequent) || 
               (node.alternate ? this.containsAwait(node.alternate) : false);
      case 'ArrayExpression':
        return node.elements.some(el => this.containsAwait(el));
      case 'MapExpression':
        return node.properties.some(prop => this.containsAwait(prop.value));
      case 'MemberExpression':
        return this.containsAwait(node.object);
      case 'LambdaExpression':
        return this.containsAwait(node.body);
      default:
        return false;
    }
  }

  private generateRecursiveFunction(node: AST.FunctionDeclarationNode): string {
    // Convert recursive calls to while loop with parameter reassignment
    const params = node.parameters.map(p => p.name);
    
    let body = `  while (true) {\n`;
    this.indentLevel += 2;
    
    // Generate body with recursion converted to parameter updates
    body += this.generateRecursiveBody(node.body, params);
    
    this.indentLevel -= 2;
    body += `  }\n`;
    
    return body;
  }

  private generateRecursiveBody(node: AST.ASTNode, params: string[]): string {
    if (node.type === 'IfExpression') {
      const condition = this.generateExpression(node.condition);
      
      this.indentLevel++;
      const consequent = this.generateRecursiveBodyContent(node.consequent, params);
      const alternate = node.alternate ? 
        this.generateRecursiveBodyContent(node.alternate, params) :
        `${this.indent()}return null;\n`;
      this.indentLevel--;
      
      return `${this.indent()}if (${condition}) {\n${consequent}${this.indent()}} else {\n${alternate}${this.indent()}}\n`;
    }
    
    return this.generateRecursiveBodyContent(node, params);
  }

  private generateRecursiveBodyContent(node: AST.ASTNode, params: string[]): string {
    if (node.type === 'CallExpression' && this.isRecursiveCall(node)) {
      // Convert recursive call to parameter update
      const args = node.arguments.map(arg => this.generateExpression(arg));
      let code = '';
      
      for (let i = 0; i < params.length && i < args.length; i++) {
        code += `${this.indent()}${params[i]} = ${args[i]};\n`;
      }
      
      code += `${this.indent()}continue;\n`;
      return code;
    }
    
    // Base case - return value
    const value = this.generateExpression(node);
    return `${this.indent()}return ${value};\n`;
  }

  private isRecursiveCall(node: AST.CallExpressionNode): boolean {
    if (node.callee.type === 'UnaryExpression' && node.callee.operator === '*') {
      return true;
    }
    if (node.callee.type === 'Identifier' && node.callee.name === this.currentFunctionName) {
      return true;
    }
    return false;
  }

  private generateTypeValidation(parameters: AST.ParameterNode[]): string {
    let validation = '';
    
    for (const param of parameters) {
      if (param.typeAnnotation) {
        const zodSchema = this.getZodSchema(param.typeAnnotation.name);
        validation += `  const ${param.name}_schema = ${zodSchema};\n`;
        validation += `  const ${param.name}_result = ${param.name}_schema.safeParse(${param.name});\n`;
        validation += `  if (!${param.name}_result.success) {\n`;
        validation += `    throw new Error(\`Type validation failed for parameter '${param.name}': expected ${param.typeAnnotation.name}, got \${typeof ${param.name}}\`);\n`;
        validation += `  }\n`;
      }
    }
    
    return validation;
  }

  private getZodSchema(type: string): string {
    switch (type.toLowerCase()) {
      case 'int':
        return 'z.number().int()';
      case 'string':
        return 'z.string()';
      case 'bool':
        return 'z.boolean()';
      case 'array':
        return 'z.array(z.any())';
      case 'map':
        return 'z.record(z.any())';
      case 'func':
        return 'z.function()';
      case 'any':
      default:
        return 'z.any()';
    }
  }

  private generateExpression(node: AST.ASTNode): string {
    switch (node.type) {
      case 'Literal':
        return this.generateLiteral(node);
      case 'Identifier':
        return node.name;
      case 'BinaryExpression':
        return this.generateBinaryExpression(node);
      case 'UnaryExpression':
        return this.generateUnaryExpression(node);
      case 'CallExpression':
        return this.generateCallExpression(node);
      case 'MemberExpression':
        return this.generateMemberExpression(node);
      case 'ArrayExpression':
        return this.generateArrayExpression(node);
      case 'MapExpression':
        return this.generateMapExpression(node);
      case 'IfExpression':
        return this.generateIfExpression(node);
      case 'BlockExpression':
        return this.generateBlockExpression(node);
      case 'AwaitExpression':
        return this.generateAwaitExpression(node);
      case 'CaptureExpression':
        return this.generateCaptureExpression(node);
      case 'LambdaExpression':
        return this.generateLambdaExpression(node);
      case 'VariableDeclaration':
      case 'FunctionDeclaration':
        // These can appear in block expressions
        throw new Error(`${node.type} must be used as a statement, not an expression`);
      default:
        throw new Error(`Unknown expression type: ${(node as any).type}`);
    }
  }

  private generateLiteral(node: AST.LiteralNode): string {
    if (node.value === null) {
      return 'null';
    }
    if (typeof node.value === 'string') {
      // Properly escape special characters for JavaScript
      const escaped = node.value
        .replace(/\\/g, '\\\\')  // Backslash must be first
        .replace(/"/g, '\\"')    // Double quotes
        .replace(/\n/g, '\\n')    // Newlines
        .replace(/\r/g, '\\r')    // Carriage returns
        .replace(/\t/g, '\\t');   // Tabs
      return `"${escaped}"`;
    }
    return String(node.value);
  }

  private generateBinaryExpression(node: AST.BinaryExpressionNode): string {
    const left = this.generateExpression(node.left);
    const right = this.generateExpression(node.right);
    
    // Structural equality check
    if (node.operator === '=') {
      return `funcy.equals(${left}, ${right})`;
    }
    
    // Inequality
    if (node.operator === '!=') {
      return `!funcy.equals(${left}, ${right})`;
    }
    
    return `(${left} ${node.operator} ${right})`;
  }

  private generateUnaryExpression(node: AST.UnaryExpressionNode): string {
    if (node.operator === '*') {
      // Recursion - will be handled by recursive function generation
      return this.generateExpression(node.argument);
    }
    
    const argument = this.generateExpression(node.argument);
    return `${node.operator}${argument}`;
  }

  private generateCallExpression(node: AST.CallExpressionNode): string {
    // Check for recursive call
    if (this.isRecursiveCall(node)) {
      const callee = this.currentFunctionName;
      const args = node.arguments.map(arg => this.generateExpression(arg)).join(', ');
      return `${callee}(${args})`;
    }
    
    // Special handling for 'if' which should generate ternary operator
    if (node.callee.type === 'Identifier' && node.callee.name === 'if') {
      if (node.arguments.length < 2 || node.arguments.length > 3) {
        throw new Error(`if() requires 2 or 3 arguments, got ${node.arguments.length}`);
      }
      const condition = this.generateExpression(node.arguments[0]);
      const consequent = this.generateExpression(node.arguments[1]);
      const alternate = node.arguments.length === 3 ? 
        this.generateExpression(node.arguments[2]) : 'null';
      return `(${condition} ? ${consequent} : ${alternate})`;
    }
    
    const callee = this.generateExpression(node.callee);
    const args = node.arguments.map(arg => this.generateExpression(arg)).join(', ');
    
    return `${callee}(${args})`;
  }

  private generateMemberExpression(node: AST.MemberExpressionNode): string {
    const object = this.generateExpression(node.object);
    return `${object}.${node.property}`;
  }

  private generateArrayExpression(node: AST.ArrayExpressionNode): string {
    const elements = node.elements.map(el => this.generateExpression(el)).join(', ');
    return `[${elements}]`;
  }

  private generateMapExpression(node: AST.MapExpressionNode): string {
    const properties = node.properties
      .map(prop => `${prop.key}: ${this.generateExpression(prop.value)}`)
      .join(', ');
    return `{${properties}}`;
  }

  private generateIfExpression(node: AST.IfExpressionNode): string {
    const condition = this.generateExpression(node.condition);
    const consequent = this.generateExpression(node.consequent);
    const alternate = node.alternate ? this.generateExpression(node.alternate) : 'null';
    
    return `(${condition} ? ${consequent} : ${alternate})`;
  }

  private generateBlockExpression(node: AST.BlockExpressionNode): string {
    // Check if block contains await expressions
    const hasAwait = node.body.some(stmt => this.containsAwait(stmt));
    const asyncKeyword = hasAwait ? 'async ' : '';
    
    // Generate IIFE for block scope
    let code = `(${asyncKeyword}function() {\n`;
    this.indentLevel++;
    
    for (let i = 0; i < node.body.length; i++) {
      const stmt = node.body[i];
      if (i === node.body.length - 1) {
        // Last statement is the return value
        // Check if it's a statement or expression
        if (stmt.type === 'VariableDeclaration' || stmt.type === 'FunctionDeclaration') {
          // Generate the statement, then return the variable
          code += this.generateStatement(stmt);
          // Return the declared variable name
          if (stmt.type === 'VariableDeclaration') {
            code += this.indent() + 'return ' + stmt.name + ';\n';
          }
        } else {
          code += this.indent() + 'return ' + this.generateExpression(stmt) + ';\n';
        }
      } else {
        code += this.generateStatement(stmt);
      }
    }
    
    this.indentLevel--;
    code += this.indent() + '})()';
    
    return code;
  }

  private generateAwaitExpression(node: AST.AwaitExpressionNode): string {
    const argument = this.generateExpression(node.argument);
    return `await ${argument}`;
  }

  private generateCaptureExpression(node: AST.CaptureExpressionNode): string {
    const tryBlock = this.generateExpression(node.tryBlock);
    
    if (node.catchHandler) {
      const handler = this.generateExpression(node.catchHandler);
      return `funcy.capture(${tryBlock}, ${handler})`;
    }
    
    return `funcy.capture(${tryBlock})`;
  }

  private generateLambdaExpression(node: AST.LambdaExpressionNode): string {
    const params = node.parameters.map(p => p.name).join(', ');
    const body = this.generateExpression(node.body);
    const isAsync = this.containsAwait(node.body);
    const asyncKeyword = isAsync ? 'async ' : '';
    return `${asyncKeyword}function(${params}) { return ${body}; }`;
  }

  private generateImportDeclaration(node: AST.ImportDeclarationNode): string {
    return this.indent() + `const ${node.name} = require(${node.path});\n`;
  }

  private generateSubscribe(node: AST.SubscribeExpressionNode): string {
    const handler = this.generateExpression(node.handler);
    return this.indent() + `funcy.subscribe("${node.name}", ${handler});\n`;
  }

  private generateTrigger(node: AST.TriggerExpressionNode): string {
    const value = this.generateExpression(node.value);
    return this.indent() + `funcy.trigger("${node.name}", ${value});\n`;
  }
}
