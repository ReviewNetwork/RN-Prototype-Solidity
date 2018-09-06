pragma solidity ^0.4.24;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./RNStorage.sol";

contract TestDelegate is RNStorage, Ownable {
    constructor () public {}

    function newTestMethod () public pure returns(uint) {
        return 123;
    }
}