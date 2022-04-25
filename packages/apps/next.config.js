const { i18n } = require('./next-i18next.config');
const withAntdLess = require('next-plugin-antd-less');
const withPlugins = require('next-compose-plugins');
const AntDesignThemePlugin = require('@helix/shared/plugins/antd-theme-plugin');
const path = require('path');
const antdVarsPath = '../shared/theme/antd/vars.less';
const { getLessVars } = require('@helix/shared/plugins/antd-theme-generator');
const themeVariables = getLessVars(path.join(__dirname, antdVarsPath));
const defaultVars = getLessVars(path.join(__dirname, '../../node_modules/antd/lib/style/themes/default.less'));
const CircularDependencyPlugin = require('circular-dependency-plugin');

const darkVars = {
  ...getLessVars(path.join(__dirname, '../../node_modules/antd/lib/style/themes/dark.less')),
  '@primary-color': defaultVars['@primary-color'],
  '@picker-basic-cell-active-with-range-color': 'darken(@primary-color, 20%)',
};

const lightVars = {
  ...getLessVars(path.join(__dirname, '../../node_modules/antd/lib/style/themes/compact.less')),
  '@primary-color': defaultVars['@primary-color'],
};

// just for dev purpose, use to compare vars in different theme.
// fs.writeFileSync('./ant-theme-vars/dark.json', JSON.stringify(darkVars));
// fs.writeFileSync('./ant-theme-vars/light.json', JSON.stringify(lightVars));
// fs.writeFileSync('./ant-theme-vars/theme.json', JSON.stringify(themeVariables));

const themeOptions = {
  antDir: path.join(__dirname, '../../node_modules/antd'),
  stylesDir: path.join(__dirname, './styles'),
  varFile: path.join(__dirname, antdVarsPath),
  themeVariables: Array.from(
    new Set([...Object.keys(darkVars), ...Object.keys(lightVars), ...Object.keys(themeVariables)])
  ),
  indexFileName: false,
  outputFilePath: path.join(__dirname, './public/color.less'),
  generateOnce: false,
};


const themePlugin = new AntDesignThemePlugin(themeOptions);

const circularDependencyPlugin = new CircularDependencyPlugin({
  exclude: /\*.js|node_modules/,
  failOnError: true,
  allowAsyncCycles: false,
  cwd: process.cwd(),
});

module.exports = withPlugins([withAntdLess], {
  experimental: {
    externalDir: true,
  },
  i18n,
  // lessVarsFilePath: './theme/antd/vars.less', // optional
  // lessVarsFilePathAppendToEndOfContent: false, // optional
  // optional https://github.com/webpack-contrib/css-loader#object
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
    config.plugins.push(themePlugin);
    config.plugins.push(circularDependencyPlugin);
    
    return config;
  },
  
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
});
