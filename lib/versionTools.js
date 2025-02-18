// The signature is the first line of the generated file.
const SIGNATURE = '// Generated by genversion.'
// If the pattern matches the first line of a file,
// we assume the file has been previously generated by genversion.
// Allow signature to have OS-specific line-endings. See PR#6
// Allow signatures to have different case and trailing dot. See PR#18
const PATTERN = /\/\/\s+generated by genversion/i

exports.SIGNATURE = SIGNATURE
exports.PATTERN = PATTERN

exports.createContent = (version, opts) => {
  // Create content for the version module
  //
  // Parameters:
  //   version: string, version tag
  //   opts: optional object with optional properties:
  //     useSemicolon:
  //       boolean. True to use semicolons in generated code
  //     useDoubleQuotes
  //       boolean. Set true to use double quotes in generated code
  //       instead of single quotes.
  //     useBackticks
  //       boolean. Set true to use backticks in generated code
  //       instead of single or double quotes.
  //     useEs6Syntax:
  //       boolean. True to use ES6 export syntax in generated code
  //     useStrict:
  //       boolean. Add the 'use strict' header
  //
  // Return:
  //   string. The version module contents.
  //
  let content = SIGNATURE + '\n'

  let Q = opts.useDoubleQuotes ? '"' : '\''
  Q = opts.useBackticks ? '`' : Q

  const SEMI = opts.useSemicolon ? ';' : ''

  // In some cases 'use strict' is required in the file
  // Can have comments before, but must be first statement
  if (opts.useStrict) {
    content += Q + 'use strict' + Q + SEMI + '\n\n'
  }

  if (opts.useEs6Syntax) {
    content += 'export const version'
  } else {
    content += 'module.exports'
  }

  content += ' = ' + Q + version + Q + SEMI + '\n'

  return content
}
