const createKZG = require('../dist/cjs/index')

const main = async () => {
    console.log(createKZG)
    const kzg = await createKZG.createKZG()
    const json = require('./trustedSetup/trusted_setup.json')
    kzg.loadTrustedSetup(json)
    console.log(kzg)
}

main()