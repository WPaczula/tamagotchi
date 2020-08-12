#!/usr/bin/env bash

set -e

trap "echo Interrupt signal detected, aborting...; exit 130" INT

function waitForService {
  local try=$1 serviceName=$2 predicate=$3 rc
  echo -n "Waiting for service (${serviceName})"
  while ((try--)); do
    rc=0 && $predicate || rc=$?
    ((rc==0)) && break;
    echo -n '.'
    sleep 1
  done
  ([[ $rc -eq 0 ]] && echo "OK") || echo "KO"
  if [[ $rc -ne 0 ]]; then echo "Service (${serviceName}) is not ready. Last exit code: ${rc}"; fi
  return $rc
}

readonly connection=${POSTGRES:-postgres://postgres@${POSTGRES_HOST:-postgres}:${POSTGRES_PORT:-5432}/${POSTGRES_DB:-tamagotchi}}
readonly psql="psql --quiet -v ON_ERROR_STOP=1"

function preparePGCommonScripts {
    local targetDirectory=$1
    node -e "require('@sss/common-entity-store').pgUtils.createCommonPGInitializationScripts('${targetDirectory}');"
}

function checkIfPostgresResponds {
  ${psql} ${connection%/*} --command="SELECT 1" >/dev/null 2>&1
}

function ensureDatabaseExists {
  local databaseName=$1
  echo "Creating database ${databaseName}"
  local cmdOutput=$(${psql} ${connection%/*} -t --command="SELECT 'found' FROM pg_database WHERE datname='${databaseName}'")
  if echo ${cmdOutput} | grep 'found'; then
    echo "Database ${databaseName} already exists."
  else
    ${psql} ${connection%/*} -t --command="CREATE DATABASE ${databaseName}"
  fi
}

waitForService 20 ${connection%/*} checkIfPostgresResponds

readonly directory=$(dirname $0)
readonly dbname=${connection##*/}

ensureDatabaseExists ${dbname}

for file in ${directory}/*.sql; do
  echo "Running ${file}"
  ${psql} ${connection} --file=${file}
done