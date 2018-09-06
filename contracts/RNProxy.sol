pragma solidity ^0.4.24;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./RNStorage.sol";
import "./REWToken.sol";

contract RNProxy is RNStorage, Ownable {
    address public implementation;
    address rnStorage;

    event LogNewImplementation(address indexed implementation);

    constructor (address rnStoageAddress, address rewTokenAddress) public {
        rnStorage = rnStoageAddress;
        token = REWToken(rewTokenAddress);
    }

    function setImplementation(address impl) public onlyOwner {
        require(implementation != impl, "Already implementing that contract");
        require(impl != address(0), "Implementation cannot be an empty address");

        implementation = impl;

        emit LogNewImplementation(impl);
    }

    function () public payable {
        bytes memory data = msg.data;
        address _implementation = implementation;

        assembly {
            let result := delegatecall(gas, _implementation, add(data, 0x20), mload(data), 0, 0)
            let size := returndatasize
            let ptr := mload(0x40)
            returndatacopy(ptr, 0, size)
            switch result
            case 0 { revert(ptr, size) }
            default { return(ptr, size) }
        }
    }
}