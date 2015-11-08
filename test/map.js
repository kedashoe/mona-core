/* global describe, it */
var assert = require('assert')
var core = require('..')
var parse = require('@mona/parse')

describe('map()', function () {
  it('transforms a parser\'s result', function () {
    assert.equal(parse(core.map(function (txt) {
      return txt.toUpperCase()
    }, core.token()), 'a'), 'A')
  })
  it('does not call function if the parser fails', function () {
    var parser = core.map(function (x) { throw x }, core.token())
    assert.throws(function () {
      parse(parser, '')
    }, /unexpected eof/)
  })
  it('access to a userState from function context', function () {
    function toUpper (text) {
      return text.toUpperCase()
    }
    assert.equal(parse(core.map(function (txt) {
      return this.convert(txt)
    }, core.token()), 'a', { userState: { convert: toUpper } }), 'A')
  })
})
