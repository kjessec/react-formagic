'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.formagic = formagic;
exports.bind = bind;
exports.defineReactive = defineReactive;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _defaultOptions = {
  transclude: true
};

function formagic(_selectPropsToListen, _subscribeToChanges, _options) {
  return function _wrap(Component) {
    return function (_React$Component) {
      _inherits(FormagicWrapperComponent, _React$Component);

      function FormagicWrapperComponent(props) {
        _classCallCheck(this, FormagicWrapperComponent);

        // assign options

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(FormagicWrapperComponent).call(this, props));

        _this.options = _extends({}, _defaultOptions, _options);

        // assign selectPropsToListen
        _this.selectPropsToListen = _selectPropsToListen;

        // assign subscribeToChanges
        _this.subscribeToChanges = _subscribeToChanges;

        // initialize repo
        _this._repo = {};
        return _this;
      }

      _createClass(FormagicWrapperComponent, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
          this.recalculateReactiveTree(this.props);
        }
      }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
          this.recalculateReactiveTree(nextProps);
        }
      }, {
        key: 'recalculateReactiveTree',
        value: function recalculateReactiveTree(dataTree) {
          var selectPropsToListen = this.selectPropsToListen;

          var selectedDataTree = selectPropsToListen(dataTree);

          this._repo = defineReactive(selectedDataTree, this.handleGlobalStateChange.bind(this));
        }
      }, {
        key: 'handleGlobalStateChange',
        value: function handleGlobalStateChange() {
          var dispatch = this.props.dispatch;
          var _repo = this._repo;
          var subscribeToChanges = this.subscribeToChanges;


          subscribeToChanges(_repo, dispatch);
        }
      }, {
        key: 'render',
        value: function render() {
          var transclude = this.options.transclude;
          var _repo = this._repo;

          var formagicProps = transclude ? _extends({}, _repo) : { formagic: _repo };

          return _react2.default.createElement(Component, _extends({}, this.props, formagicProps));
        }
      }]);

      return FormagicWrapperComponent;
    }(_react2.default.Component);
  };
}

function bind(obj, key, type) {
  if (!type) type = function type(v) {
    return v;
  };
  return {
    value: type(obj[key] || ''),
    checked: Boolean(!!obj[key]),
    onChange: function onChange(event) {
      obj[key] = type(event.target.value);
    }
  };
}

function defineReactive(source, triggerDispatch) {
  // ignore primitive/function leaf
  if (typeof source === 'function' || (typeof source === 'undefined' ? 'undefined' : _typeof(source)) !== 'object') return source;

  // if object (object/array), walk through the members
  // and set reactivity
  var newObj = {};

  // walk through the object
  Object.keys(source).forEach(function (key) {
    var initialState = source[key];

    // if array, map through the values and set reactivity
    if ((0, _util.isArray)(initialState)) {
      newObj[key] = initialState.map(function (state) {
        return defineReactive(state, triggerDispatch);
      });
    }

    // if object, go deeper
    else if ((0, _util.isObject)(initialState)) {
        newObj[key] = defineReactive(initialState, triggerDispatch);
      }

      // only make primitives reactive
      else {
          (function () {
            var _state = initialState;

            // define reactive property
            Object.defineProperty(newObj, key, {
              enumerable: true,
              get: function get() {
                return _state;
              },
              set: function set(nextState) {
                // set the internal state
                _state = nextState;

                // upon any value is being set, do triggerDispatch
                triggerDispatch();
              }
            });
          })();
        }
  });

  return newObj;
}