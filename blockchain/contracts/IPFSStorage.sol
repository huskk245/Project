// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract IPFSStorage {
    // Struct to store image metadata
    struct Image {
        string ipfsHash;
        string name;
        string description;
        uint timestamp;
        address owner;
        bool exists;
    }
    
    // Mapping from RFID to array of images
    mapping(string => Image[]) private rfidToImages;
    
    // Event emitted when a new image is added
    event ImageAdded(string rfid, string ipfsHash, string name, uint timestamp);
    
    // Add a new image for a product
    function addImage(
        string memory rfid,
        string memory ipfsHash,
        string memory name,
        string memory description
    ) public {
        Image memory image = Image({
            ipfsHash: ipfsHash,
            name: name,
            description: description,
            timestamp: block.timestamp,
            owner: msg.sender,
            exists: true
        });
        
        rfidToImages[rfid].push(image);
        
        emit ImageAdded(rfid, ipfsHash, name, block.timestamp);
    }
    
    // Get all images for a particular RFID
    function getImages(string memory rfid) public view returns (
        string[] memory,  // ipfsHashes
        string[] memory,  // names
        string[] memory,  // descriptions
        uint[] memory,    // timestamps
        address[] memory  // owners
    ) {
        Image[] storage images = rfidToImages[rfid];
        uint length = images.length;
        
        string[] memory hashes = new string[](length);
        string[] memory names = new string[](length);
        string[] memory descriptions = new string[](length);
        uint[] memory timestamps = new uint[](length);
        address[] memory owners = new address[](length);
        
        for (uint i = 0; i < length; i++) {
            Image storage img = images[i];
            hashes[i] = img.ipfsHash;
            names[i] = img.name;
            descriptions[i] = img.description;
            timestamps[i] = img.timestamp;
            owners[i] = img.owner;
        }
        
        return (hashes, names, descriptions, timestamps, owners);
    }
    
    // Get the number of images for a particular RFID
    function getImageCount(string memory rfid) public view returns (uint) {
        return rfidToImages[rfid].length;
    }
    
    // Get a specific image for a particular RFID
    function getImage(string memory rfid, uint index) public view returns (
        string memory,  // ipfsHash
        string memory,  // name
        string memory,  // description
        uint,           // timestamp
        address         // owner
    ) {
        require(index < rfidToImages[rfid].length, "Image index out of bounds");
        
        Image storage img = rfidToImages[rfid][index];
        return (
            img.ipfsHash,
            img.name,
            img.description,
            img.timestamp,
            img.owner
        );
    }
} 