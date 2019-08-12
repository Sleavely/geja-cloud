#!/usr/bin/env node

const fs = require('../src/utils/fs')
const juice = require('juice')
const path = require('path')
const { promisify } = require('util')

const inlineTemplate = promisify(juice.juiceResources)
exports.main = async () => {
  console.log('Inlining email templates..')

  // find email-template files
  const sourceDirectory = path.resolve(path.join(__dirname, '..', 'email-templates'))
  const targetDirectory = path.resolve(path.join(__dirname, '..', 'src', 'emails'))
  console.log('Looking in', sourceDirectory)

  const filesInSourceDirectory = await fs.getDirectoryFiles(sourceDirectory)
  console.log('Found the following source templates:')
  console.log(filesInSourceDirectory)

  // Clean existing inlined templates
  console.log('Removing pre-existing inlined templates..')
  const targetDirectoryFiles = await fs.getDirectoryFiles(targetDirectory)
  const outdatedFiles = targetDirectoryFiles.filter((fileName) => fileName.endsWith('html'))
  await Promise.all(outdatedFiles.map(async (fileName) => fs.unlinkAsync(path.join(targetDirectory, fileName))))
  console.log('Cleaned output directory.')

  await Promise.all(filesInSourceDirectory.map(async (fileName) => {
    const filePath = path.join(sourceDirectory, fileName)
    console.log(`Processing ${filePath}..`)

    const fileContents = await fs.readFileAsync(filePath, { encoding: 'utf8' })
    const inlinedContents = await inlineTemplate(fileContents, { webResources: { images: 2 } })

    // Write to src/email/templates
    await fs.writeFileAsync(path.join(targetDirectory, fileName), inlinedContents, { encoding: 'utf8' })
    console.log(`Wrote ${fileName}.`)
  }))
  console.log('Inlined all email templates.')
}

exports.main()
