'use strict';
import React from 'react';
import { isObject, isArray } from './util';

const _defaultOptions = {
  transclude: true
};

export function formagic(_selector, _onGlobalStateChange, _options) {
  return function _wrap(Component) {
    return class FormagicWrapperComponent extends React.Component {

      constructor(props) {
        super(props);

        // assign options
        this.options = { ..._defaultOptions, ..._options };

        // assign selector
        this.selector = _selector;

        // assign onGlobalStateChange
        this.onGlobalStateChange = _onGlobalStateChange;

        // initialize repo
        this._repo = {};
      }

      componentWillMount() {
        this.recalculate(this.props);
      }

      componentWillReceiveProps(nextProps) {
        this.recalculate(nextProps);
      }

      recalculate(dataTree) {
        const { selector } = this;
        const selectedDataTree = selector(dataTree);

        this._repo = defineReactive(
          selectedDataTree,
          this.handleGlobalStateChange.bind(this)
        );
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

        return <Component {...this.props} {...formagicProps}/>;
      }
    };
  };
}

export function bind(obj, key, type) {
  if(!type) type = v => v;
  return {
    value: type(obj[key] || ''),
    checked: Boolean(!!obj[key]),
    onChange(event) {
      obj[key] = type(event.target.value);
    }
  };
}

export function defineReactive(source, triggerDispatch) {
  // ignore primitive/function leaf
  if(typeof source === 'function' || typeof source !== 'object') return source;

  // if object (object/array), walk through the members
  // and set reactivity
  const newObj = {};

  // walk through the object
  Object.keys(source).forEach(key => {
    const initialState = source[key];

    // if array, map through the values and set reactivity
    if(isArray(initialState)) {
      newObj[key] = initialState.map(state => defineReactive(state, triggerDispatch));
    }

    // if object, go deeper
    else if(isObject(initialState)) {
      newObj[key] = defineReactive(initialState, triggerDispatch);
    }

    // only make primitives reactive
    else {
      let _state = initialState;

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
    }
  });

  return newObj;
}
