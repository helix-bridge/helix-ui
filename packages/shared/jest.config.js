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
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'node',
};
