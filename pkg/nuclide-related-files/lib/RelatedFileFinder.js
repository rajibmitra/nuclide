/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {NuclideUri} from '../../commons-node/nuclideUri';
import typeof * as FileSystemService from '../../nuclide-server/lib/services/FileSystemService';

import invariant from 'assert';
import {getServiceByNuclideUri} from '../../nuclide-remote-connection';
import nuclideUri from '../../commons-node/nuclideUri';

/**
 * Finds related files, to be used in `JumpToRelatedFile`.
 *
 * Files are related if they have the same filename but different extension,
 * or if the filename is appended with `Internal` or `-inl`. For example, these files
 * would all be related: `Foo.h`, `Foo.m`, `FooInternal.h`, `Foo-inl.h`
 *
 * For now, we only search in the given path's directory for related files.
 */
export default class RelatedFileFinder {
  /**
   * Returns the related files and the given file's index in that array.
   * The given file must be in the related files array.
   * @param filePath The filepath for which to get related files.
   * @param fileTypeWhiteList the set of file types that we are looking for;
   *      If this set is empty, all file types will be listed; the original
   *      filePath should always be in the result
   * @return The related files and the given path's index into it.
   */
  static async find(
    filePath: NuclideUri,
    fileTypeWhitelist?: Set<string> = new Set(),
  ): Promise<{relatedFiles: Array<string>, index: number}> {
    const dirName = nuclideUri.dirname(filePath);
    const prefix = getPrefix(filePath);
    const service: ?FileSystemService = getServiceByNuclideUri('FileSystemService', filePath);
    invariant(service);
    const listing = await service.readdir(nuclideUri.getPath(dirName));
    // Here the filtering logic:
    // first get all files with the same prefix -> filelist,
    // get all the files that matches the whitelist -> wlFilelist;
    // check the wlFilelist: if empty, use filelist
    const filelist = listing
      .filter(otherFilePath => {
        // $FlowFixMe stats may be null
        return otherFilePath.stats.isFile() && !otherFilePath.file.endsWith('~') &&
          getPrefix(otherFilePath.file) === prefix;
      });
    let wlFilelist = fileTypeWhitelist.size <= 0 ? filelist :
      filelist.filter(otherFilePath => {
        return fileTypeWhitelist.has(nuclideUri.extname(otherFilePath.file));
      });
    if (wlFilelist.length <= 0) {
      // no files in white list
      wlFilelist = filelist;
    }

    const relatedFiles = wlFilelist
      .map(otherFilePath => nuclideUri.join(dirName, otherFilePath.file));

    if (relatedFiles.indexOf(filePath) < 0) {
      relatedFiles.push(filePath);
    }
    relatedFiles.sort();
    return {
      relatedFiles,
      index: relatedFiles.indexOf(filePath),
    };
  }
}

function getPrefix(filePath: NuclideUri): string {
  let base = nuclideUri.basename(filePath);
  // Strip off the extension.
  const pos = base.lastIndexOf('.');
  if (pos !== -1) {
    base = base.substring(0, pos);
  }
  // In Objective-C we often have the X + XInternal.h for implementation methods.
  // Similarly, C++ users often use X.h + X-inl.h.
  return base.replace(/(Internal|-inl)$/, '');
}
