const fs = require('fs')

var REWToken = artifacts.require("./REWToken.sol");
var RNStorage = artifacts.require("./RNStorage.sol");
var RNDelegate = artifacts.require("./RNDelegate.sol");
var RNProxy = artifacts.require("./RNProxy.sol");

module.exports = async function(deployer) {
  await deployer.deploy(RNProxy, RNStorage.address, REWToken.address);
  
  const rnProxy = await RNProxy.deployed()
  
  await rnProxy.setImplementation(RNDelegate.address)
};
