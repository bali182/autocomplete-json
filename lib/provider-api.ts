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
  descriptionMoreURL?: string
}

export interface IProposalProvider {
  getFilePattern(): string;
  getProposals(request: IRequest): Promise<Array<IProposal>>;
}