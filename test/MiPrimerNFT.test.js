const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MiPrimerNFT", function () {
  let contrato;
  let owner;
  let usuario1;
  let usuario2;

  beforeEach(async function () {
    [owner, usuario1, usuario2] = await ethers.getSigners();
    const MiPrimerNFT = await ethers.getContractFactory("MiPrimerNFT");
    contrato = await MiPrimerNFT.deploy();
    await contrato.waitForDeployment();
  });

  describe("Despliegue", function () {
    it("Debe desplegar con nombre y símbolo correctos", async function () {
      expect(await contrato.name()).to.equal("MiPrimerNFT");
      expect(await contrato.symbol()).to.equal("MPNFT");
    });

    it("Debe iniciar con 0 NFTs acuñados", async function () {
      expect(await contrato.totalAcunados()).to.equal(0);
    });

    it("Debe asignar al deployer como owner", async function () {
      expect(await contrato.owner()).to.equal(owner.address);
    });
  });

  describe("Minting", function () {
    const tokenURI = "ipfs://QmTest123/metadata.json";

    it("Debe permitir al owner acuñar un NFT", async function () {
      await contrato.mint(usuario1.address, tokenURI);
      expect(await contrato.ownerOf(0)).to.equal(usuario1.address);
      expect(await contrato.totalAcunados()).to.equal(1);
    });

    it("Debe almacenar correctamente el tokenURI", async function () {
      await contrato.mint(usuario1.address, tokenURI);
      expect(await contrato.tokenURI(0)).to.equal(tokenURI);
    });

    it("No debe permitir mint a un no-owner", async function () {
      await expect(
        contrato.connect(usuario1).mint(usuario2.address, tokenURI)
      ).to.be.revertedWithCustomError(contrato, "OwnableUnauthorizedAccount");
    });

    it("Debe permitir mint público a cualquier usuario", async function () {
      await contrato.connect(usuario1).mintPublico(tokenURI);
      expect(await contrato.ownerOf(0)).to.equal(usuario1.address);
    });

    it("Debe asignar tokenIds secuenciales", async function () {
      await contrato.mint(owner.address, "ipfs://token0");
      await contrato.mint(usuario1.address, "ipfs://token1");
      await contrato.connect(usuario2).mintPublico("ipfs://token2");

      expect(await contrato.ownerOf(0)).to.equal(owner.address);
      expect(await contrato.ownerOf(1)).to.equal(usuario1.address);
      expect(await contrato.ownerOf(2)).to.equal(usuario2.address);
      expect(await contrato.totalAcunados()).to.equal(3);
    });
  });

  describe("Límite de Supply", function () {
    it("No debe permitir acuñar más de MAX_SUPPLY", async function () {
      for (let i = 0; i < 100; i++) {
        await contrato.mint(owner.address, "ipfs://token" + i);
      }
      await expect(
        contrato.mint(owner.address, "ipfs://token100")
      ).to.be.revertedWith("Se alcanzó el límite máximo de NFTs");
      expect(await contrato.totalAcunados()).to.equal(100);
    });
  });

  describe("Eventos", function () {
    it("Debe emitir evento NFTAcunado al hacer mint", async function () {
      await expect(contrato.mint(usuario1.address, "ipfs://test"))
        .to.emit(contrato, "NFTAcunado")
        .withArgs(usuario1.address, 0, "ipfs://test");
    });

    it("Debe emitir evento NFTAcunado al hacer mintPublico", async function () {
      await expect(contrato.connect(usuario1).mintPublico("ipfs://test"))
        .to.emit(contrato, "NFTAcunado")
        .withArgs(usuario1.address, 0, "ipfs://test");
    });
  });
});
