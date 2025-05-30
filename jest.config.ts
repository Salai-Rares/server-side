import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  // Core Configuration
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/src/tests'], // 1
  moduleFileExtensions: ['ts', 'js', 'json'], // 2

  // Path Aliasing (matches tsconfig.json)
  moduleNameMapper: { // 3
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@test/(.*)$': '<rootDir>/tests/$1'
  },

  // Test Execution Control
  testMatch: ['**/*.spec.ts', '**/*.test.ts'], // 4
  testPathIgnorePatterns: ['/node_modules/', '/dist/'], // 5
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'], // 6

  // Mock/Environment Behavior
  clearMocks: true, // 7
  resetMocks: true, // 8
  restoreMocks: true, // 9

  // Coverage Reporting
  collectCoverage: true, // 10
  coverageDirectory: 'coverage', // 11
  coveragePathIgnorePatterns: ['/node_modules/', '/tests/'], // 12
  coverageProvider: 'v8', // 13
  coverageThreshold: { // 14
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};

export default config;