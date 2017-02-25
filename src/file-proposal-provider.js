'use babel'

import isEmpty from 'lodash/isEmpty'
import trimStart from 'lodash/trimStart'
import startsWith from 'lodash/startsWith'
import last from 'lodash/last'
import sortBy from 'lodash/sortBy'
import includes from 'lodash/includes'

import { StorageType } from './utils'
import { sep, extname } from 'path'
import fs from 'fs'

const SLASHES = /\\|\// // slash (/) or backslash (\)

function directoryExists(path) {
  try {
    return fs.statSync(path).isDirectory()
  } catch (e) {
    return false
  }
}

function listPaths(dir, storageType, fileExtensions) {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (error, paths) => {
      if (error) {
        reject(error)
      } else {
        const fileInfos = paths.map(path => {
          const stats = fs.statSync(dir + sep + path) // TODO is it worth asyncing?
          return {
            name: path,
            isFile: stats.isFile(),
            isDirectory: stats.isDirectory()
          }
        }).filter(file => {
          switch (storageType) {
            case StorageType.FILE:
              return file.isFile && (!fileExtensions || includes(fileExtensions, extname(file.name)))
            case StorageType.FOLDER:
              return file.isDirectory
            default: {
              return file.isDirectory || !fileExtensions || includes(fileExtensions, extname(file.name))
            }
          }
        })
        resolve(fileInfos)
      }
    })
  })
}

function containerName(root, segments) {
  // Empty prefix or segments, search in the root folder.
  if (isEmpty(segments)) {
    return root
  }
  // Last character is some kind of slash.
  if (isEmpty(last(segments))) {
    // this means, the last segment was (or should be) a directory.
    const path = root + sep + trimStart(segments.join(sep), '/\\')
    if (directoryExists(path)) {
      return path
    }
  } else {
    // Last segment is not a slash, meaning we don't need, what the user typed until the last slash.
    const lastIsPartialFile = root + sep + trimStart(segments.slice(0, segments.length - 1).join(sep), '/\\')
    if (directoryExists(lastIsPartialFile)) {
      return lastIsPartialFile
    }
  }
  // User wants completions for non existing directory.
  return null
}

function prepareFiles(files, request, basePath, segments) {
  const filteredFiles = isEmpty(last(segments))
    ? files
    : files.filter(file => startsWith(file.name, last(segments)))
  return sortBy(filteredFiles, f => f.isDirectory ? 0 : 1)
}

function createProposal(file, request, basePath, segments) {
  const proposal = {}
  const text = (() => {
    let proposalText = file.name
    if (segments.length === 0) {
      proposalText = file.name
    } else if (last(segments).length === 0) {
      proposalText = segments.join('/') + file.name
    } else {
      const withoutPartial = segments.slice(0, segments.length - 1)
      if (withoutPartial.length === 0) {
        proposalText = file.name
      } else {
        proposalText = `${segments.slice(0, segments.length - 1).join('/')}/${file.name}`
      }
    }
    return proposalText + (file.isDirectory ? '/' : '')
  })()

  proposal.replacementPrefix = request.prefix
  proposal.displayText = file.name
  proposal.rightLabel = file.isDirectory ? 'folder' : 'file'
  if (request.isBetweenQuotes) {
    proposal.text = text
  } else {
    proposal.snippet = `"${text}$1"`
  }
  proposal.type = proposal.rightLabel
  return proposal
}

export class FileProposalProvider {

  constructor(configuration) {
    this.configuration = configuration
  }

  getProposals(request) {
    if (!request.isBetweenQuotes || !this.configuration.getMatcher().matches(request)) {
      return Promise.resolve([])
    }
    const dir = request.editor.getBuffer().file.getParent().path
    const {prefix} = request
    const segments = prefix.split(SLASHES)
    const searchDir = containerName(dir, segments)

    if (searchDir === null) {
      return Promise.resolve([])
    }

    return listPaths(
      searchDir,
      this.configuration.getStorageType(),
      this.configuration.getFileExtensions()
    ).then(results => prepareFiles(results, request, dir, segments)
      .map(file => createProposal(file, request, dir, segments)))
  }

  getFilePattern() {
    return this.configuration.getFilePattern()
  }
}
