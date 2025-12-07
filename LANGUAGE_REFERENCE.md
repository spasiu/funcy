# Funcy Language Reference

Complete reference for the Funcy programming language.

## Table of Contents

- [Syntax Overview](#syntax-overview)
- [Lexical Structure](#lexical-structure)
- [Data Types](#data-types)
- [Variables](#variables)
- [Functions](#functions)
- [Operators](#operators)
- [Control Flow](#control-flow)
- [Recursion](#recursion)
- [Error Handling](#error-handling)
- [Modules and Namespaces](#modules-and-namespaces)
- [Async Operations](#async-operations)
- [Built-in Functions](#built-in-functions)

## Syntax Overview

Funcy is expression-oriented with a simple, consistent syntax:

```funcy
// Variables start with @
@name value;

// Functions use => arrow
@function_name param1, param2 => expression;

// Module exports start with #
#module_name@exported_name value;

// Comments start with //
// This is a comment
```

## Lexical Structure

### Comments

Single-line comments start with `//`:

```funcy
// This is a comment
@x 42;  // Inline comment
```

### Identifiers

Identifiers must start with a letter or underscore, followed by letters, numbers, or underscores:

```funcy
@valid_name 123;
@_private 456;
@camelCase 789;
@snake_case 101;
```

### Keywords

Reserved keywords:
- `true`, `false` - Boolean literals
- `null` - Null value

Note: `if`, `throw`, `capture` are built-in functions, not keywords.

### Literals

**Numbers:**
```funcy
@integer 42;
@decimal 3.14;
@negative -17;
```

**Strings:**
```funcy
@single 'Hello';
@double "World";
@escaped "Line 1\nLine 2\tTabbed";
```

**Booleans:**
```funcy
@yes true;
@no false;
```

**Null:**
```funcy
@nothing null;
```

## Data Types

### Primitives

- **Number**: Integer or floating-point numbers
- **String**: Text enclosed in single or double quotes
- **Boolean**: `true` or `false`
- **Null**: `null` (represents absence of value)

### Compound Types

#### Arrays

Ordered collections of values:

```funcy
@empty [];
@numbers [1, 2, 3, 4, 5];
@mixed [1, "two", true, null];
@nested [[1, 2], [3, 4]];
```

#### Maps (Objects)

Key-value pairs (keys must be identifiers):

```funcy
@person [name: "Alice", age: 30];
@nested [
  user: [id: 1, name: "Bob"],
  active: true
];
```

#### Functions

Functions are first-class values:

```funcy
@add x, y => x + y;
@passed_function add;  // Functions can be assigned
```

## Variables

Variables are declared with `@` and are **immutable**:

```funcy
@x 42;
@x 100;  // Error: x is already declared
```

### Multiple Variable Declaration

Destructuring multiple return values:

```funcy
@math_ops x, y => x + y, x - y, x * y;
@sum, @diff, @product math_ops(10, 5);
// sum = 15, diff = 5, product = 50
```

## Functions

### Function Declaration

Basic syntax:

```funcy
@function_name param1, param2, ... => expression;
```

Examples:

```funcy
// Simple function
@add x, y => x + y;

// Single parameter
@double n => n * 2;

// No parameters
@get_pi => 3.14159;
```

### Type Annotations

Optional type annotations provide both documentation and runtime validation:

```funcy
@multiply x:int, y:int => x * y;
@greet name:string => "Hello, " + name;
@check flag:bool => if(flag, "yes", "no");
@process_list items:array => length(items);
@get_value data:map => Map.get(data, "key");
```

Available type annotations: `int`, `string`, `bool`, `array`, `map`, `func`, `any`

**Runtime Type Validation:**

When type annotations are present, the compiler generates runtime validation code using Zod:

```funcy
@add x:int, y:int => x + y;
@result add(5, 10);     // OK
@result2 add("5", 10);  // Error: Type validation failed for parameter 'x': expected int, got string
```

Type checking happens at function call time, providing clear error messages for type mismatches.

**Supported Types:**
- `int` - Integer numbers (validated with `z.number().int()`)
- `string` - Text strings (validated with `z.string()`)
- `bool` - Boolean values (validated with `z.boolean()`)
- `array` - Arrays of any type (validated with `z.array(z.any())`)
- `map` - Objects/maps (validated with `z.record(z.any())`)
- `func` - Functions (validated with `z.function()`)
- `any` - Any type (no validation)

### Multiple Return Values

Functions can return multiple values as tuples:

```funcy
@divide_with_remainder a, b => a / b, a % b;

@quotient, @remainder divide_with_remainder(17, 5);
// quotient = 3, remainder = 2
```

### Multi-line Functions

Use braces for multi-line function bodies:

```funcy
@compute x => {
  @doubled x * 2;
  @squared doubled * doubled;
  @result squared + 10;
};
// Returns: result (implicit return of last expression)
```

### Function Calls

```funcy
@result function_name(arg1, arg2, arg3);
```

Functions are called with parentheses and comma-separated arguments:

```funcy
@sum add(5, 3);
@value calculate(1, 2, 3, 4);
```

### Higher-Order Functions

Functions can accept other functions as parameters:

```funcy
@apply_twice f, x => f(f(x));
@increment n => n + 1;
@result apply_twice(increment, 5);  // 7
```

## Operators

### Arithmetic Operators

```funcy
@sum a + b;        // Addition
@diff a - b;       // Subtraction
@product a * b;    // Multiplication
@quotient a / b;   // Division
```

Note: No modulo operator `%` (reserved for subscriptions). Use a function instead.

### Comparison Operators

```funcy
@equal a = b;      // Structural equality
@not_equal a != b; // Structural inequality
@less a < b;       // Less than
@greater a > b;    // Greater than
@less_eq a <= b;   // Less than or equal
@greater_eq a >= b; // Greater than or equal
```

### Equality Semantics

The `=` operator performs **deep structural equality**:

```funcy
@result [1, 2, 3] = [1, 2, 3];  // true
@result [a: 1, b: 2] = [b: 2, a: 1];  // true (order doesn't matter)
@result [1, 2] = [1, 3];  // false

// Type mismatch throws an error
@result 5 = "5";  // Error: cannot compare number with string
```

### Member Access

Access module functions with `.`:

```funcy
@first Array.at(list, 0);
@upper String.toUpperCase(text);
@value Map.get(obj, "key");
```

## Control Flow

### If Expressions

`if` is a function that returns a value (ternary in compiled code):

```funcy
// if(condition, consequent, alternate)
@result if(x > 0, "positive", "negative");

// Alternate is optional (defaults to null)
@result if(exists(value), value);

// Nested if expressions
@sign if(n > 0, "positive", if(n = 0, "zero", "negative"));
```

### Pattern Matching

Not yet implemented. Use nested `if` expressions:

```funcy
@classify n => if(
  n < 0, "negative",
  if(n = 0, "zero", "positive")
);
```

## Recursion

### Self-Reference with `*`

Use `*` to reference the current function recursively:

```funcy
@factorial n => if(n = 0, 1, n * *(n - 1));

@countdown n => if(n = 0, "done", {
  log(n);
  *(n - 1);
});
```

### Recursion Optimization

The compiler automatically optimizes recursive functions into loops:

**Funcy code:**
```funcy
@factorial n => if(n = 0, 1, n * *(n - 1));
```

**Compiled JavaScript:**
```javascript
const factorial = function(n) {
  while (true) {
    if (n === 0) {
      return 1;
    } else {
      n = n - 1;
      continue;
    }
  }
};
```

### Named Recursion

You can also call a function by its own name:

```funcy
@sum_to n => if(n = 0, 0, n + sum_to(n - 1));
```

## Error Handling

### Throwing Errors

Use `throw` to raise an error:

```funcy
@validate x => if(x < 0, throw("Value must be positive"), x);
```

### Capturing Errors

Use `capture` to handle errors:

```funcy
// With error handler
@error, @result capture({
  @data risky_operation();
  log(data);
}, error => log("Error:", error));

// Without handler (returns inert error object)
@error, @result capture({
  @value might_fail();
});

if(exists(error), throw(error), log(result));
```

### Error Propagation

Errors automatically propagate up the call stack until captured:

```funcy
@outer => {
  @result inner();  // Error propagates from inner
};

@inner => {
  throw("Something went wrong");
};
```

## Modules and Namespaces

### Exporting

Export variables or functions with `#module_name@`:

```funcy
// Export a constant
#math@PI 3.14159;

// Export a function
#math@square x => x * x;
```

### Importing

Import modules with `import()`:

```funcy
@math import("./math");
@result math.square(5);  // 25
```

### Built-in Modules

Access built-in modules directly:

```funcy
@doubled Array.map(numbers, double);
@name Map.get(person, "name");
@upper String.toUpperCase(text);
```

## Async Operations

### Await with `$`

Await promises using the `$` operator:

```funcy
// Simple await
@result $fetch_data();

// With error handling
@error, @response $Fetch.get("https://api.example.com");

if(exists(error), log(error), log(response));
```

### Event Subscriptions

Subscribe to events with `%`:

```funcy
%event_name param1, param2 => {
  log("Event fired:", param1, param2);
};
```

### Event Triggers

Trigger events with `&`:

```funcy
&event_name some_value;
```

### Pub/Sub Pattern Example

```funcy
// Subscribe handlers
%user_login error, user => if(exists(error), 
  log("Login error:", error),
  log("User logged in:", user)
);

%user_login error, user => if(exists(user), update_ui(user));

// Trigger event
&user_login fetch_user();
```

## Built-in Functions

### Core Functions

#### `exists(value)`

Check if a value is not null or undefined:

```funcy
@has_value exists(x);  // true if x is not null
@is_null if(exists(x), x, "default");
```

#### `log(...values)`

Print values to console and return them:

```funcy
@x log(42);  // Prints: 42, returns: 42
log("Debug:", x, y);  // Prints multiple values
```

#### `if(condition, consequent, alternate?)`

Conditional expression:

```funcy
@result if(x > 0, "positive", "negative");
@value if(exists(data), data);  // alternate defaults to null
```

#### `throw(error)`

Throw an error:

```funcy
throw("Error message");
throw([code: 500, message: "Server error"]);
```

#### `capture(fn, handler?)`

Capture errors from function execution:

```funcy
// Returns [error, result]
@err, @res capture({
  risky_operation();
});
```

### Array Functions

#### `length(array)`

Get array length:

```funcy
@len length([1, 2, 3]);  // 3
```

#### `at(array, index)`

Access element by index:

```funcy
@first at([1, 2, 3], 0);  // 1
@last at([1, 2, 3], 2);   // 3
```

#### `append(array, value)`

Add element to end (returns new array):

```funcy
@new append([1, 2], 3);  // [1, 2, 3]
```

#### `map(array, function)`

Transform each element:

```funcy
@double n => n * 2;
@doubled map([1, 2, 3], double);  // [2, 4, 6]
```

#### `filter(array, predicate)`

Keep elements matching predicate:

```funcy
@positive n => n > 0;
@filtered filter([-1, 2, -3, 4], positive);  // [2, 4]
```

#### `reduce(array, function, initial)`

Reduce to single value:

```funcy
@sum acc, n => acc + n;
@total reduce([1, 2, 3], sum, 0);  // 6
```

### Array Module

Access via `Array.` namespace:

```funcy
Array.at(arr, index)
Array.length(arr)
Array.append(arr, value)
Array.map(arr, fn)
Array.filter(arr, fn)
Array.reduce(arr, fn, initial)
Array.slice(arr, start, end?)
Array.concat(arr1, arr2)
Array.join(arr, separator)
Array.reverse(arr)
Array.sort(arr, compareFn?)
Array.find(arr, predicate)
Array.includes(arr, value)
Array.indexOf(arr, value)
```

### Map Module

Access via `Map.` namespace:

```funcy
Map.get(map, key)           // Get value by key
Map.set(map, key, value)    // Set key-value (returns new map)
Map.has(map, key)           // Check if key exists
Map.keys(map)               // Get all keys
Map.values(map)             // Get all values
Map.entries(map)            // Get [key, value] pairs
Map.delete(map, key)        // Remove key (returns new map)
Map.merge(map1, map2)       // Merge maps
```

### String Module

Access via `String.` namespace:

```funcy
String.length(str)
String.at(str, index)
String.slice(str, start, end?)
String.concat(str1, str2)
String.split(str, separator)
String.toLowerCase(str)
String.toUpperCase(str)
String.trim(str)
String.replace(str, search, replacement)
String.includes(str, search)
String.startsWith(str, prefix)
String.endsWith(str, suffix)
String.indexOf(str, search)
```

### IO Module

Access via `IO.` namespace for all input/output operations:

#### File Operations

##### `IO.read_file(path)`

Read a file from the filesystem asynchronously. Returns a promise that resolves to `[error, contents]` where contents is a UTF-8 encoded string.

```funcy
// In a function context
@load_config => {
  @result $IO.read_file("./config.json");
  @error at(result, 0);
  @contents at(result, 1);
  if(exists(error),
    throw(error),
    contents
  );
};
```

#### HTTP Operations

All HTTP methods return `[error, response]` tuples.

```funcy
// HTTP GET request in a function
@fetch_data => {
  @result $IO.get("https://api.example.com/data");
  @error at(result, 0);
  @data at(result, 1);
  if(exists(error), throw(error), data);
};

// HTTP POST with error handling
@create_user name => {
  @result $IO.post("https://api.example.com/users", [name: name]);
  @error at(result, 0);
  @user at(result, 1);
  if(exists(error), null, user);
};

// Available methods: get, post, put, delete, patch, head
// All return [error, data] tuples
```

## Complete Examples

### Factorial with Recursion

```funcy
@factorial n => if(n = 0, 1, n * *(n - 1));
@result factorial(5);
log(result);  // 120
```

### List Processing

```funcy
@numbers [1, 2, 3, 4, 5];

@double n => n * 2;
@doubled map(numbers, double);

@is_even n => (n / 2) * 2 = n;
@evens filter(numbers, is_even);

@add acc, n => acc + n;
@sum reduce(numbers, add, 0);

log(doubled, evens, sum);
```

### Tree Traversal

```funcy
@tree [
  value: 1,
  left: [value: 2, left: null, right: null],
  right: [value: 3, left: null, right: null]
];

@traverse node => if(
  exists(node),
  {
    log(Map.get(node, "value"));
    *(Map.get(node, "left"));
    *(Map.get(node, "right"));
  },
  null
);

traverse(tree);
```

### Error Handling

```funcy
@safe_divide a, b => {
  @err, @result capture({
    if(b = 0, throw("Division by zero"), a / b);
  });
  
  if(exists(err), {
    log("Error:", err);
    0;
  }, result);
};

log(safe_divide(10, 2));  // 5
log(safe_divide(10, 0));  // Error: Division by zero, returns 0
```

### Async Data Fetching

```funcy
@fetch_user id => {
  @error, @response $IO.get("https://api.example.com/users/" + id);
  
  if(exists(error),
    throw(error),
    Map.get(response, "name")
  );
};

@error, @name $fetch_user(123);
if(exists(error), log("Error:", error), log("User:", name));
```

## Language Principles

1. **Everything is an Expression**: No statements, everything returns a value
2. **Immutability**: Variables and data structures cannot be modified
3. **No Side Effects**: Functions should not modify external state (except I/O)
4. **Explicit Control Flow**: Use `if` expressions instead of implicit branching
5. **Type Safety**: Structural equality prevents comparing incompatible types
6. **Fail Fast**: Errors propagate unless explicitly handled
7. **Referential Transparency**: Same inputs always produce same outputs (for pure functions)

## Compilation

Funcy compiles to JavaScript with the following transformations:

- Variables → `const` declarations
- Functions → Regular JavaScript functions
- Recursion → Optimized `while` loops
- `if` expressions → Ternary operators
- Maps → JavaScript objects
- Equality → Deep structural comparison via `funcy.equals()`
- Block expressions → IIFEs (Immediately Invoked Function Expressions)

## Best Practices

1. **Prefer small functions**: Break complex logic into composable functions
2. **Use descriptive names**: Variables and functions should be self-documenting
3. **Avoid deep nesting**: Extract nested logic into named functions
4. **Handle errors explicitly**: Use `capture` for operations that might fail
5. **Document with types**: Use type annotations for clarity
6. **Test recursion base cases**: Ensure recursive functions always terminate
7. **Use immutable updates**: Remember that functions return new values, not modify existing ones

## Future Features

Features planned but not yet implemented:

- Lambda expressions (anonymous functions)
- Pattern matching
- Algebraic data types (ADTs)
- Type inference and checking
- Compile-time optimizations
- Tail call optimization
- Lazy evaluation
- Comprehensions
- Pipelines and composition operators
