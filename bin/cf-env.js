#!/usr/bin/env node

const dotenv = require('dotenv')
const path = require('path')

const env = dotenv.config({
  path: path.resolve(process.cwd(), `.env${process.env.ENVIRONMENT ? `.${process.env.ENVIRONMENT}` : ''}`)
}).parsed

Object.entries(env).forEach(([key, value]) => {
  console.log(`${key.replace(/_/g, '')}=${process.env[key] || value}`)
})
