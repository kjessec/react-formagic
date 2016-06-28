'use strict';
import { isObject, isArray } from './util';
createProxy.trackChanges = false;

export function createProxy(source, callback, path = '__root', _createProxy = createProxy) {
  // if array, map through the values and create proxies
  if(isArray(source)) {
    return source.map((child, key) => _createProxy(child, function(newState) {
      if(createProxy.trackChanges) {
        console.log(`[Array][${path}.${key}] state changed! ${path}.${key} =>`, newState);
      }

      // shallow copy the array and propagate
      const newArray = [...source];
      newArray[key] = newState;
      callback(newArray, path);
    }, `${path}.${key}`));
  }

  else if(isObject(source)) {
    const dirtySource = {};
    Object.keys(source).map(key => {
      dirtySource[key] = _createProxy(source[key], function(newState) {
        if(createProxy.trackChanges) {
          console.log(
            `[Object][${path}.${key}] state changed!`,
            source[key], ` => `, newState
          );
        }

        // shallow copy the object and propagate
        callback({ ...source, [key]: newState });
      }, `${path}.${key}`);
    });

    // set proxy
    const proxy = new Proxy(dirtySource, {
      // a setter that knows how to propagate changes upwards
      set(target, name, value) {
        if(createProxy.trackChanges) {
          console.log(`[Leaf][${path}.${name}] ${name} => ${value}`);
        }

        // option 2
        callback({ ...target, [name]: value });
        return true;
      }
    });

    return proxy;
  }

  // return primitive as is
  return source;
}
