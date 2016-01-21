/* global describe, it */
var assert = require('assert')
var core = require('..')
var parse = core.parse
var reject = require('bluebird').reject

describe('eof()', function () {
  it('succeeds with true if we\'re out of input', function () {
    return parse(core.eof(), '').then(function (x) {
      assert.ok(x)
    })
  })
  it('fails with useful message if there is still input left', function () {
    return parse(
      core.eof(),
      'a'
    ).then(reject, function (e) {
      assert.ok(/expected end of input/.test(e.message))
    })
  })
})
