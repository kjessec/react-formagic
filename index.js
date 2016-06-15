'use strict';
import React from 'react';
import { defineReactive } from './reactive';

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

export function bind(obj, key) {
  return {
    value: obj[key],
    onChange(event) {
      obj[key] = event.target.value;
    }
  };
}
