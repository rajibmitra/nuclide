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

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _AuthenticationPrompt;

function _load_AuthenticationPrompt() {
  return _AuthenticationPrompt = _interopRequireDefault(require('./AuthenticationPrompt'));
}

var _nuclideUiButton;

function _load_nuclideUiButton() {
  return _nuclideUiButton = require('../../nuclide-ui/Button');
}

var _nuclideUiButtonGroup;

function _load_nuclideUiButtonGroup() {
  return _nuclideUiButtonGroup = require('../../nuclide-ui/ButtonGroup');
}

var _ConnectionDetailsPrompt;

function _load_ConnectionDetailsPrompt() {
  return _ConnectionDetailsPrompt = _interopRequireDefault(require('./ConnectionDetailsPrompt'));
}

var _IndeterminateProgressBar;

function _load_IndeterminateProgressBar() {
  return _IndeterminateProgressBar = _interopRequireDefault(require('./IndeterminateProgressBar'));
}

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _notification;

function _load_notification() {
  return _notification = require('./notification');
}

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _electron;

function _load_electron() {
  return _electron = _interopRequireDefault(require('electron'));
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _formValidationUtils;

function _load_formValidationUtils() {
  return _formValidationUtils = require('./form-validation-utils');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)();

var remote = (_electron || _load_electron()).default.remote;

(0, (_assert || _load_assert()).default)(remote != null);

var REQUEST_CONNECTION_DETAILS = 1;
var WAITING_FOR_CONNECTION = 2;
var REQUEST_AUTHENTICATION_DETAILS = 3;
var WAITING_FOR_AUTHENTICATION = 4;

/**
 * Component that manages the state transitions as the user connects to a server.
 */

var ConnectionDialog = (function (_React$Component) {
  _inherits(ConnectionDialog, _React$Component);

  _createClass(ConnectionDialog, null, [{
    key: 'defaultProps',
    value: {
      indexOfInitiallySelectedConnectionProfile: -1
    },
    enumerable: true
  }]);

  function ConnectionDialog(props) {
    var _this = this;

    _classCallCheck(this, ConnectionDialog);

    _get(Object.getPrototypeOf(ConnectionDialog.prototype), 'constructor', this).call(this, props);

    var sshHandshake = new (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).SshHandshake((0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).decorateSshConnectionDelegateWithTracking)({
      onKeyboardInteractive: function onKeyboardInteractive(name, instructions, instructionsLang, prompts, finish) {
        // TODO: Display all prompts, not just the first one.
        _this.requestAuthentication(prompts[0], finish);
      },

      onWillConnect: function onWillConnect() {},

      onDidConnect: function onDidConnect(connection, config) {
        _this.close(); // Close the dialog.
        _this.props.onConnect(connection, config);
      },

      onError: function onError(errorType, error, config) {
        _this.close(); // Close the dialog.
        (0, (_notification || _load_notification()).notifySshHandshakeError)(errorType, error, config);
        _this.props.onError(error, config);
        logger.debug(error);
      }
    }));

    this.state = {
      finish: function finish(answers) {},
      indexOfSelectedConnectionProfile: props.indexOfInitiallySelectedConnectionProfile,
      instructions: '',
      isDirty: false,
      mode: REQUEST_CONNECTION_DETAILS,
      sshHandshake: sshHandshake
    };

    this.cancel = this.cancel.bind(this);
    this._handleClickSave = this._handleClickSave.bind(this);
    this._handleDidChange = this._handleDidChange.bind(this);
    this.ok = this.ok.bind(this);
    this.onProfileClicked = this.onProfileClicked.bind(this);
  }

  _createClass(ConnectionDialog, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this._focus();
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      var indexOfSelectedConnectionProfile = this.state.indexOfSelectedConnectionProfile;
      if (nextProps.connectionProfiles == null) {
        indexOfSelectedConnectionProfile = -1;
      } else if (this.props.connectionProfiles == null
      // The current selection is outside the bounds of the next profiles list
       || indexOfSelectedConnectionProfile > nextProps.connectionProfiles.length - 1
      // The next profiles list is longer than before, a new one was added
       || nextProps.connectionProfiles.length > this.props.connectionProfiles.length) {
        // Select the final connection profile in the list because one of the above conditions means
        // the current selected index is outdated.
        indexOfSelectedConnectionProfile = nextProps.connectionProfiles.length - 1;
      }

      this.setState({ indexOfSelectedConnectionProfile: indexOfSelectedConnectionProfile });
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {
      if (this.state.mode !== prevState.mode) {
        this._focus();
      } else if (this.state.mode === REQUEST_CONNECTION_DETAILS && this.state.indexOfSelectedConnectionProfile === prevState.indexOfSelectedConnectionProfile && !this.state.isDirty && prevState.isDirty) {
        // When editing a profile and clicking "Save", the Save button disappears. Focus the primary
        // button after re-rendering so focus is on a logical element.
        this.refs.okButton.focus();
      }
    }
  }, {
    key: '_focus',
    value: function _focus() {
      var content = this.refs.content;
      if (content == null) {
        (_reactForAtom || _load_reactForAtom()).ReactDOM.findDOMNode(this.refs.cancelButton).focus();
      } else {
        content.focus();
      }
    }
  }, {
    key: '_handleDidChange',
    value: function _handleDidChange() {
      this.setState({ isDirty: true });
    }
  }, {
    key: '_handleClickSave',
    value: function _handleClickSave() {
      (0, (_assert || _load_assert()).default)(this.props.connectionProfiles != null);

      var selectedProfile = this.props.connectionProfiles[this.state.indexOfSelectedConnectionProfile];
      var connectionDetails = this.refs.content.getFormFields();
      var validationResult = (0, (_formValidationUtils || _load_formValidationUtils()).validateFormInputs)(selectedProfile.displayTitle, connectionDetails, '');

      if (typeof validationResult.errorMessage === 'string') {
        atom.notifications.addError(validationResult.errorMessage);
        return;
      }

      (0, (_assert || _load_assert()).default)(validationResult.validatedProfile != null && typeof validationResult.validatedProfile === 'object');
      // Save the validated profile, and show any warning messages.
      var newProfile = validationResult.validatedProfile;
      if (typeof validationResult.warningMessage === 'string') {
        atom.notifications.addWarning(validationResult.warningMessage);
      }

      this.props.onSaveProfile(this.state.indexOfSelectedConnectionProfile, newProfile);
      this.setState({ isDirty: false });
    }
  }, {
    key: '_validateInitialDirectory',
    value: function _validateInitialDirectory(path) {
      return path !== '/';
    }
  }, {
    key: 'render',
    value: function render() {
      var mode = this.state.mode;
      var content = undefined;
      var isOkDisabled = undefined;
      var okButtonText = undefined;

      if (mode === REQUEST_CONNECTION_DETAILS) {
        content = (_reactForAtom || _load_reactForAtom()).React.createElement((_ConnectionDetailsPrompt || _load_ConnectionDetailsPrompt()).default, {
          connectionProfiles: this.props.connectionProfiles,
          indexOfSelectedConnectionProfile: this.state.indexOfSelectedConnectionProfile,
          onAddProfileClicked: this.props.onAddProfileClicked,
          onCancel: this.cancel,
          onConfirm: this.ok,
          onDeleteProfileClicked: this.props.onDeleteProfileClicked,
          onDidChange: this._handleDidChange,
          onProfileClicked: this.onProfileClicked,
          ref: 'content'
        });
        isOkDisabled = false;
        okButtonText = 'Connect';
      } else if (mode === WAITING_FOR_CONNECTION || mode === WAITING_FOR_AUTHENTICATION) {
        content = (_reactForAtom || _load_reactForAtom()).React.createElement((_IndeterminateProgressBar || _load_IndeterminateProgressBar()).default, null);
        isOkDisabled = true;
        okButtonText = 'Connect';
      } else {
        content = (_reactForAtom || _load_reactForAtom()).React.createElement((_AuthenticationPrompt || _load_AuthenticationPrompt()).default, {
          instructions: this.state.instructions,
          onCancel: this.cancel,
          onConfirm: this.ok,
          ref: 'content'
        });
        isOkDisabled = false;
        okButtonText = 'OK';
      }

      var saveButtonGroup = undefined;
      var selectedProfile = undefined;
      if (this.state.indexOfSelectedConnectionProfile >= 0 && this.props.connectionProfiles != null) {
        selectedProfile = this.props.connectionProfiles[this.state.indexOfSelectedConnectionProfile];
      }
      if (this.state.isDirty && selectedProfile != null && selectedProfile.saveable) {
        saveButtonGroup = (_reactForAtom || _load_reactForAtom()).React.createElement(
          (_nuclideUiButtonGroup || _load_nuclideUiButtonGroup()).ButtonGroup,
          { className: 'inline-block' },
          (_reactForAtom || _load_reactForAtom()).React.createElement(
            (_nuclideUiButton || _load_nuclideUiButton()).Button,
            { onClick: this._handleClickSave },
            'Save'
          )
        );
      }

      return (_reactForAtom || _load_reactForAtom()).React.createElement(
        'div',
        null,
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          'div',
          { className: 'block' },
          content
        ),
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          'div',
          { style: { display: 'flex', justifyContent: 'flex-end' } },
          saveButtonGroup,
          (_reactForAtom || _load_reactForAtom()).React.createElement(
            (_nuclideUiButtonGroup || _load_nuclideUiButtonGroup()).ButtonGroup,
            null,
            (_reactForAtom || _load_reactForAtom()).React.createElement(
              'button',
              { className: 'btn', onClick: this.cancel, ref: 'cancelButton' },
              'Cancel'
            ),
            (_reactForAtom || _load_reactForAtom()).React.createElement(
              'button',
              {
                className: 'btn btn-primary',
                disabled: isOkDisabled,
                onClick: this.ok,
                ref: 'okButton' },
              okButtonText
            )
          )
        )
      );
    }
  }, {
    key: 'cancel',
    value: function cancel() {
      var mode = this.state.mode;

      // It is safe to call cancel even if no connection is started
      this.state.sshHandshake.cancel();

      if (mode === WAITING_FOR_CONNECTION) {
        // TODO(mikeo): Tell delegate to cancel the connection request.
        this.setState({
          isDirty: false,
          mode: REQUEST_CONNECTION_DETAILS
        });
      } else {
        // TODO(mikeo): Also cancel connection request, as appropriate for mode?
        this.props.onCancel();
        this.close();
      }
    }
  }, {
    key: 'close',
    value: function close() {
      if (this.props.onClosed) {
        this.props.onClosed();
      }
    }
  }, {
    key: 'ok',
    value: function ok() {
      var mode = this.state.mode;

      if (mode === REQUEST_CONNECTION_DETAILS) {
        // User is trying to submit connection details.
        var connectionDetailsForm = this.refs.content;

        var _connectionDetailsForm$getFormFields = connectionDetailsForm.getFormFields();

        var username = _connectionDetailsForm$getFormFields.username;
        var server = _connectionDetailsForm$getFormFields.server;
        var cwd = _connectionDetailsForm$getFormFields.cwd;
        var remoteServerCommand = _connectionDetailsForm$getFormFields.remoteServerCommand;
        var sshPort = _connectionDetailsForm$getFormFields.sshPort;
        var pathToPrivateKey = _connectionDetailsForm$getFormFields.pathToPrivateKey;
        var authMethod = _connectionDetailsForm$getFormFields.authMethod;
        var password = _connectionDetailsForm$getFormFields.password;
        var displayTitle = _connectionDetailsForm$getFormFields.displayTitle;

        if (!this._validateInitialDirectory(cwd)) {
          remote.dialog.showErrorBox('Invalid initial path', 'Please specify a non-root directory.');
          return;
        }

        if (username && server && cwd && remoteServerCommand) {
          this.setState({
            isDirty: false,
            mode: WAITING_FOR_CONNECTION
          });
          this.state.sshHandshake.connect({
            host: server,
            sshPort: sshPort,
            username: username,
            pathToPrivateKey: pathToPrivateKey,
            authMethod: authMethod,
            cwd: cwd,
            remoteServerCommand: remoteServerCommand,
            password: password,
            displayTitle: displayTitle
          });
        } else {
          remote.dialog.showErrorBox('Missing information', "Please make sure you've filled out all the form fields.");
        }
      } else if (mode === REQUEST_AUTHENTICATION_DETAILS) {
        var authenticationPrompt = this.refs.content;
        var password = authenticationPrompt.getPassword();

        this.state.finish([password]);

        this.setState({
          isDirty: false,
          mode: WAITING_FOR_AUTHENTICATION
        });
      }
    }
  }, {
    key: 'requestAuthentication',
    value: function requestAuthentication(instructions, finish) {
      this.setState({
        finish: finish,
        instructions: instructions.prompt,
        isDirty: false,
        mode: REQUEST_AUTHENTICATION_DETAILS
      });
    }
  }, {
    key: 'getFormFields',
    value: function getFormFields() {
      var connectionDetailsForm = this.refs.content;
      if (!connectionDetailsForm) {
        return null;
      }

      var _connectionDetailsForm$getFormFields2 = connectionDetailsForm.getFormFields();

      var username = _connectionDetailsForm$getFormFields2.username;
      var server = _connectionDetailsForm$getFormFields2.server;
      var cwd = _connectionDetailsForm$getFormFields2.cwd;
      var remoteServerCommand = _connectionDetailsForm$getFormFields2.remoteServerCommand;
      var sshPort = _connectionDetailsForm$getFormFields2.sshPort;
      var pathToPrivateKey = _connectionDetailsForm$getFormFields2.pathToPrivateKey;
      var authMethod = _connectionDetailsForm$getFormFields2.authMethod;
      var displayTitle = _connectionDetailsForm$getFormFields2.displayTitle;

      return {
        username: username,
        server: server,
        cwd: cwd,
        remoteServerCommand: remoteServerCommand,
        sshPort: sshPort,
        pathToPrivateKey: pathToPrivateKey,
        authMethod: authMethod,
        displayTitle: displayTitle
      };
    }
  }, {
    key: 'onProfileClicked',
    value: function onProfileClicked(indexOfSelectedConnectionProfile) {
      this.setState({
        indexOfSelectedConnectionProfile: indexOfSelectedConnectionProfile,
        isDirty: false
      });
    }
  }]);

  return ConnectionDialog;
})((_reactForAtom || _load_reactForAtom()).React.Component);

exports.default = ConnectionDialog;
module.exports = exports.default;

// The list of connection profiles that will be displayed.

// If there is >= 1 connection profile, this index indicates the initial
// profile to use.

// Function that is called when the "+" button on the profiles list is clicked.
// The user's intent is to create a new profile.

// Function that is called when the "-" button on the profiles list is clicked
// ** while a profile is selected **.
// The user's intent is to delete the currently-selected profile.