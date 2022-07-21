import { upperFirst } from 'lodash';
import { BridgeCategory } from 'shared/model';

export function bridgeCategoryDisplay(category: BridgeCategory) {
  return /^[a-z]$/.test(category) ? upperFirst(category) : category;
}
