// SPDX-License-Identifier: MIT
// 🎓 CONCEPTO CLAVE: Este contrato implementa ERC-721 desde cero, SIN usar OpenZeppelin.
// Su propósito es entender qué hay "debajo del capó" del estándar.
pragma solidity ^0.8.28;

interface IERC165 {
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

interface IERC721 is IERC165 {
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    function balanceOf(address owner) external view returns (uint256 balance);
    function ownerOf(uint256 tokenId) external view returns (address owner);
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data) external;
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
    function transferFrom(address from, address to, uint256 tokenId) external;
    function approve(address to, uint256 tokenId) external;
    function setApprovalForAll(address operator, bool approved) external;
    function getApproved(uint256 tokenId) external view returns (address operator);
    function isApprovedForAll(address owner, address operator) external view returns (bool);
}

interface IERC721Receiver {
    function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data) external returns (bytes4);
}

/// @title ERC721Puro
/// @author Marco Alarcón
/// @notice Implementación ERC-721 en Solidity puro, sin dependencias externas.
/// @dev Este contrato enseña cómo funciona internamente el estándar ERC-721.
contract ERC721Puro is IERC721 {
    string private _nombre;
    string private _simbolo;
    address public propietarioContrato;
    uint256 private _siguienteTokenId;
    uint256 public constant MAX_SUPPLY = 100;

    mapping(uint256 => address) private _propietarios;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _aprobacionesToken;
    mapping(address => mapping(address => bool)) private _aprobacionesOperador;
    mapping(uint256 => string) private _tokenURIs;

    event NFTAcunado(address indexed propietario, uint256 indexed tokenId, string tokenURI);

    constructor(string memory nombre_, string memory simbolo_) {
        _nombre = nombre_;
        _simbolo = simbolo_;
        propietarioContrato = msg.sender;
    }

    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return interfaceId == type(IERC721).interfaceId || interfaceId == type(IERC165).interfaceId;
    }

    function name() public view returns (string memory) { return _nombre; }
    function symbol() public view returns (string memory) { return _simbolo; }

    function balanceOf(address owner) external view returns (uint256 balance) {
        require(owner != address(0), unicode"Dirección inválida: address(0)");
        return _balances[owner];
    }

    function ownerOf(uint256 tokenId) public view returns (address owner) {
        owner = _propietarios[tokenId];
        require(owner != address(0), unicode"El token no existe");
        return owner;
    }

    function tokenURI(uint256 tokenId) public view returns (string memory) {
        require(_propietarios[tokenId] != address(0), unicode"El token no existe");
        return _tokenURIs[tokenId];
    }

    function totalAcunados() public view returns (uint256) {
        return _siguienteTokenId;
    }

    function mint(address to, string memory _tokenURI) public {
        require(msg.sender == propietarioContrato, unicode"Solo el propietario puede acuñar");
        require(_siguienteTokenId < MAX_SUPPLY, unicode"Se alcanzó el límite máximo de NFTs");
        require(to != address(0), unicode"No se puede acuñar a address(0)");
        uint256 nuevoTokenId = _siguienteTokenId;
        _siguienteTokenId++;
        _balances[to] += 1;
        _propietarios[nuevoTokenId] = to;
        _tokenURIs[nuevoTokenId] = _tokenURI;
        emit Transfer(address(0), to, nuevoTokenId);
        emit NFTAcunado(to, nuevoTokenId, _tokenURI);
    }

    function mintPublico(string memory _tokenURI) public {
        require(_siguienteTokenId < MAX_SUPPLY, unicode"Se alcanzó el límite máximo de NFTs");
        uint256 nuevoTokenId = _siguienteTokenId;
        _siguienteTokenId++;
        _balances[msg.sender] += 1;
        _propietarios[nuevoTokenId] = msg.sender;
        _tokenURIs[nuevoTokenId] = _tokenURI;
        emit Transfer(address(0), msg.sender, nuevoTokenId);
        emit NFTAcunado(msg.sender, nuevoTokenId, _tokenURI);
    }

    function transferFrom(address from, address to, uint256 tokenId) public {
        address propietario = ownerOf(tokenId);
        require(propietario == from, unicode"No es el propietario del token");
        require(to != address(0), unicode"No se puede transferir a address(0)");
        require(
            msg.sender == propietario ||
            _aprobacionesToken[tokenId] == msg.sender ||
            _aprobacionesOperador[propietario][msg.sender],
            unicode"No tienes permiso para transferir este token"
        );
        delete _aprobacionesToken[tokenId];
        _balances[from] -= 1;
        _balances[to] += 1;
        _propietarios[tokenId] = to;
        emit Transfer(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data) external {
        _safeTransfer(from, to, tokenId, data);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) external {
        _safeTransfer(from, to, tokenId, "");
    }

    function _safeTransfer(address from, address to, uint256 tokenId, bytes memory data) internal {
        transferFrom(from, to, tokenId);
        if (to.code.length > 0) {
            try IERC721Receiver(to).onERC721Received(msg.sender, from, tokenId, data) returns (bytes4 retval) {
                require(retval == IERC721Receiver.onERC721Received.selector, unicode"Receptor ERC721 inválido");
            } catch {
                revert(unicode"El contrato receptor no soporta ERC721");
            }
        }
    }

    function approve(address to, uint256 tokenId) public {
        address propietario = ownerOf(tokenId);
        require(
            msg.sender == propietario || _aprobacionesOperador[propietario][msg.sender],
            unicode"No tienes permiso para aprobar"
        );
        _aprobacionesToken[tokenId] = to;
        emit Approval(propietario, to, tokenId);
    }

    function getApproved(uint256 tokenId) external view returns (address operator) {
        require(_propietarios[tokenId] != address(0), unicode"El token no existe");
        return _aprobacionesToken[tokenId];
    }

    function setApprovalForAll(address operator, bool approved) public {
        require(operator != msg.sender, unicode"No puedes aprobarte a ti mismo");
        _aprobacionesOperador[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function isApprovedForAll(address owner, address operator) external view returns (bool) {
        return _aprobacionesOperador[owner][operator];
    }
}
