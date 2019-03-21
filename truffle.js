require('dotenv').config()
const { readFileSync } = require('fs')
const { join } = require('path')
const HDWalletProvider = require('truffle-hdwallet-provider')
const PrivateKeyProvider = require("truffle-privatekey-provider")
const LoomTruffleProvider = require('loom-truffle-provider')

const chainId = 'default'
const writeUrl = 'http://176.223.142.107:46658/rpc'
const readUrl = 'http://176.223.142.107:46658/query'
const loomPrivateKey = readFileSync('./private_key', 'utf-8')

const loomTruffleProvider = new LoomTruffleProvider(chainId, writeUrl, readUrl, loomPrivateKey)

const mnemonic = process.env.MNEMONIC
privateKey = process.env.PRIVATE_KEY
const infuraToken = process.env.INFURA_TOKEN

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 9545,
      network_id: "*"
    },
    ropsten:  {
      network_id: 3,
      provider: function() {
        return new HDWalletProvider(mnemonic, `https://ropsten.infura.io/${infuraToken}`)
      },
      gas: 3712388
    },
    rinkeby:  {
      network_id: 4,
      provider: function() {
        return new PrivateKeyProvider(privateKey, `https://rinkeby.infura.io/${infuraToken}`)
      }
    },
    kovan: {
      network_id: '42',
      provider: function() {
        return new PrivateKeyProvider(privateKey, `https://kovan.infura.io/${infuraToken}`)
      },
    },
    loom_dapp_chain: {
      provider: loomTruffleProvider,
      network_id: '*'
    }
  }
};
