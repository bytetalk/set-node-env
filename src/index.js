const fs = require('fs')
const ARG_KEY_PREFIX = '--'
const KEY_VALUE_SEPARATOR = '='
const END_OF_LINE = /\n|\r|\r\n/

function log (message) {
  if (debug !== undefined && debug !== 'false') {
    console.log(`[set-node-env][debug] ${message}`)
  }
}
function parseArgs () {
  const [, , ...rawArgs] = process.argv
  const ret = {}
  rawArgs.forEach(arg => {
    let [
      key = '',
      value = '',
    ] = arg.split(KEY_VALUE_SEPARATOR, 2)
    if (key.indexOf(ARG_KEY_PREFIX) === 0) {
      key = key.substring(ARG_KEY_PREFIX.length)
      if (key) {
        ret[key] = value || ''
      }
    }
  })
  return ret
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
function setEnv () {
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

const {
  mode,
  debug,
} = parseArgs()

module.exports = setEnv
