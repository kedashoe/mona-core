/* global describe, it */
var assert = require('assert')
var core = require('..')
var parse = core.parse

describe('label()', function () {
  it('replaces any error messages with an expectation', function () {
    return parse(core.label(core.fail(), 'wee'), '').then(
      Promise.reject.bind(Promise),
      function (e) {
        assert.ok(/\(line 1, column 0\) expected wee/.test(e.message))
      })
  })
})
