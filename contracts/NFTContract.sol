// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import './BaseContract.sol';
import './Helpers.sol';

/**
 * @title NFT contract for the winning card
 * @dev Contract provides mint operation for owner to mint the NFT
 */
contract NFTContract is ERC721, BaseContract {
    
    using SafeMath for uint;
    using Address for address;
    
    event TokenMinted(address indexed owner, uint id, uint dna);
    
    struct CHKMATE {
        string name;
        uint id;
        uint dna;
        uint winTime; // in seconds
        uint8 killScore; // longest kill
        bool isRare;
    }
    
    modifier validRequest(string memory gameId, uint winTime) {
        uint counterValue = currentCounterValue();
        // Check to make sure the `_gameContractAddress` is valid
        require(_gameContractAddress != Helpers.nullAddress(), "GameContract address is not valid"); // This might be moved to GameContract
        // Check to make sure the contract holds 0.01 ether
        require(_gameContractAddress.balance >= _mintingFee, "Not enough funds in GameContract"); // This might be moved to GameContract
        // Check and verify if the current `_tokens` array does not contain a token at `counterValue`
        require(_tokens.length == counterValue, "The token already exists");
        // Check and verify `winTime` is not equal to 0
        require(winTime > 0, "Win time should be greator than 0");
        _;
    }
    
    uint private _mintingFee = Helpers.MINT_FEE;
    address private _gameContractAddress;
    CHKMATE[] private _tokens;
    
    constructor(address gameContractAddress) ERC721("CHKMATE NFT", "CHKMATE") onlyOwner() {
        _gameContractAddress = gameContractAddress;
    }
    
    /**
     * @dev Call this to get a list of all tokens which are currently minted.
     *
     * @return list of currently minted tokens
     */
    function getAllTokens() external view returns (CHKMATE[] memory) {
        return _tokens;
    }
    
    /**
     * @dev Call this to get a list of all tokens that belong to caller
     *
     * @return list of currently minted tokens that belongs to caller
     */
    function getAllTokensForCaller() external view returns (CHKMATE[] memory) {
        uint currentCounter = currentCounterValue();
        CHKMATE[] memory callerTokens = new CHKMATE[](currentCounter);
        uint internalCounter = 0;
        for (uint i = 0; i < currentCounter; i++) {
          if (ownerOf(i) == msg.sender) {
            CHKMATE memory currentToken = _tokens[i];
            callerTokens[internalCounter] = currentToken;
            (bool success, uint result)= internalCounter.tryAdd(1);
            require(success, "Integer overflow for `internalCounter`");
            internalCounter = result;
          }
        }
        return callerTokens;
    }
    
    /**
     * @dev Call this to update the current minting fee. This method can only be
     * called via owner of this contract.
     *
     * @param newMintingFee new fee value to be used for minting new tokens.
     */
    function updateMintingFees(uint newMintingFee) external onlyOwner() {
        _mintingFee = newMintingFee;
    }
    
    /**
     * @dev Update the current game contract address. This method can only be
     * called via owner of this contract.
     */
    function updateGameContractAddress(address newGameContractAddress) external onlyOwner() {
        _gameContractAddress = newGameContractAddress;
    }
    
    /** 
     * @dev Create and mint a new token for the winner. Only the creator of this contract
     * can call this method externally.
     * 
     * @param gameId id of game that just ended
     * @param winTime total time (in seconds) taken by winner to win the game
     * @param killScore count of longest consecutive kill by one single player on board
     * @param isRare true if this token is Rare, false otherwise
     */
    function createAndMintToken(
        string memory gameId,
        uint winTime,
        uint8 killScore,
        bool isRare
    ) external nonReentrant onlyOwner() validRequest(gameId, winTime)  {
        // Create a new token and update the global list
        _createAndMintToken(winTime, killScore, isRare);
        // Withdraw the funds from contract address to game owner address
        //_withdrawValue();
    }
    
    /**
     * @dev Call this to withdraw funds from contract address.
     */
    function _withdrawValue() private onlyOwner() {
        address payable _owner = payable(owner());
        Address.sendValue(_owner, _mintingFee);
    }
    
    /**
     * @dev Create and mint a new token. After miniting is finished emit an event and
     * update the current counter by 1.
     *
     * @param winTime total time taked by winner to win this game.
     * @param killScore total
     */
    function _createAndMintToken(
        uint winTime,
        uint8 killScore,
        bool isRare
    ) private increment() {
        uint counterValue = currentCounterValue();
        _createToken(counterValue, winTime, killScore, isRare);
        _safeMint(msg.sender, counterValue);
        emit TokenMinted(msg.sender, counterValue, _tokens[counterValue].dna);
    }
    
    /**
     * @dev Create a new Token and update `_tokens` mapping.
     */
    function _createToken(
        uint counterValue, 
        uint winTime, 
        uint8 killScore, 
        bool isRare
    ) private {
        //string memory data = string(abi.encodePacked(block.timestamp, msg.sender, counterValue));
        uint tokenDna = Helpers.getDNA(block.timestamp, msg.sender, counterValue);
        string memory tokenName = string(abi.encodePacked("CHKMATE #", counterValue));
        CHKMATE memory token = CHKMATE({
          name: tokenName, 
          id: counterValue, 
          dna: tokenDna, 
          winTime: winTime, 
          killScore: killScore, 
          isRare: isRare
        });
        _tokens.push(token);
    }
}