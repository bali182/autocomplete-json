import {IMatcher} from './matchers';
import {IProposalProvider, IRequest, IProposal} from './provider-api';
import {isEmpty, trimLeft, endsWith, last} from 'lodash';
import {sep} from 'path';
import * as fs from 'fs';

const SLASHES = /\\|\//; // slash (/) or backslash (\)

interface IFileInfo {
  name: string;
  isFile: boolean;
  isDirectory: boolean;
}

function directoryExists(path: string): boolean {
  try {
    return fs.statSync(path).isDirectory();
  } catch (e) {
    return false;
  }
}

function filesInDir(dir: string): Promise<Array<IFileInfo>> {
  return new Promise<Array<IFileInfo>>((resolve, reject) => {
    fs.readdir(dir, (error: any, paths: Array<string>) => {
      if (error) {
        reject(error);
      } else {
        const fileInfos = paths.map(path => {
          const stats = fs.statSync(dir + sep + path); // TODO is it worth asyncing?
          return {
            name: path,
            isFile: stats.isFile(),
            isDirectory: stats.isDirectory()
          }
        });
        resolve(fileInfos);
      }
    })
  });
}

function getDirectoryName(root: string, prefix: string): string {
  // Empty prefix, search in the root folder.
  if (isEmpty(prefix)) {
    return root;
  }
  const segments = prefix.split(SLASHES);
  // Last character is some kind of slash.
  if (isEmpty(last(segments))) {
    // this means, the last segment was (or should be) a directory.
    const path = root + sep + trimLeft(segments.join(sep), '/\\');
    if (directoryExists(path)) {
      return path;
    }
  } else {
    // Last segment is not a slash, meaning we don't need, what the user typed until the last slash.
    const lastIsPartialFile = root + sep + trimLeft(segments.slice(0, segments.length - 1).join(sep), '/\\');
    if (directoryExists(lastIsPartialFile)) {
      return lastIsPartialFile;
    }
  }
  // User wants completions for non existing directory.
  return null;
}

export abstract class FileProposalProvider implements IProposalProvider {
  getProposals(request: IRequest): Promise<Array<IProposal>> {
    if (!this.getMatcher().matches(request)) {
      return Promise.resolve([]);
    }
    const dir = request.editor.getBuffer().file.getParent().path;
    const {prefix} = request; // TODO find a better way to get the prefix!!!
    const searchDir = getDirectoryName(dir, prefix);
    if (searchDir === null) {
      return Promise.resolve([]);
    }
    filesInDir(searchDir).then(results => {
      console.log(results);
    });
    return Promise.resolve([]);
  }
  abstract getFilePattern(): string;
  abstract getMatcher(): IMatcher<IRequest>
}
