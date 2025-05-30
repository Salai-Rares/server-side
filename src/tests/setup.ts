import 'jest-extended'; // Adds helpful Jest matchers
import { jest } from '@jest/globals';
import type { Mongoose } from 'mongoose';
import mongoose from 'mongoose';

import { MongoMemoryServer } from 'mongodb-memory-server';

// 1. Global Type Extensions (for custom matchers)
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(floor: number, ceiling: number): R;
    }
  }
}

// 2. Global Test Variables
let mongoServer: MongoMemoryServer;
let mongooseInstance: Mongoose;
let counter = 0 ;

// 3. Jest Lifecycle Hooks
beforeAll(async () => {
  // ========================
  // Database Initialization
  // ========================
  mongoServer = await MongoMemoryServer.create();
  mongooseInstance = await mongoose.connect(mongoServer.getUri());


  // ========================
  // Custom Matchers
  // ========================
  expect.extend({
    toBeWithinRange(received: number, floor: number, ceiling: number) {
      const pass = received >= floor && received <= ceiling;
      return {
        message: () => `expected ${received} to be within range ${floor}-${ceiling}`,
        pass
      };
    }
  });
});

// 4. Cleanup After Tests
afterAll(async () => {
  await mongooseInstance.disconnect();
  await mongoServer.stop();

});

// 5. Reset Isolation Between Tests
afterEach(async () => {
  // Clear database collections
  const collections = mongooseInstance.connection.collections;
  console.log(`after test count ${counter++}`)
  for (const key in collections) {
    await collections[key].deleteMany({});
  }


  // Clear all mocks
  jest.clearAllMocks();
});


