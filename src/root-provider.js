'use babel'

import includes from 'lodash/includes'
import trimStart from 'lodash/trimStart'

import { tokenize, TokenType } from './tokenizer'
import { provideStructure } from './structure-provider'
import { matches } from './utils'

const { STRING, END_OBJECT, END_ARRAY, COMMA } = TokenType

export default class RootProvider {

  constructor(providers = []) {
    this.selector = '.source.json'
    this.inclusionPriority = 1
    this.providers = providers
  }

  getSuggestions(originalRequest) {
    const {editor, bufferPosition, activatedManually} = originalRequest

    if (!this.checkRequest(originalRequest)) {
      return Promise.resolve([])
    }

    if (editor.lineTextForBufferRow(bufferPosition.row).charAt(bufferPosition.column - 1) === ',' && !activatedManually) {
      return Promise.resolve([]) // hack, to prevent activation right after inserting a comma
    }

    const providers = this.getMatchingProviders(editor.buffer.file)
    if (providers.length === 0) {
      return Promise.resolve([]) // no provider no proposals
    }
    return tokenize(editor.getText())
      .then(tokens => provideStructure(tokens, bufferPosition))
      .then(structure => {
        const request = this.buildRequest(structure, originalRequest)
        return Promise.all(providers.map(provider => provider.getProposals(request)))
          .then(proposals => Array.prototype.concat.apply([], proposals))
      })
  }

  checkRequest(request) {
    const {editor, bufferPosition} = request
    return Boolean(editor
      && editor.buffer
      && editor.buffer.file
      && editor.buffer.file.getBaseName
      && editor.lineTextForBufferRow
      && editor.getText
      && bufferPosition)
  }


  buildRequest(structure, originalRequest) {
    const {contents, positionInfo, tokens} = structure
    const {editor, bufferPosition} = originalRequest

    const shouldAddComma = info => {
      if (!info || !info.nextToken || !tokens || tokens.length === 0) {
        return false
      }
      if (info.nextToken && includes([END_ARRAY, END_OBJECT], info.nextToken.type)) {
        return false
      }
      return !(info.nextToken && includes([END_ARRAY, END_OBJECT], info.nextToken.type)) && info.nextToken.type !== COMMA
    }

    const prefix = info => {
      if (!info || !info.editedToken) {
        return ''
      }
      const length = bufferPosition.column - info.editedToken.col + 1
      return trimStart(info.editedToken.src.substr(0, length), '"')
    }

    return {
      contents,
      prefix: prefix(positionInfo),
      segments: positionInfo ? positionInfo.segments : null,
      token: positionInfo ? (positionInfo.editedToken) ? positionInfo.editedToken.src : null : null,
      isKeyPosition: Boolean(positionInfo && positionInfo.keyPosition),
      isValuePosition: Boolean(positionInfo && positionInfo.valuePosition),
      isBetweenQuotes: Boolean(positionInfo && positionInfo.editedToken && positionInfo.editedToken.type === STRING),
      shouldAddComma: Boolean(shouldAddComma(positionInfo)),
      isFileEmpty: tokens.length === 0,
      editor
    }
  }

  getMatchingProviders(file) {
    return this.providers.filter(p => matches(file, p.getFilePattern()))
  }

  onDidInsertSuggestion() {
    // noop for now
  }

  dispose() {
    // noop for now
  }
}
