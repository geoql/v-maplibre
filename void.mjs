import * as voidPlugin from '@awmottaz/prettier-plugin-void-html';
import { parsers } from 'prettier/plugins/html';

voidPlugin.languages.extensions = ['.html', '.vue'];
voidPlugin.parsers.vue = parsers.vue;

export default voidPlugin;
