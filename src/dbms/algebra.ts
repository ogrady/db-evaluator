import { Relation, Schema } from "./schema";

 
export interface VolcanoIterator<T> {
    open (): void
    close (): void
    next (): T | null
}

export interface BiDirectionalVolcanoIterator<T> extends VolcanoIterator<T> {
    previous (): T
}

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

export class Timeline<V extends VolcanoIterator<T>, T> implements BiDirectionalVolcanoIterator<T> {
    #inner: V
    #timeline: T[] = []
    currentIndex = 0

    constructor (inner: V) {
        this.#inner = inner
    }

    previous(): T {
        throw new Error("Method not implemented.");
    }

    open(): void {
        this.#timeline = []
        this.currentIndex = 0
    }

    close(): void {
        
    }

    next() {
        if (this.currentIndex < this.#timeline.length - 1) {
            return this.#timeline[++this.currentIndex]
        }
        const nxt = this.#inner.next()
        if (nxt) {
            this.#timeline.push(nxt)
        }
        return nxt
    }
}