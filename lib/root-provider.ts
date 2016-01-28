import * as minimatch from 'minimatch';
import * as _ from 'lodash';
import {tokenize, TokenType} from './tokenizer';
import {provideStructure, IStructureInfo} from './structure-provider';
import {PositionInfo} from './utils';
import {IProposalProvider, IRequest, IProposal} from './provider-api'

export default class RootProvider {
  public selector: string = '.source.json';
  public inclusionPriority: number = 1;

  constructor(private providers: Array<IProposalProvider> = []) { }

  getSuggestions({editor, bufferPosition, activatedManually, prefix}): Promise<Array<IProposal>> {
    if (editor.lineTextForBufferRow(bufferPosition.row).charAt(bufferPosition.column - 1) === ',' && !activatedManually) {
      return Promise.resolve([]); // hack, to prevent activation right after inserting a comma
    }

    const providers = this.getMatchingProviders(editor.buffer.file.getBaseName());
    if (providers.length === 0) {
      return Promise.resolve([]); // no provider no proposals
    }
    return tokenize(editor.getText())
      .then(tokens => provideStructure(tokens, bufferPosition))
      .then(structure => {
        const request = this.buildRequest(structure, prefix, editor);
        return Promise.all(providers.map(provider => provider.getProposals(request)))
          .then(proposals => Array.prototype.concat.apply([], proposals));
      });
  }

  buildRequest(structure: IStructureInfo, prefix: string, editor: AtomCore.IEditor): IRequest {
    const {contents, positionInfo, tokens} = structure;

    const shouldAddComma = (info: PositionInfo) => {
      if (!info || !info.nextToken || !tokens || tokens.length === 0) {
        return false;
      }
      if (info.nextToken && _.includes([TokenType.END_ARRAY, TokenType.END_OBJECT], info.nextToken.type)) {
        return false;
      }
      return !(info.nextToken && _.includes([TokenType.END_ARRAY, TokenType.END_OBJECT], info.nextToken.type)) && info.nextToken.type !== TokenType.COMMA;
    }

    return {
      contents,
      prefix: prefix,
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

  getMatchingProviders(file: string) {
    return this.providers.filter(p => minimatch(file, p.getFilePattern()))
  }

  onDidInsertSuggestion(request: IRequest) {
    // noop for now
  }

  dispose() {
    // noop for now
  }
}