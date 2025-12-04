// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ZKPVerifier.sol";

/**
 * @title DeviceRegistry
 * @dev Registry for IoT devices with ZKP-based authentication
 */
contract DeviceRegistry {
    ZKPVerifier public zkpVerifier;
    
    struct Device {
        bytes32 deviceId;
        address owner;
        bytes32 publicKeyHash; // Hash of device public key
        uint256 registeredAt;
        uint256 lastAuthenticated;
        bool isActive;
        string deviceType; // e.g., "healthcare", "industrial", "smart-city"
    }
    
    mapping(bytes32 => Device) public devices;
    mapping(address => bytes32[]) public ownerDevices;
    
    uint256 public totalDevices;
    
    event DeviceRegistered(
        bytes32 indexed deviceId,
        address indexed owner,
        string deviceType,
        uint256 timestamp
    );
    
    event DeviceAuthenticated(
        bytes32 indexed deviceId,
        uint256 timestamp
    );
    
    event DeviceDeactivated(
        bytes32 indexed deviceId,
        uint256 timestamp
    );
    
    constructor(address _zkpVerifier) {
        zkpVerifier = ZKPVerifier(_zkpVerifier);
    }
    
    /**
     * @dev Register a new IoT device with ZKP
     * @param deviceId Unique device identifier
     * @param publicKeyHash Hash of device public key
     * @param deviceType Type of IoT device
     * @param proof ZK proof for device identity
     * @param publicSignals Public signals for proof verification
     */
    function registerDevice(
        bytes32 deviceId,
        bytes32 publicKeyHash,
        string memory deviceType,
        ZKPVerifier.Proof memory proof,
        uint256[] memory publicSignals
    ) external {
        require(devices[deviceId].deviceId == bytes32(0), "Device already registered");
        require(zkpVerifier.verifyProof(proof, publicSignals), "Invalid ZKP");
        
        Device memory newDevice = Device({
            deviceId: deviceId,
            owner: msg.sender,
            publicKeyHash: publicKeyHash,
            registeredAt: block.timestamp,
            lastAuthenticated: block.timestamp,
            isActive: true,
            deviceType: deviceType
        });
        
        devices[deviceId] = newDevice;
        ownerDevices[msg.sender].push(deviceId);
        totalDevices++;
        
        emit DeviceRegistered(deviceId, msg.sender, deviceType, block.timestamp);
    }
    
    /**
     * @dev Authenticate device using ZKP
     * @param deviceId Device to authenticate
     * @param proof ZK proof for authentication
     * @param publicSignals Public signals for proof verification
     */
    function authenticateDevice(
        bytes32 deviceId,
        ZKPVerifier.Proof memory proof,
        uint256[] memory publicSignals
    ) external returns (bool) {
        require(devices[deviceId].deviceId != bytes32(0), "Device not registered");
        require(devices[deviceId].isActive, "Device is deactivated");
        require(zkpVerifier.verifyProof(proof, publicSignals), "Invalid authentication proof");
        
        devices[deviceId].lastAuthenticated = block.timestamp;
        
        emit DeviceAuthenticated(deviceId, block.timestamp);
        return true;
    }
    
    /**
     * @dev Deactivate a device
     * @param deviceId Device to deactivate
     */
    function deactivateDevice(bytes32 deviceId) external {
        require(devices[deviceId].owner == msg.sender, "Not device owner");
        require(devices[deviceId].isActive, "Device already deactivated");
        
        devices[deviceId].isActive = false;
        
        emit DeviceDeactivated(deviceId, block.timestamp);
    }
    
    /**
     * @dev Get device information
     */
    function getDevice(bytes32 deviceId) external view returns (Device memory) {
        return devices[deviceId];
    }
    
    /**
     * @dev Get all devices owned by an address
     */
    function getOwnerDevices(address owner) external view returns (bytes32[] memory) {
        return ownerDevices[owner];
    }
}
