import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

/** @type {import("jest").Config} */
const customConfig = {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testMatch: ["<rootDir>/src/**/*.test.ts", "<rootDir>/src/**/*.test.tsx"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transformIgnorePatterns: ["/node_modules/(?!(three)/)"],
  collectCoverageFrom: [
    "src/lib/**/*.{ts,tsx}",
    "src/store/**/*.{ts,tsx}",
    "src/hooks/**/*.{ts,tsx}",
    "src/services/**/*.{ts,tsx}",
    "src/cypress/paths.ts",
    "!src/**/*.test.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/lib/sizing/recommender.ts",
    "!src/lib/virtual-fitting/garment-renderer.ts",
    "!src/lib/virtual-fitting/avatar-mesh-utils.ts",
    "!src/services/api-client.ts",
    "!src/services/auth.service.ts",
    "!src/services/virtual-fitting.service.ts",
    "!src/hooks/use-camera.ts",
    "!src/hooks/use-mediapipe-pose.ts",
    "!src/hooks/use-cart.ts",
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

export default createJestConfig(customConfig);
