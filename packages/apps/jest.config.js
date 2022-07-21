module.exports = {
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      isolatedModules: true,
      tsconfig: './tsconfig.test.json'
    },
  },
  transform: {
    '\\.js$': ['babel-jest', { configFile: './babel-jest.config.js' }],
  },
  setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/', '<rootDir>/cypress'],
};
