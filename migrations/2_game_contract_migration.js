const GameContract = artifacts.require("GameContract");
const NFTContract = artifacts.require("NFTContract");

module.exports = async function (deployer) {
  // Deploy GameContract first
  await deployer.deploy(GameContract);
  // Get instance of deployed GameContract
  const gameContract = await GameContract.deployed();
  // Deploy NFTContract last using address of deployed GameContract
  await deployer.deploy(NFTContract, gameContract.address);
};