pragma solidity ^0.4.24;

import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";

contract REWToken is StandardToken {
    string public name = "REW Token";
    string public symbol = "REW";
    uint8 public decimals = 18;
    uint public INITIAL_SUPPLY = 5000000000 * (10 ** uint256(decimals));

    constructor () public {
        totalSupply_ = INITIAL_SUPPLY;
        balances[msg.sender] = INITIAL_SUPPLY;
    }
}