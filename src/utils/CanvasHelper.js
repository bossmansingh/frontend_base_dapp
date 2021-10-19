import { getIdenticonUrl } from './Helpers';
import b from '../assets/images/backgrounds/Texture_Background_6.png';
import b1 from '../assets/images/Border.png';
import b2 from '../assets/images/pieces/Knight.png';

// Dimensions
const pieceWidth = 1716;
const pieceHeight = 2083;
const chessboardSize = pieceWidth;
const winnerAvatarSize = 300;
const avatarTopPadding = (pieceHeight - pieceWidth - winnerAvatarSize)/2;
const avatarHorizontalPadding = 100;

const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const canvas = createCanvas(pieceWidth + chessboardSize, pieceHeight, 'svg');
const ctx = canvas.getContext('2d');

const imageFolderPath = 'src/assets/images';
const cardsFolderPath = `${imageFolderPath}/cards`;
const backgroundFolderPath = `${imageFolderPath}/backgrounds`;
const piecesFolderPath = `${imageFolderPath}/pieces`;
export const PieceType = {
    BISHOP: 'Bishop.png',
    KING: 'King.png',
    KNIGHT: 'Knight.png',
    PAWN: 'Pawn.png',
    QUEEN: 'Queen.png',
    ROOK: 'Rook.png'
};

const saveCard = async (_canvas, fileName) => {
    // TODO: Instead of saving to storage upload to IPFS
    const dataUrl = _canvas.toDataURL();
    //fs.writeFileSync(`${cardsFolderPath}/${fileName}`, dataUrl);
    return dataUrl;
};

export const createCard = async ({winnerAddress, otherAddress, pieceType, chessboard}) => {
    console.log('create card');

    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    

    // From a local file path:
    // const backgroundLayer = new Image();
    // backgroundLayer.onload = () => ctx.drawImage(backgroundLayer, 0, 0);
    // backgroundLayer.onerror = err => { throw err; };
    // backgroundLayer.src = b;
    const backgroundLayer = await loadImage(b);
    ctx.drawImage(backgroundLayer, 0, 0);
    
    const borderLayer = await loadImage(b1);
    ctx.drawImage(borderLayer, 0, 0);

    const pieceLayer = await loadImage(b2);
    ctx.drawImage(pieceLayer, 0, 0);
    
    if (chessboard != null) {
        const chessboardLayer = await loadImage(chessboard);
        // const chessboardLayer = await loadImage(`${imageFolderPath}/chessboard_logo.jpg`);
        ctx.drawImage(chessboardLayer, pieceWidth, 0, chessboardSize, chessboardSize);
    }
    
    const winnerAvatar = await loadImage(getIdenticonUrl(winnerAddress));
    ctx.drawImage(
        winnerAvatar, 
        pieceWidth + avatarHorizontalPadding, 
        chessboardSize + avatarTopPadding, 
        winnerAvatarSize, 
        winnerAvatarSize
    );
    
    const otherAvatar = await loadImage(getIdenticonUrl(otherAddress));
    ctx.drawImage(
        otherAvatar, 
        pieceWidth + winnerAvatarSize + (avatarHorizontalPadding * 2), 
        chessboardSize + avatarTopPadding + (winnerAvatarSize / 4), 
        winnerAvatarSize / 2, 
        winnerAvatarSize / 2
    );
    
    
    // Asynchronous PNG
    // console.log(`buffer: ${x}`);
    // canvas.toBuffer((err, buf) => {
    //     if (err) throw err; // encoding failed
    //     // buf is PNG-encoded image
    //     console.log(`buffer: ${buf}`);
    // });
    
    // const fileName = 'Texture_Background_2.png';
    // return saveCard(canvas, fileName);
    return canvas.toDataURL();
};