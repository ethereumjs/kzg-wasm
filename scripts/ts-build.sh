#!/bin/sh
set -e
# Purposefully not using `set -o xtrace`, for friendlier output.


# Presentational variables and functions declaration.

BLUE="\033[0;34m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
NOCOLOR="\033[0m"
DIM="\033[2m"

blue() {
    printf "${BLUE}$1${NOCOLOR}"
}
green() {
    printf "${GREEN}$1${NOCOLOR}"
}
yellow() {
    printf "${YELLOW}$1${NOCOLOR}"
}
red() {
    printf "${RED}$1${NOCOLOR}"
}
dim() {
    printf "${DIM}$1${NOCOLOR}"
}


# Build function declaration.

build_node() {
    blue "[Node build] "
    echo "Using tsconfig.json"
    echo "Adding ./dist/cjs/package.json"
    if ! [ -d ./dist/cjs ];
    then
        mkdir dist
        mkdir ./dist/cjs
    fi
    rm -f ./dist/cjs/package.json
    cat <<EOT >> ./dist/cjs/package.json
{
    "type": "commonjs"
}
EOT
    echo "> tsc --build ./tsconfig.json"
    printf "${BLUE}[Node build] Working... "

    npx tsc --build ./tsconfig.json
    green "DONE"

    echo "\n";
}

build_esm() {
    if [ -f ./tsconfig.esm.json ];
    then
        blue "[ESM build] "
        echo "Using tsconfig.esm.json"

        echo "Adding ./dist/esm/package.json"
        if ! [ -d ./dist/esm ];
        then
            mkdir ./dist/esm
        fi
        rm -f ./dist/esm/package.json
        cat <<EOT >> ./dist/esm/package.json
{
    "type": "module"
}
EOT
        echo "> tsc --build ./tsconfig.esm.json"
        printf "${BLUE}[ESM build] Working... "

        npx tsc --build ./tsconfig.esm.json
        green "DONE"
    else
        echo "Skipping ESM build (no config available)."
    fi
    echo "\n";
}

# Begin build process.
build_node
build_esm
