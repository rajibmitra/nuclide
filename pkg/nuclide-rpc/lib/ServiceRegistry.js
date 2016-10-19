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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _main;

function _load_main() {
  return _main = require('./main');
}

var _TypeRegistry;

function _load_TypeRegistry() {
  return _TypeRegistry = require('./TypeRegistry');
}

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)();

// Maps from RpcContext to proxy

var ServiceRegistry = (function () {
  function ServiceRegistry(predefinedTypes, services) {
    _classCallCheck(this, ServiceRegistry);

    this._typeRegistry = new (_TypeRegistry || _load_TypeRegistry()).TypeRegistry(predefinedTypes);
    this._predefinedTypes = predefinedTypes.map(function (predefinedType) {
      return predefinedType.typeName;
    });
    this._functionsByName = new Map();
    this._classesByName = new Map();
    this._services = new Map();

    this.addServices(services);
  }

  _createClass(ServiceRegistry, [{
    key: 'addServices',
    value: function addServices(services) {
      services.forEach(this.addService, this);
    }
  }, {
    key: 'addService',
    value: function addService(service) {
      var _this = this;

      var preserveFunctionNames = service.preserveFunctionNames != null && service.preserveFunctionNames;
      try {
        (function () {
          var factory = (0, (_main || _load_main()).createProxyFactory)(service.name, preserveFunctionNames, service.definition, _this._predefinedTypes);
          // $FlowIssue - the parameter passed to require must be a literal string.
          var localImpl = require(service.implementation);
          _this._services.set(service.name, {
            name: service.name,
            factory: factory
          });

          // Register type aliases.
          factory.defs.forEach(function (definition) {
            var name = definition.name;
            switch (definition.kind) {
              case 'alias':
                if (definition.definition != null) {
                  _this._typeRegistry.registerAlias(name, definition.location, definition.definition);
                }
                break;
              case 'function':
                // Register module-level functions.
                var functionName = service.preserveFunctionNames ? name : service.name + '/' + name;
                _this._registerFunction(functionName, localImpl[name], definition.type);
                break;
              case 'interface':
                // Register interfaces.
                _this._classesByName.set(name, {
                  localImplementation: localImpl[name],
                  definition: definition
                });

                _this._typeRegistry.registerType(name, definition.location, function (object, context) {
                  return context.marshal(name, object);
                }, function (objectId, context) {
                  return context.unmarshal(objectId, name, context.getService(service.name)[name]);
                });

                // Register all of the static methods as remote functions.
                definition.staticMethods.forEach(function (funcType, funcName) {
                  _this._registerFunction(name + '/' + funcName, localImpl[name][funcName], funcType);
                });
                break;
            }
          });
        })();
      } catch (e) {
        logger.error('Failed to load service ' + service.name + '. Stack Trace:\n' + e.stack);
        throw e;
      }
    }
  }, {
    key: '_registerFunction',
    value: function _registerFunction(name, localImpl, type) {
      if (this._functionsByName.has(name)) {
        throw new Error('Duplicate RPC function: ' + name);
      }
      this._functionsByName.set(name, {
        localImplementation: localImpl,
        type: type
      });
    }
  }, {
    key: 'getFunctionImplemention',
    value: function getFunctionImplemention(name) {
      var result = this._functionsByName.get(name);
      (0, (_assert || _load_assert()).default)(result);
      return result;
    }
  }, {
    key: 'getClassDefinition',
    value: function getClassDefinition(className) {
      var result = this._classesByName.get(className);
      (0, (_assert || _load_assert()).default)(result != null);
      return result;
    }
  }, {
    key: 'getTypeRegistry',
    value: function getTypeRegistry() {
      return this._typeRegistry;
    }
  }, {
    key: 'getServices',
    value: function getServices() {
      return this._services.values();
    }
  }, {
    key: 'hasService',
    value: function hasService(serviceName) {
      return this._services.has(serviceName);
    }
  }, {
    key: 'getService',
    value: function getService(serviceName) {
      var result = this._services.get(serviceName);
      (0, (_assert || _load_assert()).default)(result != null);
      return result;
    }
  }]);

  return ServiceRegistry;
})();

exports.ServiceRegistry = ServiceRegistry;

/**
 * Store a mapping from function name to a structure holding both the local implementation and
 * the type definition of the function.
 */

/**
 * Store a mapping from a class name to a struct containing it's local constructor and it's
 * interface definition.
 */