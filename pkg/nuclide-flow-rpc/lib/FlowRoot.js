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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fuzzaldrin;

function _load_fuzzaldrin() {
  return _fuzzaldrin = require('fuzzaldrin');
}

var _semver;

function _load_semver() {
  return _semver = _interopRequireDefault(require('semver'));
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)();

var _FlowHelpers;

function _load_FlowHelpers() {
  return _FlowHelpers = require('./FlowHelpers');
}

var _FlowProcess;

function _load_FlowProcess() {
  return _FlowProcess = require('./FlowProcess');
}

var _FlowVersion;

function _load_FlowVersion() {
  return _FlowVersion = require('./FlowVersion');
}

var _astToOutline;

function _load_astToOutline() {
  return _astToOutline = require('./astToOutline');
}

var _diagnosticsParser;

function _load_diagnosticsParser() {
  return _diagnosticsParser = require('./diagnosticsParser');
}

/** Encapsulates all of the state information we need about a specific Flow root */

var FlowRoot = (function () {
  function FlowRoot(root, execInfoContainer) {
    var _this = this;

    _classCallCheck(this, FlowRoot);

    this._root = root;
    this._execInfoContainer = execInfoContainer;
    this._process = new (_FlowProcess || _load_FlowProcess()).FlowProcess(root, execInfoContainer);
    this._version = new (_FlowVersion || _load_FlowVersion()).FlowVersion(function () {
      return _this._flowGetVersion();
    });
    this._process.getServerStatusUpdates().filter(function (state) {
      return state === 'not running';
    }).subscribe(function () {
      return _this._version.invalidateVersion();
    });
  }

  _createClass(FlowRoot, [{
    key: 'dispose',
    value: function dispose() {
      this._process.dispose();
    }
  }, {
    key: 'allowServerRestart',
    value: function allowServerRestart() {
      this._process.allowServerRestart();
    }
  }, {
    key: 'getPathToRoot',
    value: function getPathToRoot() {
      return this._root;
    }
  }, {
    key: 'getServerStatusUpdates',
    value: function getServerStatusUpdates() {
      return this._process.getServerStatusUpdates();
    }
  }, {
    key: 'flowFindDefinition',
    value: _asyncToGenerator(function* (file, currentContents, line, column) {
      var options = {};
      // We pass the current contents of the buffer to Flow via stdin.
      // This makes it possible for get-def to operate on the unsaved content in
      // the user's editor rather than what is saved on disk. It would be annoying
      // if the user had to save before using the jump-to-definition feature to
      // ensure he or she got accurate results.
      options.stdin = currentContents;

      var args = ['get-def', '--json', '--path', file, line, column];
      try {
        var result = yield this._process.execFlow(args, options);
        if (!result) {
          return null;
        }
        var json = parseJSON(args, result.stdout);
        if (json.path) {
          return {
            file: json.path,
            point: {
              line: json.line - 1,
              column: json.start - 1
            }
          };
        } else {
          return null;
        }
      } catch (e) {
        return null;
      }
    })

    /**
     * If currentContents is null, it means that the file has not changed since
     * it has been saved, so we can avoid piping the whole contents to the Flow
     * process.
     */
  }, {
    key: 'flowFindDiagnostics',
    value: _asyncToGenerator(function* (file, currentContents) {
      yield this._forceRecheck(file);

      var options = {};

      var args = undefined;
      if (currentContents) {
        options.stdin = currentContents;

        // Currently, `flow check-contents` returns all of the errors in the
        // project. It would be nice if it would use the path for filtering, as
        // currently the client has to do the filtering.
        args = ['check-contents', '--json', file];
      } else {
        // We can just use `flow status` if the contents are unchanged.
        args = ['status', '--json', file];
      }

      var result = undefined;

      try {
        // Don't log errors if the command returns a nonzero exit code, because status returns nonzero
        // if it is reporting any issues, even when it succeeds.
        result = yield this._process.execFlow(args, options, /* waitForServer */true);
        if (!result) {
          return null;
        }
      } catch (e) {
        // This codepath will be exercised when Flow finds type errors as the
        // exit code will be non-zero. Note this codepath could also be exercised
        // due to a logical error in Nuclide, so we try to differentiate.
        if (e.exitCode !== undefined) {
          result = e;
        } else {
          logger.error(e);
          return null;
        }
      }

      var json = undefined;
      try {
        json = parseJSON(args, result.stdout);
      } catch (e) {
        return null;
      }

      return (0, (_diagnosticsParser || _load_diagnosticsParser()).flowStatusOutputToDiagnostics)(this._root, json);
    })
  }, {
    key: 'flowGetAutocompleteSuggestions',
    value: _asyncToGenerator(function* (file, currentContents, line, column, prefix, activatedManually) {
      // We may want to make this configurable, but if it is ever higher than one we need to make sure
      // it works properly when the user manually activates it (e.g. with ctrl+space). See
      // https://github.com/atom/autocomplete-plus/issues/597
      //
      // If this is made configurable, consider using autocomplete-plus' minimumWordLength setting, as
      // per https://github.com/atom/autocomplete-plus/issues/594
      var minimumPrefixLength = 1;

      // Allows completions to immediately appear when we are completing off of object properties.
      // This also needs to be changed if minimumPrefixLength goes above 1, since after you type a
      // single alphanumeric character, autocomplete-plus no longer includes the dot in the prefix.
      var prefixHasDot = prefix.indexOf('.') !== -1;

      // If it is just whitespace and punctuation, ignore it (this keeps us
      // from eating leading dots).
      var replacementPrefix = /^[\s.]*$/.test(prefix) ? '' : prefix;

      if (!activatedManually && !prefixHasDot && replacementPrefix.length < minimumPrefixLength) {
        return [];
      }

      var options = {};

      var args = ['autocomplete', '--json', file];

      options.stdin = (0, (_FlowHelpers || _load_FlowHelpers()).insertAutocompleteToken)(currentContents, line, column);
      try {
        var result = yield this._process.execFlow(args, options);
        if (!result) {
          return [];
        }
        var json = parseJSON(args, result.stdout);
        var resultsArray = undefined;
        if (Array.isArray(json)) {
          // Flow < v0.20.0
          resultsArray = json;
        } else {
          // Flow >= v0.20.0. The output format was changed to support more detailed failure
          // information.
          resultsArray = json.result;
        }
        var candidates = resultsArray.map(function (item) {
          return (0, (_FlowHelpers || _load_FlowHelpers()).processAutocompleteItem)(replacementPrefix, item);
        });
        return (0, (_fuzzaldrin || _load_fuzzaldrin()).filter)(candidates, replacementPrefix, { key: 'displayText' });
      } catch (e) {
        return [];
      }
    })
  }, {
    key: 'flowGetType',
    value: _asyncToGenerator(function* (file, currentContents, line_, column_, includeRawType) {
      var line = line_;
      var column = column_;
      var options = {};

      options.stdin = currentContents;

      line++;
      column++;
      var args = ['type-at-pos', '--json', '--path', file, line, column];
      if (includeRawType) {
        args.push('--raw');
      }

      var result = undefined;
      try {
        result = yield this._process.execFlow(args, options);
      } catch (e) {
        result = null;
      }
      if (!result) {
        return null;
      }
      var output = result.stdout;

      var json = undefined;
      try {
        json = parseJSON(args, output);
      } catch (e) {
        return null;
      }
      var type = json.type;
      var rawType = json.raw_type;
      if (!type || type === '(unknown)') {
        return null;
      }
      return { type: type, rawType: rawType };
    })
  }, {
    key: 'flowGetCoverage',
    value: _asyncToGenerator(function* (path) {
      // The coverage command doesn't actually have the required information until Flow v0.28. For
      // earlier versions, we have to fall back on dump-types, which is slower especially in
      // pathological cases. We can remove this entirely when we want to stop supporting versions
      // earlier than v0.28.

      var version = yield this._version.getVersion();
      // Fall back to dump types if we don't know the version
      var useDumpTypes = version == null || (_semver || _load_semver()).default.lte(version, '0.27.0');
      return useDumpTypes ? (yield this._getCoverageViaDumpTypes(path)) : (yield this._getCoverageViaCoverage(path));
    })
  }, {
    key: '_getCoverageViaDumpTypes',
    value: _asyncToGenerator(function* (path) {
      var args = ['dump-types', '--json', path];
      var result = undefined;
      try {
        result = yield this._process.execFlow(args, {});
      } catch (e) {
        return null;
      }
      if (result == null) {
        return null;
      }
      var json = undefined;
      try {
        json = parseJSON(args, result.stdout);
      } catch (e) {
        // The error is already logged in parseJSON
        return null;
      }

      var allEntries = json;

      var uncoveredEntries = allEntries.filter(function (item) {
        return item.type === '' || item.type === 'any';
      });
      var uncoveredRanges = uncoveredEntries.map(function (item) {
        return (0, (_FlowHelpers || _load_FlowHelpers()).flowCoordsToAtomCoords)(item.loc);
      });

      var uncoveredCount = uncoveredEntries.length;
      var totalCount = allEntries.length;
      var coveredCount = totalCount - uncoveredCount;
      return {
        percentage: totalCount === 0 ? 100 : coveredCount / totalCount * 100,
        uncoveredRanges: uncoveredRanges
      };
    })
  }, {
    key: '_getCoverageViaCoverage',
    value: _asyncToGenerator(function* (path) {
      var args = ['coverage', '--json', path];
      var result = undefined;
      try {
        result = yield this._process.execFlow(args, {});
      } catch (e) {
        return null;
      }
      if (result == null) {
        return null;
      }
      var json = undefined;
      try {
        json = parseJSON(args, result.stdout);
      } catch (e) {
        // The error is already logged in parseJSON
        return null;
      }

      var expressions = json.expressions;

      var uncoveredCount = expressions.uncovered_count;
      var coveredCount = expressions.covered_count;
      var totalCount = uncoveredCount + coveredCount;

      var uncoveredRanges = expressions.uncovered_locs.map((_FlowHelpers || _load_FlowHelpers()).flowCoordsToAtomCoords);

      return {
        percentage: totalCount === 0 ? 100 : coveredCount / totalCount * 100,
        uncoveredRanges: uncoveredRanges
      };
    })
  }, {
    key: '_forceRecheck',
    value: _asyncToGenerator(function* (file) {
      try {
        yield this._process.execFlow(['force-recheck', file],
        /* options */{},
        // Make an attempt to force a recheck, but if the server is busy don't insist.
        /* waitsForServer */false,
        /* suppressErrors */true);
        return true;
      } catch (e) {
        // This command was introduced in Flow v0.23, so silently swallow errors to avoid logspam on
        // earlier versions, until we want to break support for earlier version.
        return false;
      }
    })
  }, {
    key: '_flowGetVersion',
    value: _asyncToGenerator(function* () {
      var args = ['version', '--json'];
      var json = undefined;
      try {
        var result = yield (_FlowProcess || _load_FlowProcess()).FlowProcess.execFlowClient(args, this._root, this._execInfoContainer);
        if (result == null) {
          return null;
        }
        json = parseJSON(args, result.stdout);
      } catch (e) {
        logger.warn(e);
        return null;
      }
      return json.semver;
    })

    // This static function takes an optional FlowRoot instance so that *if* it is part of a Flow
    // root, it can use the appropriate flow-bin installation (which may be the only Flow
    // installation) but if it lives outside of a Flow root, outlining still works using the system
    // Flow.
  }], [{
    key: 'flowGetOutline',
    value: _asyncToGenerator(function* (root, currentContents, execInfoContainer) {
      var options = {
        stdin: currentContents
      };

      var flowRootPath = root == null ? null : root.getPathToRoot();

      var args = ['ast'];

      var json = undefined;
      try {
        var result = yield (_FlowProcess || _load_FlowProcess()).FlowProcess.execFlowClient(args, flowRootPath, execInfoContainer, options);
        if (result == null) {
          return null;
        }
        json = parseJSON(args, result.stdout);
      } catch (e) {
        logger.warn(e);
        return null;
      }

      try {
        return (0, (_astToOutline || _load_astToOutline()).astToOutline)(json);
      } catch (e) {
        // Traversing the AST is an error-prone process and it's hard to be sure we've handled all the
        // cases. Fail gracefully if it does not work.
        logger.error(e);
        return null;
      }
    })
  }]);

  return FlowRoot;
})();

exports.FlowRoot = FlowRoot;

function parseJSON(args, value) {
  try {
    return JSON.parse(value);
  } catch (e) {
    logger.warn('Invalid JSON result from flow ' + args.join(' ') + '. JSON:\n\'' + value + '\'.');
    throw e;
  }
}

// The path to the directory where the .flowconfig is -- i.e. the root of the Flow project.