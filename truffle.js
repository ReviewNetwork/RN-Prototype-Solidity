require('dotenv').config()
const HDWalletProvider = require('truffle-hdwallet-provider')
const PrivateKeyProvider = require("truffle-privatekey-provider")


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
      },
      gas: 4612388
    }
  },
  // rpc: {
	// 	host: "localhost",
	// 	gas: 7712388,
	// 	port: 9545
	// },
  // solc: { optimizer: { enabled: true, runs: 200 } }
};
