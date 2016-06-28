'use strict';
import React from 'react';
import { createProxy } from './createProxy';
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
        const { selectPropsToListen, subscribeToChanges } = this;
        const { dispatch } = this.props;
        const selectedDataTree = selectPropsToListen(dataTree);

        this._repo = createProxy(
          selectedDataTree,
          (newState) => subscribeToChanges(newState, dispatch)
        );
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
