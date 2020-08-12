NAME                            := tamagotchi-server
DOCKER                          := docker
GIT                             := git
TAG                             ?= ${shell $(GIT) rev-parse --abbrev-ref HEAD}
PORT                            ?= 3001
IMAGE                           := $(NAME)
DOCKER_COMPOSE        					:= docker-compose -f docker-compose.yml
MODULES_TARGETS                 := lint test image

lint:
	$(MAKE) -C src lint

image: lint
	$(DOCKER) build --tag $(IMAGE):$(TAG) --build-arg port=$(PORT) ./

start: stop lint
	$(DOCKER_COMPOSE) run --user="root" --rm web -- ./initdb.sh
	NODE_ENV=development $(DOCKER_COMPOSE) up -d web

stop:
	$(DOCKER_COMPOSE) down --volumes --remove-orphans

test: stop ## test application
	$(DOCKER_COMPOSE) run --user="root" --rm web -- ./initdb.sh
	$(DOCKER_COMPOSE) run -e NODE_ENV=test --rm --entrypoint "/bin/bash -c" web "npm test"

test-dev:
	$(DOCKER_COMPOSE) run -e NODE_ENV=test --rm --entrypoint "/bin/bash -c" web "npm test"

.PHONY: $(MODULES_TARGETS) node_modules