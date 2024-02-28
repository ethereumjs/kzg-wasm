const createKZG = require('../dist/cjs/index')

const main = async () => {
    console.log(createKZG)
    const kzg = await createKZG.createKZG()
    console.log(kzg)
}

main()