const ProductTracker = artifacts.require("ProductTracker");
const IPFSStorage = artifacts.require("IPFSStorage");

module.exports = function(deployer) {
  // Deploy the ProductTracker contract
  deployer.deploy(ProductTracker);
  
  // Deploy the IPFSStorage contract
  deployer.deploy(IPFSStorage);
}; 