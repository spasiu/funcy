# Funcy

A purely functional, expression-oriented language that compiles to JavaScript with runtime type validation.

## Overview

Funcy is designed to eliminate mutation, coercion, and imperative control flow while retaining practical interoperability with the JavaScript ecosystem. All evaluation is eager and left-to-right, all values are immutable, and all logic is expressed through functions rather than statements.

📖 **[Complete Language Reference](LANGUAGE_REFERENCE.md)** - Comprehensive guide to Funcy syntax, semantics, and features

🔍 **[Type Checking Guide](TYPE_CHECKING.md)** - Runtime type validation with Zod

⚡ **[CLI Documentation](CLI.md)** - Command-line tools for compiling and running Funcy programs

## Features

- **Pure Functional**: No mutation, no side effects (except I/O)
- **Expression-Oriented**: Everything is an expression that returns a value
- **Type Safe**: Optional type annotations with compile-time and runtime validation via Zod
- **Recursive Optimization**: Recursive functions are automatically optimized into loops
- **Multiple Return Values**: Functions can return multiple values as arrays
- **Structural Equality**: Deep equality checking for all data structures
- **Error Handling**: Automatic error propagation with capture/throw
- **Async Support**: Promise-based async with `$` await operator
- **Module System**: Namespace-based modules with exports

## Installation

```bash
npm install
npm run build
```

## Quick Reference

| Feature | Syntax | Example |
|---------|--------|----------|
| Variable | `@name value;` | `@x 42;` |
| Function | `@name params => expr;` | `@add x, y => x + y;` |
| If expression | `if(cond, then, else)` | `if(x > 0, x, 0)` |
| Recursion | `*` (self-reference) | `@fact n => if(n = 0, 1, n * *(n - 1));` |
| Array | `[1, 2, 3]` | `@nums [1, 2, 3];` |
| Map | `[key: val, ...]` | `@person [name: "Alice", age: 30];` |
| Multiple returns | `=> val1, val2, ...` | `@ops x, y => x + y, x - y;` |
| Equality | `a = b` (structural) | `[1, 2] = [1, 2]` (true) |
| Member access | `Module.function()` | `Array.map(list, fn)` |
| Await | `$promise` | `@result $fetch();` |
| Comment | `// comment` | `// This is a comment` |

**CLI Commands:**

| Command | Description |
|---------|-------------|
| `funcy run file.fu` | Compile and run immediately |
| `funcy compile file.fu` | Compile to JavaScript |
| `funcy compile folder/` | Bundle folder to single JS file |

See **[LANGUAGE_REFERENCE.md](LANGUAGE_REFERENCE.md)** for complete details.

## Usage

### CLI Commands

```bash
# Run a Funcy file (compile and execute)
funcy run <file.fu>

# Compile a single file to JavaScript
funcy compile <file.fu> [output.js]

# Compile entire folder to single bundle
funcy compile <folder> [output.js]

# Show help
funcy help
```

**Examples:**
```bash
# Run a program
funcy run examples/hello.fu

# Compile single file
funcy compile src/main.fu dist/main.js

# Compile project folder
funcy compile src/ dist/bundle.js
```

### Language Syntax

#### Variables

```funcy
@x 42;
@message "Hello, World!";
@numbers [1, 2, 3];
@person [name: "Alice", age: 30];
```

#### Functions

```funcy
// Simple function
@add x, y => x + y;

// Function with type annotations
@multiply x:int, y:int => x * y;

// Multiple return values
@math_ops x, y => x + y, x - y, x * y, x / y;

// Using multiple return values
@sum, @diff, @prod, @quot math_ops(10, 5);

// Multi-line function
@compute x => {
  @doubled x * 2;
  @result doubled + 10;
};
```

#### Recursion

Recursive functions use `*` to reference themselves and are automatically optimized into loops:

```funcy
@factorial n => if(n = 0, 1, n * *(n - 1));

@result factorial(5);  // 120
```

#### Control Flow

Use `if` as an expression (ternary in compiled JS):

```funcy
@max a, b => if(a > b, a, b);

@status n => if(n > 0, "positive", if(n = 0, "zero", "negative"));
```

#### Arrays and Maps

```funcy
// Arrays
@numbers [1, 2, 3, 4, 5];
@first at(numbers, 0);
@doubled map(numbers, n => n * 2);

// Maps (objects)
@person [name: "Bob", age: 25];
@name Map.get(person, "name");
@updated Map.set(person, "age", 26);
```

#### Error Handling

```funcy
// Capture errors
@error, @result capture({
  @data risky_operation();
  log(data);
});

// Throw errors
@validate x => if(x < 0, throw("negative value"), x);
```

#### Async Operations

```funcy
// Await promises with $
@error, @response $IO.get("https://api.example.com");

// Subscribe to events
%my_event error, response => if(exists(error), log(error), log(response));

// Trigger events
&my_event get("https://...");
```

## Standard Library

### Core Functions

- `exists(value)` - Check if value is not null
- `log(...values)` - Log and return value(s)
- `if(condition, consequent, alternate)` - Conditional expression
- `throw(error)` - Throw an error
- `capture(fn, handler?)` - Capture errors
- `length(arr|str)` - Get length
- `at(arr, index)` - Array access
- `append(arr, value)` - Append to array (returns new array)

### Array Module

- `Array.map(arr, fn)` - Map function over array
- `Array.filter(arr, fn)` - Filter array
- `Array.reduce(arr, fn, initial)` - Reduce array
- `Array.slice(arr, start, end?)` - Slice array
- `Array.concat(arr1, arr2)` - Concatenate arrays
- `Array.join(arr, separator)` - Join array elements
- `Array.reverse(arr)` - Reverse array
- `Array.sort(arr, compareFn?)` - Sort array
- `Array.find(arr, predicate)` - Find element
- `Array.includes(arr, value)` - Check inclusion
- `Array.indexOf(arr, value)` - Find index

### Map Module

- `Map.get(map, key)` - Get value by key
- `Map.set(map, key, value)` - Set key-value pair
- `Map.has(map, key)` - Check if key exists
- `Map.keys(map)` - Get all keys
- `Map.values(map)` - Get all values
- `Map.entries(map)` - Get key-value pairs
- `Map.delete(map, key)` - Delete key
- `Map.merge(map1, map2)` - Merge two maps

### String Module

- `String.length(str)` - Get length
- `String.at(str, index)` - Get character
- `String.slice(str, start, end?)` - Slice string
- `String.concat(str1, str2)` - Concatenate strings
- `String.split(str, separator)` - Split string
- `String.toLowerCase(str)` - Convert to lowercase
- `String.toUpperCase(str)` - Convert to uppercase
- `String.trim(str)` - Trim whitespace
- `String.replace(str, search, replacement)` - Replace substring
- `String.includes(str, search)` - Check inclusion
- `String.startsWith(str, prefix)` - Check prefix
- `String.endsWith(str, suffix)` - Check suffix
- `String.indexOf(str, search)` - Find index

### IO Module

All IO operations return `[error, result]` tuples for consistent error handling.

**File Operations:**
- `IO.read_file(path)` - Read file contents as UTF-8 string → `[error, contents]`

**HTTP Operations:**
- `IO.get(url, options?)` - HTTP GET request → `[error, response]`
- `IO.post(url, body, options?)` - HTTP POST request → `[error, response]`
- `IO.put(url, body, options?)` - HTTP PUT request → `[error, response]`
- `IO.delete(url, options?)` - HTTP DELETE request → `[error, response]`
- `IO.patch(url, body, options?)` - HTTP PATCH request → `[error, response]`
- `IO.head(url, options?)` - HTTP HEAD request → `[error, response]`

## Examples

See the `examples/` directory for working examples:

- `hello.fu` - Simple hello world
- `factorial.fu` - Recursive factorial with optimization
- `arrays.fu` - Array operations with map and reduce
- `comprehensive.fu` - Comprehensive example showcasing multiple language features

Compile and run any example:
```bash
node dist/cli.js examples/hello.fu
node examples/hello.js
```

## Architecture

The Funcy compiler consists of:

1. **Lexer** (`src/lexer.ts`) - Tokenizes Funcy source code
2. **Parser** (`src/parser.ts`) - Builds an Abstract Syntax Tree (AST)
3. **Code Generator** (`src/codegen.ts`) - Generates JavaScript from AST
4. **Runtime** (`src/runtime.ts`) - Core runtime library and standard functions
5. **CLI** (`src/cli.ts`) - Command-line interface for compilation

### Compilation Process

```
Funcy Source (.fu) → Lexer → Parser → AST → Code Generator → JavaScript (.js)
```

The generated JavaScript uses the Funcy runtime library for:
- Structural equality checking
- Error handling with capture/throw
- Standard library functions
- Type validation (future: with Zod schemas)

## Testing

```bash
# Run compiler tests
npm test

# Run type checking tests
npm run test:types
```

The test suites cover:
- **Compiler tests**: Variable declarations, functions, recursion, control flow
- **Type checking tests**: Runtime type validation with Zod for all supported types (int, string, bool, array, map)

## Language Design Principles

1. **No Mutation**: All data structures are immutable
2. **No Coercion**: Strict type checking, no implicit conversions
3. **Expression-Only**: No statements, everything returns a value
4. **Eager Evaluation**: Left-to-right evaluation order
5. **Structural Typing**: Types match by structure, not name
6. **Fail Fast**: Errors propagate unless explicitly captured

## Future Enhancements

- Lambda expressions (anonymous functions)
- Pattern matching
- Zod schema generation for runtime type validation
- TypeScript output with full type annotations
- More comprehensive standard library
- IDE/Editor support with syntax highlighting
- REPL for interactive development
- Package management system
- WebAssembly compilation target

## License

MIT
