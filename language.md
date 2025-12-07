# Language

Funcy is a purely functional, expression-oriented language that compiles to TypeScript and JavaScript, designed to eliminate mutation, coercion, and imperative control flow while retaining practical interoperability with the JavaScript ecosystem. All evaluation is eager and left-to-right, all values are immutable, and all logic is expressed through functions rather than statements. Funcy uses structural typing enforced at both compile-time (via TypeScript) and run-time (via Zod), with optional type annotations and full support for generics, while defaulting to any where types are omitted. Equality is structural and type-strict, refusing to compare values with incompatible shapes, and functions resolve by best match (exact types over structural matches over any). Errors propagate automatically unless captured and transformed into inert values, enabling both exception-style flow and functional error handling. Recursion is a first-class construct compiled into optimized looping code, and asynchronous computation is Promise-based with ergonomic await via $ or event-style subscriptions. With multi-return values, namespace-based modules, recursion support, and deep runtime validation, Funcy delivers the safety and expressiveness of a functional language while compiling into idiomatic, maintainable JavaScript.

## Funcy Design

Evaluation is eager, left-to-right, expression-only.
No mutation exists.
No implicit type coercion exists.
Errors short-circuit execution unless explicitly captured.
All functions either return values or throw.
Exact matches beat structural matches, which beat any.
throw(error) = activate
inert error = structurally different type (not raw Error)

Variable declarations are immutable, no loops or if statements, just functions.

Types are strucutral and are compile time (TS) and run-time (Zod) enforced. Generics are supported. Rely on typescript types. Types are also optional, any is the default for arguments.

Recursive calls are optimized into while loops in JS by the compiler. This includes deep recursion.

If's are implemented as ternaries in TS by the compiler.

Types are supported but they're totally optional and used for data validation and assistance. Any works fine. But equality checks will fail if the compared items aren't the same type / structure.

Structural typing with typescript, and implemented as run time checks with Zod too. Compilation steps are Funcy to TypeScript with Zod to JavaScript.

Regular math, not polish notation.

Return values are sort of like destructured arrays of values. So you can return `@get_123 () => 1,2,3;` and handle it like `@one, @two get_123();`.

Errors are thrown by default and travel up to the nearest `capture` call to be handled, or just crash the program latogether if they're not handled:

```funcy
capture({
    @doubled map([1,2,3], n => n * 2);
    log(doubled);
}, error => {
    log(error);
});
```

Is equivalent to:

```funcy
log(capture(map([1,2,3], n => n * 2)));
```

Capture returns the "inert" error

```funcy
@error, @doubled capture({
    @doubled map([1,2,3], n => n * 2);
    log(doubled);
}, error => {
    log(error);
});

if(exists(error), throw(error)); // returns null on the else by default. 
```

`exists(value)` checks that a value is not null. Undefined is `null`.

All functions return some value. So the built in `log` returns the value passed to it.

Because assignment is not done with `=` it can be used for equality checks. If the type of a value on each side of the equality check is not the same, it errors. Equality check also checks for a match in all nested properties of maps, objects and arrays. So `[a: 1, b:2] = [b:2, a:1]` evaluates to `true`.

Functions are a mix of name and arity and argument types. So `@map arg1, arg2, arg3` and `@map arg:string` and `@map arg:int` and can all be called with `map(...)`.

The `.` operator is for namespacing/modules and All JS methods are implemented as functions in the data type module. E.g., `Array.at(list, index)` or `Map.get(dict, key)`

`@variable_name value;`

`@variable_name arg1, arg2, ... => value;`

`@variable_name arg1, arg2, ... => { code_block_value };` <- multi-line code blocks with implicit returns and internal scope

`@variable_name arg1:type, arg2:type, ... => (value);` <- types (and paren grouping statements)

`@variable_name arg1, arg2, ... => value1, value2, ...;`

`#module_name@variable_name value;` <- `$` to declare a local variable and module export. During compilation exports are added to module namespaces across multiple files.

`@module_name import("module");` <- imports

`[ x: 123, y: 456 ]` <- Maps (in JS)

`[1, 2, 3]` <- arrays

`@func_name n => if(n > 9, n, *(n + 1))` <- use `*` to self reference the function for recursion. Works for anonymous functions too.

Example:

```funcy
@math_em x:int, y:int => x * y, x + y, x - y;

@multiplied, @added, @subtracted math_em(3, (1 + 2));

@map list:[], f:func, index:int, output:[] => if(index = length(list), output, {
    map(list, func, index, append(output, func(at(list, index))));
});

@map list:[], f:func => map(list, func, 0, []);
```

Promises are the supported async pattern. JS functions that use callbacks are implemented as promises.

Promises can either be awaited using `$` like `@error, @response $get('https://...');` or passed around, like:

```funcy
@promise get('https://...');
...
@error, @response $promise;
```

Alternatively, there's a callback subscription pattern that's implemented on pub/sub + then/catch:

```funcy
%get_x error, response => if(exists(error), log(error), log(response));
%get_x error, response => if(exists(error), null, so_something_else(response));

&get_x get('https://...');
```

## Implementation instructions

In no particular order:

- Implement the compiler to typescript with Zod to JS with Zod
- Implement the standard library for basic data types.
- Implement fetch.get post put delete, etc on top of the js fetch library.
- Expose a command to compile a .fu file to a .js file for Node.

- Create a plan to implement all the features implied above.
- test exhaustively at each step.
