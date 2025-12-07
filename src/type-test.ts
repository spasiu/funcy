import { compile } from './compiler';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface TestCase {
  name: string;
  code: string;
  shouldPass: boolean;
  expectedError?: string;
}

const tests: TestCase[] = [
  {
    name: 'Valid int parameters',
    code: `
@add x:int, y:int => x + y;
@result add(5, 10);
log(result);
    `,
    shouldPass: true,
  },
  {
    name: 'Invalid int parameter (string passed)',
    code: `
@add x:int, y:int => x + y;
@result add("5", 10);
log(result);
    `,
    shouldPass: false,
    expectedError: "Type validation failed for parameter 'x': expected int",
  },
  {
    name: 'Invalid int parameter (float passed)',
    code: `
@add x:int, y:int => x + y;
@result add(5.5, 10);
log(result);
    `,
    shouldPass: false,
    expectedError: "Type validation failed for parameter 'x': expected int",
  },
  {
    name: 'Valid string parameter',
    code: `
@greet name:string => "Hello, " + name;
@result greet("Alice");
log(result);
    `,
    shouldPass: true,
  },
  {
    name: 'Invalid string parameter (number passed)',
    code: `
@greet name:string => "Hello, " + name;
@result greet(42);
log(result);
    `,
    shouldPass: false,
    expectedError: "Type validation failed for parameter 'name': expected string",
  },
  {
    name: 'Valid bool parameter',
    code: `
@check flag:bool => if(flag, "yes", "no");
@result check(true);
log(result);
    `,
    shouldPass: true,
  },
  {
    name: 'Invalid bool parameter (string passed)',
    code: `
@check flag:bool => if(flag, "yes", "no");
@result check("true");
log(result);
    `,
    shouldPass: false,
    expectedError: "Type validation failed for parameter 'flag': expected bool",
  },
  {
    name: 'Valid array parameter',
    code: `
@get_length arr:array => length(arr);
@result get_length([1, 2, 3]);
log(result);
    `,
    shouldPass: true,
  },
  {
    name: 'Invalid array parameter (number passed)',
    code: `
@get_length arr:array => length(arr);
@result get_length(42);
log(result);
    `,
    shouldPass: false,
    expectedError: "Type validation failed for parameter 'arr': expected array",
  },
  {
    name: 'Valid map parameter',
    code: `
@get_name person:map => Map.get(person, "name");
@result get_name([name: "Bob"]);
log(result);
    `,
    shouldPass: true,
  },
  {
    name: 'Mixed type parameters',
    code: `
@process name:string, age:int, active:bool => [name: name, age: age, active: active];
@result process("Alice", 30, true);
log(result);
    `,
    shouldPass: true,
  },
];

function runTest(test: TestCase): boolean {
  const tempDir = path.join(__dirname, '../test-temp');
  const tempFile = path.join(tempDir, 'test.fu');
  const outputFile = path.join(tempDir, 'test.js');

  try {
    // Create temp directory
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Compile Funcy code
    const compiled = compile(test.code);

    // Write compiled JS to temp file
    fs.writeFileSync(outputFile, compiled);

    // Execute the compiled code
    try {
      execSync(`node ${outputFile}`, { encoding: 'utf-8', stdio: 'pipe' });
      
      if (test.shouldPass) {
        console.log(`✓ ${test.name}`);
        return true;
      } else {
        console.error(`✗ ${test.name}: Expected error but code executed successfully`);
        return false;
      }
    } catch (execError: any) {
      if (!test.shouldPass) {
        if (test.expectedError && execError.stderr.includes(test.expectedError)) {
          console.log(`✓ ${test.name}`);
          return true;
        } else if (!test.expectedError) {
          console.log(`✓ ${test.name}`);
          return true;
        } else {
          console.error(`✗ ${test.name}: Wrong error message`);
          console.error(`  Expected: ${test.expectedError}`);
          console.error(`  Got: ${execError.stderr}`);
          return false;
        }
      } else {
        console.error(`✗ ${test.name}: Unexpected error`);
        console.error(execError.stderr);
        return false;
      }
    }
  } catch (error: any) {
    console.error(`✗ ${test.name}: Compilation error`);
    console.error(error.message);
    return false;
  } finally {
    // Cleanup
    try {
      if (fs.existsSync(outputFile)) {
        fs.unlinkSync(outputFile);
      }
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

function runAllTests() {
  console.log('Running Type Checking Tests\n');
  console.log('='.repeat(50));

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    if (runTest(test)) {
      passed++;
    } else {
      failed++;
    }
  }

  console.log('='.repeat(50));
  console.log(`\nResults: ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests();
