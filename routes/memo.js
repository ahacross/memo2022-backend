const { TableTemplate, query, queryTrans, addPaging } = require('../DB/');
const express = require('express');
const router = express.Router();

const fields = ["title", "memo", "isPublic", "status"];
const memosTable = new TableTemplate('noteDB.memos', fields, ["mid"]);
// const table = new TableTemplate('memo.memos', ["title", "memo", "status"], ["mid"]);
const memosListQuery = params => `${memosTable.select(params)} order by mid DESC `;

/* list */
router.get('/', async function(req, res, next) {
  const { size, row } = req.query;
  const listQuery = memosListQuery()
  const queryStr = size ? addPaging(listQuery, size, row) : listQuery
  console.log(size, row, queryStr)
  res.json(await query(async conn => await conn.query(queryStr)));
});

/* getOne */
router.get('/:mid', async function(req, res, next) {
  const { mid } = req.params;
  const queryStr = memosListQuery({ mid })
  res.json(await query(async conn => await conn.query(queryStr)));
});

const tagsTable = new TableTemplate('noteDB.tags', ["tname"], ["tid"]);
const memoTagsTable = new TableTemplate('noteDB.memo_tags', ["mid", "tid"], ["mid", "tid"]);
const memoTagsQuery = mid => `select mt.*, t.tname from noteDB.memo_tags mt join noteDB.tags t on mt.tid = t.tid where mid='${mid}'`

async function saveTags(conn, tagNames, mid) {
  const memoTagIds = await conn.query(memoTagsQuery(mid));
  let savedTnames = []
  if (memoTagIds.length) {
    savedTnames = memoTagIds.map(({ tname }) => tname);
  }

  for(const tname of tagNames.split(" ")) {
    if (savedTnames.includes(tname)) {
      savedTnames.splice(savedTnames.indexOf(tname), 1);
    } else {
      const result = await conn.query(tagsTable.select({ tname }))
      let tid = result.length && result[0].tid || 0
      if (tid === 0) {
        const tagResult = await conn.query(tagsTable.insert({ tname }))
        tid = tagResult.insertId
      }
      await conn.query(memoTagsTable.insert({ mid, tid }))
    }
  }

  if (savedTnames.length) {
    for(const tname of savedTnames) {
      const result = await conn.query(tagsTable.select({ tname }));
      const tid = result.length && result[0].tid;
      await conn.query(memoTagsTable.delete({ mid, tid }));
    }
  }
}

const templateParam = {
  status: 'Y',
  isPublic: 'N'
}

/* insert */
router.post('/', async function(req, res, next) {
  const params = { ...templateParam, ...req.body };
  await queryTrans(async conn => {
    const memo = await conn.query(memosTable.insert(params))
    const mid = memo.insertId
    await saveTags(conn, params.tags, mid)
    return 1;
  }, next)

  res.json({"msg":"등록 성공"})
});

/* update */
router.put('/:mid', async function(req, res, next) {
  const params = { ...templateParam, ...req.body };
  params.mid = Number(req.params.mid);
  const result = await queryTrans(async conn => {
    await conn.query(memosTable.update(params));
    await saveTags(conn, params.tags, params.mid);
    return 1;
  }, next)

  console.log(result);
  res.json({"msg":"수정 성공"})
});

module.exports = router;
