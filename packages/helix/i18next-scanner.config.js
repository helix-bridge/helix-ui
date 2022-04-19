const typescriptTransform = require('i18next-scanner-typescript');

module.exports = {
  input: [
    'pages/**/*.tsx',
    'components/**/*.tsx',
    // Use ! to filter out files or directories
    '!src/__tests__/**',
    '!src/components/icons/**',
    '!**/node_modules/**',
  ],
  output: './public/',
  options: {
    debug: false,
    removeUnusedKeys: false,
    browserLanguageDetection: true,
    func: {
      list: ['i18next.t', 'i18n.t', 't'],
      extensions: ['.js', 'jsx'],
    },
    trans: {
      extensions: ['.js', '.jsx'],
      fallbackKey(_, value) {
        return value;
      },
    },
    lngs: ['en', 'zh'],
    ns: ['translation'],
    defaultLng: 'en',
    defaultNs: 'translation',
    defaultValue(lng, ns, key) {
      if (lng === 'en') {
        // Return key as the default value for English language
        return key;
      }
      // Return the string '__NOT_TRANSLATED__' for other languages
      return '__NOT_TRANSLATED__';
    },
    resource: {
      loadPath: './public/locales/{{lng}}/{{ns}}.json',
      savePath: 'locales/{{lng}}/{{ns}}.json',
      jsonIndent: 2,
      lineEnding: '\n',
    },
    nsSeparator: false, // namespace separator
    keySeparator: false, // key separator
    interpolation: {
      prefix: '{{',
      suffix: '}}',
    },
  },
  transform: typescriptTransform({ extensions: ['.tsx', 'ts'] }),
};
