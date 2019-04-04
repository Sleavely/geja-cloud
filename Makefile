ENVIRONMENT        ?= dev
PROJECT             = geja
AWS_DEFAULT_REGION ?= eu-west-1
TAGS = Environment=$(ENVIRONMENT) Project=$(PROJECT)
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
      Environment=$(ENVIRONMENT) \
      Project=$(PROJECT) \
    --tags $(TAGS) \
    --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
    --s3-bucket $(ARTIFACTS_BUCKET) \
    # --no-fail-on-empty-changeset

deploy:
	@echo "Resetting dist directory"
	@rm -rf dist
	@mkdir -p dist

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
