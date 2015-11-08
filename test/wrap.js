/* global describe, it */
var assert = require('assert')
var core = require('..')
var parse = require('@mona/parse')

describe('wrap()', function () {
  it('wraps a parser\'s output with a tagging object', function () {
    assert.deepEqual(parse(core.tag(core.token(), 'tok'), 'f'),
                     {tok: 'f'})
  })
})
