import { readJSON, writeJSON } from '../lib/file.js'
import { getSHA256 } from '../lib/crypto.js'
import express from 'express'
const router = express.Router()


function getFileName(req) {
  // console.log('Cookies: ', (req.cookies?.name || 'info'))
  return req.cookies?.name || 'info'
}

// get json
router.get('/', async function(req, res, next) {
  const fileName = getFileName(req)
  const data = await readJSON(fileName)
  if (fileName === 'info') {
    delete data.password
  }
  res.json(data)
})

// save json
router.post('/', async function(req, res, next) {
  const fileName = getFileName(req)
  if (fileName === 'info' && req.body.password) {
    req.body.password = await getSHA256(req.body.password)
  }

  res.json(await writeJSON(getFileName(req), req.body))
})

export default router
