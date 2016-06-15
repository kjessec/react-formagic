'use strict';
import { isObject } from './util';
const isArray = Array.isArray;

export function defineReactive(source, triggerDispatch) {
  const newObj = {};
  const keys = Object.keys(source);

  // walk
  keys.forEach(key => {
    const initialState = source[key];
    let _state;

    if(isArray(initialState)) {
      _state = initialState.map(state => {
        if(isObject(state)) return defineReactive(state, triggerDispatch);
        // do not support array => primitive
        return state;
      });
    }

    else if(isObject(initialState)) {
      _state = defineReactive(initialState, triggerDispatch);
    }

    else {
      _state = initialState;
    }

    // define reactive property
    Object.defineProperty(newObj, key, {
      enumerable: true,
      get() { return _state; },
      set(nextState) {
        // set the internal state
        _state = nextState;

        // upon any value is being set, do triggerDispatch
        triggerDispatch();
      }
    });
  });

  return newObj;
}
