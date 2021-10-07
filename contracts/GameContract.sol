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
    
    event GameCreated(address indexed challengerAddress, string gameId);
    event GameJoined(address indexed challengerAddress, address indexed challengeAcceptorAddress, string gameId);
    event GameEnd(address indexed winnerAddress, string gameId);
    event NFTCreated(address indexed winnerAddress, string gameId, bool isRare);
    
    enum ActionType {
        CreateGame,
        JoinGame,
        EndGame
    }
    
    // modifier validGame(uint gameId, uint valuePassed, ActionType action, address _winnerAddress) {
    //     // Check and verify if the caller address is valid
    //     require(msg.sender != Helpers.nullAddress(), "Caller address is not valid");

    //     AddressMapping memory addressMapping = _games[gameId];
    //     address challengerAddress = addressMapping.challengerAddress;
    //     address challengeAcceptorAddress = addressMapping.challengeAcceptorAddress;
    //     address winnerAddress = addressMapping.winnerAddress;
    //     bool gameExists = challengerAddress != Helpers.nullAddress() || challengeAcceptorAddress != Helpers.nullAddress() || winnerAddress != Helpers.nullAddress();

    //     if (action == ActionType.CreateGame) {
    //         // Check and verify if a game with specified ID  already exists.
    //         require(!gameExists, "A game with specified ID already exists");
    //         // Check and verify if a value equal to or greater than `_baseGameFee` was sent along with the transaction.
    //         require(valuePassed == _baseGameFee, "Sent value should be equal to game fee");
    //         // Check and verify if the winner address is not set.
    //         require(challengerAddress == Helpers.nullAddress(), "Challenger address is already set");
    //         // Check and verify if challenge acceptor address is not set yet.
    //         require(challengeAcceptorAddress == Helpers.nullAddress(), "Challenge acceptor address is already set");
    //         // Check and verify if the winner address is not set.
    //         require(winnerAddress == Helpers.nullAddress(), "Winner address cannot be set before the game ends");
    //     } else if (action == ActionType.JoinGame) {
    //         // Check and verify if a game currently exists for specified `gameId`.
    //         require(gameExists, "A game with specified ID does not exists");
    //         // Check and verify if challenger address is already set for the game.
    //         require(challengerAddress != Helpers.nullAddress(), "No challenger address set for the game");
    //         // Check and verify if challenger address is not equal to caller address.
    //         require(challengerAddress != msg.sender, "Challenger and challenge acceptor address cannot be same address");
    //         // Check and verify if challenge acceptor address is not equal to caller address.
    //         require(challengeAcceptorAddress != msg.sender, "The player already accepted the challenge");
    //         // Check and verify if challenge acceptor address is not set yet.
    //         require(challengeAcceptorAddress == Helpers.nullAddress(), "A player already accepted this challenge");
    //         // Check and verify if a value equal to or greater than `_baseGameFee` was sent along with the transaction.
    //         require(valuePassed == _baseGameFee, "Sent value should be equal to game fee");
    //         // Check and verify if the winner address is not set.
    //         require(winnerAddress == Helpers.nullAddress(), "Winner address cannot be set before the game ends");
    //     } else if (action == ActionType.EndGame) {
    //         // Check and verify if a game exists for the specified `gameId`.
    //         require(gameExists, "A game with specified ID does not exists.");
    //         // Check and verify if challengerAddress is valid.
    //         require(challengerAddress != Helpers.nullAddress(), "Challenger address is not valid.");
    //         // Check and verify if challenge acceptor address is valid.
    //         require(challengeAcceptorAddress != Helpers.nullAddress(), "Challenge acceptor address is not valid");
    //         // Check and verify if the winner address is not set.
    //         require(winnerAddress == Helpers.nullAddress(), "Winner address is already set");
    //         // Check and verify if the passed _winnerAddress is valid
    //         require(_winnerAddress != Helpers.nullAddress(), "Winner address is not valid");
    //         // Check and verify if passed _winnerAddress is equal to either player of the game
    //         require(_winnerAddress == challengerAddress || _winnerAddress == challengeAcceptorAddress, "Winner address does not belong to either player of the game");
    //     } else {
    //         require(false, "Action invalid.");
    //     }
    //     _;
    // }

    mapping(string => address) private _challengerMap;
    mapping(string => address) private _opponentMap;
    mapping(string => address) private _winnersMap;

    uint private _baseGameFee = Helpers.GAME_FEE;
    IERC20 private _token = new ERC20("ether", "ETH");
    NFTContract private nftContract = new NFTContract(address(this));
    
    /**
     * @dev Call this to get the current balance of 
     */
    function getContractBalance() external view returns (uint) {
        return address(this).balance;
    }
    
    /**
     * @dev Call this to get the current `_baseGameFee` 
     */
    function getBaseGameFee() external view returns (uint) {
        return _baseGameFee;
    }
    
    /**
     * @dev Call this to update the current base game fee. This method can only be called via owner of this contract.
     *
     * @param newGameFee new fee value to be used for creating a new game.
     */
    function updateBaseGameFees(uint newGameFee) external onlyOwner() {
      _baseGameFee = newGameFee;
    }
    
    /**
    * @dev Create a new game by depositing a gameFee.
    * 
    */
    function createGame(string memory gameId) external payable nonReentrant {
        // Check and verify if the caller address is valid
        require(msg.sender != Helpers.nullAddress(), "Caller address is not valid");
        address challengerAddress = _challengerMap[gameId];
        bool gameExists = challengerAddress != Helpers.nullAddress();
        // Check and verify if a game with specified ID  already exists.
        require(!gameExists, "A game with specified ID already exists");
        // Check and verify if a challenger address does not already exists.
        bool challengerExists = challengerAddress != Helpers.nullAddress();
        require(!challengerExists, "Challenger address already exists");
        // Check and verify if a value equal to or greater than `_baseGameFee` was sent along with the transaction.
        require(msg.value >= _baseGameFee, "Sent value should be equal to game fee");
        // Check and verify if the challenge acceptor address exist
        bool challengeAcceptorNotExists = _opponentMap[gameId] == Helpers.nullAddress();
        require(challengeAcceptorNotExists, "Challenge acceptor address already exists");
        bool winnerExists = _winnersMap[gameId] != Helpers.nullAddress();
        // Check and verify if the winner address is not set.
        require(!winnerExists, "Winner address cannot be set before the game starts");
        // Create a new game after the funds are locked
        _createGame(gameId);
        // Safe increase allowance for this contract to spend `_baseGameFee` after the game is finished
        SafeERC20.safeIncreaseAllowance(_token, address(this), msg.value);
        // Emit new game event
        emit GameCreated(msg.sender, gameId);
    }
    
    /**
     * @dev Call this to join a game with provided `gameId`. Throw an exeption if no game for this `gameId` exists.
     * 
     * @param gameId id of game to be ended
     */
    function joinGame(string memory gameId) external payable nonReentrant {
        // Check and verify if the caller address is valid
        require(msg.sender != Helpers.nullAddress(), "Caller address is not valid");
        address challengerAddress = _challengerMap[gameId];
        bool gameExists = challengerAddress != Helpers.nullAddress();
        // Check and verify if a game with specified ID  already exists.
        require(gameExists, "A game with specified ID does not exist");
        // Check and verify if a challenger address exists.
        bool challengerExists = challengerAddress != Helpers.nullAddress();
        require(challengerExists, "Challenger address does not exists");
        // Check and verify if a value equal to or greater than `_baseGameFee` was sent along with the transaction.
        require(msg.value >= _baseGameFee, "Sent value should be equal to game fee");
        // Check and verify if the challenge acceptor address exist
        bool challengeAcceptorExists = _opponentMap[gameId] != Helpers.nullAddress();
        require(!challengeAcceptorExists, "Challenge acceptor address already exists");
        // Check and verify if both player address are unique
        require(challengerAddress != msg.sender, "Both player address should be unique");
        // Check and verify if the winner address is not set.
        bool winnerExists = _winnersMap[gameId] != Helpers.nullAddress();
        require(!winnerExists, "Winner address cannot be set before the game starts");
        // Join an already created game with specified `gameId`
        _joinGame(gameId);
        // Safe increase allowance for this contract to spend `msg.value` after the game is finished
        SafeERC20.safeIncreaseAllowance(_token, address(this), msg.value);
        // Emit game joined event
        emit GameJoined(challengerAddress, msg.sender, gameId);
    }
    
    /**
     * @dev Call this to end a game with specified `gameId`. A game would end either when one player wins or if no 
     * player accepts a challenge within 30 minutes.
     * 
     * @param gameId id of this game
     * @param winnerAddress address of player who won the game
     * @param winTime time taken (in seconds) to win the game
     */
    function endGame(
        string memory gameId, 
        address winnerAddress, 
        uint winTime
    ) external nonReentrant onlyOwner() {
        // Check and verify if the `winTime` is greater than 0
        require(winTime > 0, "WinTime has to be greater than 0");
        // End the current game and update winner address
        _endGame(winnerAddress, gameId);
        // Emit end game event
        emit GameEnd(winnerAddress, gameId);
    }
    
    /**
     * @dev Winner of the game can call this to mint the winning card NFT.
     *
     * @param gameId id of this game
     * @param isRare true if this NFT is rare
     * @param winTime time taken (in seconds) to win the game
     * @param killScore count of longest consecutive kill by one single piece on board
     */
    function mintNFT(
        string memory gameId, 
        bool isRare,
        uint winTime, 
        uint8 killScore
    ) external nonReentrant {
        // Check and verify if the caller address is valid
        require(msg.sender != Helpers.nullAddress(), "Caller address is not valid");
        address challengerAddress = _challengerMap[gameId];
        bool gameExists = challengerAddress != Helpers.nullAddress();
        // Check and verify if a game with specified ID  already exists.
        require(gameExists, "A game with specified ID does not exist");
        // Check and verify if the challenge acceptor address exist
        bool challengeAcceptorExists = _opponentMap[gameId] != Helpers.nullAddress();
        require(challengeAcceptorExists, "Challenge acceptor address is not set");
        address winnerAddress = _winnersMap[gameId];
        bool winnerExists = winnerAddress != Helpers.nullAddress();
        // Check and verify if the winner address is not set.
        require(winnerExists, "Winner address is not set");
        // Check and verify if the caller address matches to winner address
        require(msg.sender == winnerAddress, "Only the winner of the game can mint the NFT card");
        // Create and mint NFT and assign it to winner address
        _createAndMintNFT(gameId, winnerAddress, isRare, winTime, killScore);
    }
    
    /**
     * @dev Create a new game and update the mapping for `games`.
     * 
     * @param gameId id of game to be started
     */
    function _createGame(string memory gameId) private increment() {
        _challengerMap[gameId] = msg.sender;
    }
    
    /**
     * @dev Call this to join a game with provided `gameId`.
     * 
     * @param gameId id of game to be ended
     */
    function _joinGame(string memory gameId) private {
        _opponentMap[gameId] = msg.sender;
    }
    
    /**
     * @dev Call this to set the `winnerAddress` when a game finishes
     * 
     * @param winnerAddress address of player who won the game
     * @param gameId id of this game
     */
    function _endGame(address winnerAddress, string memory gameId) private {
        _winnersMap[gameId] = winnerAddress;
    }

    /**
     * @dev Call this method when the game ends to create and mint NFT.
     * 
     * @param gameId id of this game.
     * @param winnerAddress address of player who won the game
     * @param isRare true if this NFT is rare
     * @param winTime time taken (in seconds) to win the game
     * @param killScore count of longest consecutive kill by one single piece on board
     */
    function _createAndMintNFT(
        string memory gameId, 
        address winnerAddress, 
        bool isRare,
        uint winTime, 
        uint8 killScore
    ) private {
        // Create nft here and once created then emit NFTCreated event 
        nftContract.createAndMintToken(gameId, winTime, killScore, isRare);
        emit NFTCreated(winnerAddress, gameId, isRare);
    }
}