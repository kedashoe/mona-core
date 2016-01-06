/* global describe, it */
var assert = require('assert')
var core = require('..')
var parse = core.parse

describe('value()', function () {
  it('parses to the given value', function () {
    return parse(core.value('foo'), '').then(function (val) {
      assert.equal(val, 'foo')
    })
  })
  it('does not consume input', function () {
    return parse(core.value('x'), 'a', {
      allowTrailing: true,
      returnState: true
    }).then(function (s) {
      assert.equal(s.value, 'x')
      assert.equal(s.position.line, 1)
      assert.equal(s.position.column, 0)
    })
  })
})
