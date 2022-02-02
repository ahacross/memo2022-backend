class TableTemplate {
  #table
  #fields
  #keys
  #fieldQuery
  constructor(table, fields, keys) {
    this.#table = table
    this.#fields = fields
    this.#keys = keys
  }

  getTable() {
    return this.#table
  }

  getFields() {
    return this.#fields
  }

  getKeys() {
    return this.#keys
  }

  setFieldQuery(query) {
    this.#fieldQuery = query
  }

  #makeFieldInfo(fields, data, type, withTable=true) {
    const array = [];
    if (fields) {
      for (const field of fields) {
        let value = data[field]
        if(typeof value === 'string') {
          value = `'${value}'`;
        }
        value && array.push(`${field}=${value}`);
      }
    }

    if (type === 'where') {
      return `${withTable && this.getTable() || ''} ${array.length ? 'where' : ''} ${array.join(' and ')}`
    } else if (type === 'set') {
      return `${this.getTable()} ${array.length ? 'set' : ''} ${array.join(', ')}`
    }
  }

  #makeWhere(fields, data, withTable= true) {
    return this.#makeFieldInfo(fields, data, 'where', withTable)
  }

  #makeSet(fields, data, ) {
    return this.#makeFieldInfo(fields, data, 'set')
  }

  #makeQuery({ type, data, fields, keys }) {
    let query
    if (!fields && data) {
      fields = Object.keys(data)
    }

    if (type === 'select') {
      query = `${this.#fieldQuery} from ${this.#makeWhere(fields, data)}`
    } else if (type === 'insert') {
      query = `into ${this.#makeSet(fields, data)}`
    } else if (type === 'update') {
      query = `${this.#makeSet(fields, data)} ${this.#makeWhere(keys, data, false)}`
    } else if (type === 'delete') {
      query = `from ${this.#makeWhere(fields, data)}`
    }

    return `${type} ${query}`
  }

  #makeOrder(orderBy = []) {
    orderBy = orderBy.reduce((sumArr, order) => {
      const key = Object.keys(order)[0]
      sumArr.push(`${key} ${order[key]}`)
      return sumArr;
    }, [])
    return `order by ${orderBy.join(', ')}`
  }

  #makePaging(pageSize, rowNum) {
    return `limit ${pageSize} offset ${rowNum}`
  }

  getList({ data, pageSize = 10, rowNum = 0, orderBy = [] }) {
    return `${this.select(data).trim()} ${this.#makeOrder(orderBy)} ${this.#makePaging(pageSize, rowNum)}`;
  }

  select(data) {
    return `${this.#makeQuery({ type: 'select', data })}`;
  };

  insert(data) {
    const fields = this.getFields()
    return `${this.#makeQuery({ type: 'insert', data, fields })}`;
  };

  update(data) {
    const fields = this.getFields()
    const keys = this.getKeys()
    return `${this.#makeQuery({ type: 'update', data, fields, keys })}`;
  };

  delete(data) {
    return `${this.#makeQuery({ type: 'delete', data })}`;
  };

  join(fieldQuery, joinTable, onQuery, data) {
    return `
      select ${fieldQuery} 
      from ${this.getTable()}
      join ${joinTable}
      on ${onQuery}
      ${this.#makeWhere(Object.keys(data), data)}
    `
  };
}

module.exports = TableTemplate
