const fs = require('fs')
const { KEY_VALUE_SEPARATOR, END_OF_LINE, log } = require('./common')

let debugMode = false

function getValue (value) {
  // https://nodejs.org/dist/latest-v13.x/docs/api/process.html#process_process_env
  // Assigning a property on process.env will implicitly convert the value to a string.
  // This behavior is deprecated.
  // Future versions of Node.js may throw an error when the value is not a string, number, or boolean.
  if (value === 'true') {
    return true
  } else if (value === 'false') {
    return false
  } else {
    const number = Number(value)

    if (isNaN(number)) {
      return value
    } else {
      return number
    }
  }
}
function parseEnv (name, content = '') {
  const ret = {}

  content.split(END_OF_LINE).forEach((line, index) => {
    let [
      key = '',
      ...value
    ] = line.split(KEY_VALUE_SEPARATOR)

    key = key.trim()
    value = value.join(KEY_VALUE_SEPARATOR).trim()

    if (key.startsWith('#')) {
      return
    }

    if (key && value) {
      ret[key] = getValue(value)
    } else if (key + value) {
      log(debugMode, `parsing ${name} line:${index + 1}, value:'${line}' is illegal format`)
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
    log(debugMode, err.message)

    return {}
  }
}
function setNodeEnv (mode, debug) {
  debugMode = debug

  const basicEnv = loadEnv('.env')
  const modeEnv = mode ? loadEnv(`.env.${mode}`) : {}
  const env = {
    ...basicEnv,
    ...modeEnv,
  }

  Object.keys(env).forEach(key => {
    if (process.env[key] === undefined) {
      process.env[key] = env[key]
    } else {
      log(debugMode, `'${key}:${process.env[key]}' is already defined in process.env, new value:'${env[key]}' is ignored`)
    }
  })

  if (process.env.NODE_ENV === undefined) {
    process.env.NODE_ENV = mode
  }
}

module.exports = setNodeEnv
