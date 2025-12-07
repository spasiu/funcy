import { z } from 'zod';

// Type system for Funcy
export enum FuncyType {
  INT = 'int',
  STRING = 'string',
  BOOL = 'bool',
  ARRAY = 'array',
  MAP = 'map',
  FUNC = 'func',
  ANY = 'any',
  NULL = 'null',
}

// Map Funcy types to Zod schemas
export function getFuncyTypeSchema(type: string): z.ZodTypeAny {
  switch (type) {
    case FuncyType.INT:
      return z.number().int();
    case FuncyType.STRING:
      return z.string();
    case FuncyType.BOOL:
      return z.boolean();
    case FuncyType.ARRAY:
      return z.array(z.any());
    case FuncyType.MAP:
      return z.record(z.any());
    case FuncyType.FUNC:
      return z.function();
    case FuncyType.NULL:
      return z.null();
    case FuncyType.ANY:
    default:
      return z.any();
  }
}

// Generate Zod schema code as string
export function generateZodSchema(type: string): string {
  switch (type) {
    case FuncyType.INT:
      return 'z.number().int()';
    case FuncyType.STRING:
      return 'z.string()';
    case FuncyType.BOOL:
      return 'z.boolean()';
    case FuncyType.ARRAY:
      return 'z.array(z.any())';
    case FuncyType.MAP:
      return 'z.record(z.any())';
    case FuncyType.FUNC:
      return 'z.function()';
    case FuncyType.NULL:
      return 'z.null()';
    case FuncyType.ANY:
    default:
      return 'z.any()';
  }
}

// Runtime type validator
export class TypeValidator {
  static validate(value: any, type: string, name: string = 'value'): void {
    const schema = getFuncyTypeSchema(type);
    const result = schema.safeParse(value);
    
    if (!result.success) {
      throw new Error(
        `Type validation failed for ${name}: expected ${type}, got ${typeof value}. ${result.error.message}`
      );
    }
  }
  
  static validateFunction(args: any[], paramTypes: string[], functionName: string): void {
    for (let i = 0; i < paramTypes.length; i++) {
      if (paramTypes[i] !== FuncyType.ANY && i < args.length) {
        this.validate(args[i], paramTypes[i], `parameter ${i + 1} of ${functionName}`);
      }
    }
  }
}

// Compile-time type inference
export class TypeInferencer {
  private typeMap: Map<string, string> = new Map();
  
  inferLiteralType(value: any): string {
    if (value === null) return FuncyType.NULL;
    if (typeof value === 'boolean') return FuncyType.BOOL;
    if (typeof value === 'string') return FuncyType.STRING;
    if (typeof value === 'number') {
      return Number.isInteger(value) ? FuncyType.INT : FuncyType.ANY;
    }
    if (Array.isArray(value)) return FuncyType.ARRAY;
    if (typeof value === 'object') return FuncyType.MAP;
    if (typeof value === 'function') return FuncyType.FUNC;
    return FuncyType.ANY;
  }
  
  setType(name: string, type: string): void {
    this.typeMap.set(name, type);
  }
  
  getType(name: string): string {
    return this.typeMap.get(name) || FuncyType.ANY;
  }
  
  checkTypeCompatibility(type1: string, type2: string): boolean {
    if (type1 === FuncyType.ANY || type2 === FuncyType.ANY) return true;
    return type1 === type2;
  }
}
