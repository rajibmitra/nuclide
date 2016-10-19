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

exports.locationToString = locationToString;
exports.locationsEqual = locationsEqual;
exports.stripLocationsFileName = stripLocationsFileName;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _commonsNodeNuclideUri;

function _load_commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

function locationToString(location) {
  switch (location.type) {
    case 'source':
      return location.fileName + '(' + location.line + ')';
    case 'builtin':
      return '<builtin>';
    default:
      throw new Error('Bad location type');
  }
}

function locationsEqual(first, second) {
  if (first.type !== second.type) {
    return false;
  }
  switch (first.type) {
    case 'source':
      (0, (_assert || _load_assert()).default)(second.type === 'source');
      return first.fileName === second.fileName && first.line === second.line;
    case 'builtin':
      return true;
    default:
      throw new Error('Bad location type');
  }
}

function stripLocationsFileName(obj) {
  function inspect(key, value) {
    if (key === 'location' && value !== null && typeof value.fileName === 'string') {
      value.fileName = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.basename(value.fileName);
    } else {
      stripLocationsFileName(value);
    }
  }
  if (Array.isArray(obj)) {
    obj.forEach(function (value) {
      inspect(null, value);
    });
  } else if (obj instanceof Map) {
    obj.forEach(function (value, key) {
      inspect(key, value);
    });
  } else if (obj != null && typeof obj === 'object') {
    Object.keys(obj).forEach(function (key) {
      inspect(key, obj[key]);
    });
  }
  return obj;
}