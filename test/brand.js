/* global artifacts, contract, it, assert */

const truffleAssert = require('truffle-assertions')
const REWToken = artifacts.require('REWToken')
const ReviewNetwork = artifacts.require('ReviewNetwork')

contract('BrandTest', function (accounts) {
    it('create a brand', async () => {
        let rew = await REWToken.new()
        let rn = await ReviewNetwork.new(rew.address)

        let brandAddress = '0x77e79d0b6350c5dc1949ce5cc0cb37104ee7a700'
        let name = 'Apple'
        let logo = 'http://logok.org/wp-content/uploads/2014/04/Apple-logo-grey-880x625.png'
        let hash = 'QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz'

        try {
            let tx = await rn.createBrand(brandAddress, name, logo, hash, { from: accounts[0] })
            truffleAssert.eventEmitted(tx, 'LogBrandAdded')
        } catch (ex) {
            console.log(ex)
            assert.fail('Brand creation failed.')
        }
    })
})
