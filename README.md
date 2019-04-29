# GEJA cloud

A minimalistic ecommerce application for the swedish market. The frontend resides in its own repository: [geja-frontend](https://github.com/Sleavely/geja-frontend)

[![CircleCI](https://circleci.com/gh/Sleavely/geja-cloud/tree/master.svg?style=svg&circle-token=3d9ba39451f3fd7173df433bf09d48bd69e2ecb7)](https://circleci.com/gh/Sleavely/geja-cloud/tree/master)

---

## Installation

1. Copy `.example.env` to `.env`
1. `npm install`

## Running locally

1. `node local.js`

## Deploying to AWS

Unless you are me:

1. Change the `ARTIFACTS_BUCKET` in `Makefile`.
1. Make sure you have a custom domain name set up in API Gateway
1. Change `DomainName` from `aws.triplehead.net` in your `cloudformation.yml`

Now, to actually deploy:

1. `make deploy`
