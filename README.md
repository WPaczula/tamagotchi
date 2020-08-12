# Tamagotchi

Tamagotchi project for internal shool group.

## Requirements

`Docker`, `docker-compose` and `make` are necessery to run this application.

## Development

To start development type `make start`. 

To start test on already runned application type `make test-dev`.

To start test on new instance of application type `make test`. It will stop already working application and build new instance.

## Production

Only application from branch `master` and `develop_[0-9]` will be deploy on production server.