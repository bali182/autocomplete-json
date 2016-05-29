export interface IRequest {
  contents: Object,
  prefix: string,
  segments: Array<string | number>,
  token: string,
  isKeyPosition: boolean,
  isValuePosition: boolean,
  isBetweenQuotes: boolean,
  isFileEmpty: boolean,
  shouldAddComma: boolean
  editor: any, // TextEditor
}

export interface IProposal {
  text?: string,
  snippet?: string,
  displayText?: string,
  replacementPrefix?: string,
  type?: string,
  leftLabel?: string,
  leftLabelHTML?: string,
  rightLabel?: string,
  className?: string,
  iconHTML?: string,
  description?: string,
  descriptionMoreURL?: string,
}

export interface IFilePatternProvider {
  getFilePattern(): string | string[];
}

export interface IProposalProvider extends IFilePatternProvider {
  getProposals(request: IRequest): Promise<Array<IProposal>>;
}

export interface IJsonSchemaProvider extends IFilePatternProvider {
  getSchemaURI(): string;
}

export interface IMatcher<T> {
  matches(input: T): boolean;
}

export interface IJsonPathMatcher extends IMatcher<Array<string | number>> {
  any(): IJsonPathMatcher;
  index(value?: number | Array<number>): IJsonPathMatcher;
  key(value?: string | Array<string>): IJsonPathMatcher;
}

export interface IRequestMatcher extends IMatcher<IRequest> {
  path(matcher: IMatcher<Array<string | number>>): IRequestMatcher;
  value(): IRequestMatcher;
  key(): IRequestMatcher;
}

export interface ICompositeMatcher<T> extends IMatcher<T> {
  append(matcher: IMatcher<T>): ICompositeMatcher<T>;
  prepend(matcher: IMatcher<T>): ICompositeMatcher<T>;
}

export enum StorageType {
  FILE = <any>'FILE',
  FOLDER = <any>'FOLDER',
  BOTH = <any>'BOTH'
}

export interface IFileProposalConfiguration {
  getFileExtensions(): Array<string>,
  getStorageType(): StorageType,
  getMatcher(): IMatcher<IRequest>,
  getFilePattern(): string
}
