// SPDX-License-Identifier: MIT
// 🎓 CONCEPTO CLAVE: Cada contrato inteligente necesita una licencia.
// MIT es la más permisiva y común en proyectos open source.
pragma solidity ^0.8.28;

// 🎓 CONCEPTO CLAVE: OpenZeppelin es una librería de contratos seguros y auditados.
// En lugar de escribir todo desde cero, heredamos de contratos probados.

// ERC721URIStorage extiende ERC721 y agrega la capacidad de almacenar URIs de metadata por token
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

// Ownable nos da control de acceso: solo el dueño del contrato puede ejecutar ciertas funciones
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MiPrimerNFT
 * @author Marco Alarcón
 * @notice Contrato didáctico que implementa el estándar ERC-721 para tokens no fungibles (NFTs).
 * @dev Hereda de ERC721URIStorage (para metadata) y Ownable (para control de acceso).
 *
 * ¿Qué es un NFT?
 * Un NFT (Non-Fungible Token) es un token único en la blockchain.
 * A diferencia de ETH o tokens ERC-20 (donde 1 ETH = 1 ETH),
 * cada NFT tiene un identificador único (tokenId) y puede representar
 * un objeto digital distinto: arte, certificados, tickets, etc.
 */
contract MiPrimerNFT is ERC721URIStorage, Ownable {
    // -------------------------------------------------------
    // 📦 VARIABLES DE ESTADO
    // -------------------------------------------------------

    /// @notice Contador interno que lleva la cuenta del próximo tokenId a asignar.
    /// @dev En OpenZeppelin v5 se eliminó la librería Counters.
    ///      Usamos un simple uint256 que incrementamos manualmente.
    uint256 private _siguienteTokenId;

    /// @notice Cantidad máxima de NFTs que este contrato puede acuñar.
    /// @dev Es una constante: su valor no puede cambiar después del deploy.
    ///      Esto es un patrón común para crear "escasez digital".
    uint256 public constant MAX_SUPPLY = 100;

    // -------------------------------------------------------
    // 📢 EVENTOS
    // -------------------------------------------------------

    /// @notice Evento que se emite cada vez que se acuña un nuevo NFT.
    /// @dev Los eventos son registros inmutables en la blockchain que las
    ///      aplicaciones web (dApps) pueden "escuchar" en tiempo real.
    /// @param propietario Dirección del dueño del nuevo NFT
    /// @param tokenId Identificador único del NFT recién creado
    /// @param tokenURI URI que apunta a la metadata del NFT (normalmente en IPFS)
    event NFTAcunado(
        address indexed propietario,
        uint256 indexed tokenId,
        string tokenURI
    );

    // -------------------------------------------------------
    // 🏗️ CONSTRUCTOR
    // -------------------------------------------------------

    /**
     * @notice Inicializa el contrato con nombre y símbolo del NFT.
     * @dev El constructor se ejecuta UNA SOLA VEZ cuando el contrato se despliega.
     *      - ERC721("MiPrimerNFT", "MPNFT"): define nombre y símbolo de la colección
     *      - Ownable(msg.sender): establece al desplegador como dueño del contrato
     */
    constructor()
        ERC721("MiPrimerNFT", "MPNFT") // Nombre y símbolo de la colección NFT
        Ownable(msg.sender) // El que despliega el contrato es el dueño inicial
    {}

    // -------------------------------------------------------
    // 🔨 FUNCIONES DE ACUÑADO (MINTING)
    // -------------------------------------------------------

    /**
     * @notice Acuña un nuevo NFT y lo asigna a la dirección indicada. Solo el dueño puede llamarla.
     * @dev Función restringida con el modificador onlyOwner de OpenZeppelin.
     * @param to Dirección que recibirá el NFT
     * @param _tokenURI URI de la metadata del NFT (ej: "ipfs://QmXyz...")
     *
     * 🎓 CONCEPTO CLAVE: "onlyOwner" es un modificador de acceso.
     *    Los modificadores son como guardias que verifican condiciones
     *    ANTES de ejecutar la función. Si la condición falla, la
     *    transacción se revierte y no se gasta gas.
     */
    function mint(address to, string memory _tokenURI) public onlyOwner {
        // Verificamos que no hayamos alcanzado el límite máximo de NFTs
        require(_siguienteTokenId < MAX_SUPPLY, unicode"Se alcanzó el límite máximo de NFTs");

        uint256 nuevoTokenId = _siguienteTokenId;
        _siguienteTokenId++;

        // 🎓 CONCEPTO CLAVE: _safeMint crea el token, lo asigna y verifica el receptor
        _safeMint(to, nuevoTokenId);

        // 🎓 CONCEPTO CLAVE: _setTokenURI vincula el tokenId con su metadata
        _setTokenURI(nuevoTokenId, _tokenURI);

        emit NFTAcunado(to, nuevoTokenId, _tokenURI);
    }

    /**
     * @notice Acuña un nuevo NFT para cualquier persona que llame a esta función.
     * @dev A diferencia de mint(), esta función es pública y cualquiera puede usarla.
     * @param _tokenURI URI de la metadata del NFT
     *
     * 🎓 CONCEPTO CLAVE: msg.sender es la dirección de la wallet que
     *    envió la transacción. Siempre está disponible y no se puede falsificar.
     */
    function mintPublico(string memory _tokenURI) public {
        require(_siguienteTokenId < MAX_SUPPLY, unicode"Se alcanzó el límite máximo de NFTs");

        uint256 nuevoTokenId = _siguienteTokenId;
        _siguienteTokenId++;

        _safeMint(msg.sender, nuevoTokenId);
        _setTokenURI(nuevoTokenId, _tokenURI);

        emit NFTAcunado(msg.sender, nuevoTokenId, _tokenURI);
    }

    // -------------------------------------------------------
    // 🔍 FUNCIONES DE CONSULTA (VIEW)
    // -------------------------------------------------------

    /**
     * @notice Retorna la cantidad total de NFTs acuñados hasta el momento.
     * @dev Las funciones "view" no modifican el estado de la blockchain,
     *      por lo tanto NO cuestan gas cuando se llaman directamente.
     * @return Número total de NFTs acuñados
     *
     * 🎓 CONCEPTO CLAVE: Las funciones "view" son gratuitas.
     *    Solo leen datos de la blockchain sin modificarla.
     */
    function totalAcunados() public view returns (uint256) {
        return _siguienteTokenId;
    }
}
