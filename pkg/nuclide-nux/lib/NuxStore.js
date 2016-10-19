Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var NEW_NUX_EVENT = 'newNuxModel';

var NUX_SAVED_STORE = 'nuclide-nux.saved-nux-data-store';

exports.NUX_SAVED_STORE = NUX_SAVED_STORE;

var NuxStore = (function () {
  function NuxStore() {
    _classCallCheck(this, NuxStore);

    this._nuxMap = new Map();
    this._emitter = new (_atom || _load_atom()).Emitter();
  }

  _createClass(NuxStore, [{
    key: 'dispose',
    value: function dispose() {
      this._emitter.dispose();
    }

    // Load the saved NUX statuses. Reads serialized values from backend and local caches
    // and generates a map of NUX states by ID by merging the two values.
  }, {
    key: 'initialize',
    value: function initialize() {
      // Get the NUX backend cached information; stub for OSS friendliness
      var NuxBackendCache = undefined;
      try {
        // This inline import won't affect performance since we only call it once per NuxStore.
        // $FlowFB
        NuxBackendCache = require('./fb-NuxCache').NuxCache;
      } catch (e) {
        NuxBackendCache = (function () {
          function _class() {
            _classCallCheck(this, _class);
          }

          _createClass(_class, [{
            key: 'getNuxStatus',
            value: function getNuxStatus() {
              return new Map();
            }
          }]);

          return _class;
        })();
      }

      var nuclideNuxState = new Map(JSON.parse(window.localStorage.getItem(NUX_SAVED_STORE)));
      var fbNuxState = new NuxBackendCache().getNuxStatus();

      // Merge the two maps. If a key exists in both input maps, the value from
      // the latter (backend cache) will be used in the resulting map.
      // $FlowIgnore - Flow thinks the spread operator is incompatible with Map
      this._nuxMap = new Map([].concat(_toConsumableArray(nuclideNuxState), _toConsumableArray(fbNuxState)));
    }

    /*
     * Try to add the NUX to the list of registered NUXes.
     */
  }, {
    key: 'addNewNux',
    value: function addNewNux(nux) {
      var nuxState = this._nuxMap.get(nux.id);
      // if `developmentMode` is set, the NUX will be shown during EVERY session.
      // This is used to make debugging easier.
      if (nuxState && !nux.developmentMode) {
        return;
      }
      this._nuxMap.set(nux.id, false);
      this._emitter.emit(NEW_NUX_EVENT, nux);
    }
  }, {
    key: 'serialize',
    value: function serialize() {
      this._saveNuxState();
    }
  }, {
    key: '_saveNuxState',
    value: function _saveNuxState() {
      window.localStorage.setItem(NUX_SAVED_STORE,
      // $FlowIgnore -- Flow thinks the spread operator is incompatible with Maps
      JSON.stringify([].concat(_toConsumableArray(this._nuxMap))));
    }

    /**
     * Register a change handler that is invoked whenever the store changes.
     */
  }, {
    key: 'onNewNux',
    value: function onNewNux(callback) {
      return this._emitter.on(NEW_NUX_EVENT, callback);
    }
  }, {
    key: 'onNuxCompleted',
    value: function onNuxCompleted(nuxModel) {
      if (!this._nuxMap.has(nuxModel.id)) {
        return;
      }
      this._nuxMap.set(nuxModel.id,
      /* completed */true);
      this._saveNuxState();
    }
  }]);

  return NuxStore;
})();

exports.NuxStore = NuxStore;

// Maps a Nux's unique ID to the boolean representing its viewed state