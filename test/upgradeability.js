/* global artifacts, contract, it, assert */

const _ = require('lodash')

const truffleAssert = require('truffle-assertions')
const REWToken = artifacts.require('REWToken')
const RNStorage = artifacts.require('RNStorage')
const RNProxy = artifacts.require('RNProxy')
const RNDelegate = artifacts.require('RNDelegate')
const TestDelegate = artifacts.require('TestDelegate')

contract('UpgradeabilityTest', function (accounts) {
    it('deploys contracts', async () => {
        let rew = await REWToken.new()
        let rnStorage = await RNStorage.new()
        let rnProxy = await RNProxy.new(rnStorage.address, rew.address)
        let rnDelegate = await RNDelegate.new()

        await rnProxy.setImplementation(rnDelegate.address)

        let rn = _.extend(rnProxy, RNDelegate.at(rnProxy.address))

        try {
            await rn.registerUser('test', { from: accounts[0] })
            let username = await rn.getUsername(accounts[0])
            assert.equal(username, 'test', 'Username is not correct.')

            let productAddress = '0x8cc3d48971a543acfc50bc7c7b12173e2dc1aa49'
            let name = 'Macbook Pro 13 2017'
            let image = 'https://www.stuff.tv/sites/stuff.tv/files/brands/Apple/MacBook_Pro_2017/apple_macbook_pro_2017_2.jpg'
            let hash = 'QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz'
            let categoryId = 3
            let subcategoryId = 3
            let description = 'Nice laptop.'

            let tx = await rn.createProduct(
                productAddress,
                categoryId,
                subcategoryId,
                name,
                image,
                description,
                hash,
                { from: accounts[0] }
            )

            truffleAssert.eventEmitted(tx, 'LogProductAdded')
        } catch (ex) {
            console.log(ex)
            assert.fail('Contract deployment failed.')
        }
        
    })
    
    it('upgrades delegate contract', async () => {
        let rew = await REWToken.new()
        let rnStorage = await RNStorage.new()
        let rnProxy = await RNProxy.new(rnStorage.address, rew.address)
        let rnDelegate = await RNDelegate.new()
        let testDelegate = await TestDelegate.new()

        await rnProxy.setImplementation(rnDelegate.address)
        await rnProxy.setImplementation(testDelegate.address)

        let rn = _.extend(rnProxy, TestDelegate.at(rnProxy.address))

        try {
            let testNumber = await rn.newTestMethod({ from: accounts[0] })
            assert.equal(testNumber.toNumber(), 123, 'Test number is not correct.')
        } catch (ex) {
            console.log(ex)
            assert.fail('Contract upgrade failed.')
        }
    })
})
