/**
 * Script 02: Acuñar (Mint) un NFT
 * USO: npx hardhat run scripts/02_mint.js --network localhost
 */
const hre = require("hardhat");

async function main() {
  console.log("=".repeat(60));
  console.log("🎨 PROCESO DE ACUÑADO (MINTING) DE NFT");
  console.log("=".repeat(60));

  const [owner, usuario1] = await hre.ethers.getSigners();

  console.log("\n📦 Desplegando contrato para esta sesión de prueba...");
  const MiPrimerNFT = await hre.ethers.getContractFactory("MiPrimerNFT");
  const contrato = await MiPrimerNFT.deploy();
  await contrato.waitForDeployment();
  const direccionContrato = await contrato.getAddress();

  console.log("📋 Contrato en:", direccionContrato);
  console.log("👤 Dueño (owner):", owner.address);
  console.log("👤 Usuario 1:", usuario1.address);

  console.log("\n" + "-".repeat(60));
  console.log("🔨 MINT #1: Dueño acuña para sí mismo");
  console.log("-".repeat(60));

  const tokenURI1 = "ipfs://QmEjemplo1/metadata.json";
  console.log("🎨 Iniciando proceso de minting...");
  console.log("👤 Acuñando para:", owner.address);
  console.log("🔗 Token URI:", tokenURI1);

  const gasEstimado1 = await contrato.mint.estimateGas(owner.address, tokenURI1);
  console.log("⛽ Gas estimado:", gasEstimado1.toString(), "unidades");

  const tx1 = await contrato.mint(owner.address, tokenURI1);
  await tx1.wait();

  console.log("🆔 Token ID: 0");

  const propietario1 = await contrato.ownerOf(0);
  console.log("👑 Propietario verificado:", propietario1);

  const uriVerificada1 = await contrato.tokenURI(0);
  console.log("🔗 Token URI verificada:", uriVerificada1);

  console.log("\n" + "-".repeat(60));
  console.log("🔨 MINT #2: Usuario1 acuña con mintPublico()");
  console.log("-".repeat(60));

  const tokenURI2 = "ipfs://QmEjemplo2/metadata.json";
  console.log("🎨 Iniciando proceso de minting público...");
  console.log("👤 Acuñando para:", usuario1.address, "(msg.sender)");
  console.log("🔗 Token URI:", tokenURI2);

  const gasEstimado2 = await contrato.connect(usuario1).mintPublico.estimateGas(tokenURI2);
  console.log("⛽ Gas estimado:", gasEstimado2.toString(), "unidades");

  const tx2 = await contrato.connect(usuario1).mintPublico(tokenURI2);
  await tx2.wait();

  console.log("🆔 Token ID: 1");

  const propietario2 = await contrato.ownerOf(1);
  console.log("👑 Propietario verificado:", propietario2);

  const uriVerificada2 = await contrato.tokenURI(1);
  console.log("🔗 Token URI verificada:", uriVerificada2);

  console.log("\n" + "=".repeat(60));
  console.log("📊 RESUMEN DE ACUÑADO");
  console.log("=".repeat(60));

  const totalAcunados = await contrato.totalAcunados();
  console.log("🔢 Total de NFTs acuñados:", totalAcunados.toString());
  console.log("🏷️  Token 0 → Dueño:", await contrato.ownerOf(0));
  console.log("🏷️  Token 1 → Dueño:", await contrato.ownerOf(1));
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error durante el minting:");
    console.error(error.message);
    process.exit(1);
  });
