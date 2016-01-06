/* global describe, it */
var assert = require('assert')
var core = require('..')
var parse = core.parse

describe('tag()', function () {
  it('wraps a result in an object with a given key', function () {
    return parse(core.tag(core.token(), 'LetterA'), 'a').then(function (x) {
      assert.deepEqual(x, {LetterA: 'a'})
    })
  })
})
