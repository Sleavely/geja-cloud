#!/usr/bin/env node

const fs = require('../src/utils/fs')
const juice = require('juice')
const path = require('path')
const { promisify } = require('util')

const inlineTemplate = promisify(juice.juiceResources)
exports.main = async () => {
  // find email-template files
  const sourceDirectory = path.resolve(path.join(__dirname, '..', 'email-templates'))
  const targetDirectory = path.resolve(path.join(__dirname, '..', 'src', 'email', 'templates'))
  console.log('Looking in', sourceDirectory)

  const filesInSourceDirectory = await fs.getDirectoryFiles(sourceDirectory)
  console.log('Found the following source templates:')
  console.log(filesInSourceDirectory)

  return Promise.all(filesInSourceDirectory.map(async (fileName) => {
    const filePath = path.join(sourceDirectory, fileName)
    console.log(`Reading ${filePath}..`)

    const fileContents = await fs.readFileAsync(filePath, { encoding: 'utf8' })
    const inlinedContents = await inlineTemplate(fileContents, {})

    // Write to src/email/templates
    return fs.writeFileAsync(path.join(targetDirectory, fileName), inlinedContents, { encoding: 'utf8' })
  }))
}

exports.main()
