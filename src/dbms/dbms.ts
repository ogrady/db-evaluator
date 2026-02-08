type ColumnType = 'Boolean' | 'String' | 'Integer' | 'Float'
type ColumnList<K extends string = string> = Record<K, Column>
type ColumnTypeToNativeTypeMapping = {
    'Boolean': boolean,
    'String': string,
    'Integer': number,
    'Float': number
}
type ColumnTypeValidator<T> = (x: unknown) => x is T
type StringToColumnTypeParser<T> = (x: string) => T


export const columnValidators: {[type in ColumnType]: ColumnTypeValidator<type>} = {
    Boolean: (x: unknown): x is 'Boolean' => typeof x === 'boolean',
    String: (x: unknown): x is 'String' => typeof x === 'string',
    Integer: (x: unknown): x is 'Integer' => Number.isInteger(x),
    Float: (x: unknown): x is 'Float' => Number.isInteger(x) || Boolean((''+x).match(/^\d+.\d+$/))  // 42.0 automatically becomes 42
}

export const fieldParsers: {[type in ColumnType]: StringToColumnTypeParser<ColumnTypeToNativeTypeMapping[type]>} = {
    Boolean: (x: string) => x === 'true',
    String: (x: string) => x,
    Integer: (x: string) => Number.parseInt(x),
    Float: (x: string) => Number.parseFloat(x),
}

const genericFieldParser = <T extends ColumnType>(column: Column<T>, value: string) => ({
    column,
    value: fieldParsers[column.type](value)
  } as ColumnWithValue
)


export class Column<T extends ColumnType = ColumnType> {
    readonly name: string
    readonly type: T

    constructor (name: string, type: T) {
        this.name = name
        this.type = type
    }

    accepts (x: unknown): boolean {
        return columnValidators[this.type](x)
    }
}

export class Schema {
    readonly fields: ColumnList
    #fieldNames?: string[]
    get fieldNames () { return this.#fieldNames ??= Object.keys(this.fields) }
    get fieldCount () { return this.fieldNames.length }

    hasField (field: string) {
        return field in this.fields
    }

    hasFieldOfType (field: string, type: ColumnType): field is keyof ColumnList {
        return field in this.fields && this.fields[field].type === type 
    }

    equals (other: Schema) {
        return other.fieldCount === this.fieldCount
            ? Object.values(this.fields).every(({name, type}) => other.hasFieldOfType(name, type))
            : false
    }

    matches (tuple: Tuple) {
        tuple.columns
    }

    constructor ({fields}: {fields: readonly [string, ColumnType | Column][]}) {
        this.fields = Object.fromEntries(fields.map(([n,t]) => [n, t instanceof Column ? t : new Column(n,t)]))
    }

    join (other: Schema) {
        return new Schema({
            fields: Object.entries(this.fields).concat(Object.entries(other.fields))
        })
    }
}

type ColumnWithValue =
  {
    // ensures T is inferred from .column and enforces consistency with the type of .value
    [T in ColumnType]: {
      value: ColumnTypeToNativeTypeMapping[T];
      column: Column<T>;
    }
  }[ColumnType];

export class Tuple {
    readonly columns: {[name: string]: ColumnWithValue}

    constructor ({columns}: {columns: ColumnWithValue[]}) {
        this.columns = Object.fromEntries(columns.map(col => [col.column.name, col]))
    }
}

export class Relation {
    readonly schema: Schema
    readonly tuples: Tuple[] = []

    get rowCount () {
        return this.tuples.length
    }

    constructor ({schema, tuples = []}: {schema: Schema, tuples: Tuple[]}) {
        this.schema = schema
        this.tuples.push(...tuples)
    }

    addRow (data: {column: string, value: string}[]) {
        this.tuples.push(
            new Tuple({
                columns: data.map(({column, value}) => genericFieldParser(this.schema.fields[column], value))
            })
        )
    }
}

interface VolcanoIterator<T> {
    open (): void
    close (): void
    next (): T
}