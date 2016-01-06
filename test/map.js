/* global describe, it */
var assert = require('assert')
var core = require('..')
var parse = core.parse

describe('map()', function () {
  it('transforms a parser\'s result', function () {
    return parse(core.map(function (txt) {
      return txt.toUpperCase()
    }, core.token()), 'a').then(function (val) {
      assert.equal(val, 'A')
    })
  })
  it('does not call function if the parser fails', function () {
    return parse(core.map(function (x) {
      throw x
    }, core.token()), '').then(Promise.reject.bind(Promise), function (e) {
      assert.ok(/unexpected eof/.test(e.message))
    })
  })
  it('access to a userState from function context', function () {
    return parse(core.map(function (txt) {
      return this.convert(txt)
    }, core.token()), 'a', {
      userState: {
        convert: function (text) { return text.toUpperCase() }
      }
    }).then(function (res) {
      assert.equal(res, 'A')
    })
  })
})
