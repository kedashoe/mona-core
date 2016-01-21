/* global describe, it */
var assert = require('assert')
var core = require('..')
var parse = core.parse
var reject = require('bluebird').reject

describe('delay()', function () {
  it('delays calling a parser constructor until parse-time', function () {
    var parser = core.delay(function () {
      throw new Error('Parser explosion')
    })
    return parse(parser, '').then(reject, function (e) {
      assert.ok(/Parser explosion/.test(e.message))
    })
  })
  it('returns a parser with the arguments applied', function () {
    var obj = {}
    return parse(core.delay(core.value, obj), '').then(function (val) {
      assert.equal(val, obj)
    })
  })
})
