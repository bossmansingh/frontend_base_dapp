import { getIdenticonUrl } from './Helpers';
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
const winnerAvatarSize = 300;
const otherAvatarSize = winnerAvatarSize / 2;
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

export const createCard = async ({winnerAddress, otherAddress, pieceType, chessboard}) => {
    console.log('create card');
    
    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );
    const backgroundLayer = await loadImage(PlainBackground);
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

    const winnerAvatar = await loadImage(getIdenticonUrl(winnerAddress));
    let avatarTopPadding = (remainingHeight - winnerAvatarSize) / 2;
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
    
    const otherAvatar = await loadImage(getIdenticonUrl(otherAddress));
    avatarTopPadding = (remainingHeight - otherAvatarSize) / 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(
        pieceWidth + winnerAvatarSize + (avatarHorizontalPadding * 2) + (winnerAvatarSize/4), 
        chessboardSize + chessboardPadding + avatarTopPadding + (winnerAvatarSize/4), 
        (winnerAvatarSize/4),
        0, 
        2*Math.PI, 
        true
    );
    ctx.clip();
    ctx.drawImage(
        otherAvatar, 
        pieceWidth + winnerAvatarSize + (avatarHorizontalPadding * 2), 
        chessboardSize + chessboardPadding + avatarTopPadding, 
        winnerAvatarSize / 2, 
        winnerAvatarSize / 2
    );
    ctx.closePath();
    ctx.restore();
    return canvas.toDataURL();
};