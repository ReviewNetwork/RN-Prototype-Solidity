const fs = require('fs')

var REWToken = artifacts.require("./REWToken.sol");
var ReviewNetwork = artifacts.require("./ReviewNetwork.sol");

module.exports = async function(deployer) {
  await deployer.deploy(REWToken);
  await deployer.deploy(ReviewNetwork, REWToken.address);

  [
    'REWToken',
    'ReviewNetwork',
  ].forEach((name) => {
    const artifact = artifacts.require(`${name}.sol`);
    const metaDataFile = `${__dirname}/../build/contracts/${name}.json`;
    const metaData = require(metaDataFile);
    metaData.networks[deployer.network_id] = {};
    metaData.networks[deployer.network_id].address = artifact.address;
    fs.writeFileSync(metaDataFile, JSON.stringify(metaData, null, 4));
  });
};
