'use strict';
import { isObject, isArray } from './util';
createProxy.trackChanges = false;
export function createProxy(source, callback, path = '__root', _createProxy = createProxy) {
  // if array, map through the values and create proxies
  if(isArray(source)) {
    return source.map((child, key) => {
      return _createProxy(child, function(newState) {
        if(createProxy.trackChanges) {
          console.log(`[Array][${path}.${key}] state changed! ${path}.${key} =>`, newState);
        }
        const newArray = [...source];
        newArray[key] = newState;
        callback(newArray, path);
      }, `${path}.${key}`);
    });
  }

  else if(isObject(source)) {
    const dirtySource = {};
    Object.keys(source).map(key => {
      dirtySource[key] = _createProxy(source[key], function(newState) {
        if(createProxy.trackChanges) {
          console.log(`[Object][${path}.${key}] state changed! ${path}.${key} =>`, newState);
        }
        callback({ ...source, [key]: newState }, path);
      }, `${path}.${key}`);
    });

    // set proxy
    const proxy = new Proxy(dirtySource, {
      // a setter that knows how to propagate changes upwards
      set(target, name, value) {
        if(createProxy.trackChanges) {
          console.log(`[Leaf][${path}.${name}] ${name} => ${value}`);
        }
        target[name] = value;
        callback({ ...target, [name]: value }, path);
        return true;
      }
    });

    return proxy;
  }

  // return primitive as is
  else return source;
}
