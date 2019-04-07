# GEJA cloud

A minimalistic ecommerce application for the swedish market.

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
