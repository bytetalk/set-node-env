const fs = require('fs')
const KEY_VALUE_SEPARATOR = '='
const END_OF_LINE = /\n|\r|\r\n/
let debugMode = false

function log (message) {
  if (debugMode) {
    console.log(`[set-node-env][debug] ${message}`)
  }
}
function parseEnv (name, content = '') {
  const ret = {}
  content.split(END_OF_LINE).forEach((line, index) => {
    let [
      key = '',
      value = '',
    ] = line.split(KEY_VALUE_SEPARATOR, 2)
    key = key.trim()
    value = value.trim()
    if (key && value) {
      ret[key] = value
    } else if (key + value) {
      log(`parsing ${name} line:${index + 1}, value:'${line}' is illegal format`)
    }
  })
  return ret
}
function loadEnv (name) {
  try {
    const content = fs.readFileSync(name, { // relative to process.cwd()
      encoding: 'utf-8',
    })
    return parseEnv(name, content)
  } catch (err) {
    log(err.message)
    return {}
  }
}
function setEnv (mode, debug) {
  debugMode = debug
  const basicEnv = loadEnv('.env')
  const modeEnv = mode ? loadEnv(`.env.${mode}`) : {}
  const env = {
    ...basicEnv,
    ...modeEnv,
  }
  Object.keys(env).forEach(key => {
    if (process.env[key]) {
      log(`key:'${key}' is already defined in process.env, new value:'${env[key]}' is ignored`)
    } else {
      process.env[key] = env[key]
    }
  })
}

module.exports = setEnv
