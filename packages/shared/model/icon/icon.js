// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const json = require('./iconfont.json');

/**
 * 1. download icons from https://www.iconfont.cn/
 * 2. cp iconfont.json to this dictionary
 * 3. run `node ./icon.js` to create the ts file.
 */

const test = JSON.stringify(json);
const reg = /"font_class":"[\w-]+",/g;

let str = 'export type HelixIcons = \n';
let res = '';

while ((res = reg.exec(test))) {
  const result = res[0].split(':')[1].slice(0, -1);
  str = `${str} | ${result}`;
}

fs.writeFileSync(path.join(__dirname, './icons.ts'), str + ';');
