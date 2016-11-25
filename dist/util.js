'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var isArray = exports.isArray = Array.isArray;
var isObject = exports.isObject = function isObject(obj) {
  return obj === Object(obj);
};
var deepPlant = exports.deepPlant = function deepPlant(source, path, reduce) {
  var sepPath = path.split('.');
  var newState = _recursivePlant(source, sepPath, function (newTree) {
    return newTree;
  }, reduce);

  return newState || source;
};

function _recursivePlant(state, sepPath, callback, reduce) {
  // sepPath.length === 0 means we're at the leaf node we need
  if (!sepPath.length) {
    var newLeafState = reduce(state);
    return callback(newLeafState);
  }

  var path = sepPath.shift();

  // if path cannot be found, return false
  if (state[path] === null || typeof state[path] === 'undefined') return false;

  return _recursivePlant(state[path], sepPath, function (newChildState) {
    if (isArray(state)) {
      var newState = [].concat(_toConsumableArray(state));
      newState[path] = newChildState;
      return callback(newState);
    } else if (isObject(state)) {
      return callback(_extends({}, state, _defineProperty({}, path, newChildState)));
    }

    throw new Error(path + ' is not an array nor object.');
  }, reduce);
}