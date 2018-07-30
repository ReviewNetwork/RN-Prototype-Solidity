/* global artifacts, contract, it, assert */

const truffleAssert = require('truffle-assertions')
const REWToken = artifacts.require('REWToken')
const ReviewNetwork = artifacts.require('ReviewNetwork')

contract('ReviewTest', function (accounts) {
    it('create a review', async () => {
        let rew = await REWToken.new()
        let rn = await ReviewNetwork.new(rew.address)

        let reviewAddress = '0x8cc3d48971a543acfc50bc7c7b12173e2dc1aa49'
        let productAddress = '0x8cc3d48971a543acfc50bc7c7b12173e2dc1aa49'
        let authorAddress = '0x77e79d0b6350c5dc1949ce5cc0cb37104ee7a700'
        let score = 3
        let hash = 'QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz'

        try {
            let tx = await rn.createReview(reviewAddress, authorAddress, productAddress, score, hash, { from: accounts[0] })
            truffleAssert.eventEmitted(tx, 'LogReviewAdded')
        } catch (ex) {
            console.log(ex)
            assert.fail('Review creation failed.')
        }
    })
})
