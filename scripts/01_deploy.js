/**
 * Script 01: Despliegue del contrato MiPrimerNFT
 * USO: npx hardhat run scripts/01_deploy.js --network localhost
 */
const hre = require("hardhat");

async function main() {
  console.log("=".repeat(60));
  console.log("\U0001f680 DESPLEGANDO CONTRATO MiPrimerNFT");
  console.log("=".repeat(60));

  const [deployer] = await hre.ethers.getSigners();
  console.log("\n\U0001f464 Cuenta que despliega:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("\U0001f4b0 Balance:", hre.ethers.formatEther(balance), "ETH");

  console.log("\n\U0001f4e6 Preparando contrato para despliegue...");
  const MiPrimerNFT = await hre.ethers.getContractFactory("MiPrimerNFT");

  console.log("\u23f3 Enviando transacci\u00f3n de deploy...");
  const contrato = await MiPrimerNFT.deploy();
  await contrato.waitForDeployment();

  const direccion = await contrato.getAddress();

  console.log("\n" + "=".repeat(60));
  console.log("\u2705 \u00a1CONTRATO DESPLEGADO EXITOSAMENTE!");
  console.log("=".repeat(60));
  console.log("\U0001f4cb Direcci\u00f3n del contrato:", direccion);
  console.log("\U0001f451 Due\u00f1o del contrato:", deployer.address);

  const nombre = await contrato.name();
  const simbolo = await contrato.symbol();
  const total = await contrato.totalAcu\u00f1ados();

  console.log("\n\U0001f4ca Informaci\u00f3n del contrato:");
  console.log("   \U0001f3f7\ufe0f  Nombre:", nombre);
  console.log("   \U0001f524 S\u00edmbolo:", simbolo);
  console.log("   \U0001f522 Total acu\u00f1ados:", total.toString());
  console.log("\n\U0001f4a1 Guarda esta direcci\u00f3n para usarla en los siguientes scripts:");
  console.log("   CONTRATO=" + direccion);
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n\u274c Error durante el despliegue:");
    console.error(error.message);
    process.exit(1);
  });
