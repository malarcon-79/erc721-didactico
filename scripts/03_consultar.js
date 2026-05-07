/**
 * Script 03: Consultar información de NFTs
 * USO: npx hardhat run scripts/03_consultar.js --network localhost
 */
const hre = require("hardhat");

async function main() {
  console.log("=".repeat(60));
  console.log("🔍 CONSULTANDO INFORMACIÓN DE NFTs");
  console.log("=".repeat(60));

  const [owner, usuario1] = await hre.ethers.getSigners();

  console.log("\n📦 Preparando contrato con datos de ejemplo...");
  const MiPrimerNFT = await hre.ethers.getContractFactory("MiPrimerNFT");
  const contrato = await MiPrimerNFT.deploy();
  await contrato.waitForDeployment();

  await (await contrato.mint(owner.address, "ipfs://QmCertificado1/metadata.json")).wait();
  await (await contrato.connect(usuario1).mintPublico("ipfs://QmArteDigital2/metadata.json")).wait();
  await (await contrato.mint(usuario1.address, "ipfs://QmTicket3/metadata.json")).wait();

  console.log("✅ Contrato listo con 3 NFTs acuñados\n");

  console.log("=".repeat(60));
  console.log("📊 INFORMACIÓN GENERAL DE LA COLECCIÓN");
  console.log("=".repeat(60));

  const nombre = await contrato.name();
  const simbolo = await contrato.symbol();
  const total = await contrato.totalAcunados();
  const direccion = await contrato.getAddress();

  console.log("🏷️  Nombre de la colección:", nombre);
  console.log("🔤 Símbolo:", simbolo);
  console.log("📋 Dirección del contrato:", direccion);
  console.log("🔢 Total acuñados:", total.toString(), "de", "100 (MAX_SUPPLY)");

  console.log("\n" + "=".repeat(60));
  console.log("🖼️  DETALLE DE CADA NFT");
  console.log("=".repeat(60));

  for (let tokenId = 0; tokenId < Number(total); tokenId++) {
    console.log("\n--- Token ID: " + tokenId + " ---");
    const propietario = await contrato.ownerOf(tokenId);
    console.log("  👑 Propietario:", propietario);
    const uri = await contrato.tokenURI(tokenId);
    console.log("  🔗 Token URI:", uri);
    if (propietario === owner.address) {
      console.log("  📝 Nota: Este NFT pertenece al dueño del contrato");
    } else {
      console.log("  📝 Nota: Este NFT pertenece a un usuario externo");
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ Consulta completada exitosamente");
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error durante la consulta:");
    console.error(error.message);
    process.exit(1);
  });
