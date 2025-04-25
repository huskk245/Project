// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ProductTracker {
    struct ProductStage {
        string rfid;
        string imageHash;  // IPFS hash for the image
        uint freshnessScore;
        uint timestamp;
        string location;
        string handler;
        string description;
    }

    struct Product {
        string name;
        string productType;
        string origin;
        string initialRfid;
        uint harvestDate;
        bool exists;
        mapping(uint => ProductStage) stages;
        uint stageCount;
    }

    // Maps RFID to product
    mapping(string => Product) private products;
    // Maps product ID to array of RFIDs
    mapping(string => string[]) private productRfids;
    // Store the list of product IDs
    string[] private productIds;

    event ProductRegistered(string rfid, string name, string productType, string origin, uint harvestDate);
    event StageRecorded(string rfid, uint stageNumber, string imageHash, uint freshnessScore, string location, uint timestamp);
    event FinalStageRecorded(string rfid, string imageHash, uint freshnessScore, string location, uint timestamp);

    // Register a new product with initial stage data
    function registerProduct(
        string memory productId,
        string memory rfid,
        string memory name,
        string memory productType,
        string memory origin,
        uint harvestDate,
        string memory imageHash,
        uint freshnessScore,
        string memory location,
        string memory handler,
        string memory description
    ) public {
        require(!products[rfid].exists, "Product with this RFID already exists");
        
        Product storage product = products[rfid];
        product.name = name;
        product.productType = productType;
        product.origin = origin;
        product.initialRfid = rfid;
        product.harvestDate = harvestDate;
        product.exists = true;
        product.stageCount = 1;
        
        // Record initial stage data
        ProductStage storage stage = product.stages[0];
        stage.rfid = rfid;
        stage.imageHash = imageHash;
        stage.freshnessScore = freshnessScore;
        stage.timestamp = block.timestamp;
        stage.location = location;
        stage.handler = handler;
        stage.description = description;
        
        // Store the product ID mapping
        productRfids[productId].push(rfid);
        productIds.push(productId);
        
        emit ProductRegistered(rfid, name, productType, origin, harvestDate);
        emit StageRecorded(rfid, 0, imageHash, freshnessScore, location, block.timestamp);
    }
    
    // Record an intermediate stage with RFID data
    function recordIntermediateStage(
        string memory rfid,
        string memory location,
        string memory handler,
        string memory description
    ) public {
        require(products[rfid].exists, "Product with this RFID not found");
        
        Product storage product = products[rfid];
        uint stageNumber = product.stageCount;
        product.stageCount += 1;
        
        ProductStage storage stage = product.stages[stageNumber];
        stage.rfid = rfid;
        stage.imageHash = ""; // No image for intermediate stages
        stage.freshnessScore = 0; // No freshness score for intermediate stages
        stage.timestamp = block.timestamp;
        stage.location = location;
        stage.handler = handler;
        stage.description = description;
        
        emit StageRecorded(rfid, stageNumber, "", 0, location, block.timestamp);
    }
    
    // Record the final stage with image and freshness data
    function recordFinalStage(
        string memory rfid,
        string memory imageHash,
        uint freshnessScore,
        string memory location,
        string memory handler,
        string memory description
    ) public {
        require(products[rfid].exists, "Product with this RFID not found");
        
        Product storage product = products[rfid];
        uint stageNumber = product.stageCount;
        product.stageCount += 1;
        
        ProductStage storage stage = product.stages[stageNumber];
        stage.rfid = rfid;
        stage.imageHash = imageHash;
        stage.freshnessScore = freshnessScore;
        stage.timestamp = block.timestamp;
        stage.location = location;
        stage.handler = handler;
        stage.description = description;
        
        emit FinalStageRecorded(rfid, imageHash, freshnessScore, location, block.timestamp);
    }
    
    // Get product stage details
    function getProductStage(string memory rfid, uint stageNumber) public view returns (
        string memory,  // rfid
        string memory,  // imageHash
        uint,          // freshnessScore
        uint,          // timestamp
        string memory,  // location
        string memory,  // handler
        string memory   // description
    ) {
        require(products[rfid].exists, "Product with this RFID not found");
        require(stageNumber < products[rfid].stageCount, "Stage does not exist");
        
        ProductStage storage stage = products[rfid].stages[stageNumber];
        return (
            stage.rfid,
            stage.imageHash,
            stage.freshnessScore,
            stage.timestamp,
            stage.location,
            stage.handler,
            stage.description
        );
    }
    
    // Get product details
    function getProductDetails(string memory rfid) public view returns (
        string memory,  // name
        string memory,  // productType
        string memory,  // origin
        uint,          // harvestDate
        uint           // stageCount
    ) {
        require(products[rfid].exists, "Product with this RFID not found");
        
        Product storage product = products[rfid];
        return (
            product.name,
            product.productType,
            product.origin,
            product.harvestDate,
            product.stageCount
        );
    }
    
    // Get all RFIDs for a product ID
    function getProductRfids(string memory productId) public view returns (string[] memory) {
        return productRfids[productId];
    }
    
    // Get all product IDs
    function getAllProductIds() public view returns (string[] memory) {
        return productIds;
    }
} 