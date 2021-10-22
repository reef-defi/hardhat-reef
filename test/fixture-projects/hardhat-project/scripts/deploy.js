const hre = require("hardhat");

async function main() {
  const alice = await hre.reef.getSignerByName("alice");
  await alice.claimDefaultAccount();

  const Flipper = await hre.reef.getContractFactory("Flipper", alice);
  const flipper = await Flipper.deploy(false);

  console.log("Deploy done");
  console.log({
    flipper: flipper.address,
    deploy_hash: flipper.deployTransaction,
  });
  console.log("Initial value:", await flipper.get());

  // Flip value
  console.log("Flipping value ...");
  await flipper.flip();

  // Check new value
  console.log("New value:", await flipper.get());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
