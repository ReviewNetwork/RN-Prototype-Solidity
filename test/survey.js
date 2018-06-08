/* global artifacts, contract, it, assert */

const REWToken = artifacts.require('REWToken')
const ReviewNetwork = artifacts.require('ReviewNetwork')

contract('SurveyTest', function (accounts) {
    it('create a survey', async () => {
        let rew = await REWToken.new()
        let rn = await ReviewNetwork.new(rew.address)

        let hash = 'QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz'
        let title = 'Cats or dogs?'
        let reward = 5

        try {
            await rn.createSurvey(title, hash, reward, { from: accounts[0] })
            let status = await rn.getSurveyStatus.call(hash)
            assert.equal(status, 0, 'Survey status not set correctly')
        } catch (ex) {
            assert.fail('Survey creation failed.')
        }
    })
    
    it('fund a survey', async () => {
        let rew = await REWToken.new()
        let rn = await ReviewNetwork.new(rew.address)

        let hash = 'QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz'
        let title = 'Cats or dogs?'
        let reward = 5

        try {
            await rn.createSurvey(title, hash, reward, { from: accounts[0] })
            await rew.approve(rn.address, 2500)
            await rn.fundSurvey(hash, 2500, { from: accounts[0] })
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

        try {
            await rn.createSurvey(title, hash, reward, { from: accounts[0] })
            await rew.approve(rn.address, 2500)
            await rn.fundSurvey(hash, 2500, { from: accounts[0] })
            await rn.startSurvey(hash, { from: accounts[0] })

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

        try {
            await rn.createSurvey(title, hash, reward, { from: accounts[0] })
            await rew.approve(rn.address, 2500)
            await rn.fundSurvey(hash, 2500, { from: accounts[0] })
            await rn.startSurvey(hash, { from: accounts[0] })
            await rn.completeSurvey(hash, { from: accounts[0] })

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
        let answerHash = 'QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz'

        try {
            await rn.createSurvey(title, hash, reward, { from: accounts[0] })
            await rew.approve(rn.address, 2500)
            await rn.fundSurvey(hash, 2500, { from: accounts[0] })
            await rn.startSurvey(hash, { from: accounts[0] })

            await rn.answerSurvey(hash, answerHash, { from: accounts[1] })

            let rewBalance = await rew.balanceOf.call(accounts[1])
            assert.equal(rewBalance, reward, 'Reward not sent after submitting an answer to a survey')

            let isSurveyAnswered = await rn.isSurveyAnsweredBy.call(hash, accounts[1])
            assert.equal(isSurveyAnswered, true, 'Survey not answered by a user')
        } catch (ex) {
            assert.fail('Survey answering failed.')
        }
    })
})
