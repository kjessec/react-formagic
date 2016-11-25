'use strict';
import { isObject, isArray, deepPlant, shallowCompare } from './util';

// type constants
const IS_ARRAY      = 0x1;
const IS_OBJECT     = 0x2;

export default function createProxyContext() {
  let proxyTrie = {};
  let notifyUpdate = null;

  return function createProxyTrie(source, _notifyUpdate) {
    notifyUpdate = _notifyUpdate;

    // using previous proxyTrie, calculate a new proxy trie
    proxyTrie = createProxyNode(proxyTrie, source, (path, nextNodeState) => {
      // caution: proxyTrie here is the newer version!
      notifyUpdate(deepPlant(proxyTrie, path.slice(1), () => nextNodeState));
    }, '');

    return proxyTrie;
  }
}

function createProxyNode(previous, source, callback, path = '') {
  // suppress unnecessary recalculation
  if(previous === source) return source;

  // go along...
  switch(getType(source)) {
    case IS_ARRAY:
      return source.map((child, idx) => createProxyNode((previous || [])[idx], child, callback, `${path}.${idx}`));

    // use looped defineProperty over defineProperties,
    // http://jsperf.com/defineproperties-vs-looped-defineproperty
    case IS_OBJECT:
      const proxiedChildren = {};
      Object.keys(source).forEach(key => {
        const child = createProxyNode((previous || {})[key], source[key], callback, `${path}.${key}`);

        // suppress unnecessarily re-defining getter/setter
        if(child === (previous || {})[key]) {
          proxiedChildren[key] = child;
        }

        // define getter/setter if new
          Object.defineProperty(proxiedChildren, key, {
            get() { return child; },
            set(newValue) { callback(`${path}.${key}`, newValue); },
            enumerable: true
          });
      });

      return proxiedChildren;

    // all js primitives
    default:
      return source;
  }

  throw new TypeError('Unknown data supplied, neither array or object.');
}

function getType(node) {
  return isArray(node) ? IS_ARRAY : (isObject(node) && IS_OBJECT);
}
