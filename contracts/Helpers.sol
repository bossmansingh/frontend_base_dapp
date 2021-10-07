// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @dev Helper methods for other contracts
 */
library Helpers {
    
    using SafeMath for uint;

    uint constant GAME_FEE = 0.05 ether;
    uint constant MINT_FEE = GAME_FEE * 2;

    /**
     * Create and return a random number based on input `data`.
     * 
     * @param data uint value for which a random number is to be generated.
     * @return generated random number
     */
    function getEncryptedKey(string memory data) private pure returns (uint) {
        uint mod = 10**16;
        uint _randomNumber = uint(keccak256(abi.encodePacked(data)));
        (bool success, uint result) = SafeMath.tryMod(_randomNumber, mod);
        require(success, "Integer overflow for mod operation while generating random number");
        return result;
    }

    function getDNA(uint timestamp, address addr, uint counterValue) internal pure returns (uint) {
        string memory data = string(abi.encodePacked(timestamp, addr, counterValue));
        return getEncryptedKey(data);
    }

    /**
     * Return a null address
     */
    function nullAddress() internal pure returns (address) {
        return address(0);
    }
}