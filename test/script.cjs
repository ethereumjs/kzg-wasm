const loadKZG = require('../dist/cjs/index')

const main = async () => {
    const kzg = await loadKZG.loadKZG()
    console.log(kzg)
}

main()