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

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _nuclideArcanistRpcLibUtils;

function _load_nuclideArcanistRpcLibUtils() {
  return _nuclideArcanistRpcLibUtils = require('../../nuclide-arcanist-rpc/lib/utils');
}

var _nuclideArcanistRpcLibUtils2;

function _load_nuclideArcanistRpcLibUtils2() {
  return _nuclideArcanistRpcLibUtils2 = require('../../nuclide-arcanist-rpc/lib/utils');
}

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var RevisionTimelineNode = (function (_React$Component) {
  _inherits(RevisionTimelineNode, _React$Component);

  function RevisionTimelineNode(props) {
    _classCallCheck(this, RevisionTimelineNode);

    _get(Object.getPrototypeOf(RevisionTimelineNode.prototype), 'constructor', this).call(this, props);
    this._handlePhabricatorRevisionClick = this._handlePhabricatorRevisionClick.bind(this);
    this._handleSelectionChange = this._handleSelectionChange.bind(this);
  }

  _createClass(RevisionTimelineNode, [{
    key: '_handlePhabricatorRevisionClick',
    value: function _handlePhabricatorRevisionClick(event) {
      // Clicking an anchor opens the `href` in the browser. Stop propagation so it doesn't affect
      // the node selection in the Timeline.
      event.stopPropagation();

      var revision = (0, (_nuclideArcanistRpcLibUtils || _load_nuclideArcanistRpcLibUtils()).getPhabricatorRevisionFromCommitMessage)(this.props.revision.description);
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('diff-view-phabricator-diff-open', { revision: revision });
    }
  }, {
    key: '_handleSelectionChange',
    value: function _handleSelectionChange() {
      this.props.onSelectionChange(this.props.revision);
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props;
      var revisionStatus = _props.revisionStatus;
      var index = _props.index;
      var revision = _props.revision;
      var revisionsCount = _props.revisionsCount;
      var selectedIndex = _props.selectedIndex;
      var author = revision.author;
      var bookmarks = revision.bookmarks;
      var date = revision.date;
      var description = revision.description;
      var hash = revision.hash;
      var title = revision.title;

      var revisionClassName = (0, (_classnames || _load_classnames()).default)('revision revision--actionable', {
        'selected-revision-inrange': index < selectedIndex,
        'selected-revision-end': index === selectedIndex,
        'selected-revision-last': index === revisionsCount - 1
      });
      var tooltip = hash + ': ' + title + '\n  Author: ' + author + '\n  Date: ' + date.toString();

      var commitAuthor = (0, (_nuclideArcanistRpcLibUtils2 || _load_nuclideArcanistRpcLibUtils2()).getCommitAuthorFromAuthorEmail)(author);
      var commitAuthorElement = undefined;
      if (commitAuthor != null) {
        commitAuthorElement = (_reactForAtom || _load_reactForAtom()).React.createElement(
          'span',
          { className: 'inline-block' },
          commitAuthor
        );
      }

      var phabricatorRevision = (0, (_nuclideArcanistRpcLibUtils || _load_nuclideArcanistRpcLibUtils()).getPhabricatorRevisionFromCommitMessage)(description);
      var phabricatorRevisionElement = undefined;
      if (phabricatorRevision != null) {
        phabricatorRevisionElement = (_reactForAtom || _load_reactForAtom()).React.createElement(
          'a',
          {
            className: 'inline-block',
            href: phabricatorRevision.url,
            onClick: this._handlePhabricatorRevisionClick },
          (_reactForAtom || _load_reactForAtom()).React.createElement(
            'strong',
            null,
            phabricatorRevision.name
          )
        );
      }

      var revisionStatusElement = undefined;
      if (revisionStatus != null) {
        revisionStatusElement = (_reactForAtom || _load_reactForAtom()).React.createElement(
          'span',
          { className: (0, (_classnames || _load_classnames()).default)('inline-block', revisionStatus.className) },
          revisionStatus.name
        );
      }

      var associatedExtraElement = undefined;
      try {
        // $FlowFB
        var diffUtils = require('../../commons-node/fb-vcs-utils.js');
        var taskIds = diffUtils.getFbCommitTaskInfoFromCommitMessage(description);
        associatedExtraElement = taskIds.map(function (task) {
          return (_reactForAtom || _load_reactForAtom()).React.createElement(
            'a',
            { key: task.id, className: 'inline-block', href: task.url },
            task.name
          );
        });
      } catch (ex) {
        // There are no extra UI elements to show.
      }

      var bookmarksToRender = bookmarks.slice();
      if (index === 0 && revisionsCount > 1 && bookmarks.length === 0) {
        bookmarksToRender.push('HEAD');
      }
      if (index === revisionsCount - 1 && bookmarks.length === 0) {
        bookmarksToRender.push('BASE');
      }

      var bookmarksElement = undefined;
      if (bookmarksToRender.length > 0) {
        bookmarksElement = (_reactForAtom || _load_reactForAtom()).React.createElement(
          'span',
          { className: 'inline-block text-success' },
          bookmarksToRender.join(' ')
        );
      }

      return (_reactForAtom || _load_reactForAtom()).React.createElement(
        'div',
        {
          className: revisionClassName,
          onClick: this._handleSelectionChange,
          title: tooltip },
        (_reactForAtom || _load_reactForAtom()).React.createElement('div', { className: 'revision-bubble' }),
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          'div',
          { className: 'revision-label text-monospace' },
          (_reactForAtom || _load_reactForAtom()).React.createElement(
            'span',
            { className: 'inline-block' },
            hash.substr(0, 7)
          ),
          commitAuthorElement,
          phabricatorRevisionElement,
          revisionStatusElement,
          associatedExtraElement,
          bookmarksElement,
          (_reactForAtom || _load_reactForAtom()).React.createElement('br', null),
          (_reactForAtom || _load_reactForAtom()).React.createElement(
            'span',
            { className: 'revision-title' },
            title
          )
        )
      );
    }
  }]);

  return RevisionTimelineNode;
})((_reactForAtom || _load_reactForAtom()).React.Component);

exports.default = RevisionTimelineNode;
module.exports = exports.default;