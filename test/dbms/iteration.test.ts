import test from 'node:test'
import assert from 'node:assert/strict'

import { Schema, Column, Tuple, Relation } from '../../src/dbms/schema.ts'


test('relation', t => {
    const s1 = new Schema({ columns: [
        ['flag', 'Boolean'],
        ['count', 'Integer']
    ]})
    const t1 = new Tuple({
        columns: [
            { value: true, column: new Column('flag', 'Boolean') },
            { value: 4, column: new Column('count', 'Integer') }
        ]    
    })
    const r1 = new Relation({ schema: s1, tuples: [t1] })
    r1.addRow([{column: 'flag', value: 'false'}, {column: 'count', value: '2'}])
    assert.equal(r1.next(), t1)
    assert.equal(r1.next()?.columns['count'].value, 2)
    assert.equal(r1.next(), null)
})
