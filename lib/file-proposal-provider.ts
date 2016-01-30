import {IProposalProvider, IRequest, IProposal, IFileProposalConfiguration, IMatcher, StorageType} from './provider-api';
import {isEmpty, trimLeft, endsWith, startsWith, last, sortBy, includes} from 'lodash';
import {sep, extname} from 'path';
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

function listPaths(dir: string, storageType: StorageType, fileExtensions: Array<string>): Promise<Array<IFileInfo>> {
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
        }).filter(file => {
          switch (storageType) {
            case StorageType.FILE:
              return file.isFile && (!fileExtensions || includes(fileExtensions, extname(file.name)));
            case StorageType.FOLDER:
              return file.isDirectory;
            default: {
              return file.isDirectory || !fileExtensions || includes(fileExtensions, extname(file.name));
            }
          }
        });
        resolve(fileInfos);
      }
    })
  });
}

function containerName(root: string, segments: Array<string>): string {
  // Empty prefix or segments, search in the root folder.
  if (isEmpty(segments)) {
    return root;
  }
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

function prepareFiles(files: Array<IFileInfo>, request: IRequest, basePath: string, segments: Array<string>): Array<IFileInfo> {
  let filteredFiles = isEmpty(last(segments))
    ? files
    : files.filter(file => startsWith(file.name, last(segments)));
  return sortBy(filteredFiles, f => f.isDirectory ? 0 : 1);
}

function createProposal(file: IFileInfo, request: IRequest, basePath: string, segments: Array<string>): IProposal {
  const proposal: IProposal = {};
  const text = (() => {
    let proposalText = file.name;
    if (segments.length === 0) {
      proposalText = file.name;
    } else if (last(segments).length === 0) {
      proposalText = segments.join('/') + file.name;
    } else {
      const withoutPartial = segments.slice(0, segments.length - 1);
      if (withoutPartial.length === 0) {
        proposalText = file.name
      } else {
        proposalText = segments.slice(0, segments.length - 1).join('/') + '/' + file.name;
      }
    }
    return proposalText + (file.isDirectory ? '/' : '');
  })();

  proposal.replacementPrefix = request.prefix;
  proposal.displayText = file.name;
  proposal.rightLabel = file.isDirectory ? 'folder' : 'file';
  if (request.isBetweenQuotes) {
    proposal.text = text;
  } else {
    proposal.snippet = '"' + text + '$1"';
  }
  proposal.type = proposal.rightLabel;
  return proposal;
}

export class FileProposalProvider implements IProposalProvider {

  constructor(private configuration: IFileProposalConfiguration) { }

  getProposals(request: IRequest): Promise<Array<IProposal>> {
    if (!request.isBetweenQuotes || !this.configuration.getMatcher().matches(request)) {
      return Promise.resolve([]);
    }
    const dir = request.editor.getBuffer().file.getParent().path;
    const {prefix} = request;
    const segments = prefix.split(SLASHES);
    const searchDir = containerName(dir, segments);

    if (searchDir === null) {
      return Promise.resolve([]);
    }

    return listPaths(
      searchDir,
      this.configuration.getStorageType(),
      this.configuration.getFileExtensions()
    ).then(results => {
      return prepareFiles(results, request, dir, segments)
        .map(file => createProposal(file, request, dir, segments));
    });
  }

  getFilePattern(): string {
    return this.configuration.getFilePattern();
  }
}
