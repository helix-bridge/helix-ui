module.exports = {
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
  transform: {
    '\\.js$': ['babel-jest', { configFile: './babel-jest.config.js' }],
  },
  setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'jsdom',
  transformIgnorePatterns: [
    "node_modules/(?!(@polkadot|react-i18next|next-i18next))",
  ],
};
