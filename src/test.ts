import { compile } from './compiler';

function test(name: string, source: string, expectedOutput?: string) {
  console.log(`\n=== Test: ${name} ===`);
  console.log('Source:');
  console.log(source);
  console.log('\nCompiled:');
  
  try {
    const compiled = compile(source);
    console.log(compiled);
    console.log('✓ Compilation successful');
    return true;
  } catch (error: any) {
    console.error('✗ Compilation failed:', error.message);
    return false;
  }
}

function runTests() {
  console.log('Running Funcy Compiler Tests\n');
  console.log('='.repeat(50));
  
  let passed = 0;
  let failed = 0;
  
  // Test 1: Simple variable
  if (test('Simple Variable', '@x 42;')) passed++; else failed++;
  
  // Test 2: String literal
  if (test('String Literal', '@message "Hello, World!";')) passed++; else failed++;
  
  // Test 3: Array
  if (test('Array', '@numbers [1, 2, 3];')) passed++; else failed++;
  
  // Test 4: Map
  if (test('Map', '@person [name: "Alice", age: 30];')) passed++; else failed++;
  
  // Test 5: Simple function
  if (test('Simple Function', '@add x, y => x + y;')) passed++; else failed++;
  
  // Test 6: Function call
  if (test('Function Call', '@add x, y => x + y;\n@result add(3, 4);')) passed++; else failed++;
  
  // Test 7: Recursion
  if (test('Recursive Factorial', '@factorial n => if(n = 0, 1, n * *(n - 1));')) passed++; else failed++;
  
  // Test 8: Multiple return values
  if (test('Multiple Returns', '@math_em x, y => x * y, x + y, x - y;')) passed++; else failed++;
  
  // Test 9: If expression
  if (test('If Expression', '@max a, b => if(a > b, a, b);')) passed++; else failed++;
  
  // Test 10: Block expression
  if (test('Block Expression', '@compute x => {\n  @doubled x * 2;\n  @result doubled + 10;\n};')) passed++; else failed++;
  
  console.log('\n' + '='.repeat(50));
  console.log(`\nTest Results: ${passed} passed, ${failed} failed`);
  
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
