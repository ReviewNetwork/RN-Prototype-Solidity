const fs = require('fs')

// var REWToken = artifacts.require("./REWToken.sol");
var RNDelegate = artifacts.require("./RNDelegate.sol");

module.exports = async function(deployer) {
  await deployer.deploy(RNDelegate);
};
