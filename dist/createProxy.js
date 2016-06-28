'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.createProxy = createProxy;

var _util = require('./util');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

createProxy.trackChanges = false;

function createProxy(source, callback) {
  var path = arguments.length <= 2 || arguments[2] === undefined ? '__root' : arguments[2];

  var _createProxy = arguments.length <= 3 || arguments[3] === undefined ? createProxy : arguments[3];

  // if array, map through the values and create proxies
  if ((0, _util.isArray)(source)) {
    return source.map(function (child, key) {
      return _createProxy(child, function (newState) {
        if (createProxy.trackChanges) {
          console.log('[Array][' + path + '.' + key + '] state changed! ' + path + '.' + key + ' =>', newState);
        }

        // shallow copy the array and propagate
        var newArray = [].concat(_toConsumableArray(source));
        newArray[key] = newState;
        callback(newArray, path);
      }, path + '.' + key);
    });
  } else if ((0, _util.isObject)(source)) {
    var _ret = function () {
      var dirtySource = {};
      Object.keys(source).map(function (key) {
        dirtySource[key] = _createProxy(source[key], function (newState) {
          if (createProxy.trackChanges) {
            console.log('[Object][' + path + '.' + key + '] state changed! ' + path + '.' + key, source, ' => ', newState);
          }

          // shallow copy the object and propagate
          callback(_extends({}, source, _defineProperty({}, key, newState)));
        }, path + '.' + key);
      });

      // set proxy
      var proxy = new Proxy(dirtySource, {
        // a setter that knows how to propagate changes upwards

        set: function set(target, name, value) {
          if (createProxy.trackChanges) {
            console.log('[Leaf][' + path + '.' + name + '] ' + name + ' => ' + value);
          }

          // option 2
          callback(_extends({}, target, _defineProperty({}, name, value)));
          return true;
        }
      });

      return {
        v: proxy
      };
    }();

    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
  }

  // return primitive as is
  return source;
}