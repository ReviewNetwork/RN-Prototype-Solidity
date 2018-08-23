const fs = require('fs')

var REWToken = artifacts.require("./REWToken.sol");
var ReviewNetwork = artifacts.require("./ReviewNetwork.sol");

module.exports = async function(deployer) {
  await deployer.deploy(ReviewNetwork, REWToken.address);
};
