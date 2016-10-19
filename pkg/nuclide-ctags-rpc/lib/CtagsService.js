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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

// nothing here

var getCtagsService = _asyncToGenerator(function* (uri) {
  var dir = yield (_commonsNodeFsPromise || _load_commonsNodeFsPromise()).default.findNearestFile(TAGS_FILENAME, (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.dirname(uri));
  if (dir == null) {
    return null;
  }
  return new CtagsService((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.join(dir, TAGS_FILENAME));
});

exports.getCtagsService = getCtagsService;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsNodeNuclideUri;

function _load_commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _commonsNodeFsPromise;

function _load_commonsNodeFsPromise() {
  return _commonsNodeFsPromise = _interopRequireDefault(require('../../commons-node/fsPromise'));
}

var _commonsNodeCollection;

function _load_commonsNodeCollection() {
  return _commonsNodeCollection = require('../../commons-node/collection');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var TAGS_FILENAME = 'tags';

var CtagsService = (function () {
  function CtagsService(tagsPath) {
    _classCallCheck(this, CtagsService);

    this._tagsPath = tagsPath;
  }

  _createClass(CtagsService, [{
    key: 'getTagsPath',
    value: function getTagsPath() {
      return Promise.resolve(this._tagsPath);
    }
  }, {
    key: 'findTags',
    value: function findTags(query, options) {
      var _this = this;

      var ctags = undefined;
      try {
        ctags = require('../VendorLib/ctags-prebuilt/lib/ctags');
      } catch (e) {
        (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error('Could not load the ctags package:', e);
        return Promise.resolve([]);
      }

      var dir = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.dirname(this._tagsPath);
      return new Promise(function (resolve, reject) {
        ctags.findTags(_this._tagsPath, query, options, _asyncToGenerator(function* (error, tags) {
          if (error != null) {
            reject(error);
          } else {
            var processed = yield Promise.all(tags.map(_asyncToGenerator(function* (tag) {
              // Convert relative paths to absolute ones.
              tag.file = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.join(dir, tag.file);
              // Tag files are often not perfectly in sync - filter out missing files.
              if (yield (_commonsNodeFsPromise || _load_commonsNodeFsPromise()).default.exists(tag.file)) {
                if (tag.fields != null) {
                  var map = new Map();
                  for (var key in tag.fields) {
                    map.set(key, tag.fields[key]);
                  }
                  tag.fields = map;
                }
                return tag;
              }
              return null;
            })));
            resolve((0, (_commonsNodeCollection || _load_commonsNodeCollection()).arrayCompact)(processed));
          }
        }));
      });
    }
  }, {
    key: 'dispose',
    value: function dispose() {}
  }]);

  return CtagsService;
})();

exports.CtagsService = CtagsService;

// As specified in the tags file; defaults to 0 if not specified.

// As specified in the tags file; defaults to empty if not specified.