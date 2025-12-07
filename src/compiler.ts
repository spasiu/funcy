import { Lexer } from './lexer';
import { Parser } from './parser';
import { CodeGenerator } from './codegen';

export function compile(source: string): string {
  // Tokenize
  const lexer = new Lexer(source);
  const tokens = lexer.tokenize();
  
  // Parse
  const parser = new Parser(tokens);
  const ast = parser.parse();
  
  // Generate code
  const codegen = new CodeGenerator();
  const code = codegen.generate(ast);
  
  return code;
}

export { Lexer, Parser, CodeGenerator };
