// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import './BaseContract.sol';
import "./NFTContract.sol";
import './Helpers.sol';

contract GameContract is BaseContract {
    
    using SafeMath for uint;
    using SafeERC20 for IERC20;
    using Address for address;
    
    event GameCreated(address indexed challengerAddress, uint gameId);
    event GameJoined(address indexed challengeAcceptorAddress, uint gameId);
    event NFTCreated(address indexed winnerAddress, uint gameId, bool isRare);
    
    struct Game {
        uint id;
        uint gameFee; // base game fee set by the challenger
        address challengerAddress;
        address challengeAcceptorAddress;
        address winnerAddress;
        bool inProgress;
    }

    Game[] private _games;

    uint private _gameFee = 0.005 ether;
    IERC20 private _token = new ERC20("ether", "ETH");
    NFTContract private nftContract = new NFTContract(address(this));
    
    /**
     * @dev This contract can only be deployed by the owner
     */
    constructor() onlyOwner() {}

    /**
     * @dev Call this to get a list of all tokens which are currently minted.
     *
     * @return list of currently minted tokens
     */
    function getAllGames() external view returns (Game[] memory) {
      return _games;
    }
    
    function getContractBalance() external view onlyOwner() returns (uint) {
        return address(this).balance;
    }
    
    /**
     * @dev Call this to update the current base game fee. This method can only be called via owner of this contract.
     *
     * @param newGameFee new fee value to be used for creating a new game.
     */
    function updateGameFees(uint newGameFee) external onlyOwner() {
      _gameFee = newGameFee;
    }
    
    /**
    * @dev Create a new game by depositing a gameFee. If no other player accepts the request within next 30 minutes
    * 
    */
    function createGame() external payable nonReentrant {
        address challenger = msg.sender;
        uint currentCounter = currentCounterValue();
        // Check and verify if there is no game already created for current `_gameCounter` value
        require(_games.length == currentCounter, "A game already exists for current counter");
        // Check and verify if the challenger address is valid
        require(challenger != Helpers.nullAddress(), "Challenger address is not valid");
        // Check and verify if the depositAmount is equal to `gameFee`
        require(msg.value >= _gameFee, "Sent value should be equal to or greater than game fee");
        // Create a new game after the funds are locked
        _createGame(msg.value);
        // Emit a new event after the game is created
        emit GameCreated(challenger, currentCounter);
        // Safe increase allowance for this contract to spend `_gameFee` after the game is finished
        //SafeERC20.safeIncreaseAllowance(_token, address(this), msg.value);
    }
    
    /**
     * @dev Call this to join a game with provided `gameId`. Throw an exeption if no game for this `gameId` exists.
     * 
     * @param gameId id of game to be ended
     */
    function joinGame(uint gameId) external payable nonReentrant {
        // Check and verify if the challenger address is valid
        address challengeAcceptor = msg.sender;
        require(challengeAcceptor != Helpers.nullAddress(), "Challenge acceptor address is not valid");
        // Check and verify if a game exists for specified `gameId` 
        require(_games.length > 0 && _games.length >= gameId, "A game for specified gameId does not exists");
        Game memory onGoingGame = _games[gameId];
        // Check and verify if challenger address is already set
        require(onGoingGame.challengerAddress != Helpers.nullAddress(), "Challenger address is invalid");
        // Check and verify if challengeAcceptor address is not set
        require(onGoingGame.challengeAcceptorAddress == Helpers.nullAddress(), "Challenge acceptor address is already set");
        // Check and verify if the current game is in progress
        require(onGoingGame.inProgress, "Current game is no longer in progress");
        // Check and verify if a fee matching the current game fee was sent along with this transaction
        uint currentGameFee = onGoingGame.gameFee;
        require(msg.value == currentGameFee, "Sent value should be equalt to game fee");
        // Join an already created game with specified `gameId`
        _joinGame(gameId);
        // Emit event
        emit GameJoined(challengeAcceptor, gameId);
        // Safe increase allowance for this contract to spend `msg.value` after the game is finished
        //SafeERC20.safeIncreaseAllowance(_token, address(this), msg.value);
    }
    
    /**
     * @dev Call this to end a game with specified `gameId`. A game would end either when one player wins or if no 
     * player accepts a challenge within 30 minutes.
     * 
     * @param gameId id of this game
     * @param winTime total win time in seconds for this game
     * @param killScore total kill score of this game
     * @param isRare true if this NFT is rare
     */
    function endGame(uint gameId, uint winTime, uint8 killScore, bool isRare) public payable nonReentrant {
        // Check and verify if the caller address is valid
        address callerAddress = msg.sender;
        require(callerAddress != Helpers.nullAddress(), "A valid address is required to end a game");
        // Check and verify if a game exists for the specified `gameId`
        require(_games.length > 0 && _games.length >= gameId, "A game for specified gameId does not exists");
        Game memory currentGame = _games[gameId];
        // Check and verify if challengerAddress is valid
        require(currentGame.challengerAddress != Helpers.nullAddress(), "Challenger address is not valid");
        // Check and verify if the current game is in progress
        require(currentGame.inProgress);
        // Check and verify `winTime` is greater than 0
        require(winTime > 0);
        // Check and verify if the caller is the winner of the game
        require(callerAddress == currentGame.winnerAddress);
        // Check and verify if the `killScore` is greater than 0
        require(killScore > 0);
        // Transfer locked funds into contract address
        // address addr = address(this);
        // address payable payableGameContractAddress = payable(addr);
        // SafeERC20.safeTransferFrom(_token, currentGame.challengerAddress, payableGameContractAddress, currentGame.gameFee);
        // if (currentGame.challengeAcceptorAddress != Helpers.nullAddress()) {
        //     SafeERC20.safeTransferFrom(_token, currentGame.challengeAcceptorAddress, payableGameContractAddress, currentGame.gameFee);
        // }
        // End the game
        _endGame(gameId);
        // Create and mint NFT and assign it to winner address
        _createAndMintNFT(gameId, winTime, killScore, isRare);
    }
    
    /**
     * @dev Call this method when the game ends to create and mint NFT.
     * 
     * @param gameId id of this game
     * @param winTime total win time in seconds for this game
     * @param killScore total kill score of this game
     * @param isRare true if this NFT is rare
     */
    function _createAndMintNFT(uint gameId, uint winTime, uint8 killScore, bool isRare) private nonReentrant {
        Game memory currentGame = _games[gameId];
        // Create nft here and once created then emit NFTCreated event 
        nftContract.createAndMintToken(winTime, killScore, isRare);
        emit NFTCreated(currentGame.winnerAddress, gameId, isRare);
    }
    
    /**
     * @dev Create a new game and update the mapping for `games`.
     * 
     * @param gameFee current fee required to create a game.
     */
    function _createGame(uint gameFee) private increment() {
        Game memory game = Game({
            id: currentCounterValue(),
            gameFee: gameFee,
            challengerAddress: msg.sender,
            challengeAcceptorAddress: Helpers.nullAddress(),
            winnerAddress: Helpers.nullAddress(),
            inProgress: true
        });
        _games.push(game);
    }
    
    /**
     * @dev Call this to join a game with provided `gameId`.
     * 
     * @param gameId id of game to be ended
     */
    function _joinGame(uint gameId) private {
        Game memory onGoingGame = _games[gameId];
        onGoingGame.challengeAcceptorAddress = msg.sender;
        _games[gameId] = onGoingGame;
    }
    
    /**
     * @dev Call this to end a game with specified `gameId` and update its win time.
     * 
     * @param gameId id of game to be ended
     */
    function _endGame(uint gameId) private {
        Game memory onGoingGame = _games[gameId];
        onGoingGame.winnerAddress = msg.sender;
        onGoingGame.inProgress = false;
        _games[gameId] = onGoingGame;
    }
}