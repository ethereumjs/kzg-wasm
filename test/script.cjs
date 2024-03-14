const loadKZG = require('../dist/cjs/index')

const main = async () => {
    console.log(loadKZG)
    const kzg = await loadKZG.loadKZG()
    console.log(kzg)
}

main()