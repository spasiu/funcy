// Funcy Runtime Library

// Event subscriptions for pub/sub pattern
const subscribers: { [key: string]: Function[] } = {};

// Structural equality check
function equals(a: any, b: any): boolean {
  // Type check first
  if (typeof a !== typeof b) {
    throw new Error(`Type mismatch: cannot compare ${typeof a} with ${typeof b}`);
  }
  
  // Null check
  if (a === null && b === null) return true;
  if (a === null || b === null) return false;
  
  // Primitive types
  if (typeof a !== 'object') {
    return a === b;
  }
  
  // Arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!equals(a[i], b[i])) return false;
    }
    return true;
  }
  
  // Objects/Maps
  const keysA = Object.keys(a).sort();
  const keysB = Object.keys(b).sort();
  
  if (keysA.length !== keysB.length) return false;
  
  for (let i = 0; i < keysA.length; i++) {
    if (keysA[i] !== keysB[i]) return false;
    if (!equals(a[keysA[i]], b[keysB[i]])) return false;
  }
  
  return true;
}

// Check if value exists (not null)
function exists(value: any): boolean {
  return value !== null && value !== undefined;
}

// Log and return value
function log(...values: any[]): any {
  console.log(...values);
  return values.length === 1 ? values[0] : values;
}

// If expression as function
function if_expr(condition: any, consequent: any, alternate: any = null): any {
  return condition ? consequent : alternate;
}

// Throw error
function throw_error(error: any): never {
  if (typeof error === 'string') {
    throw new Error(error);
  }
  throw error;
}

// Capture errors and return inert error value
function capture(fn: Function, handler?: Function): any {
  try {
    const result = fn();
    if (handler) {
      return [null, result];
    }
    return result;
  } catch (error) {
    if (handler) {
      return [error, null];
    }
    // Return inert error (wrapped)
    return { __error: true, error };
  }
}

// Array/String length
function length(arr: any[] | string): number {
  return arr.length;
}

// Array access
function at(arr: any[], index: number): any {
  if (index < 0 || index >= arr.length) {
    throw new Error(`Index ${index} out of bounds for array of length ${arr.length}`);
  }
  return arr[index];
}

// Array append (returns new array)
function append(arr: any[], value: any): any[] {
  return [...arr, value];
}

// Array map
function map(arr: any[], fn: Function): any[] {
  return arr.map(fn as any);
}

// Array filter
function filter(arr: any[], fn: Function): any[] {
  return arr.filter(fn as any);
}

// Array reduce
function reduce(arr: any[], fn: Function, initial: any): any {
  return arr.reduce(fn as any, initial);
}

// Subscribe to event
function subscribe(name: string, handler: Function): void {
  if (!subscribers[name]) {
    subscribers[name] = [];
  }
  subscribers[name].push(handler);
}

// Trigger event
function trigger(name: string, value: any): void {
  if (subscribers[name]) {
    for (const handler of subscribers[name]) {
      handler(null, value);
    }
  }
}

// Array module
const Array_module = {
  at(arr: any[], index: number): any {
    return at(arr, index);
  },
  
  length(arr: any[]): number {
    return arr.length;
  },
  
  append(arr: any[], value: any): any[] {
    return append(arr, value);
  },
  
  map(arr: any[], fn: Function): any[] {
    return arr.map(fn as any);
  },
  
  filter(arr: any[], fn: Function): any[] {
    return arr.filter(fn as any);
  },
  
  reduce(arr: any[], fn: Function, initial: any): any {
    return arr.reduce(fn as any, initial);
  },
  
  slice(arr: any[], start: number, end?: number): any[] {
    return arr.slice(start, end);
  },
  
  concat(arr1: any[], arr2: any[]): any[] {
    return arr1.concat(arr2);
  },
  
  join(arr: any[], separator: string = ','): string {
    return arr.join(separator);
  },
  
  reverse(arr: any[]): any[] {
    return [...arr].reverse();
  },
  
  sort(arr: any[], compareFn?: Function): any[] {
    return [...arr].sort(compareFn as any);
  },
  
  find(arr: any[], predicate: Function): any {
    return arr.find(predicate as any);
  },
  
  includes(arr: any[], value: any): boolean {
    return arr.includes(value);
  },
  
  indexOf(arr: any[], value: any): number {
    return arr.indexOf(value);
  },
};

// Map module for objects
const Map_module = {
  get(map: any, key: string): any {
    return map[key];
  },
  
  set(map: any, key: string, value: any): any {
    return { ...map, [key]: value };
  },
  
  has(map: any, key: string): boolean {
    return key in map;
  },
  
  keys(map: any): string[] {
    return Object.keys(map);
  },
  
  values(map: any): any[] {
    return Object.values(map);
  },
  
  entries(map: any): [string, any][] {
    return Object.entries(map);
  },
  
  delete(map: any, key: string): any {
    const newMap = { ...map };
    delete newMap[key];
    return newMap;
  },
  
  merge(map1: any, map2: any): any {
    return { ...map1, ...map2 };
  },
};

// Number module
const Number_module = {
  parseInt(str: string, radix: number = 10): number {
    const result = parseInt(str, radix);
    if (isNaN(result)) {
      throw new Error(`Cannot parse "${str}" as integer`);
    }
    return result;
  },
  
  parseFloat(str: string): number {
    const result = parseFloat(str);
    if (isNaN(result)) {
      throw new Error(`Cannot parse "${str}" as float`);
    }
    return result;
  },
};

// String module
const String_module = {
  length(str: string): number {
    return str.length;
  },
  
  at(str: string, index: number): string {
    return str[index];
  },
  
  slice(str: string, start: number, end?: number): string {
    return str.slice(start, end);
  },
  
  concat(str1: string, str2: string): string {
    return str1 + str2;
  },
  
  split(str: string, separator: string): string[] {
    return str.split(separator);
  },
  
  toLowerCase(str: string): string {
    return str.toLowerCase();
  },
  
  toUpperCase(str: string): string {
    return str.toUpperCase();
  },
  
  trim(str: string): string {
    return str.trim();
  },
  
  replace(str: string, search: string, replacement: string): string {
    return str.replace(search, replacement);
  },
  
  includes(str: string, search: string): boolean {
    return str.includes(search);
  },
  
  startsWith(str: string, prefix: string): boolean {
    return str.startsWith(prefix);
  },
  
  endsWith(str: string, suffix: string): boolean {
    return str.endsWith(suffix);
  },
  
  indexOf(str: string, search: string): number {
    return str.indexOf(search);
  },
};

// IO module for input/output operations
interface FetchOptions {
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

async function fetchRequest(
  url: string,
  method: string,
  options: FetchOptions = {}
): Promise<[any, any]> {
  try {
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    if (options.body) {
      fetchOptions.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, fetchOptions);
    
    const contentType = response.headers.get('content-type');
    let data: any;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      return [new Error(`HTTP ${response.status}: ${response.statusText}`), null];
    }

    return [null, data];
  } catch (error: any) {
    return [error, null];
  }
}

const IO_module = {
  // File operations
  async read_file(path: string): Promise<[any, string | null]> {
    try {
      const fs = require('fs').promises;
      const contents = await fs.readFile(path, 'utf8');
      return [null, contents];
    } catch (error: any) {
      return [error, null];
    }
  },
  
  // HTTP operations
  get(url: string, options: FetchOptions = {}): Promise<[any, any]> {
    return fetchRequest(url, 'GET', options);
  },

  post(url: string, body: any, options: FetchOptions = {}): Promise<[any, any]> {
    return fetchRequest(url, 'POST', { ...options, body });
  },

  put(url: string, body: any, options: FetchOptions = {}): Promise<[any, any]> {
    return fetchRequest(url, 'PUT', { ...options, body });
  },

  delete(url: string, options: FetchOptions = {}): Promise<[any, any]> {
    return fetchRequest(url, 'DELETE', options);
  },

  patch(url: string, body: any, options: FetchOptions = {}): Promise<[any, any]> {
    return fetchRequest(url, 'PATCH', { ...options, body });
  },

  head(url: string, options: FetchOptions = {}): Promise<[any, any]> {
    return fetchRequest(url, 'HEAD', options);
  },
};

// Export all runtime functions
export const funcy = {
  equals,
  exists,
  log,
  if: if_expr,
  throw: throw_error,
  capture,
  length,
  at,
  append,
  map,
  filter,
  reduce,
  subscribe,
  trigger,
  Array: Array_module,
  Map: Map_module,
  String: String_module,
  Number: Number_module,
  IO: IO_module,
};
