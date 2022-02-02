const { TableTemplate, query, queryTrans } = require('../DB/');
const express = require('express');
const router = express.Router();

const database = 'noteDB'
const fields = ["title", "memo", "isPublic", "status"];
const memosTable = new TableTemplate(`${database}.memos m`, fields, ["mid"]);
memosTable.setFieldQuery(`
  m.*,
  (select GROUP_CONCAT(tname SEPARATOR ' ') from ${database}.memo_tags mt join ${database}.tags t on mt.tid = t.tid where mt.mid = m.mid) tags
`)

/* list */
router.get('/', async function(req, res, next) {
  const { pageSize, rowNum } = req.query;
  const queryStr = memosTable.getList( { pageSize, rowNum, orderBy: [{ mid: 'DESC' }] })
  res.json(await query(async conn => await conn.query(queryStr)));
});

/* getOne */
router.get('/:mid', async function(req, res, next) {
  const { mid } = req.params;
  res.json(await query(async conn => await conn.query(memosTable.select({ mid }))));
});

const tagsTable = new TableTemplate(`${database}.tags`, ["tname"], ["tid"]);
const memoTagsTable = new TableTemplate(`${database}.memo_tags mt`, ["mid", "tid"], ["mid", "tid"]);

async function saveTags(conn, tagNames, mid) {
  const memoTagIds = await conn.query(memoTagsTable.join('mt.*, t.tname', `${database}.tags t`, 'mt.tid = t.tid', { mid }));
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

/* insert */
router.post('/', async function(req, res, next) {
  const params = req.body;
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
  const params = req.body;
  params.mid = Number(req.params.mid);
  const result = await queryTrans(async conn => {
    await conn.query(memosTable.update(params));
    await saveTags(conn, params.tags, params.mid);
    return 1;
  }, next)

  console.log(result);
  res.json({"msg":"수정 성공"})
});

/* delete */
router.delete('/:mid', async (req, res, next) => {
  const mid = Number(req.params.mid);
  await queryTrans(async conn => await conn.query(memosTable.update({ status: "N", mid })));
  res.json({ "msg": "삭제 성공" });
});

module.exports = router;
