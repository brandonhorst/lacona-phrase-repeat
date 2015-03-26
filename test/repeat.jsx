/** @jsx phrase.createElement */
/* eslint-env mocha */
import {expect} from 'chai'
import fulltext from 'lacona-util-fulltext'
import * as lacona from 'lacona'
import * as phrase from 'lacona-phrase'
import Repeat from '..'

function from(i) {const a = []; for (let x of i) a.push(x); return a}

describe('repeat', () => {
  let parser

  beforeEach(() => {
    parser = new lacona.Parser()
  })

  describe('separator', () => {
    it('does not accept input that does not match the child', () => {
      parser.sentences = [
        <Repeat>
          <content><literal text='super' /></content>
          <separator><literal text='man' /></separator>
        </Repeat>
      ]

      const data = from(parser.parse('wrong'))
      expect(data).to.have.length(0)
    })

    it('accepts the child on its own', () => {
      parser.sentences = [
        <Repeat>
          <content><literal text='super' /></content>
          <separator><literal text='man' /></separator>
        </Repeat>
      ]

      const data = from(parser.parse('superm'))
      expect(data).to.have.length(1)
      expect(fulltext.match(data[0])).to.equal('super')
      expect(fulltext.suggestion(data[0])).to.equal('man')
      expect(fulltext.completion(data[0])).to.equal('super')
    })

    it('accepts the child twice, with the separator in the middle', () => {
      parser.sentences = [
        <Repeat>
          <content><literal text='super' /></content>
          <separator><literal text='man' /></separator>
        </Repeat>
      ]

      const data = from(parser.parse('supermans'))
      expect(data).to.have.length(1)
      expect(fulltext.suggestion(data[0])).to.equal('super')
    })

    it('allows for content to have children', () => {
      parser.sentences = [
        <Repeat>
          <content>
            <choice>
              <literal text='a' />
              <literal text='b' />
            </choice>
          </content>
          <separator><literal text=' ' /></separator>
        </Repeat>
      ]

      const data = from(parser.parse('a'))
      expect(data).to.have.length(3)
      expect(fulltext.all(data[0])).to.equal('a')
      expect(fulltext.all(data[1])).to.equal('a a')
      expect(fulltext.all(data[2])).to.equal('a b')
    })
  })

  it('allows for content to have children', () => {
    parser.sentences = [
      <Repeat>
        <choice>
          <literal text='a' />
          <literal text='b' />
        </choice>
      </Repeat>
    ]

    const data = from(parser.parse(''))
    expect(data).to.have.length(6)
    expect(fulltext.all(data[0])).to.equal('a')
    expect(fulltext.all(data[1])).to.equal('b')
    expect(fulltext.all(data[2])).to.equal('aa')
    expect(fulltext.all(data[3])).to.equal('ab')
    expect(fulltext.all(data[4])).to.equal('ba')
    expect(fulltext.all(data[5])).to.equal('bb')
  })

  it('does not accept input that does not match the child', () => {
    parser.sentences = [
      <Repeat>
        <literal text='super' />
      </Repeat>
    ]
    const data = from(parser.parse('wrong'))
    expect(data).to.have.length(0)
  })

  it('accepts the child on its own', () => {
    parser.sentences = [
      <Repeat>
        <literal text='super' />
      </Repeat>
    ]

    const data = from(parser.parse('sup'))
    expect(data).to.have.length(2)
    expect(fulltext.all(data[0])).to.equal('super')
    expect(fulltext.all(data[1])).to.equal('supersuper')
  })

  it('accepts the child twice', () => {
    parser.sentences = [
      <Repeat>
        <literal text='super' />
      </Repeat>
    ]

    const data = from(parser.parse('supers'))
    expect(data).to.have.length(2)
    expect(fulltext.all(data[0])).to.equal('supersuper')
    expect(fulltext.all(data[1])).to.equal('supersupersuper')
  })

  it('creates an array from the values of the children', () => {
    parser.sentences = [
      <Repeat max={2}>
        <choice>
          <literal text='super' value='super' />
          <literal text='man' value='man' />
        </choice>
      </Repeat>
    ]

    const data = from(parser.parse('superm'))
    expect(data).to.have.length(1)
    expect(data[0].result).to.eql(['super', 'man'])
  })

  it('does not accept fewer than min iterations', () => {
    parser.sentences = [
      <Repeat min={2}>
        <content><literal text='a' /></content>
        <separator><literal text='b' /></separator>
      </Repeat>
    ]

    const data = from(parser.parse('a'))
    expect(data).to.have.length(1)
    expect(fulltext.match(data[0])).to.equal('a')
    expect(fulltext.suggestion(data[0])).to.equal('b')
    expect(fulltext.completion(data[0])).to.equal('a')
  })

  it('does not accept more than max iterations', () => {
    parser.sentences = [
      <Repeat max={1}>
        <content><literal text='a' /></content>
        <separator><literal text='b' /></separator>
      </Repeat>
    ]

    const data = from(parser.parse('a'))
    expect(data).to.have.length(1)
    expect(fulltext.suggestion(data[0])).to.equal('')
    expect(fulltext.match(data[0])).to.equal('a')
  })

  it('passes on its category', () => {
    parser.sentences = [
      <Repeat category='myCat'>
        <literal text='a' />
      </Repeat>
    ]

    const data = from(parser.parse(''))
    expect(data).to.have.length(2)
    expect(data[0].suggestion[0].category).to.equal('myCat')
    expect(data[1].suggestion[0].category).to.equal('myCat')
    expect(data[1].completion[0].category).to.equal('myCat')
  })

  it('rejects non-unique repeated elements', () => {
    parser.sentences = [
      <Repeat unique={true}>
        <choice>
          <literal text='a' value='a' />
          <literal text='b' value='b' />
        </choice>
      </Repeat>
    ]

    const data = from(parser.parse('aa'))
    expect(data).to.have.length(0)
  })

  it('accepts unique repeated elements', () => {
    parser.sentences = [
      <Repeat unique={true}>
        <choice>
          <literal text='a' value='a' />
          <literal text='b' value='b' />
        </choice>
      </Repeat>
    ]

    const data = from(parser.parse(''))
    expect(data).to.have.length(4)
    expect(fulltext.all(data[0])).to.equal('a')
    expect(fulltext.all(data[1])).to.equal('b')
    expect(fulltext.all(data[2])).to.equal('ab')
    expect(fulltext.all(data[3])).to.equal('ba')
  })

  it('allows for choices inside of repeats to be limited', () => {
  parser.sentences = [
    <Repeat>
      <choice limit={1}>
        <literal text='aa' />
        <literal text='ab' />
        <literal text='ac' />
      </choice>
    </Repeat>
  ]

  const data = from(parser.parse('aba'))
  expect(data).to.have.length(2)
  expect(fulltext.all(data[0])).to.equal('abaa')
  expect(fulltext.all(data[1])).to.equal('abaaaa')
})

it('allows for choices inside of repeat separators to be limited', () => {
  parser.sentences = [
    <Repeat>
      <content>
        <literal text='x' />
      </content>
      <separator>
        <choice limit={1}>
          <literal text='aa' />
          <literal text='ab' />
          <literal text='ac' />
        </choice>
      </separator>
    </Repeat>
  ]

  const data = from(parser.parse('xa'))
  expect(data).to.have.length(1)
  expect(fulltext.match(data[0])).to.equal('x')
  expect(fulltext.suggestion(data[0])).to.equal('aa')
  expect(fulltext.completion(data[0])).to.equal('x')
})
})
