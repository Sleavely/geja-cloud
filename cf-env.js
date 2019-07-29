#!/usr/bin/env node

const dotenv = require('dotenv')

const env = dotenv.config().parsed

Object.keys(env).forEach((key) => {
  console.log(`${key.replace(/_/g, '')}=${env[key]}`)
})
