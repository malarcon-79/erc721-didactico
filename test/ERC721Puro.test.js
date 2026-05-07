const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ERC721Puro", function () {
  let contrato;
  let owner;
  let usuario1;
  let usuario2;

  beforeEach(async function () {
    [owner, usuario1, usuario2] = await ethers.getSigners();
    const ERC721Puro = await ethers.getContractFactory("ERC721Puro");
    contrato = await ERC721Puro.deploy("NFTPuro", "PURO");
    await contrato.waitForDeployment();
  });

  describe("Despliegue", function () {
    it("Debe desplegar con nombre y símbolo correctos", async function () {
      expect(await contrato.name()).to.equal("NFTPuro");
      expect(await contrato.symbol()).to.equal("PURO");
    });

    it("Debe iniciar con 0 NFTs acuñados", async function () {
      expect(await contrato.totalAcunados()).to.equal(0);
    });

    it("Debe asignar al deployer como propietario del contrato", async function () {
      expect(await contrato.propietarioContrato()).to.equal(owner.address);
    });
  });

  describe("Minting", function () {
    const tokenURI = "ipfs://QmTest123/metadata.json";

    it("Debe permitir al propietario acuñar un NFT", async function () {
      await contrato.mint(usuario1.address, tokenURI);
      expect(await contrato.ownerOf(0)).to.equal(usuario1.address);
      expect(await contrato.totalAcunados()).to.equal(1);
    });

    it("Debe almacenar correctamente el tokenURI", async function () {
      await contrato.mint(usuario1.address, tokenURI);
      expect(await contrato.tokenURI(0)).to.equal(tokenURI);
    });

    it("No debe permitir mint a un no-propietario", async function () {
      await expect(
        contrato.connect(usuario1).mint(usuario2.address, tokenURI)
      ).to.be.revertedWith("Solo el propietario puede acuñar");
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

  describe("Transferencia", function () {
    beforeEach(async function () {
      await contrato.mint(owner.address, "ipfs://token0");
    });

    it("Debe permitir al dueño transferir su NFT", async function () {
      await contrato.transferFrom(owner.address, usuario1.address, 0);
      expect(await contrato.ownerOf(0)).to.equal(usuario1.address);
    });

    it("No debe permitir transferir a un no-autorizado", async function () {
      await expect(
        contrato.connect(usuario1).transferFrom(owner.address, usuario2.address, 0)
      ).to.be.revertedWith("No tienes permiso para transferir este token");
    });

    it("Debe permitir transferir con aprobación de token", async function () {
      await contrato.approve(usuario1.address, 0);
      await contrato.connect(usuario1).transferFrom(owner.address, usuario2.address, 0);
      expect(await contrato.ownerOf(0)).to.equal(usuario2.address);
    });

    it("Debe permitir transferir con aprobación de operador", async function () {
      await contrato.setApprovalForAll(usuario1.address, true);
      await contrato.connect(usuario1).transferFrom(owner.address, usuario2.address, 0);
      expect(await contrato.ownerOf(0)).to.equal(usuario2.address);
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

    it("Debe emitir evento Transfer al hacer mint", async function () {
      await expect(contrato.mint(usuario1.address, "ipfs://test"))
        .to.emit(contrato, "Transfer")
        .withArgs(ethers.ZeroAddress, usuario1.address, 0);
    });

    it("Debe emitir evento NFTAcunado al hacer mintPublico", async function () {
      await expect(contrato.connect(usuario1).mintPublico("ipfs://test"))
        .to.emit(contrato, "NFTAcunado")
        .withArgs(usuario1.address, 0, "ipfs://test");
    });
  });

  describe("ERC-165 (Detección de interfaces)", function () {
    it("Debe soportar la interfaz ERC-721 (0x80ac58cd)", async function () {
      expect(await contrato.supportsInterface("0x80ac58cd")).to.be.true;
    });

    it("Debe soportar la interfaz ERC-165 (0x01ffc9a7)", async function () {
      expect(await contrato.supportsInterface("0x01ffc9a7")).to.be.true;
    });

    it("No debe soportar interfaces desconocidas", async function () {
      expect(await contrato.supportsInterface("0xffffffff")).to.be.false;
    });
  });
});
