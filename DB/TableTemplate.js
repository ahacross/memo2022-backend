class TableTemplate {
  #table
  #fields
  #keys
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

  makeFieldInfo(fields, data, prefix, sep) {
    const array = [];
    if (fields) {
      for (const name of fields) {
        let value = data[name]
        if(value && typeof value === 'string') {
          value = `'${value}'`;
        }
        array.push(`${name}=${value}`);
      }
    }

    return `${this.getTable()} ${array.length > 0 ? prefix : ''} ${array.join(sep)}`
  }

  makeWhere(fields, data) {
    return this.makeFieldInfo(fields, data, 'where', ' and ')
  }

  makeSet(fields, data) {
    return this.makeFieldInfo(fields, data, 'set', ', ')
  }

  makeQuery(params) {
    let { type, data, fields, keys } = params
    let query
    if (!fields && data) {
      fields = Object.keys(data)
    }

    if (type.includes('select')) {
      query = `select * from ${this.makeWhere(fields, data)}`
    } else if (type.includes('insert')) {
      query = `insert into ${this.makeSet(fields, data)}`
    } else if (type.includes('update')) {
      const temp = this.makeWhere(keys, data).split(' ').slice(1).join(' ')
      query = `update ${this.makeSet(fields, data)} ${temp}`
    } else if (type.includes('delete')) {
      query = `delete from ${this.makeWhere(fields, data)}`
    }

    return query
  }

  select(data) {
    return `${this.makeQuery({ type: 'select', data })}`;
  };

  insert(data) {
    const fields = this.getFields()
    return `${this.makeQuery({ type: 'insert', data, fields })}`;
  };

  update(data) {
    const fields = this.getFields()
    const keys = this.getKeys()
    return `${this.makeQuery({ type: 'update', data, fields, keys })}`;
  };

  delete(data) {
    return `${this.makeQuery({ type: 'delete', data })}`;
  };
}

module.exports = TableTemplate
