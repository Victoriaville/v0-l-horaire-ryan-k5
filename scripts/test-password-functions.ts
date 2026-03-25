/**
 * Test script for password hashing functions
 * Tests both new Argon2id and legacy PBKDF2 verification
 */

import { hashPassword, verifyPassword, verifyPBKDF2 } from "../lib/password-crypto";
import crypto from "crypto";

async function runTests() {
  console.log("[v0] ===== PASSWORD FUNCTION TEST SUITE =====\n");

  try {
    // TEST 1: Hash a new password with Argon2id
    console.log("[v0] TEST 1: Hashing new password with Argon2id...");
    const testPassword = "TestPassword123!@#";
    const argon2Hash = await hashPassword(testPassword);
    console.log("[v0] ✓ Hash created successfully");
    console.log("[v0] Hash format:", argon2Hash.substring(0, 20) + "...");
    console.log("[v0] Hash starts with $argon2id$:", argon2Hash.startsWith("$argon2id$"));

    // TEST 2: Verify password against Argon2id hash
    console.log("\n[v0] TEST 2: Verifying correct password against Argon2id hash...");
    const isValidCorrect = await verifyPassword(testPassword, argon2Hash);
    console.log("[v0] ✓ Correct password verification:", isValidCorrect);

    console.log("\n[v0] TEST 2b: Verifying WRONG password against Argon2id hash...");
    const isValidWrong = await verifyPassword("WrongPassword123", argon2Hash);
    console.log("[v0] ✓ Wrong password verification:", isValidWrong);

    // TEST 3: Create a legacy PBKDF2 hash (simulating old data)
    console.log("\n[v0] TEST 3: Creating legacy PBKDF2 hash (simulating old data)...");
    const salt = crypto.randomBytes(16);
    const pbkdf2Hash = crypto.pbkdf2Sync(testPassword, salt, 100000, 32, "sha256");
    const combined = Buffer.concat([salt, pbkdf2Hash]);
    const legacyHashBase64 = combined.toString("base64");
    console.log("[v0] ✓ Legacy PBKDF2 hash created");
    console.log("[v0] Hash format (base64):", legacyHashBase64.substring(0, 20) + "...");

    // TEST 4: Verify password against legacy PBKDF2 hash
    console.log("\n[v0] TEST 4: Verifying correct password against legacy PBKDF2 hash...");
    const isValidPBKDF2 = await verifyPBKDF2(testPassword, legacyHashBase64);
    console.log("[v0] ✓ PBKDF2 verification (correct):", isValidPBKDF2);

    console.log("\n[v0] TEST 4b: Verifying WRONG password against legacy PBKDF2 hash...");
    const isValidPBKDF2Wrong = await verifyPBKDF2("WrongPassword123", legacyHashBase64);
    console.log("[v0] ✓ PBKDF2 verification (wrong):", isValidPBKDF2Wrong);

    // SUMMARY
    console.log("\n[v0] ===== TEST SUMMARY =====");
    const allTestsPassed =
      isValidCorrect === true &&
      isValidWrong === false &&
      isValidPBKDF2 === true &&
      isValidPBKDF2Wrong === false;

    if (allTestsPassed) {
      console.log("[v0] ✅ ALL TESTS PASSED!");
      console.log("[v0] - Argon2id hashing works");
      console.log("[v0] - Argon2id verification works");
      console.log("[v0] - Legacy PBKDF2 verification works");
      console.log("[v0] - Wrong password rejection works for both");
    } else {
      console.log("[v0] ❌ SOME TESTS FAILED!");
      console.log("[v0] Test results:");
      console.log(`[v0] - Argon2id correct password: ${isValidCorrect}`);
      console.log(`[v0] - Argon2id wrong password rejection: ${!isValidWrong}`);
      console.log(`[v0] - PBKDF2 correct password: ${isValidPBKDF2}`);
      console.log(`[v0] - PBKDF2 wrong password rejection: ${!isValidPBKDF2Wrong}`);
    }
  } catch (error) {
    console.error("[v0] ❌ TEST ERROR:", error);
    process.exit(1);
  }
}

runTests();
