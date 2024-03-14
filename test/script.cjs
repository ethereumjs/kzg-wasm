const loadKZG = require('../dist/cjs/index')

const main = async () => {
    const kzg = await loadKZG.loadKZG()
    const json = require('./trustedSetup/trusted_setup.json')
    kzg.loadTrustedSetup(json)
    console.log(kzg)
}

main()