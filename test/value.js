/* global describe, it */
var assert = require('assert')
var core = require('..')
var parse = require('@mona/parse').parse
var comb = require('@mona/combinators')

describe.only('value()', function () {
  it('parses to the given value', function (d) {
    parse(core.value('foo'), '').then(function (val) {
      assert.equal(val, 'foo')
      d()
    }, d)
  })
  it('does not consume input', function (d) {
    var parser = comb.followedBy(core.value('foo'), core.token())
    parse(parser, 'a').then(function (val) {
      assert.equal(val, 'foo')
      d()
    }, d)
  })
})
