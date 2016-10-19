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

exports.hgRepositoryForEditor = hgRepositoryForEditor;

var _nuclideHgGitBridge;

function _load_nuclideHgGitBridge() {
  return _nuclideHgGitBridge = require('../../nuclide-hg-git-bridge');
}

function hgRepositoryForEditor(editor) {
  var repo = (0, (_nuclideHgGitBridge || _load_nuclideHgGitBridge()).repositoryForPath)(editor.getPath() || '');
  if (!repo || repo.getType() !== 'hg') {
    return null;
  }
  return repo;
}