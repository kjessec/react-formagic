'use strict';
import React from 'react';
import createProxyTrie from './createProxyTrie';

const _defaultOptions = {
  // do not do transclusion by default
  transclude: false,

  // default namespace passed as a prop is formagic
  namespace: 'formagic'
};

export default function formagic(propsToProxy, subscriber, options) {
  return function _wrap(Component) {
    return class FormagicWrapperComponent extends React.Component {

      constructor(props) {
        super(props);

        // assign options
        this.options = { ..._defaultOptions, ...options };
        this.propsToProxy = propsToProxy;
        this.subscriber = subscriber;

        // initialize repo
        this.proxiedTrie = {};
      }

      componentWillMount() {
        this.proxiedTrie = this.recalculateReactiveTree(this.props);
      }

      componentWillReceiveProps(nextProps) {
        this.proxiedTrie = this.recalculateReactiveTree(nextProps);
      }

      recalculateReactiveTree(dataTree) {
        const { propsToProxy, subscriber } = this;
        const selectedDataTree = propsToProxy(dataTree);

        return createProxyTrie(
          selectedDataTree,
          newState => subscriber(newState, this.props)
        );
      }

      render() {
        const { transclude } = this.options;
        const { proxiedTrie } = this;
        const formagicProps = transclude ? { ...proxiedTrie } : { [this.options.namespace]: proxiedTrie };

        return <Component {...this.props} {...formagicProps}/>;
      }
    };
  };
}
