/* global artifacts, contract, it, assert */

const truffleAssert = require('truffle-assertions')
const REWToken = artifacts.require('REWToken')
const ReviewNetwork = artifacts.require('ReviewNetwork')

contract('ReviewTest', function (accounts) {
    it('add a user', async () => {
        let rew = await REWToken.new()
        let rn = await ReviewNetwork.new(rew.address)

        let username = 'test-username'
        let userAddress = accounts[0]

        try {
            let userExistsBefore = await rn.userExists(userAddress)
            assert.equal(userExistsBefore, false, 'User exists before it is created :O')
            
            await rn.registerUser(username)

            let userExistsAfter = await rn.userExists(userAddress)
            assert.equal(userExistsAfter, true, 'User does not exist after it is created')
        } catch (ex) {
            console.log(ex)
            assert.fail('User creation failed.')
        }
    })

    it('create a review', async () => {
        let rew = await REWToken.new()
        let rn = await ReviewNetwork.new(rew.address)

        let username = 'test-username'
        let reviewAddress = '0x8cc3d48971a543acfc50bc7c7b12173e2dc1aa49'
        let score = 3
        let reviewHash = 'QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz'

        let productAddress = '0x8cc3d48971a543acfc50bc7c7b12173e2dc1aa49'
        let brandAddress = '0x77e79d0b6350c5dc1949ce5cc0cb37104ee7a700'
        let name = 'Macbook Pro 13 2017'
        let image = 'https://www.stuff.tv/sites/stuff.tv/files/brands/Apple/MacBook_Pro_2017/apple_macbook_pro_2017_2.jpg'
        let productHash = 'QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz'

        try {
            await rn.createProduct(productAddress, brandAddress, name, image, productHash, { from: accounts[0] })
            await rn.registerUser(username, { from: accounts[0] })
            let createValidatorPromises = [...Array(10).keys()].map(i => {
                rn.addValidator(accounts[i], { from: accounts[0] })
            })

            await Promise.all(createValidatorPromises)

            let tx = await rn.createReview(
                reviewAddress,
                productAddress,
                score,
                reviewHash,
                { from: accounts[0] }
            )

            truffleAssert.eventEmitted(tx, 'LogReviewAdded')
            
            let reviewStatus = await rn.getReviewStatus(reviewAddress)
            assert.equal(reviewStatus, 0, 'Review not created.')
        } catch (ex) {
            console.log(ex)
            assert.fail('Review creation failed.')
        }
    })
    
    it('approve a review', async () => {
        let rew = await REWToken.new()
        let rn = await ReviewNetwork.new(rew.address)

        let username = 'test-username'
        let reviewAddress = '0x8cc3d48971a543acfc50bc7c7b12173e2dc1aa49'
        let score = 3
        let reviewHash = 'QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz'

        let productAddress = '0x8cc3d48971a543acfc50bc7c7b12173e2dc1aa49'
        let brandAddress = '0x77e79d0b6350c5dc1949ce5cc0cb37104ee7a700'
        let name = 'Macbook Pro 13 2017'
        let image = 'https://www.stuff.tv/sites/stuff.tv/files/brands/Apple/MacBook_Pro_2017/apple_macbook_pro_2017_2.jpg'
        let productHash = 'QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz'

        try {
            await rn.createProduct(productAddress, brandAddress, name, image, productHash, { from: accounts[0] })
            await rn.registerUser(username, { from: accounts[0] })
            let createValidatorPromises = [...Array(10).keys()].map(i => {
                rn.addValidator(accounts[i], { from: accounts[0] })
            })

            await Promise.all(createValidatorPromises)

            let tx = await rn.createReview(
                reviewAddress,
                productAddress,
                score,
                reviewHash,
                { from: accounts[0] }
            )

            let chosenValidators = tx.logs
                .filter(log => log.event === 'LogValidatorChosen')
                .map(log => log.args.validatorAddress)

            // run votes sequentially so each one is in separate block.
            // (important so we only get one LogReviewApproved/Rejected event)
            let txs = await chosenValidators.reduce(async (promiseChain, validatorAddress) => {
                let txs = await promiseChain
                let tx = await rn.validatorVote(reviewAddress, 1, { from: validatorAddress })
                return [...txs, tx]
            }, Promise.resolve([]))

            let allEvents = txs.map(tx => tx.logs)
            let allEventsFlat = [].concat(...allEvents)
            let reviewApprovedEvents = allEventsFlat.filter(log => log.event === 'LogReviewApproved')

            assert.equal(reviewApprovedEvents.length, 1, 'Review not approved.')

            let reviewStatus = await rn.getReviewStatus(reviewAddress)
            assert.equal(reviewStatus, 1, 'Review not approved.')
        } catch (ex) {
            console.log(ex)
            assert.fail('Review approval failed.')
        }
    })
    
    it('reject a review', async () => {
        let rew = await REWToken.new()
        let rn = await ReviewNetwork.new(rew.address)

        let username = 'test-username'
        let reviewAddress = '0x8cc3d48971a543acfc50bc7c7b12173e2dc1aa49'
        let score = 3
        let reviewHash = 'QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz'

        let productAddress = '0x8cc3d48971a543acfc50bc7c7b12173e2dc1aa49'
        let brandAddress = '0x77e79d0b6350c5dc1949ce5cc0cb37104ee7a700'
        let name = 'Macbook Pro 13 2017'
        let image = 'https://www.stuff.tv/sites/stuff.tv/files/brands/Apple/MacBook_Pro_2017/apple_macbook_pro_2017_2.jpg'
        let productHash = 'QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz'

        try {
            await rn.createProduct(productAddress, brandAddress, name, image, productHash, { from: accounts[0] })
            await rn.registerUser(username, { from: accounts[0] })
            let createValidatorPromises = [...Array(10).keys()].map(i => {
                rn.addValidator(accounts[i], { from: accounts[0] })
            })

            await Promise.all(createValidatorPromises)

            let tx = await rn.createReview(
                reviewAddress,
                productAddress,
                score,
                reviewHash,
                { from: accounts[0] }
            )

            let chosenValidators = tx.logs
                .filter(log => log.event === 'LogValidatorChosen')
                .map(log => log.args.validatorAddress)

            // run votes sequentially so each one is in separate block.
            // (important so we only get one LogReviewApproved/Rejected event)
            let txs = await chosenValidators.reduce(async (promiseChain, validatorAddress) => {
                let txs = await promiseChain
                let tx = await rn.validatorVote(reviewAddress, -1, { from: validatorAddress })
                return [...txs, tx]
            }, Promise.resolve([]))

            let allEvents = txs.map(tx => tx.logs)
            let allEventsFlat = [].concat(...allEvents)
            let reviewRejectedEvents = allEventsFlat.filter(log => log.event === 'LogReviewRejected')

            assert.equal(reviewRejectedEvents.length, 1, 'Review not rejected.')

            let reviewStatus = await rn.getReviewStatus(reviewAddress)
            assert.equal(reviewStatus, 2, 'Review not rejected.')
        } catch (ex) {
            console.log(ex)
            assert.fail('Review rejection failed.')
        }
    })
})
