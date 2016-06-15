'use strict';
import React from 'react';
import { isObject, isArray } from './util';

export function formagic(_selector, _onGlobalStateChange, _options = {}) {
  return function _wrap(Component) {
    return class FormagicWrapped extends React.Component {

      constructor(props) {
        super(props);

        // assign options
        this.options = _options;

        // assign selector
        this.selector = _selector;

        // assign onGlobalStateChange
        this.onGlobalStateChange = _onGlobalStateChange;

        // initialize repo
        this._repo = {};

        this.recalculate(props);
      }

      componentWillReceiveProps(nextProps) {
        this.recalculate(nextProps);
      }

      recalculate(props) {
        const { selector } = this;
        const selected = selector(props);
        if(selected) {
          this._repo = defineReactive(
            selected,
            this.handleGlobalStateChange.bind(this)
          );
        }
      }

      handleGlobalStateChange() {
        const { dispatch } = this.props;
        const { _repo, onGlobalStateChange } = this;

        onGlobalStateChange(_repo, dispatch);
      }

      render() {
        const { transclude } = this.options;
        const { _repo } = this;
        const formagicProps = transclude ? { ..._repo } : { formagic: _repo };

        return <Component {...this.state} {...this.props} {...formagicProps}/>;
      }
    };
  };
}

export function bind(obj, key, type) {
  if(!type) type = v => v;
  return {
    value: type(obj[key]),
    checked: Boolean(!!obj[key]),
    onChange(event) {
      obj[key] = type(event.target.value)
    }
  };
}

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
