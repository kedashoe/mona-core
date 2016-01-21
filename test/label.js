/* global describe, it */
var assert = require('assert')
var core = require('..')
var parse = core.parse
var reject = require('bluebird').reject

describe('label()', function () {
  it('replaces any error messages with an expectation', function () {
    return parse(core.label(core.fail(), 'wee'), '').then(
      reject,
      function (e) {
        assert.ok(/\(line 1, column 0\) expected wee/.test(e.message))
      })
  })
})
