#!/usr/bin/env bash

set -e

if [ "$1" = "--" ]; then
    shift
    exec "$@"
else
    exec npm run "$@"
fi
