ENVIRONMENT        ?= $(shell grep -E "^ENVIRONMENT=.+$$" .env | cut -d '=' -f2)
PROJECT             = $(shell grep -E "^PROJECT=.+$$" .env | cut -d '=' -f2)
AWS_DEFAULT_REGION ?= eu-west-1
BRANCH_NAME = $(shell git branch | grep \* | cut -d ' ' -f2)
COMMIT_HASH = $(shell git log -1 --format=%h)
TAGS = Environment=$(ENVIRONMENT) Project=$(PROJECT) GitBranch=$(BRANCH_NAME) GitCommit=$(COMMIT_HASH)
ARTIFACTS_BUCKET = irish-luck

package = aws cloudformation package \
    --template-file cloudformation.yml \
    --output-template-file dist/cloudformation.dist.yml \
    --s3-bucket $(ARTIFACTS_BUCKET) \
    --s3-prefix $(PROJECT)

deploy = aws cloudformation deploy --template-file dist/cloudformation.dist.yml \
    --stack-name $(PROJECT)-$(ENVIRONMENT) \
    --region $(AWS_DEFAULT_REGION) \
    --parameter-overrides \
      $(shell bin/cf-env.js) \
    --tags $(TAGS) \
    --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
    --s3-bucket $(ARTIFACTS_BUCKET) \
    # --no-fail-on-empty-changeset

deploy:
	@echo "Resetting dist directory"
	@rm -rf dist
	@mkdir -p dist

	@node bin/inlineEmailCss.js

	@echo "Building deployment package"
	@cp -r src dist/
	@cp package.json dist/src/package.json
	@cd dist/src/ && npm install --production

	@echo "Deploying"
	$(call package)
	$(call deploy)

	@echo "Cleaning up"
	@rm -rf dist
	@echo "Done!"
