import type { VolcanoIterator } from "./iteration";
import { Relation, Schema } from "./schema.ts";

export abstract class Join<T> implements VolcanoIterator<T> {
    protected r: Relation
    protected s: Relation
    constructor (r: Relation, s: Relation) {
        this.r = r
        this.s = s
    }
    abstract open(): void
    abstract close(): void
    abstract next(): T | null
    abstract getSchema (): Schema

}

export class CrossJoin<T> extends Join<any> {
    open(): void {
        throw new Error("Method not implemented.");
    }
    close(): void {
        throw new Error("Method not implemented.");
    }
    next() {
        throw new Error("Method not implemented.");
    }
    getSchema(): Schema {
        return this.r.schema.join(this.s.schema)
    }
}
