# Supply Chain Blockchain

This blockchain implementation tracks products through the supply chain with RFID, images, and freshness scores for full transparency.

## Key Features

- First stage: Captures image, freshness score, and RFID data
- Intermediate stages: Tracks product using RFID data
- Final stage: Captures image, freshness score, and RFID data again

## Smart Contracts

1. **ProductTracker.sol** - Main contract for tracking products through the supply chain
2. **IPFSStorage.sol** - Contract for storing image data on IPFS

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- Ganache (for local blockchain)
- Truffle
- IPFS daemon (optional - for local image storage)

### Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Copy the example environment file:
   ```
   cp .env.example .env
   ```

3. Configure your `.env` file with your mnemonic and blockchain network details.

### Compiling Contracts

```
npm run compile
```

### Deployment

For local development (Ganache):
```
npm run deploy:dev
```

For testnet deployment:
```
npm run deploy:prod
```

## Usage

### Registering a Product (First Stage)

```javascript
const { registerProduct } = require('./blockchain');

const result = await registerProduct({
  productId: "apple-batch-123",
  rfid: "rfid-12345",
  name: "Organic Apples",
  productType: "Fruit",
  origin: "Orchard Farm",
  harvestDate: Math.floor(Date.now() / 1000),
  imageHash: "QmYourIPFSHash",
  freshnessScore: 95,
  location: "Farm Warehouse",
  handler: "Farmer John",
  description: "Freshly harvested organic apples"
});
```

### Recording Intermediate Stages

```javascript
const { recordIntermediateStage } = require('./blockchain');

const result = await recordIntermediateStage({
  rfid: "rfid-12345",
  location: "Distribution Center",
  handler: "Logistics Manager",
  description: "In transit to retail store"
});
```

### Recording Final Stage

```javascript
const { recordFinalStage } = require('./blockchain');

const result = await recordFinalStage({
  rfid: "rfid-12345",
  imageHash: "QmYourNewIPFSHash",
  freshnessScore: 85,
  location: "Retail Store",
  handler: "Store Manager",
  description: "Ready for sale"
});
```

### Retrieving Product History

```javascript
const { getAllProductStages } = require('./blockchain');

const stages = await getAllProductStages("rfid-12345");
```

## Integration with IPFS

This project uses IPFS for decentralized storage of product images:

```javascript
const { addFileToIPFS, getIPFSUrl } = require('./ipfs');

// Upload an image to IPFS
const result = await addFileToIPFS('/path/to/image.jpg');
const imageHash = result.hash;

// Get the IPFS gateway URL for an image
const imageUrl = getIPFSUrl(imageHash);
``` 