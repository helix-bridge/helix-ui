const { i18n } = require('./next-i18next.config');
const withAntdLess = require('next-plugin-antd-less');
const withPlugins = require('next-compose-plugins');
const path = require('path');
// const antdVarsPath = '../shared/theme/antd/vars.less';
// const { getLessVars } = require('../shared/plugins/antd-theme-generator');
// const themeVariables = getLessVars(path.join(__dirname, antdVarsPath));
// const defaultVars = getLessVars(path.join(__dirname, '../../node_modules/antd/lib/style/themes/default.less'));
const CircularDependencyPlugin = require('circular-dependency-plugin');
const darkVars = require('../shared/theme/antd/dark.json');
const projectVars = require('../shared/theme/antd/vars.json');
const pangolinVariables = require('../shared/theme/network/dark/pangolin.json');

// const darkVars = {
//   ...getLessVars(path.join(__dirname, '../../node_modules/antd/lib/style/themes/dark.less')),
//   '@primary-color': defaultVars['@primary-color'],
//   '@picker-basic-cell-active-with-range-color': 'darken(@primary-color, 20%)',
// };

// just for dev purpose, use to compare vars in different theme.
// fs.writeFileSync('./ant-theme-vars/dark.json', JSON.stringify(darkVars));
// fs.writeFileSync('./ant-theme-vars/light.json', JSON.stringify(lightVars));
// fs.writeFileSync('./ant-theme-vars/theme.json', JSON.stringify(themeVariables));

const circularDependencyPlugin = new CircularDependencyPlugin({
  exclude: /\*.js|node_modules/,
  failOnError: true,
  allowAsyncCycles: false,
  cwd: process.cwd(),
});

class WasmChunksFixPlugin {
  apply(compiler) {
    compiler.hooks.thisCompilation.tap('WasmChunksFixPlugin', (compilation) => {
      compilation.hooks.processAssets.tap({ name: 'WasmChunksFixPlugin' }, (assets) =>
        Object.entries(assets).forEach(([pathname, source]) => {
          if (!pathname.match(/\.wasm$/)) return;
          compilation.deleteAsset(pathname);

          const name = pathname.split('/')[1];
          const info = compilation.assetsInfo.get(pathname);
          compilation.emitAsset(name, source, info);
        })
      );
    });
  }
}

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
    // ...themeVariables,
    ...pangolinVariables,
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

  webpack(config, { isServer, dev }) {
    const wasmExtensionRegExp = /\.wasm$/;

    config.resolve.extensions.push('.wasm');

    config.module.rules.forEach((rule) => {
      (rule.oneOf || []).forEach((oneOf) => {
        if (oneOf.loader && oneOf.loader.indexOf('file-loader') >= 0) {
          // make file-loader ignore WASM files
          oneOf.exclude.push(wasmExtensionRegExp);
        }
      });
    });

    // add a dedicated loader for WASM
    config.module.rules.push({
      test: wasmExtensionRegExp,
      type: 'javascript/auto',
      include: path.resolve(__dirname, 'src'),
      use: [{ loader: require.resolve('wasm-loader'), options: {} }],
    });

    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
    });

    config.module.rules.push({
      test: /\.js$/,
      include: /node_modules/,
      loader: require.resolve('@open-wc/webpack-import-meta-loader'),
    });

    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };

    if (!dev && isServer) {
      config.output.webassemblyModuleFilename = 'chunks/[id].wasm';
      config.plugins.push(new WasmChunksFixPlugin());
    }

    return config;
  },

  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
});
