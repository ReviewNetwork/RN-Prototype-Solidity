const fs = require('fs')

var REWToken = artifacts.require("./REWToken.sol");

module.exports = async function(deployer) {
  await deployer.deploy(REWToken);
};
