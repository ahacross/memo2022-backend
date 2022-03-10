import { writeJsonFile } from 'write-json-file'
import { loadJsonFile } from 'load-json-file'

export async function readJSON(name) {
  try {
    return await loadJsonFile(`${name}.json`)
  } catch (e) {
    console.trace(e)
    return {}
  }
}

export async function writeJSON(name, body) {
  try {
    const base = await readJSON(name)
    await writeJsonFile(`${name}.json`, { ...base, ...body })
    return { result: '저장 성공!' }
  } catch(e) {
    console.trace(e)
    return { result: '저장 실패!' }
  }
}
