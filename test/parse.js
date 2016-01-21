/* global describe, it */
var assert = require('assert')
var core = require('..')
var parse = core.parse
var reject = require('bluebird').reject

describe('parse()', function () {
  it('returns a promise by default', function () {
    var p = parse(core.value(''), '')
    assert.equal(typeof p.then, 'function')
  })
  it('executes a parser on a string and returns the result', function () {
    var result = {}
    return parse(core.value(result), '').then(function (res) {
      assert.equal(res, result)
    })
  })
  it('returns ParserState on success if returnState is true', function () {
    return parse(core.value('foo'), '', {
      returnState: true
    }).then(function (res) {
      assert.equal(res.value, 'foo')
      assert.ok(res.isParserState)
    })
  })
  it('Fails the promise on parse failure by default', function () {
    return parse(core.fail('bad qq'), '').then(reject, function (e) {
      assert.equal('(line 1, column 0) bad qq', e.message)
    })
  })
  it('reports an error if parser argument isn\'t a function', function () {
    return parse(undefined, 'parsemeplease').then(reject, function (e) {
      assert.equal(
        e.message,
        'Parser needs to be a function, but got undefined instead')
    })
  })
})
