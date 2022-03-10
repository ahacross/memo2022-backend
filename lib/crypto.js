import { readJSON } from './file.js'
import CryptoJS from 'crypto-js'

export const getSHA256 = function (text) {
  return CryptoJS.SHA256(text).toString(CryptoJS.enc.Base64)
}

export const checkPassword = async function(text) {
  const { password } = await readJSON('info')
  return password === getSHA256(text)
}
// https://api.ipify.org?format=json
