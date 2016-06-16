'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isObject = isObject;
function isObject(obj) {
  return obj === Object(obj);
}

var isArray = exports.isArray = Array.isArray;