'use strict';
import React from 'react';
import { isObject, isArray } from './util';

const _defaultOptions = {
  // do not do transclusion by default
  transclude: false,
  // default namespace passed as a prop is formagic
  namespace: 'formagic'
};

export function formagic(_selectPropsToListen, _subscribeToChanges, _options) {
  return function _wrap(Component) {
    return class FormagicWrapperComponent extends React.Component {

      constructor(props) {
        super(props);

        // assign options
        this.options = { ..._defaultOptions, ..._options };

        // assign selectPropsToListen
        this.selectPropsToListen = _selectPropsToListen;

        // assign subscribeToChanges
        this.subscribeToChanges = _subscribeToChanges;

        // initialize repo
        this._repo = {};
      }

      componentWillMount() {
        this.recalculateReactiveTree(this.props);
      }

      componentWillReceiveProps(nextProps) {
        this.recalculateReactiveTree(nextProps);
      }

      recalculateReactiveTree(dataTree) {
        const { selectPropsToListen } = this;
        const selectedDataTree = selectPropsToListen(dataTree);

        this._repo = defineReactive(
          selectedDataTree,
          this.handleGlobalStateChange.bind(this)
        );
      }

      handleGlobalStateChange() {
        const { dispatch } = this.props;
        const { _repo, subscribeToChanges } = this;

        subscribeToChanges(_repo, dispatch);
      }

      render() {
        const { transclude } = this.options;
        const { _repo } = this;
        const formagicProps = transclude ? { ..._repo } : { [this.options.namespace]: _repo };

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
  // return function, primitive, null/undefined as is
  // these are the leaf values, attempting to set reactivity on them
  // will fail
  if(
    typeof source === 'undefined' ||
    typeof source === 'function' ||
    typeof source !== 'object' ||
    source === null
  ) return source;

  // if array, map through the values and set reactivity
  else if(isArray(source)) {
    return source.map(state => defineReactive(state, triggerDispatch));
  }

  // if object (object/array), walk through the members
  // and set reactivity
  const newObj = {};

  // walk through the object
  Object.keys(source).forEach(key => {
    let persistedState = source[key];

    // if object, go deeper and recursively make all leaves reactive
    if(isObject(persistedState)) {
      persistedState = defineReactive(persistedState, triggerDispatch);
    }

    // define reactive property
    Object.defineProperty(newObj, key, {
      enumerable: true,
      get() { return persistedState; },
      set(nextState) {
        // set the internal state
        persistedState = nextState;

        // upon any value is being set, do triggerDispatch
        triggerDispatch();
      }
    });
  });

  return newObj;
}
