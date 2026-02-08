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
    readonly columns: ColumnList
    #columnNames?: string[]
    get columnNames () { return this.#columnNames ??= Object.keys(this.columns) }
    get columnCount () { return this.columnNames.length }

    constructor ({columns}: {columns: readonly [string, ColumnType | Column][]}) {
        this.columns = Object.fromEntries(columns.map(([n,t]) => [n, t instanceof Column ? t : new Column(n,t)]))
    }

    hasColumn (column: string) {
        return column in this.columns
    }

    hasColumnOfType (column: string, type: ColumnType): column is keyof ColumnList {
        return column in this.columns && this.columns[column].type === type 
    }

    equals (other: Schema) {
        return other.columnCount === this.columnCount
            ? Object.values(this.columns).every(({name, type}) => other.hasColumnOfType(name, type))
            : false
    }

    matches (tuple: Tuple) {
        return tuple.schema.equals(this)
    }

    join (other: Schema) {
        return new Schema({
            columns: Object.entries(this.columns).concat(Object.entries(other.columns))
        })
    }

    project ({ columns }: { columns: { column: string, alias?: string }[] }) {
        return new Schema({
            columns: columns.map(({ column, alias }) => [alias ?? column, new Column(alias ?? column, this.columns[column].type)])
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
    /*
    readonly schema: Schema
    readonly values: { }

    constructor ({ values, schema }: { schema: Schema, values: any }) {
        this.schema = schema
        this.values = values
    }
        */
    readonly columns: {[name: string]: ColumnWithValue}
    #schema?: Schema
    get schema () {
        return this.#schema ??= new Schema({
            columns: Object.entries(this.columns)
                .map(([name, col]) => [name, col.column])
        })
    }

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
                columns: data.map(({column, value}) => genericFieldParser(this.schema.columns[column], value))
            })
        )
    }
}

/*
interface VolcanoIterator<T> {
    open (): void
    close (): void
    next (): T
}
*/