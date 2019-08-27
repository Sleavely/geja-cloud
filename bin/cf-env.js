#!/usr/bin/env node

const dotenv = require('dotenv')
const path = require('path')

const environmentSpecificEnv = (
  process.env.ENVIRONMENT && dotenv.config({
    path: path.resolve(process.cwd(), `.${process.env.ENVIRONMENT}.env`),
  }).parsed
) || {}

const defaultEnv = dotenv.config({
  path: path.resolve(process.cwd(), `.env`),
}).parsed || {}

const env = { ...environmentSpecificEnv, ...defaultEnv }

Object.entries(env).forEach(([key, value]) => {
  console.log(`${key.replace(/_/g, '')}=${process.env[key] || value}`)
})
