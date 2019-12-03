#!/usr/bin/env node
const setEnv = require('..')
const ARG_KEY_PREFIX = '--'
const KEY_VALUE_SEPARATOR = '='

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

let {
  mode,
  debug,
} = parseArgs()
if (debug) {
  if (debug === 'false') {
    debug = false
  } else {
    debug = true
  }
} else {
  if (debug === '') {
    debug = true
  } else {
    debug = false
  }
}
setEnv(mode, debug)
