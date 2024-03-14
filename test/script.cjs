const loadKZG = require('../dist/cjs/index')

const main = async () => {
    const kzg = await loadKZG.loadKZG()
    const json = require('../src/trustedSetup')
    kzg.loadTrustedSetup(json)
    console.log(kzg)
}

main()