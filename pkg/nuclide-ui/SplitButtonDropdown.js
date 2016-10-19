Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _Button;

function _load_Button() {
  return _Button = require('./Button');
}

var _ButtonGroup;

function _load_ButtonGroup() {
  return _ButtonGroup = require('./ButtonGroup');
}

var _Dropdown;

function _load_Dropdown() {
  return _Dropdown = require('./Dropdown');
}

var _electron;

function _load_electron() {
  return _electron = _interopRequireDefault(require('electron'));
}

var remote = (_electron || _load_electron()).default.remote;

(0, (_assert || _load_assert()).default)(remote != null);

var SplitButtonDropdown = (function (_React$Component) {
  _inherits(SplitButtonDropdown, _React$Component);

  function SplitButtonDropdown() {
    _classCallCheck(this, SplitButtonDropdown);

    _get(Object.getPrototypeOf(SplitButtonDropdown.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(SplitButtonDropdown, [{
    key: 'render',
    value: function render() {
      var _this = this;

      var selectedOption = this.props.options.find(function (option) {
        return option.type !== 'separator' && option.value === _this.props.value;
      }) || this.props.options[0];

      (0, (_assert || _load_assert()).default)(selectedOption.type !== 'separator');

      var ButtonComponent = this.props.buttonComponent || (_Button || _load_Button()).Button;

      var dropdownOptions = this.props.options.map(function (option) {
        return _extends({}, option, {
          selectedLabel: ''
        });
      });

      return (_reactForAtom || _load_reactForAtom()).React.createElement(
        (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
        { className: 'nuclide-ui-split-button-dropdown' },
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          ButtonComponent,
          {
            size: this.props.size == null ? undefined : this.props.size,
            disabled: this.props.confirmDisabled === true,
            icon: selectedOption.icon || undefined,
            onClick: this.props.onConfirm },
          selectedOption.selectedLabel || selectedOption.label || ''
        ),
        (_reactForAtom || _load_reactForAtom()).React.createElement((_Dropdown || _load_Dropdown()).Dropdown, {
          size: this._getDropdownSize(this.props.size),
          disabled: this.props.changeDisabled === true,
          options: dropdownOptions,
          value: this.props.value,
          onChange: this.props.onChange
        })
      );
    }
  }, {
    key: '_getDropdownSize',
    value: function _getDropdownSize(size) {
      switch (size) {
        case (_Button || _load_Button()).ButtonSizes.EXTRA_SMALL:
          return 'xs';
        case (_Button || _load_Button()).ButtonSizes.SMALL:
          return 'sm';
        case (_Button || _load_Button()).ButtonSizes.LARGE:
          return 'lg';
        default:
          return 'sm';
      }
    }
  }]);

  return SplitButtonDropdown;
})((_reactForAtom || _load_reactForAtom()).React.Component);

exports.SplitButtonDropdown = SplitButtonDropdown;
exports.ButtonSizes = (_Button || _load_Button()).ButtonSizes;