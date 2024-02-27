const initKzg = require('../dist/cjs/index')

const main = async () => {
    console.log(initKzg)
    const kzg = await initKzg.initKzg()
    console.log(kzg)
}

main()