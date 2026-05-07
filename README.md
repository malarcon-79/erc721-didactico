# 🎓 ERC-721 Didáctico — Mi Primer NFT

> Proyecto didáctico para aprender el estándar ERC-721 (NFTs) paso a paso.
> **BCY0010 · Fundamentos de Blockchain · DuocUC**

---

## 📋 Descripción

Este proyecto es una guía práctica y autoexplicativa para entender cómo funcionan los **NFTs (Tokens No Fungibles)** bajo el estándar **ERC-721** de Ethereum. Está diseñado para estudiantes de primer año de informática sin experiencia previa en blockchain.

El proyecto incluye **dos contratos inteligentes** completamente comentados:
- **MiPrimerNFT.sol**: usa OpenZeppelin, la forma estándar y segura de crear NFTs
- **ERC721Puro.sol**: implementa ERC-721 desde cero en Solidity puro, para entender qué hay "debajo del capó"

Además incluye scripts de interacción y tests unitarios, todo en **español**.

---

## 🎯 ¿Qué aprenderás?

1. **Qué es un NFT y cómo se diferencia de un token fungible (ERC-20)**
2. **Cómo se despliega un contrato inteligente** en una blockchain local y testnet
3. **Cómo funciona el minting**: crear tokens únicos y asignarlos a direcciones
4. **Cómo consultar la blockchain**: leer propietarios, metadata y estado del contrato
5. **Cómo se estructura la metadata de un NFT** siguiendo el estándar de OpenSea

---

## 📐 Flujo completo de un NFT

```
  Wallet (MetaMask)
     │
     ▼
  mint() / mintPublico()    ← Transacción firmada con tu clave privada
     │
     ▼
  Contrato ERC-721          ← Asigna tokenId único al nuevo NFT
     │
     ├──▶ ownerOf(tokenId)  → Retorna la dirección del propietario
     │
     └──▶ tokenURI(tokenId) → Retorna la URI de metadata
                                │
                                ▼
                             IPFS / HTTP
                                │
                                ▼
                             Archivo JSON:
                             {
                               "name": "Mi NFT #1",
                               "description": "...",
                               "image": "ipfs://...",
                               "attributes": [...]
                             }
```

---

## 📁 Estructura del proyecto

```
erc721-didactico/
├── README.md                    ← Esta guía
├── package.json                 ← Dependencias del proyecto
├── hardhat.config.js            ← Configuración de redes y compilador
├── contracts/
│   ├── MiPrimerNFT.sol          ← ERC-721 con OpenZeppelin (recomendado)
│   └── ERC721Puro.sol           ← ERC-721 en Solidity puro (didáctico)
├── scripts/
│   ├── 01_deploy.js             ← Despliegue del contrato
│   ├── 02_mint.js               ← Acuñado de NFTs
│   └── 03_consultar.js          ← Consulta de datos on-chain
├── metadata/
│   └── ejemplo_metadata.json    ← Ejemplo de metadata estándar
├── test/
│   ├── MiPrimerNFT.test.js      ← Tests del contrato OpenZeppelin
│   └── ERC721Puro.test.js       ← Tests del contrato Solidity puro
└── .env.example                 ← Plantilla de variables de entorno
```

---

## ⚙️ Prerrequisitos

- **Node.js 18+**: [descargar aquí](https://nodejs.org/)
- **MetaMask**: extensión de navegador para gestionar tu wallet
- **Cuenta en Pinata** (opcional, para subir metadata a IPFS): [pinata.cloud](https://pinata.cloud)

Verifica tu versión de Node.js:
```bash
node --version   # Debe mostrar v18.x.x o superior
```

---

## 🚀 Instalación paso a paso

```bash
# 1. Clonar el repositorio
git clone https://github.com/malarcon-79/erc721-didactico.git
cd erc721-didactico

# 2. Instalar dependencias
npm install

# 3. Copiar el archivo de variables de entorno
cp .env.example .env
# Edita .env con tus valores (solo necesario para Sepolia)

# 4. Compilar el contrato
npx hardhat compile
```

---

## 🎮 Uso — Comandos en orden pedagógico

### Paso 1: Levantar la red local
```bash
npx hardhat node
```
> Esto crea una blockchain local con 20 cuentas de prueba, cada una con 10000 ETH ficticios.

### Paso 2: Desplegar el contrato (en otra terminal)
```bash
npx hardhat run scripts/01_deploy.js --network localhost
```

### Paso 3: Acuñar NFTs
```bash
npx hardhat run scripts/02_mint.js --network localhost
```

### Paso 4: Consultar la blockchain
```bash
npx hardhat run scripts/03_consultar.js --network localhost
```

### Paso 5: Ejecutar los tests
```bash
npx hardhat test
```

---

## 📖 ¿Cómo funciona? ERC-721 vs ERC-20

| Característica | ERC-20 (Fungible) | ERC-721 (No Fungible) |
|---|---|---|
| **Ejemplo** | ETH, USDT, DAI | CryptoKitties, NFTs de arte |
| **Intercambiable** | ✅ 1 token = 1 token | ❌ Cada token es único |
| **Identificador** | No tiene (solo saldo) | tokenId único |
| **Balance** | `balanceOf(address)` → cantidad | `balanceOf(address)` → cuántos NFTs |
| **Propiedad** | No aplica | `ownerOf(tokenId)` → dirección |
| **Metadata** | No tiene | `tokenURI(tokenId)` → JSON |

---

## 🔗 Guía para obtener ETH de testnet Sepolia

Para desplegar en la testnet Sepolia necesitas ETH de prueba (sin valor real):

1. **Google Cloud Faucet**: [cloud.google.com/application/web3/faucet/ethereum/sepolia](https://cloud.google.com/application/web3/faucet/ethereum/sepolia)
2. **Alchemy Faucet**: [sepoliafaucet.com](https://sepoliafaucet.com)
3. **Infura Faucet**: [infura.io/faucet/sepolia](https://www.infura.io/faucet/sepolia)

Pasos:
1. Abre MetaMask y cambia a la red **Sepolia**
2. Copia tu dirección de wallet
3. Pégala en uno de los faucets anteriores
4. Espera unos minutos a que llegue el ETH de prueba

Para desplegar en Sepolia:
```bash
npx hardhat run scripts/01_deploy.js --network sepolia
```

---

## ❌ Errores frecuentes y soluciones

### 1. `Error: Cannot find module '@nomicfoundation/hardhat-toolbox'`
**Causa**: No se instalaron las dependencias.
```bash
npm install
```

### 2. `Error: HH8: There's one or more errors in your config file`
**Causa**: El archivo `.env` no existe o tiene valores vacíos.
```bash
cp .env.example .env
```

### 3. `Error: could not detect network`
**Causa**: La red local no está corriendo.
```bash
npx hardhat node
```

### 4. `Error: Nonce too high`
**Causa**: MetaMask tiene un nonce desincronizado con la red local.
**Solución**: En MetaMask → Configuración → Avanzado → Borrar datos de actividad.

### 5. `Error: insufficient funds for gas`
**Causa**: La cuenta no tiene ETH suficiente.
- En red local: las cuentas de Hardhat tienen 10000 ETH cada una.
- En Sepolia: usa un faucet para obtener ETH de prueba.

---

## 📜 Licencia

Este proyecto está bajo la licencia [MIT](https://opensource.org/licenses/MIT).

Libre para uso educativo y modificación.

---

*Proyecto creado por **Marco Alarcón** para **BCY0010 – Fundamentos de Blockchain** · DuocUC*
