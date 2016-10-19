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

var DiffMode = Object.freeze({
  BROWSE_MODE: '1. Browse',
  COMMIT_MODE: '2. Commit',
  PUBLISH_MODE: '3. Publish'
});

exports.DiffMode = DiffMode;
// This is to work around flow's missing support of enums.
DiffMode;

var DiffOption = Object.freeze({
  DIRTY: 'Dirty',
  LAST_COMMIT: 'Last Commit',
  COMPARE_COMMIT: 'Compare Commit'
});

exports.DiffOption = DiffOption;
// This is to work around flow's missing support of enums.
DiffOption;

var CommitMode = Object.freeze({
  COMMIT: 'Commit',
  AMEND: 'Amend'
});

exports.CommitMode = CommitMode;
// This is to work around flow's missing support of enums.
CommitMode;

var CommitModeState = Object.freeze({
  READY: 'Ready',
  LOADING_COMMIT_MESSAGE: 'Loading Commit Message',
  AWAITING_COMMIT: 'Awaiting Commit'
});

exports.CommitModeState = CommitModeState;
// This is to work around flow's missing support of enums.
CommitModeState;

var PublishMode = Object.freeze({
  CREATE: 'Create',
  UPDATE: 'Update'
});

exports.PublishMode = PublishMode;
// This is to work around flow's missing support of enums.
PublishMode;

var PublishModeState = Object.freeze({
  READY: 'Ready',
  LOADING_PUBLISH_MESSAGE: 'Loading Publish Message',
  AWAITING_PUBLISH: 'Awaiting Publish',
  PUBLISH_ERROR: 'Publish Error'
});

exports.PublishModeState = PublishModeState;
// This is to work around flow's missing support of enums.
PublishModeState;

var NON_MERCURIAL_REPO_DISPLAY_NAME = '[X] Non-Mercurial Repository';

exports.NON_MERCURIAL_REPO_DISPLAY_NAME = NON_MERCURIAL_REPO_DISPLAY_NAME;
var DiffSectionStatus = Object.freeze({
  ADDED: 'Added',
  CHANGED: 'Changed',
  REMOVED: 'Removed'
});

exports.DiffSectionStatus = DiffSectionStatus;
// This is to work around flow's missing support of enums.
DiffSectionStatus;