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
copy_wasm() {
    if ! [ -d ./dist ];
    then
        mkdir dist
        mkdir ./dist/wasm
    fi
    cp ./wasm/kzg.wasm ./dist/wasm
}
build_node() {
    blue "[Node build] "
    echo "Using tsconfig.json"
    echo "Adding ./dist/cjs/package.json"
    if ! [ -d ./dist/cjs ];
    then
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
        sed -i.bak 's#./loader.cjs#./loader.mjs#g' src/index.ts
        
        echo "> tsc --build ./tsconfig.esm.json"
        printf "${BLUE}[ESM build] Working... "

        npx tsc --build ./tsconfig.esm.json
        sed -i.bak 's#./loader.mjs#./loader.cjs#g' src/index.ts
        rm ./src/index.ts.bak
        cat <<EOT >> ./dist/esm/kzg.js.tmp
import { createRequire } from 'node:module';
import { dirname } from "path";
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

EOT
        cat ./dist/esm/kzg.js >> ./dist/esm/kzg.js.tmp
        mv ./dist/esm/kzg.js.tmp ./dist/esm/kzg.js
        green "DONE"
    else
        echo "Skipping ESM build (no config available)."
    fi
    echo "\n";
}

build_web() {
    blue "[Web build] "

    echo "Adding dist/browser"
    if ! [ -d ./dist/browser ];
    then
        mkdir ./dist/browser
    fi
    blue "Copying build files "
    cp ./dist/esm/* ./dist/browser
    cp ./browser/kzg.js ./dist/browser/kzg.js
    green "DONE"
    echo "\n"
}

# Begin build process.
copy_wasm
build_node
build_esm
build_web