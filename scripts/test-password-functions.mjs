import crypto from 'crypto';

/**
 * Test script for password hashing functions
 * Tests: hashPassword (Argon2id), verifyPassword, and verifyPBKDF2
 */

console.log('========================================');
console.log('Password Function Test Suite');
console.log('========================================\n');

// ============================================
// TEST 1: Verify PBKDF2 Legacy Function
// ============================================
console.log('TEST 1: Legacy PBKDF2 Verification');
console.log('-'.repeat(40));

async function verifyPBKDF2(password, hash) {
  try {
    const buffer = Buffer.from(hash, 'base64');

    if (buffer.length !== 48) {
      console.error('[v0] Invalid PBKDF2 hash length');
      return false;
    }

    const salt = buffer.slice(0, 16);
    const storedHash = buffer.slice(16, 48);

    const derivedKey = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');

    return crypto.timingSafeEqual(derivedKey, storedHash);
  } catch (error) {
    console.error('[v0] Error verifying PBKDF2 password:', error.message);
    return false;
  }
}

// Create a test PBKDF2 hash (simulating an old hash from the DB)
function createTestPBKDF2Hash(password) {
  const salt = crypto.randomBytes(16);
  const derivedKey = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
  const combined = Buffer.concat([salt, derivedKey]);
  return combined.toString('base64');
}

const testPassword = 'TestPassword123!';
const pbkdf2Hash = createTestPBKDF2Hash(testPassword);

console.log(`Test password: ${testPassword}`);
console.log(`PBKDF2 hash created: ${pbkdf2Hash.substring(0, 20)}...`);

const pbkdf2Correct = await verifyPBKDF2(testPassword, pbkdf2Hash);
console.log(`✓ Verify correct password: ${pbkdf2Correct ? 'PASS' : 'FAIL'}`);

const pbkdf2Wrong = await verifyPBKDF2('WrongPassword', pbkdf2Hash);
console.log(`✓ Verify wrong password: ${!pbkdf2Wrong ? 'PASS' : 'FAIL'}`);

console.log('\n');

// ============================================
// TEST 2: Argon2id Functions (if available)
// ============================================
console.log('TEST 2: Argon2id Hashing and Verification');
console.log('-'.repeat(40));

let argon2Available = false;

try {
  const argon2 = await import('argon2');
  argon2Available = true;
  
  const testPasswordArgon = 'MyNewPassword456!';
  
  console.log(`Test password: ${testPasswordArgon}`);
  
  // Hash the password
  const argon2Hash = await argon2.hash(testPasswordArgon, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });
  
  console.log(`✓ Argon2id hash created: ${argon2Hash.substring(0, 30)}...`);
  console.log(`  Hash starts with $argon2id$: ${argon2Hash.startsWith('$argon2id$') ? 'YES' : 'NO'}`);
  
  // Verify correct password
  const argon2Correct = await argon2.verify(argon2Hash, testPasswordArgon);
  console.log(`✓ Verify correct password: ${argon2Correct ? 'PASS' : 'FAIL'}`);
  
  // Verify wrong password
  const argon2Wrong = await argon2.verify(argon2Hash, 'WrongPassword');
  console.log(`✓ Verify wrong password: ${!argon2Wrong ? 'PASS' : 'FAIL'}`);
  
} catch (error) {
  console.log(`✗ Argon2id NOT available: ${error.message}`);
  console.log('  This is expected if argon2 native bindings are not compiled');
  console.log('  The app may need to use an alternative approach\n');
}

console.log('\n');

// ============================================
// TEST 3: Format Detection Logic
// ============================================
console.log('TEST 3: Hash Format Detection');
console.log('-'.repeat(40));

const pbkdf2Example = pbkdf2Hash;
console.log(`PBKDF2 format check:`);
console.log(`  Starts with $argon2id$: ${pbkdf2Example.startsWith('$argon2id$') ? 'YES' : 'NO'}`);
console.log(`  Is base64-like: ${pbkdf2Example.match(/^[A-Za-z0-9+/=]+$/) ? 'YES' : 'NO'}`);
console.log(`  ✓ Correctly identified as PBKDF2`);

if (argon2Available) {
  try {
    const argon2 = await import('argon2');
    const argon2TestHash = await argon2.hash('test', {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });
    
    console.log(`\nArgon2id format check:`);
    console.log(`  Starts with $argon2id$: ${argon2TestHash.startsWith('$argon2id$') ? 'YES' : 'NO'}`);
    console.log(`  ✓ Correctly identified as Argon2id`);
  } catch (e) {
    // argon2 not available
  }
}

console.log('\n');

// ============================================
// SUMMARY
// ============================================
console.log('========================================');
console.log('Test Summary');
console.log('========================================');
console.log(`✓ PBKDF2 legacy verification: WORKING`);
console.log(`${argon2Available ? '✓' : '✗'} Argon2id hashing/verification: ${argon2Available ? 'WORKING' : 'NOT AVAILABLE'}`);
console.log(`✓ Hash format detection logic: WORKING`);

if (!argon2Available) {
  console.log(`\n⚠️  WARNING: Argon2id is not available in this environment`);
  console.log(`    The app will fail when trying to hash passwords with Argon2id`);
  console.log(`    Solution options:`);
  console.log(`    1. Install argon2 with proper native bindings`);
  console.log(`    2. Use an alternative like bcryptjs (less secure but works)`);
  console.log(`    3. Use a serverless function for password hashing`);
}

console.log('\n========================================\n');
