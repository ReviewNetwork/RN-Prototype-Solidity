const fs = require('fs')

var RNStorage = artifacts.require("./RNStorage.sol");

module.exports = async function(deployer) {
  await deployer.deploy(RNStorage);
};
