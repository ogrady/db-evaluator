export interface VolcanoIterator<T> {
    open (): void
    close (): void
    next (): T | null
}

export interface BiDirectionalVolcanoIterator<T> extends VolcanoIterator<T> {
    previous (): T
}

export class Timeline<V extends VolcanoIterator<unknown>, T = V extends VolcanoIterator<infer T> ? T : never> implements BiDirectionalVolcanoIterator<V extends VolcanoIterator<infer T> ? T : never> {
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
        this.#inner.open()
        this.#timeline = [] as ReturnType<V['next']>[]
        this.currentIndex = 0
    }

    close(): void {
        this.#inner.close()
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