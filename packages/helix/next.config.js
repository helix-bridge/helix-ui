const { i18n } = require('./next-i18next.config');
const withAntdLess = require('next-plugin-antd-less');
const withPlugins = require('next-compose-plugins');
const path = require('path');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const darkVars = require('../shared/theme/antd/dark.json');
const projectVars = require('../shared/theme/antd/vars.json');
const crabVariables = require('../shared/theme/network/dark/crab.json');
const proVariables = require('../shared/theme/network/dark/pro.json');

const envVariables = process.env.CHAIN_TYPE === 'test' ? crabVariables : proVariables;

const circularDependencyPlugin = new CircularDependencyPlugin({
  exclude: /\*.js|node_modules/,
  failOnError: true,
  allowAsyncCycles: false,
  cwd: process.cwd(),
});

module.exports = withPlugins([withAntdLess, circularDependencyPlugin], {
  experimental: {
    externalDir: true,
  },
  i18n,
  // lessVarsFilePath: antdVarsPath, // optional
  // lessVarsFilePathAppendToEndOfContent: false, // optional
  // optional https://github.com/webpack-contrib/css-loader#object
  modifyVars: {
    ...darkVars,
    ...projectVars,
    ...envVariables,
  },
  cssLoaderOptions: {
    mode: 'local',
    // localIdentName: __DEV__ ? "[local]--[hash:base64:4]" : "[hash:base64:8]", // invalid! for Unify getLocalIdent (Next.js / CRA), Cannot set it, but you can rewritten getLocalIdentFn
    exportLocalsConvention: 'camelCase',
    exportOnlyLocals: false,
    // ...
    getLocalIdent: (context, localIdentName, localName, options) => {
      return 'whatever_random_class_name';
    },
  },

  // for Next.js ONLY
  nextjs: {
    localIdentNameFollowDev: true, // default false, for easy to debug on PROD mode
  },

  webpack(config) {
    return config;
  },

  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
});
