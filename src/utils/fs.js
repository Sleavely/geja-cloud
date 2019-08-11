'use strict'

const fs = require('fs')
const { promisify } = require('util')
const readDirAsync = promisify(fs.readdir)
const readFileAsync = promisify(fs.readFile)
const writeFileAsync = promisify(fs.writeFile)
const unlinkAsync = promisify(fs.unlink)

const getDirectoryFiles = async (directoryPath) => {
  // Note: withFileTypes requires Node 10+
  const dir = await readDirAsync(directoryPath, { withFileTypes: true })
  return dir
    .filter(item => !item.isDirectory())
    .map(item => item.name)
}

module.exports = {
  getDirectoryFiles,
  readFileAsync,
  writeFileAsync,
  unlinkAsync,
}
