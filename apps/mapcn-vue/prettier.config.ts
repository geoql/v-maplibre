import type { Config } from 'prettier';

const config: Config = {
  $schema: 'http://json.schemastore.org/prettierrc',
  semi: true,
  arrowParens: 'always',
  singleQuote: true,
  trailingComma: 'all',
  bracketSpacing: true,
  htmlWhitespaceSensitivity: 'css',
  insertPragma: false,
  tabWidth: 2,
  vueIndentScriptAndStyle: true,
  endOfLine: 'lf',
};

export default config;
