'use strict';
export function isObject(obj) {
  return obj === Object(obj);
}

export const isArray = Array.isArray;
