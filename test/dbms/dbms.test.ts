import test from 'node:test'
import assert from 'node:assert/strict'
import { Schema, Column, fieldParsers, Tuple, Relation } from '../../src/dbms/dbms.ts'

test('fields accept', t => {
    const int = new Column('', 'Integer')
    const bool = new Column('', 'Boolean')
    const str = new Column('', 'String')
    const float = new Column('', 'Float')

    t.test('int accepts int', () => assert.ok(int.accepts(42)))
    t.test('int does not accept bool', () => assert.ok(!int.accepts(true)))
    t.test('bool accepts bool', () => assert.ok(bool.accepts(true)))
    t.test('bool does not accept int', () => assert.ok(!bool.accepts(42)))
    t.test('string accepts string', () => assert.ok(str.accepts('hello')))
    t.test('string does not accept int', () => assert.ok(!str.accepts(42)))
    t.test('float accepts float', () => assert.ok(float.accepts(42.0)))
    t.test('float accepts int', () => assert.ok(float.accepts(42)))
    t.test('float does not accept bool', () => assert.ok(!float.accepts(false)))
})

test('parsers', t => {
    t.test('integer', () => assert.equal(fieldParsers.Integer('42'), 42))
    t.test('float', () => assert.ok(4.2 - fieldParsers.Float('4.2') < 0.01))
    t.test('boolean true', () => assert.equal(fieldParsers.Boolean('true'), true))
    t.test('boolean false', () => assert.equal(fieldParsers.Boolean('false'), false))
    t.test('string', () => assert.equal(fieldParsers.String('hello'), 'hello'))
})

test('schemas are equal', () => {
    const s1 = new Schema({fields: [['x', 'Integer'], ['y', 'Boolean']]})
    const s2 = new Schema({fields: [['x', 'Integer'], ['y', 'Boolean']]})
    const s3 = new Schema({fields: [['x', 'Integer'], ['z', 'Boolean']]})
    const s4 = new Schema({fields: [['x', 'Integer'], ['y', 'String']]})
    const s5 = new Schema({fields: [['x', 'Integer']]})
    const s6 = new Schema({fields: [['x', 'Integer'], ['y', 'Boolean'], ['z', 'String']]})

    assert.ok(s1.equals(s2), 'should be equal')
    assert.ok(!s1.equals(s3), 'should not match based on incorrect field name z')
    assert.ok(!s1.equals(s4), 'should not match based on incorrect field type of y')
    assert.ok(!s1.equals(s5), 'should not match based on missing field y')
    assert.ok(!s1.equals(s6), 'should not match based on additional field z')
})

test('schema join', () => {
    const s1 = new Schema({fields: [['x', 'Integer']]})
    const s2 = new Schema({fields: [['y', 'Boolean']]})
    const joined = new Schema({fields: [['x', 'Integer'], ['y', 'Boolean']]})
    
    assert.ok(s1.join(s2).equals(joined), 'should contain x:int and y:bool after join')
})

test('tuple', () => {
    const t1 = new Tuple({ columns: [{
        value: 42,
        column: new Column('foo', 'Integer')
    }]})
})

test('relation', () => {
    const s1 = new Schema({ fields: [
        ['flag', 'Boolean'],
        ['count', 'Integer']
    ]})
    const t1 = new Tuple({
        columns: [
            { value: true, column: new Column('flag', 'Boolean') },
            { value: 42, column: new Column('count', 'Integer') }
        ]    
    })
    const r1 = new Relation({ schema: s1, tuples: [t1] })

    assert.equal(r1.rowCount, 1)
})