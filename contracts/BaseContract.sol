// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract BaseContract is ReentrancyGuard, Ownable {
    
    using Counters for Counters.Counter;
    
    Counters.Counter private _counter = Counters.Counter(0);
    
    /**
     * @dev Returns the current value of counter
     *
     * @return current counter value
     */
    function currentCounterValue() internal view returns (uint) {
      return _counter.current();
    }
    
    /**
     * @dev Add this modifier to method which will increament the counter by one as the last operation.
     */
     modifier increment() {
         _;
         _counter.increment();
     }
    
    /**
     * @dev Call this method to update ownership in future (if needed). This external 
     * method can only be called by the owner of this contract. Since `transferOwnership()`
     * already have this check it's not required for this method.
     * 
     * @param newOwnerAddress address of new owner to which ownership is to be transfered.
     */
    function setOwnership(address newOwnerAddress) external {
      transferOwnership(newOwnerAddress);
    }
}