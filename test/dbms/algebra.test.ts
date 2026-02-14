import test from 'node:test'
import assert from 'node:assert/strict'

import { Relation } from '../../src/dbms/schema.ts'
import { CrossJoin } from '../../src/dbms/algebra.ts'

test.suite('algebra', () => {
    test('foo', t => {
        //const x = new CrossJoin(null as unknown as Relation, null as unknown as Relation).getSchema()
        assert.ok(true, 'o no')
    })
})