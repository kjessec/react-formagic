'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = createProxyContext;

var _util = require('./util');

// type constants
var IS_ARRAY = 0x1;
var IS_OBJECT = 0x2;

function createProxyContext() {
  var proxyTrie = {};
  var notifyUpdate = null;

  return function createProxyTrie(source, _notifyUpdate) {
    notifyUpdate = _notifyUpdate;

    // using previous proxyTrie, calculate a new proxy trie
    proxyTrie = createProxyNode(proxyTrie, source, function (path, nextNodeState) {
      // caution: proxyTrie here is the newer version!
      notifyUpdate((0, _util.deepPlant)(proxyTrie, path.slice(1), function () {
        return nextNodeState;
      }));
    }, '');

    return proxyTrie;
  };
}

function createProxyNode(previous, source, callback) {
  var path = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';

  // suppress unnecessary recalculation
  if (previous === source) return source;

  // go along...

  var _ret = function () {
    switch (getType(source)) {
      case IS_ARRAY:
        return {
          v: source.map(function (child, idx) {
            return createProxyNode((previous || [])[idx], child, callback, path + '.' + idx);
          })
        };

      // use looped defineProperty over defineProperties,
      // http://jsperf.com/defineproperties-vs-looped-defineproperty
      case IS_OBJECT:
        var proxiedChildren = {};
        Object.keys(source).forEach(function (key) {
          var child = createProxyNode((previous || {})[key], source[key], callback, path + '.' + key);

          // suppress unnecessarily re-defining getter/setter
          if (child === (previous || {})[key]) {
            proxiedChildren[key] = child;
          }

          // define getter/setter if new
          Object.defineProperty(proxiedChildren, key, {
            get: function get() {
              return child;
            },
            set: function set(newValue) {
              callback(path + '.' + key, newValue);
            },

            enumerable: true
          });
        });

        return {
          v: proxiedChildren
        };

      // all js primitives
      default:
        return {
          v: source
        };
    }
  }();

  if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
  throw new TypeError('Unknown data supplied, neither array or object.');
}

function getType(node) {
  return (0, _util.isArray)(node) ? IS_ARRAY : (0, _util.isObject)(node) && IS_OBJECT;
}