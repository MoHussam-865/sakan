import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  // Points to the Next.js app root so next/jest can pick up next.config.ts and .env files
  dir: "./",
});

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",

  // Runs after the test environment (jsdom) is set up – ideal for @testing-library/jest-dom
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],

  // TS path alias support matching tsconfig.json paths
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  // Collect coverage only from src, excluding test files and type-only files
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**",
    "!src/**/tests/**",
  ],

  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.{ts,tsx}",
    "<rootDir>/src/**/*.test.{ts,tsx}",
    "<rootDir>/tests/**/*.test.{ts,tsx}",
  ],
};

export default createJestConfig(config);
