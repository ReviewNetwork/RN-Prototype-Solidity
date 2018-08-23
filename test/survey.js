/* global artifacts, contract, it, assert */

require('dotenv').config()
const util = require('ethereumjs-util')
const truffleAssert = require('truffle-assertions')
const REWToken = artifacts.require('REWToken')
const ReviewNetwork = artifacts.require('ReviewNetwork')

contract('SurveyTest', function (accounts) {
    let pubKey = util.privateToPublic(`0x${process.env.PRIVATE_KEY}`).toString('hex')

    it('create a survey', async () => {
        let rew = await REWToken.new()
        let rn = await ReviewNetwork.new(rew.address)

        let hash = 'QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz'
        let title = 'Cats or dogs?'
        let reward = 5
        let maxAnswers = 10

        try {
            let tx = await rn.createSurvey(pubKey, title, hash, reward, maxAnswers, { from: accounts[0] })
            truffleAssert.eventEmitted(tx, 'LogSurveyAdded')

            let status = await rn.getSurveyStatus.call(hash)
            assert.equal(status, 0, 'Survey status not set correctly')
        } catch (ex) {
            console.log(ex)
            assert.fail('Survey creation failed.')
        }
    })
    
    it('fund a survey', async () => {
        let rew = await REWToken.new()
        let rn = await ReviewNetwork.new(rew.address)

        let tx

        let hash = 'QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz'
        let title = 'Cats or dogs?'
        let reward = 5
        let maxAnswers = 10

        try {
            await rn.createSurvey(pubKey, title, hash, reward, maxAnswers, { from: accounts[0] })
            tx = await rew.approve(rn.address, 2500)
            truffleAssert.eventEmitted(tx, 'Approval')
            tx = await rn.fundSurvey(hash, 2500, { from: accounts[0] })
            truffleAssert.eventEmitted(tx, 'LogSurveyFunded')
            let status = await rn.getSurveyStatus.call(hash)
            assert.equal(status, 1, 'Survey status not set correctly')
        } catch (ex) {
            assert.fail('Survey funding failed.')
        }
    })

    it('start a survey', async () => {
        let rew = await REWToken.new()
        let rn = await ReviewNetwork.new(rew.address)

        let hash = 'QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz'
        let title = 'Cats or dogs?'
        let reward = 5
        let maxAnswers = 10

        try {
            await rn.createSurvey(pubKey, title, hash, reward, maxAnswers, { from: accounts[0] })
            await rew.approve(rn.address, 2500)
            await rn.fundSurvey(hash, 2500, { from: accounts[0] })
            let tx = await rn.startSurvey(hash, { from: accounts[0] })
            truffleAssert.eventEmitted(tx, 'LogSurveyStarted')

            let status = await rn.getSurveyStatus.call(hash)
            assert.equal(status, 2, 'Survey status not set correctly')
        } catch (ex) {
            assert.fail('Survey starting failed.')
        }
    })

    it('complete a survey', async () => {
        let rew = await REWToken.new()
        let rn = await ReviewNetwork.new(rew.address)

        let hash = 'QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz'
        let title = 'Cats or dogs?'
        let reward = 5
        let maxAnswers = 10

        try {
            await rn.createSurvey(pubKey, title, hash, reward, maxAnswers, { from: accounts[0] })
            await rew.approve(rn.address, 2500)
            await rn.fundSurvey(hash, 2500, { from: accounts[0] })
            await rn.startSurvey(hash, { from: accounts[0] })
            let tx = await rn.completeSurvey(hash, { from: accounts[0] })

            truffleAssert.eventEmitted(tx, 'LogSurveyCompleted')

            let status = await rn.getSurveyStatus.call(hash)
            assert.equal(status, 3, 'Survey status not set correctly')
        } catch (ex) {
            assert.fail('Survey completing failed.')
        }
    })
    
    it('answer a survey', async () => {
        let rew = await REWToken.new()
        let rn = await ReviewNetwork.new(rew.address)

        let hash = 'QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz'
        let title = 'Cats or dogs?'
        let reward = 5
        let maxAnswers = 10
        let answerHash = 'QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz'

        try {
            await rn.createSurvey(pubKey, title, hash, reward, maxAnswers, { from: accounts[0] })
            await rew.approve(rn.address, 2500)
            await rn.fundSurvey(hash, 2500, { from: accounts[0] })
            await rn.startSurvey(hash, { from: accounts[0] })

            let tx = await rn.answerSurvey(hash, answerHash, { from: accounts[1] })

            truffleAssert.eventEmitted(tx, 'LogSurveyAnswered')

            let rewBalance = await rew.balanceOf.call(accounts[1])
            assert.equal(rewBalance, reward, 'Reward not sent after submitting an answer to a survey')

            let isSurveyAnswered = await rn.isSurveyAnsweredBy.call(hash, accounts[1])
            assert.equal(isSurveyAnswered, true, 'Survey not answered by a user')
        } catch (ex) {
            console.log(ex)
            assert.fail('Survey answering failed.')
        }
    })
})
