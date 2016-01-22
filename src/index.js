import bluebird from 'bluebird'

/**
 * Core parsers
 *
 * @module mona/core
 */

/**
 * Executes a parser and returns the resulting promise.
 *
 * @param {Function} parser - The parser to execute.
 * @param {String} string - Source to parse from.
 * @param {Object} [opts] - Options object.
 * @param {String} [opts.fileName] - filename to use for error messages.
 * @memberof module:mona/api
 * @instance
 *
 * @example
 * parse(token(), 'a') // => 'a'
 */
export function parse (parser, string, opts = {}) {
  if (!opts.allowTrailing) {
    parser = bind(parser, result =>
      bind(eof(), () => value(result)))
  }
  let state = opts.state || new ParserState(undefined,
    string,
    0,
    opts.userState,
    opts.position || new SourcePosition(opts.fileName),
    false)
  return state.parse(parser).then(parserState => {
    if (opts.returnState) {
      return parserState
    } else if (parserState.failed) {
      throw parserState.error
    } else {
      return parserState.value
    }
  })
}

/**
 * Returns a parser that always succeeds without consuming input.
 *
 * @param [val=undefined] - value to use as this parser's value.
 * @memberof module:mona/core
 * @instance
 *
 * @example
 * parse(value('foo'), '') // => 'foo'
 */
export function value (val) {
  return parserState => {
    let newState = parserState.copy()
    newState.value = val
    return newState
  }
}

/**
 * Returns a parser that calls `fun` on the value resulting from running
 * `parser` on the current parsing state. Fails without executing `fun` if
 * `parser` fails.
 *
 * @param {Parser} parser - The parser to execute.
 * @param {Function} fun - Function called with the resulting value of
 *                         `parser`. Must return a parser.
 * @memberof module:mona/core
 * @instance
 *
 * @example
 * parse(bind(token(), function(x) { return value(x+'!') }), 'a') // => 'a!'
 */
export function bind (parser, fun) {
  return parserState => {
    return parserState.parse(parser).then(newParserState => {
      if (newParserState.failed) {
        return newParserState
      } else {
        return newParserState.parse(
          fun.call(newParserState.userState, newParserState.value))
      }
    })
  }
}

/**
 * Returns a parser that always fails without consuming input. Automatically
 * includes the line and column positions in the final ParserError.
 *
 * @param {String} msg - Message to report with the failure.
 * @param {String} type - A type to apply to the ParserError.
 * @memberof module:mona/core
 * @instance
 */
export function fail (msg = 'parser error', type = 'failure') {
  return function (parserState) {
    let newParserState = parserState.copy()
    newParserState.failed = true
    var newError = new ParserError(newParserState.position, [msg],
                                   type, type === 'eof')
    newParserState.error = parserState.error
      ? parserState.error.merge(newError)
      : newError
    return newParserState
  }
}

/**
 * Returns a parser that will label a `parser` failure by replacing its error
 * messages with `msg`.
 *
 * @param {Parser} parser - Parser whose errors to replace.
 * @param {String} msg - Error message to replace errors with.
 * @memberof module:mona/core
 * @instance
 *
 * @example
 * parse(token(), '') // => unexpected eof
 * parse(label(token(), 'thing'), '') // => expected thing
 */
export function label (parser, msg) {
  return parserState => {
    return parserState.parse(parser).then(newState => {
      if (newState.failed) {
        newState = newState.copy()
        newState.error = new ParserError(newState.error.position,
          ['expected ' + msg],
          'expectation',
          newState.error.wasEof)
      }
      return newState
    })
  }
}

/**
 * Returns a parser that consumes a single item from the input, or fails with an
 * unexpected eof error if there is no input left.
 *
 * @param {Integer} [count=1] - number of tokens to consume. Must be > 0.
 * @memberof module:mona/core
 * @instance
 *
 * @example
 * parse(token(), 'a') // => 'a'
 */
export function token (count) {
  count = count || 1 // force 0 to 1, as well.
  // TODO - move input-bumping into the ParserState class.
  return parserState => {
    const input = parserState.input
    const offset = parserState.offset
    const newOffset = offset + count
    let newParserState = parserState.copy()
    let newPosition = parserState.position.copy()
    newParserState.position = newPosition
    for (let i = offset; i < newOffset && input.length >= i; i++) {
      if (input.charAt(i) === '\n') {
        newPosition.column = 0
        newPosition.line += 1
      } else {
        newPosition.column += 1
      }
    }
    newParserState.offset = newOffset
    if (input.length >= newOffset) {
      newParserState.value = input.slice(offset, newOffset)
      return newParserState
    } else {
      return fail('unexpected eof', 'eof')(newParserState)
    }
  }
}

/**
 * Returns a parser that succeeds with a value of `true` if there is no more
 * input to consume.
 *
 * @memberof module:mona/core
 * @instance
 *
 * @example
 * parse(eof(), '') // => true
 */
export function eof () {
  return parserState =>
    parserState.input.length === parserState.offset
    ? value(true)(parserState)
    : fail('expected end of input', 'expectation')(parserState)
}

/**
 * Delays calling of a parser constructor function until parse-time. Useful for
 * recursive parsers that would otherwise blow the stack at construction time.
 *
 * @param {Function} constructor - A function that returns a Parser.
 * @param {...*} args - Arguments to apply to the constructor.
 * @memberof module:mona/core
 * @instance
 *
 * @example
 * // The following would usually result in an infinite loop:
 * function foo() {
 *   return or(x(), foo())
 * }
 * // But you can use delay() to remedy this...
 * function foo() {
 *   return or(x(), delay(foo))
 * }
 */
export function delay (constructor, ...args) {
  return parserState => constructor(...args)(parserState)
}

/**
 * Debugger parser that logs the ParserState with a tag.
 *
 * @param {Parser} parser - Parser to wrap.
 * @param {String} tag - Tag to use when logging messages.
 * @param {String} [level='log'] - 'log', 'info', 'debug', 'warn', 'error'.
 * @memberof module:mona/core
 * @instance
 */
export function log (parser, tag, level = 'log') {
  return parserState => {
    return parserState.parse(parser).then(newParserState => {
      console[level](tag + ' :: ', parserState, ' => ', newParserState)
      return newParserState
    })
  }
}

/**
 * Returns a parser that transforms the resulting value of a successful
 * application of its given parser. This function is a lot like `bind`, except
 * it always succeeds if its parser succeeds, and is expected to return a
 * transformed value, instead of another parser.
 *
 * @param {Function} transformer - Function called on `parser`'s value. Its
 *                                 return value will be used as the `map`
 *                                 parser's value.
 * @param {Parser} parser - Parser that will yield the input value.
 * @memberof module:mona/core
 * @instance
 *
 * @example
 * parse(map(parseFloat, text()), '1234.5') // => 1234.5
 */
export function map (transformer, parser) {
  return bind(parser, function (result) {
    return value(transformer.call(this, result))
  })
}

/**
 * Returns a parser that returns an object with a single key whose value is the
 * result of the given parser.
 *
 * @param {Parser} parser - Parser whose value will be tagged.
 * @param {String} tag - String to use as the object's key.
 * @memberof module:mona/core
 * @instance
 *
 * @example
 * parse(tag(token(), 'myToken'), 'a') // => {myToken: 'a'}
 */
export function tag (parser, key) {
  return map(x => {
    var ret = {}
    ret[key] = x
    return ret
  }, parser)
}

/**
 * Returns a parser that runs a given parser without consuming input, while
 * still returning a success or failure.
 *
 * @param {Parser} test - Parser to execute.
 * @memberof module:mona/core
 * @instance
 *
 * @example
 * parse(and(lookAhead(token()), token()), 'a') // => 'a'
 */
export function lookAhead (parser) {
  return parserState => {
    return parserState.parse(parser).then(newState => {
      newState.offset = parserState.offset
      newState.position = parserState.position
      return newState
    })
  }
}

/**
 * Returns a parser that succeeds if `predicate` returns true when called on a
 * parser's result.
 *
 * @param {Function} predicate - Tests a parser's result.
 * @param {Parser} [parser=token()] - Parser to run.
 * @memberof module:mona/core
 * @instance
 *
 * @example
 * parse(is(function(x) { return x === 'a' }), 'a') // => 'a'
 */
export function is (predicate, parser = token()) {
  return bind(parser, x => {
    return predicate(x) ? value(x) : fail('predicate check failed')
  })
}

/**
 * Returns a parser that succeeds if `predicate` returns false when called on a
 * parser's result.
 *
 * @param {Function} predicate - Tests a parser's result.
 * @param {Parser} [parser=token()] - Parser to run.
 * @memberof module:mona/core
 * @instance
 *
 * @example
 * parse(isNot(function(x) { return x === 'a' }), 'b') // => 'b'
 */
export function isNot (predicate, parser) {
  return is(x => !predicate(x), parser)
}

/*
 * Utility classes
 */

class ParserState {
  constructor (value, input, offset, userState,
               position, hasConsumed, error, failed) {
    this.value = value
    this.input = input
    this.offset = offset
    this.position = position
    this.userState = userState
    this.failed = failed
    this.error = error
  }
  parse (parser) {
    return bluebird.resolve(this).then(parserState => {
      if (typeof parser !== 'function') {
        throw new Error('Parser needs to be a function, but got ' +
        parser + ' instead')
      }
      return parser(parserState)
    })
  }
  copy () {
    return new ParserState(this.value,
                           this.input,
                           this.offset,
                           this.userState,
                           this.position,
                           this.hasConsumed,
                           this.error,
                           this.failed)
  }
}
ParserState.prototype.isParserState = true

export function invokeParser (parser, parserState) {
  console.warn('invokeParser is deprecated. Use parserState.parse() instead.')
  return parserState.parse(parser)
}

/**
 * Represents a source location.
 * @typedef {Object} SourcePosition
 * @property {String} name - Optional sourcefile name.
 * @property {Integer} line - Line number, starting from 1.
 * @property {Integer} column - Column number in the line, starting from 1.
 * @memberof module:mona/api
 * @instance
 */
class SourcePosition {
  constructor (name, line, column) {
    this.name = name
    this.line = line || 1
    this.column = column || 0
  }
  copy () {
    return new SourcePosition(this.name, this.line, this.column)
  }
}

/**
 * Information about a parsing failure.
 * @typedef {Object} ParserError
 * @property {api.SourcePosition} position - Source position for the error.
 * @property {Array} messages - Array containing relevant error messages.
 * @property {String} type - The type of parsing error.
 * @memberof module:mona/api
 */
class ParserError {
  constructor (pos, messages, type, wasEof) {
    if (Error.captureStackTrace) {
      // For pretty-printing errors on node.
      Error.captureStackTrace(this, this)
    }
    this.position = pos
    this.messages = messages
    this.type = type
    this.wasEof = wasEof
    this.message = ('(line ' + this.position.line +
                    ', column ' + this.position.column + ') ' +
                    this.messages.join('\n'))
  }
  merge (err2) {
    const err1 = this
    if (!err1 || (!err1.messages.length && err2.messages.length)) {
      return err2
    } else if (!err2 || (!err2.messages.length && err1.messages.length)) {
      return err1
    } else {
      switch (comparePositions(err1.position, err2.position)) {
        case 'gt':
          return err1
        case 'lt':
          return err2
        case 'eq':
          var newMessages =
            (err1.messages.concat(err2.messages)).reduce((acc, x) => {
              return (~acc.indexOf(x)) ? acc : acc.concat([x])
            }, [])
          return new ParserError(err2.position,
                                 newMessages,
                                 err2.type,
                                 err2.wasEof || err1.wasEof)
        default:
          throw new Error('This should never happen')
      }
    }
  }
}

function comparePositions (pos1, pos2) {
  if (pos1.line < pos2.line) {
    return 'lt'
  } else if (pos1.line > pos2.line) {
    return 'gt'
  } else if (pos1.column < pos2.column) {
    return 'lt'
  } else if (pos1.column > pos2.column) {
    return 'gt'
  } else {
    return 'eq'
  }
}
