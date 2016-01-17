/**
 * Commonly used JSON tokens
 */
export const Tokens = {
  COMMA: 'comma',
  END_LABEL: 'end-label',
  BEGIN_OBJECT: 'begin-object',
  END_OBJECT: 'end-object',
  BEGIN_ARRAY: 'begin-array',
  END_ARRAY: 'end-array',
  STRING: 'string',
  NULL: 'null',
  BOOLEAN: 'boolean',
  NUMBER: 'number',
  SYMBOL: 'symbol',
  WHITESPACE: 'whitespace'
};

/**
 * JSON types
 */
export const Types = {
  OBJECT: 'object',
  ARRAY: 'array',
  NUMBER: 'number',
  STRING: 'string',
  BOOLEAN: 'boolean',
}

/**
 * Built-in types for proposals
 */
export const ProposalTypes = {
  VARIABLE: 'variable',
  CONSTANT: 'constant',
  PROPERTY: 'property',
  VALUE: 'value',
  METHOD: 'method',
  FUNCTION: 'function',
  CLASS: 'class',
  TYPE: 'type',
  KEYWORD: 'keyword',
  TAG: 'tag',
  SNIPPET: 'snippet',
  IMPORT: 'import',
  REQUIRE: 'require'
}
