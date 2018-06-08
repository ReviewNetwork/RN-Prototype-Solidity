const HDWalletProvider = require('truffle-hdwallet-provider')

const mnemonic = 'crowd party laugh address sheriff fix trend pen present boost oil castle'
const infuraToken = '4Hz0eFn9CA8ojZPjLdoG'

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
    }
  },
  // rpc: {
	// 	host: "localhost",
	// 	gas: 7712388,
	// 	port: 9545
	// },
  // solc: { optimizer: { enabled: true, runs: 200 } }
};
