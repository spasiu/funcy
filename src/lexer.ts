export enum TokenType {
  // Literals
  NUMBER = 'NUMBER',
  STRING = 'STRING',
  IDENTIFIER = 'IDENTIFIER',
  
  // Keywords
  NULL = 'NULL',
  TRUE = 'TRUE',
  FALSE = 'FALSE',
  
  // Operators
  AT = 'AT',              // @
  HASH = 'HASH',          // #
  DOLLAR = 'DOLLAR',      // $
  PERCENT = 'PERCENT',    // %
  AMPERSAND = 'AMPERSAND', // &
  ASTERISK = 'ASTERISK',  // *
  PLUS = 'PLUS',          // +
  MINUS = 'MINUS',        // -
  SLASH = 'SLASH',        // /
  EQUALS = 'EQUALS',      // =
  NOT_EQUALS = 'NOT_EQUALS', // !=
  GT = 'GT',              // >
  LT = 'LT',              // <
  GTE = 'GTE',            // >=
  LTE = 'LTE',            // <=
  DOT = 'DOT',            // .
  
  // Delimiters
  LPAREN = 'LPAREN',      // (
  RPAREN = 'RPAREN',      // )
  LBRACE = 'LBRACE',      // {
  RBRACE = 'RBRACE',      // }
  LBRACKET = 'LBRACKET',  // [
  RBRACKET = 'RBRACKET',  // ]
  COMMA = 'COMMA',        // ,
  SEMICOLON = 'SEMICOLON', // ;
  COLON = 'COLON',        // :
  ARROW = 'ARROW',        // =>
  
  // Special
  EOF = 'EOF',
  NEWLINE = 'NEWLINE',
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

export class Lexer {
  private source: string;
  private position: number = 0;
  private line: number = 1;
  private column: number = 1;
  
  constructor(source: string) {
    this.source = source;
  }
  
  private current(): string {
    return this.source[this.position] || '';
  }
  
  private peek(offset: number = 1): string {
    return this.source[this.position + offset] || '';
  }
  
  private advance(): string {
    const char = this.current();
    this.position++;
    if (char === '\n') {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    return char;
  }
  
  private skipWhitespace(): void {
    while (this.current() && /[ \t\r\n]/.test(this.current())) {
      this.advance();
    }
  }
  
  private skipComment(): void {
    if (this.current() === '/' && this.peek() === '/') {
      while (this.current() && this.current() !== '\n') {
        this.advance();
      }
    }
  }
  
  private readNumber(): Token {
    const line = this.line;
    const column = this.column;
    let value = '';
    
    while (this.current() && /[0-9.]/.test(this.current())) {
      value += this.advance();
    }
    
    return { type: TokenType.NUMBER, value, line, column };
  }
  
  private readString(quote: string): Token {
    const line = this.line;
    const column = this.column;
    let value = '';
    
    this.advance(); // consume opening quote
    
    while (this.current() && this.current() !== quote) {
      if (this.current() === '\\') {
        this.advance();
        const escaped = this.advance();
        switch (escaped) {
          case 'n': value += '\n'; break;
          case 't': value += '\t'; break;
          case 'r': value += '\r'; break;
          case '\\': value += '\\'; break;
          case quote: value += quote; break;
          default: value += escaped;
        }
      } else {
        value += this.advance();
      }
    }
    
    this.advance(); // consume closing quote
    
    return { type: TokenType.STRING, value, line, column };
  }
  
  private readIdentifier(): Token {
    const line = this.line;
    const column = this.column;
    let value = '';
    
    while (this.current() && /[a-zA-Z0-9_]/.test(this.current())) {
      value += this.advance();
    }
    
    // Check for keywords
    if (value === 'null') {
      return { type: TokenType.NULL, value, line, column };
    }
    if (value === 'true') {
      return { type: TokenType.TRUE, value, line, column };
    }
    if (value === 'false') {
      return { type: TokenType.FALSE, value, line, column };
    }
    
    return { type: TokenType.IDENTIFIER, value, line, column };
  }
  
  public tokenize(): Token[] {
    const tokens: Token[] = [];
    
    while (this.position < this.source.length) {
      this.skipWhitespace();
      
      if (this.position >= this.source.length) {
        break;
      }
      
      this.skipComment();
      
      if (this.position >= this.source.length) {
        break;
      }
      
      // Skip whitespace after comment
      this.skipWhitespace();
      
      if (this.position >= this.source.length) {
        break;
      }
      
      const char = this.current();
      const line = this.line;
      const column = this.column;
      
      // Numbers
      if (/[0-9]/.test(char)) {
        tokens.push(this.readNumber());
        continue;
      }
      
      // Strings
      if (char === '"' || char === "'") {
        tokens.push(this.readString(char));
        continue;
      }
      
      // Identifiers
      if (/[a-zA-Z_]/.test(char)) {
        tokens.push(this.readIdentifier());
        continue;
      }
      
      // Two-character operators
      if (char === '=' && this.peek() === '>') {
        this.advance();
        this.advance();
        tokens.push({ type: TokenType.ARROW, value: '=>', line, column });
        continue;
      }
      
      if (char === '!' && this.peek() === '=') {
        this.advance();
        this.advance();
        tokens.push({ type: TokenType.NOT_EQUALS, value: '!=', line, column });
        continue;
      }
      
      if (char === '>' && this.peek() === '=') {
        this.advance();
        this.advance();
        tokens.push({ type: TokenType.GTE, value: '>=', line, column });
        continue;
      }
      
      if (char === '<' && this.peek() === '=') {
        this.advance();
        this.advance();
        tokens.push({ type: TokenType.LTE, value: '<=', line, column });
        continue;
      }
      
      // Single-character tokens
      const tokenMap: { [key: string]: TokenType } = {
        '@': TokenType.AT,
        '#': TokenType.HASH,
        '$': TokenType.DOLLAR,
        '%': TokenType.PERCENT,
        '&': TokenType.AMPERSAND,
        '*': TokenType.ASTERISK,
        '+': TokenType.PLUS,
        '-': TokenType.MINUS,
        '/': TokenType.SLASH,
        '=': TokenType.EQUALS,
        '>': TokenType.GT,
        '<': TokenType.LT,
        '.': TokenType.DOT,
        '(': TokenType.LPAREN,
        ')': TokenType.RPAREN,
        '{': TokenType.LBRACE,
        '}': TokenType.RBRACE,
        '[': TokenType.LBRACKET,
        ']': TokenType.RBRACKET,
        ',': TokenType.COMMA,
        ';': TokenType.SEMICOLON,
        ':': TokenType.COLON,
      };
      
      if (char in tokenMap) {
        this.advance();
        tokens.push({ type: tokenMap[char], value: char, line, column });
        continue;
      }
      
      throw new Error(`Unexpected character '${char}' at line ${line}, column ${column}`);
    }
    
    tokens.push({ type: TokenType.EOF, value: '', line: this.line, column: this.column });
    return tokens;
  }
}
