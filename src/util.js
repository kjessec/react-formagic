'use strict';
export const isArray = Array.isArray;
export const isObject = obj => obj === Object(obj);
export const deepPlant = function deepPlant(source, path, reduce) {
  const sepPath = path.split('.');
  const newState = _recursivePlant(source, sepPath, newTree => newTree, reduce);

  return newState || source;
};

function _recursivePlant(state, sepPath, callback, reduce) {
  // sepPath.length === 0 means we're at the leaf node we need
  if(!sepPath.length) {
    const newLeafState = reduce(state);
    return callback(newLeafState);
  }

  const path = sepPath.shift();

  // if path cannot be found, return false
  if(state[path] === null || typeof state[path] === 'undefined') return false;

  return _recursivePlant(state[path], sepPath, newChildState => {
    if(isArray(state)) {
      const newState = [...state];
      newState[path] = newChildState;
      return callback(newState);
    } else if(isObject(state)) {
      return callback({ ...state, [path]: newChildState });
    }

    throw new Error(`${path} is not an array nor object.`);
  }, reduce);
}
