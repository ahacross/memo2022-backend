const TableTemplate = require('./TableTemplate');
const mariadb = require('mariadb');
const config = require('../config/db')[process.env.NODE_ENV || 'development'];
const pool = mariadb.createPool(config);

const query = async (fn) => {
  const conn = await pool.getConnection();
  try {
    return await fn(conn);
  } catch (e) {
    console.error('Error while performing Query.', e);
  } finally {
    conn && await conn.end();
    console.log('close');
  }
};

const queryTrans = async (fn) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    let rows;
    try {
      rows = await fn(conn);
      await conn.commit();
      return await rows;
    } catch (err) {
      console.error("Error loading data, reverting changes: ", err);
      await    conn.rollback();
    }
  } catch(e) {
    console.error('Error starting a transaction:', e);
  } finally {
    conn && await conn.end();
    console.log('close');
  }
  return Promise.resolve(1);
}

const addPaging = function(query, size, row) {
  return `${query} limit ${size} offset ${row}`;
}

module.exports = {
  query, queryTrans, TableTemplate, addPaging,
}
