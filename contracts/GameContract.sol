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
    
    using SafeERC20 for IERC20;
    using Address for address;
    
    event GameCreated(address indexed challengerAddress, uint gameId);
    event GameJoined(address indexed challengeAcceptorAddress, uint gameId);
    event NFTCreated(address indexed winnerAddress, uint gameId, bool isRare);
    
    enum ActionType {
        CreateGame,
        JoinGame,
        EndGame,
        SetWinner
    }
    
    struct Game {
        uint id;
        uint gameFee; // base game fee set by the challenger
        uint winTime; // in seconds
        uint8 killScore;
        address challengerAddress;
        address challengeAcceptorAddress;
        address winnerAddress;
        bool inProgress;
    }
    
    modifier validGame(uint gameId, uint valuePassed, ActionType action) {
        // Check and verify if the caller address is valid
        require(msg.sender != Helpers.nullAddress(), "Caller address is not valid");
        
        bool gameExists = false;
        // Since There sis no concept of null
        for (uint i = 0; i < _games.length; i++) {
            if (i == gameId) {
                gameExists = true;
            }
        }
        if (action == ActionType.CreateGame) {
            // Check and verify if a game with specified ID  already exists.
            require(!gameExists, "A game with specified ID already exists");
            // Check and verify if a value equal to or greater than `_baseGameFee` was sent along with the transaction.
            require(valuePassed >= _baseGameFee, "Sent value should be equal to or greater than base game fee");
        } else if (action == ActionType.JoinGame) {
            // Check and verify if a game currently exists for specified `gameId`.
            require(gameExists, "A game with specified ID does not exists");
            Game memory onGoingGame = _games[gameId];
            // Check and verify if challenger address is already set for the game.
            require(onGoingGame.challengerAddress != Helpers.nullAddress(), "No challenger address set for the game");
            // Check and verify if challenger address is not equal to caller address.
            require(onGoingGame.challengerAddress != msg.sender, "Challenger and challenge acceptor address cannot be equal");
            // Check and verify if challenger address is not equal to caller address.
            require(onGoingGame.challengeAcceptorAddress != msg.sender, "The player already accepted the challenge");
            // Check and verify if challenger address is not equal to caller address.
            require(onGoingGame.challengeAcceptorAddress == Helpers.nullAddress(), "A player already accepted this challenge");
            // Check and verify if the current game is in progress.
            require(onGoingGame.inProgress, "Current game is no longer in progress");
            // Check and verify if a value equal to game fee was sent along with this transaction.
            require(valuePassed == onGoingGame.gameFee, "Sent value should be equalt to game fee.");
        } else if (action == ActionType.EndGame) {
            // Check and verify if a game exists for the specified `gameId`.
            require(gameExists, "A game with specified ID does not exists.");
            Game memory currentGame = _games[gameId];
            // Check and verify if challengerAddress is valid.
            require(currentGame.challengerAddress != Helpers.nullAddress(), "Challenger address is not valid.");
            // Check and verify if the winner address is not 0.
            require(currentGame.winnerAddress != Helpers.nullAddress(), "Winner address is not valid.");
            // Check and verify if the caller is the winner of the game.
            require(msg.sender == currentGame.winnerAddress, "Only the winner can call this method.");
            // Check and verify `winTime` is greater than 0.
            require(currentGame.winTime > 0, "WinTime should be greater that 0.");
        } else if (action == ActionType.SetWinner) {
            // Check and verify if a game exists for the specified `gameId`.
            require(gameExists, "A game with specified ID does not exists.");
            Game memory currentGame = _games[gameId];
            // Check and verify if the challengerAddress is valid.
            require(currentGame.challengerAddress != Helpers.nullAddress(), "Challenger address is not valid.");
            // Check and verify if the challengeAcceptorAddress is valid.
            require(currentGame.challengeAcceptorAddress != Helpers.nullAddress(), "Challenge acceptor address is not valid.");
            // Check and verify if caller is either the challenger or challengeAcceptor.
            require(msg.sender == currentGame.challengerAddress || msg.sender == currentGame.challengeAcceptorAddress, "Unknow player cannot set the winner.");
            // Check and verify if the winner address is not already set.
            require(currentGame.winnerAddress == Helpers.nullAddress(), "Winner address is already set.");
            // Check and verify if the current game is in progress.
            require(currentGame.inProgress, "This game is not in progress anymore.");
        } else {
            require(false, "Action invalid.");
        }
        _;
    }

    Game[] private _games;

    uint private _baseGameFee = 0.005 ether;
    IERC20 private _token = new ERC20("ether", "ETH");
    NFTContract private nftContract = new NFTContract(address(this));
    
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
      _baseGameFee = newGameFee;
    }
    
    /**
    * @dev Create a new game by depositing a gameFee. If no other player accepts the request within next 30 minutes
    * 
    */
    function createGame() external payable nonReentrant validGame(currentCounterValue(), msg.value, ActionType.CreateGame) {
        address challenger = msg.sender;
        uint currentCounter = currentCounterValue();
        // Create a new game after the funds are locked
        _createGame(msg.value);
        // Emit a new event after the game is created
        emit GameCreated(challenger, currentCounter);
        // Safe increase allowance for this contract to spend `_baseGameFee` after the game is finished
        //SafeERC20.safeIncreaseAllowance(_token, address(this), msg.value);
    }
    
    /**
     * @dev Call this to join a game with provided `gameId`. Throw an exeption if no game for this `gameId` exists.
     * 
     * @param gameId id of game to be ended
     */
    function joinGame(uint gameId) external payable nonReentrant validGame(gameId, msg.value, ActionType.JoinGame) {
        // Join an already created game with specified `gameId`
        _joinGame(gameId);
        // Emit event
        emit GameJoined(msg.sender, gameId);
        // Safe increase allowance for this contract to spend `msg.value` after the game is finished
        SafeERC20.safeIncreaseAllowance(_token, address(this), msg.value);
    }
    
    /**
     * @dev Call this to set the `winnerAddress` when a game finishes
     * 
     * @param winnerAddress address of player who won the game
     * @param gameId id of this game
     * @param winTime time taken (in seconds) to win the game
     * @param killScore count of longest consecutive kill by one single piece on board
     */
    function setWinner(
        address winnerAddress,
        uint gameId, 
        uint winTime, 
        uint8 killScore
    ) external nonReentrant validGame(gameId, 0, ActionType.SetWinner) {
        // Check and verify if the `winTime` is greater than 0
        require(winTime > 0, "WinTime has to be greater than 0");
        // Set winner address and other data
        _setWinner(winnerAddress, gameId, winTime, killScore);
    }
    
    /**
     * @dev Call this to end a game with specified `gameId`. A game would end either when one player wins or if no 
     * player accepts a challenge within 30 minutes.
     * 
     * @param gameId id of this game
     * @param isRare true if this NFT is rare
     */
    function endGame(uint gameId, bool isRare) external nonReentrant validGame(gameId, 0, ActionType.EndGame) {
        
        // Transfer locked funds into contract address
        // address addr = address(this);
        // address payable payableGameContractAddress = payable(addr);
        // SafeERC20.safeTransferFrom(_token, currentGame.challengerAddress, payableGameContractAddress, currentGame.gameFee);
        // if (currentGame.challengeAcceptorAddress != Helpers.nullAddress()) {
        //     SafeERC20.safeTransferFrom(_token, currentGame.challengeAcceptorAddress, payableGameContractAddress, currentGame.gameFee);
        // }
        
        // Create and mint NFT and assign it to winner address
        _createAndMintNFT(gameId, isRare);
    }
    
    /**
     * @dev Call this method when the game ends to create and mint NFT.
     * 
     * @param gameId id of this game
     * @param isRare true if this NFT is rare
     */
    function _createAndMintNFT(uint gameId, bool isRare) private {
        Game memory currentGame = _games[gameId];
        // Create nft here and once created then emit NFTCreated event 
        nftContract.createAndMintToken(gameId, currentGame.winTime, currentGame.killScore, isRare);
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
            winTime: 0,
            killScore: 0,
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
     * @dev Call this to set the `winnerAddress` when a game finishes
     * 
     * @param winnerAddress address of player who won the game
     * @param gameId id of this game
     * @param winTime time taken (in seconds) to win the game
     * @param killScore count of longest consecutive kill by one single piece on board
     */
    function _setWinner(
        address winnerAddress,
        uint gameId, 
        uint winTime, 
        uint8 killScore
    ) private {
        Game memory onGoingGame = _games[gameId];
        onGoingGame.winnerAddress = winnerAddress;
        onGoingGame.winTime = winTime;
        onGoingGame.killScore = killScore;
        onGoingGame.inProgress = false;
        _games[gameId] = onGoingGame;
    }
}