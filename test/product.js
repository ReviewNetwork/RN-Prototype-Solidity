/* global artifacts, contract, it, assert */

const truffleAssert = require('truffle-assertions')
const REWToken = artifacts.require('REWToken')
const ReviewNetwork = artifacts.require('ReviewNetwork')

contract('ProductTest', function (accounts) {
    it('create a product', async () => {
        let rew = await REWToken.new()
        let rn = await ReviewNetwork.new(rew.address)

        let productAddress = '0x8cc3d48971a543acfc50bc7c7b12173e2dc1aa49'
        let brandAddress = '0x77e79d0b6350c5dc1949ce5cc0cb37104ee7a700'
        let name = 'Macbook Pro 13 2017'
        let image = 'https://www.stuff.tv/sites/stuff.tv/files/brands/Apple/MacBook_Pro_2017/apple_macbook_pro_2017_2.jpg'
        let hash = 'QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz'

        try {
            let tx = await rn.createProduct(productAddress, brandAddress, name, image, hash, { from: accounts[0] })
            truffleAssert.eventEmitted(tx, 'LogProductAdded')
        } catch (ex) {
            console.log(ex)
            assert.fail('Product creation failed.')
        }
    })
})
