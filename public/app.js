// board description
var nbRows = 9;
var nbCols = 9;
var kPieceWidth = 50;
var kPieceHeight = 50;
var kPixelWidth = 1 + (nbRows * kPieceWidth);
var kPixelHeight = 1 + (nbCols * kPieceHeight);
// characters positions
var currentPosition = { column: 0, row: 0 };
var nbMushrooms = 10;
var mushrooms = [];
var gContext;

if (window.addEventListener) { // Mozilla, Netscape, Firefox
    window.addEventListener('load', WindowLoad, false);
}
else if (window.attachEvent) { // IE
    window.attachEvent('onload', WindowLoad);
}

function isInsideGrid(position) {
    return (position.row >= 0 && position.row < nbRows) && (position.column >= 0 && position.column < nbCols);
}

function drawCharacters(position) {
    // draw
    gContext.strokeStyle = "#000";
    gContext.stroke();

    var imgMario = new Image();
    imgMario.onload = function () {
        // transform row / column to grid coords
        var x = (position.column * kPieceWidth) + (kPieceWidth / 2);
        var y = (position.row * kPieceHeight) + (kPieceHeight / 2);        
        gContext.drawImage(imgMario, x-(kPieceWidth/2), y-(kPieceHeight/2), kPieceWidth , kPieceHeight)
    }
    imgMario.src = "./assets/mario.png";

    var imgPeach = new Image();
    imgPeach.onload = function () {
        var xPeach = ((nbRows-1) * kPieceWidth) + (kPieceWidth / 2);
        var yPeach = ((nbCols-1) * kPieceHeight) + (kPieceHeight / 2);   
        gContext.drawImage(imgPeach, xPeach-(kPieceWidth/2), yPeach-(kPieceHeight/2), kPieceWidth , kPieceHeight)
    }
    imgPeach.src = "./assets/peach.png";

    var imgMushroom = new Image();
    imgMushroom.onload = function () {
        mushrooms
        .map(function (pos) {
            var xMushroom = (pos.row * kPieceWidth) + (kPieceWidth / 2);
            var yMushroom = (pos.column * kPieceHeight) + (kPieceHeight / 2);                
            gContext.drawImage(imgMushroom, xMushroom-(kPieceWidth/2), yMushroom-(kPieceHeight/2), kPieceWidth , kPieceHeight)
        })
        
    }
    imgMushroom.src = "./assets/mushroom.png";      
}

function drawBoard() {
    gContext.clearRect(0, 0, kPixelWidth, kPixelHeight);
    gContext.beginPath();
    /* vertical lines */
    for (var x = 0; x <= kPixelWidth; x += kPieceWidth) {
        gContext.moveTo(0.5 + x, 0);
        gContext.lineTo(0.5 + x, kPixelHeight);
    }
    /* horizontal lines */
    for (var y = 0; y <= kPixelHeight; y += kPieceHeight) {
        gContext.moveTo(0, 0.5 + y);
        gContext.lineTo(kPixelWidth, 0.5 + y);
    }
    /* draw */
    gContext.strokeStyle = "#ccc";
    gContext.stroke();
    drawCharacters(currentPosition);
}

document.addEventListener("keydown", function (e) {
    var newPosition = { column: 0, row: 0 };
    newPosition.column = currentPosition.column;
    newPosition.row = currentPosition.row;
    if (e.keyCode == 65) { // A
        newPosition.column -= 1;
    }
    if (e.keyCode == 68) { // D
        newPosition.column += 1;
    }
    if (e.keyCode == 87) { // W
        newPosition.row -= 1;
    }
    if (e.keyCode == 83) { // S
        newPosition.row += 1;
    }
    if (isInsideGrid(newPosition)) {
        currentPosition = newPosition;
    }
    drawBoard();
}, false);

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min +1)) + min;
}

function WindowLoad(event) {
    // generate random mushrooms
    for (var i = 0; i < nbMushrooms; i++) {
        mushrooms.push({column: getRandomIntInclusive(0, nbCols-1), row: getRandomIntInclusive(0, nbRows-1)});
    }

    var canvas = document.createElement('canvas');

    canvas.id = 'canvas';
    canvas.width = kPixelWidth;
    canvas.height = kPixelHeight;

    document.body.appendChild(canvas);
    var context = canvas.getContext("2d");
    gContext = context;

    drawBoard();
}        