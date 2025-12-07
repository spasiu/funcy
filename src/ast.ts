export type ASTNode =
  | ProgramNode
  | VariableDeclarationNode
  | FunctionDeclarationNode
  | ExportDeclarationNode
  | ImportDeclarationNode
  | CallExpressionNode
  | BinaryExpressionNode
  | UnaryExpressionNode
  | IfExpressionNode
  | BlockExpressionNode
  | ArrayExpressionNode
  | MapExpressionNode
  | MemberExpressionNode
  | AwaitExpressionNode
  | SubscribeExpressionNode
  | TriggerExpressionNode
  | CaptureExpressionNode
  | LambdaExpressionNode
  | LiteralNode
  | IdentifierNode
  | TypeAnnotationNode
  | ParameterNode;

export interface ProgramNode {
  type: 'Program';
  body: ASTNode[];
}

export interface VariableDeclarationNode {
  type: 'VariableDeclaration';
  name: string;  // Single name for backwards compatibility
  names?: string[];  // Multiple names for destructuring
  value: ASTNode;
  exports?: string; // module name if exported
}

export interface ParameterNode {
  type: 'Parameter';
  name: string;
  typeAnnotation?: TypeAnnotationNode;
}

export interface FunctionDeclarationNode {
  type: 'FunctionDeclaration';
  name: string;
  parameters: ParameterNode[];
  body: ASTNode;
  returnValues: ASTNode[]; // multiple return values
  exports?: string; // module name if exported
}

export interface ExportDeclarationNode {
  type: 'ExportDeclaration';
  module: string;
  declaration: VariableDeclarationNode | FunctionDeclarationNode;
}

export interface ImportDeclarationNode {
  type: 'ImportDeclaration';
  name: string;
  path: string;
}

export interface CallExpressionNode {
  type: 'CallExpression';
  callee: ASTNode;
  arguments: ASTNode[];
}

export interface BinaryExpressionNode {
  type: 'BinaryExpression';
  operator: string;
  left: ASTNode;
  right: ASTNode;
}

export interface UnaryExpressionNode {
  type: 'UnaryExpression';
  operator: string;
  argument: ASTNode;
}

export interface IfExpressionNode {
  type: 'IfExpression';
  condition: ASTNode;
  consequent: ASTNode;
  alternate?: ASTNode;
}

export interface BlockExpressionNode {
  type: 'BlockExpression';
  body: ASTNode[];
}

export interface ArrayExpressionNode {
  type: 'ArrayExpression';
  elements: ASTNode[];
}

export interface MapExpressionNode {
  type: 'MapExpression';
  properties: { key: string; value: ASTNode }[];
}

export interface MemberExpressionNode {
  type: 'MemberExpression';
  object: ASTNode;
  property: string;
}

export interface AwaitExpressionNode {
  type: 'AwaitExpression';
  argument: ASTNode;
}

export interface SubscribeExpressionNode {
  type: 'SubscribeExpression';
  name: string;
  handler: ASTNode; // function expression
}

export interface TriggerExpressionNode {
  type: 'TriggerExpression';
  name: string;
  value: ASTNode;
}

export interface CaptureExpressionNode {
  type: 'CaptureExpression';
  tryBlock: ASTNode;
  catchHandler?: ASTNode; // optional error handler
}

export interface LambdaExpressionNode {
  type: 'LambdaExpression';
  parameters: ParameterNode[];
  body: ASTNode;
}

export interface LiteralNode {
  type: 'Literal';
  value: string | number | boolean | null;
  raw: string;
}

export interface IdentifierNode {
  type: 'Identifier';
  name: string;
}

export interface TypeAnnotationNode {
  type: 'TypeAnnotation';
  name: string;
  generics?: TypeAnnotationNode[];
}
