import { checkPassword } from '../lib/crypto.js'
import { writeJSON } from '../lib/file.js'
import express from 'express'
const router = express.Router()

// post json
router.post('/checkPass', async function(req, res, next) {
  const { password } = req.body
  res.json({ result: await checkPassword(password) })
})

// post json
router.post('/saveIp', async function(req, res, next) {
  const { ip } = req.body
  const result = await writeJSON('ip', { ip, date: new Date().getTime() })
  res.json(result)
})

export default router
