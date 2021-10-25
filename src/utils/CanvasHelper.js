import { convertRGBtoHex, getIdenticonUrl, getRandomNumber } from './Helpers';
import { createCanvas, loadImage } from 'canvas';

// Import Border
import Border from '../assets/images/Border.png';

// Import backgrounds
import PlainBackground from '../assets/images/backgrounds/Plain_Background.png';
import TextureBackground1 from '../assets/images/backgrounds/Texture_Background_1.png';
import TextureBackground2 from '../assets/images/backgrounds/Texture_Background_2.png';
import TextureBackground3 from '../assets/images/backgrounds/Texture_Background_3.png';
import TextureBackground4 from '../assets/images/backgrounds/Texture_Background_4.png';
import TextureBackground5 from '../assets/images/backgrounds/Texture_Background_5.png';
import TextureBackground6 from '../assets/images/backgrounds/Texture_Background_6.png';
import TextureBackground7 from '../assets/images/backgrounds/Texture_Background_7.png';
import TextureBackground8 from '../assets/images/backgrounds/Texture_Background_8.png';

// Import Pieces
import Bishop from '../assets/images/pieces/Bishop.png';
import King from '../assets/images/pieces/King.png';
import Knight from '../assets/images/pieces/Knight.png';
import Pawn from '../assets/images/pieces/Pawn.png';
import Queen from '../assets/images/pieces/Queen.png';
import Rook from '../assets/images/pieces/Rook.png';

// Dimensions
const pieceWidth = 1716;
const pieceHeight = 2083;
const chessboardPadding = 20;
const chessboardSize = pieceWidth;
const winnerAvatarSize = 250;
const otherAvatarSize = winnerAvatarSize * 0.65;
const avatarHorizontalPadding = 100;

const canvas = createCanvas((2 * pieceWidth) + (3 * chessboardPadding), pieceHeight + (2 * chessboardPadding), 'svg');
const ctx = canvas.getContext('2d');

const remainingHeight = canvas.height - (chessboardPadding + chessboardSize);

export const PieceType = {
    BISHOP: 'Bishop',
    KING: 'King',
    KNIGHT: 'Knight',
    PAWN: 'Pawn',
    QUEEN: 'Queen',
    ROOK: 'Rook'
};

export const createCard = async ({playerAddress, opponentAddress, pieceType, chessboard, backgroundColor, isPlayerWinner}) => {
    console.log('create card');
    console.log(`backgroundColor: ${backgroundColor}`);
    const hexColor = convertRGBtoHex(backgroundColor);
    console.log(`hexColor: ${hexColor}`);
    ctx.fillStyle = hexColor;
    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    const randomNumber = getRandomNumber(0, 100);
    let backgroundImage;
    if (randomNumber % 11 === 0) {
        backgroundImage = TextureBackground1;
    } else if (randomNumber % 12 === 0) {
        backgroundImage = TextureBackground2;
    } else if (randomNumber % 13 === 0) {
        backgroundImage = TextureBackground3;
    } else if (randomNumber % 14 === 0) {
        backgroundImage = TextureBackground4;
    } else if (randomNumber % 15 === 0) {
        backgroundImage = TextureBackground5;
    } else if (randomNumber % 16 === 0) {
        backgroundImage = TextureBackground6;
    } else if (randomNumber % 17 === 0) {
        backgroundImage = TextureBackground7;
    } else if (randomNumber % 18 === 0) {
        backgroundImage = TextureBackground8;
    } else {
        backgroundImage = PlainBackground;
    }
    const backgroundLayer = await loadImage(backgroundImage);
    ctx.drawImage(backgroundLayer, chessboardPadding, chessboardPadding);
    
    const borderLayer = await loadImage(Border);
    ctx.drawImage(borderLayer, chessboardPadding, chessboardPadding);

    let currentPiece = null;
    switch (pieceType) {
        case PieceType.BISHOP :
            currentPiece = Bishop;
            break;
        case PieceType.KING :
            currentPiece = King;
            break;
        case PieceType.KNIGHT :
            currentPiece = Knight;
            break;
        case PieceType.PAWN :
            currentPiece = Pawn;
            break;
        case PieceType.QUEEN :
            currentPiece = Queen;
            break;
        case PieceType.ROOK :
            currentPiece = Rook;
            break;
        default:
            currentPiece = null;
    }
    if (currentPiece) {
        const pieceLayer = await loadImage(currentPiece);
        ctx.drawImage(pieceLayer, chessboardPadding, chessboardPadding);
    }
    
    if (chessboard != null) {
        const chessboardLayer = await loadImage(chessboard);
        ctx.drawImage(chessboardLayer, pieceWidth + (2 * chessboardPadding), chessboardPadding, chessboardSize, chessboardSize);
    }

    if (isPlayerWinner) {
        await addLargeAvatar(playerAddress);
        await addSmallAvatar(opponentAddress);
    } else {
        await addSmallAvatar(playerAddress);
        await addLargeAvatar(opponentAddress);
    }
    return canvas.toDataURL();
};


async function addLargeAvatar(address) {
    const winnerAvatar = await loadImage(getIdenticonUrl(address));
    const avatarTopPadding = (remainingHeight - winnerAvatarSize) / 2;
    console.log(`remainingHeight: ${remainingHeight}`);
    console.log(`avatarTopPadding: ${avatarTopPadding}`);
    ctx.save();
    ctx.beginPath();
    ctx.arc(
        pieceWidth + avatarHorizontalPadding + (winnerAvatarSize/2), 
        chessboardSize + chessboardPadding + avatarTopPadding + (winnerAvatarSize/2), 
        (winnerAvatarSize/2),
        0, 
        2*Math.PI, 
        true
    );
    ctx.clip();
    ctx.drawImage(
        winnerAvatar, 
        pieceWidth + avatarHorizontalPadding, 
        chessboardSize + chessboardPadding + avatarTopPadding,
        winnerAvatarSize, 
        winnerAvatarSize
    );
    ctx.closePath();
    ctx.restore();
}

async function addSmallAvatar(address) {
    const otherAvatar = await loadImage(getIdenticonUrl(address));
    const avatarTopPadding = (remainingHeight - otherAvatarSize) / 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(
        pieceWidth + winnerAvatarSize + (avatarHorizontalPadding * 2) + (otherAvatarSize/2), 
        chessboardSize + chessboardPadding + avatarTopPadding + (otherAvatarSize/2), 
        (otherAvatarSize/2),
        0, 
        2*Math.PI, 
        true
    );
    ctx.clip();
    ctx.drawImage(
        otherAvatar, 
        pieceWidth + winnerAvatarSize + (avatarHorizontalPadding * 2), 
        chessboardSize + chessboardPadding + avatarTopPadding, 
        otherAvatarSize, 
        otherAvatarSize
    );
    ctx.closePath();
    ctx.restore();
}