import {includes, trimLeft} from 'lodash';
import {tokenize, TokenType} from './tokenizer';
import {provideStructure, IStructureInfo} from './structure-provider';
import {PositionInfo, matches} from './utils';
import {IProposalProvider, IRequest, IProposal} from './provider-api'

export default class RootProvider {
  public selector: string = '.source.json';
  public inclusionPriority: number = 1;

  constructor(private providers: Array<IProposalProvider> = []) { }

  getSuggestions(originalRequest: any): Promise<Array<IProposal>> {
    const {editor, bufferPosition, activatedManually, prefix} = originalRequest;

    if (!this.checkRequest(originalRequest)) {
      return Promise.resolve([]);
    }

    if (editor.lineTextForBufferRow(bufferPosition.row).charAt(bufferPosition.column - 1) === ',' && !activatedManually) {
      return Promise.resolve([]); // hack, to prevent activation right after inserting a comma
    }

    const providers = this.getMatchingProviders(editor.buffer.file);
    if (providers.length === 0) {
      return Promise.resolve([]); // no provider no proposals
    }
    return tokenize(editor.getText())
      .then(tokens => provideStructure(tokens, bufferPosition))
      .then(structure => {
        const request = this.buildRequest(structure, originalRequest);
        return Promise.all(providers.map(provider => provider.getProposals(request)))
          .then(proposals => Array.prototype.concat.apply([], proposals));
      });
  }

  checkRequest(request: any) {
    const {editor, bufferPosition} = request;
    return !!(editor
      && editor.buffer
      && editor.buffer.file
      && editor.buffer.file.getBaseName
      && editor.lineTextForBufferRow
      && editor.getText
      && bufferPosition
    );
  }


  buildRequest(structure: IStructureInfo, originalRequest: any): IRequest {
    const {contents, positionInfo, tokens} = structure;
    const {editor, bufferPosition} = originalRequest;

    const shouldAddComma = (info: PositionInfo) => {
      if (!info || !info.nextToken || !tokens || tokens.length === 0) {
        return false;
      }
      if (info.nextToken && includes([TokenType.END_ARRAY, TokenType.END_OBJECT], info.nextToken.type)) {
        return false;
      }
      return !(info.nextToken && includes([TokenType.END_ARRAY, TokenType.END_OBJECT], info.nextToken.type)) && info.nextToken.type !== TokenType.COMMA;
    }

    const prefix: (info: PositionInfo) => string = (info: PositionInfo) => {
      if (!info || !info.editedToken) {
        return '';
      }
      const length = bufferPosition.column - info.editedToken.col + 1;
      return trimLeft(info.editedToken.src.substr(0, length), '"');
    }

    return {
      contents,
      prefix: prefix(positionInfo),
      segments: positionInfo ? positionInfo.segments : null,
      token: positionInfo ? (positionInfo.editedToken) ? positionInfo.editedToken.src : null : null,
      isKeyPosition: !!(positionInfo && positionInfo.keyPosition),
      isValuePosition: !!(positionInfo && positionInfo.valuePosition),
      isBetweenQuotes: !!(positionInfo && positionInfo.editedToken && positionInfo.editedToken.type === TokenType.STRING),
      shouldAddComma: !!shouldAddComma(positionInfo),
      isFileEmpty: tokens.length === 0,
      editor: editor
    }
  }

  getMatchingProviders(file: any) {
    return this.providers.filter(p => matches(file, p.getFilePattern()))
  }

  onDidInsertSuggestion(request: IRequest) {
    // noop for now
  }

  dispose() {
    // noop for now
  }
}
