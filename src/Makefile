NPM_REGISTRY                    ?= $(shell npm config get registry)
NPM                             := npm

node_modules: ## install node_modules
	$(NPM) install --quiet --registry=$(NPM_REGISTRY)

lint: node_modules ## lint an application
	$(NPM) run lint