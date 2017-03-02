// board description
var nbRows = 9;
var nbCols = 9;
var kPieceWidth = 50;
var kPieceHeight = 50;
var kPixelWidth = 1 + (nbRows * kPieceWidth);
var kPixelHeight = 1 + (nbCols * kPieceHeight);
var gameEnded = false;
// characters positions
var currentPosition = { column: 0, row: 0 };
var nbMushrooms = 10;
var mushrooms = [];
var pathUser = [];
var pathRobot = [];
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
    var imgMario = new Image();
    imgMario.onload = function () {
        // transform row / column to grid coords
        var x = (position.column * kPieceWidth);
        var y = (position.row * kPieceHeight);
        gContext.drawImage(imgMario, x, y, kPieceWidth, kPieceHeight)
    }
    imgMario.src = "./assets/mario.png";

    var imgPeach = new Image();
    imgPeach.onload = function () {
        var xPeach = ((nbRows - 1) * kPieceWidth);
        var yPeach = ((nbCols - 1) * kPieceHeight);
        gContext.drawImage(imgPeach, xPeach, yPeach, kPieceWidth, kPieceHeight)
    }
    imgPeach.src = "./assets/peach.png";

    var imgMushroom = new Image();
    imgMushroom.onload = function () {
        mushrooms
            .map(function (pos) {
                var xMushroom = (pos.column * kPieceWidth);
                var yMushroom = (pos.row * kPieceHeight);
                gContext.drawImage(imgMushroom, xMushroom, yMushroom, kPieceWidth, kPieceHeight)
            })
    }
    imgMushroom.src = "./assets/mushroom.png";
}

function drawPath(path) {
    console.log("called");
    gContext.clearRect(0, 0, kPixelWidth, kPixelHeight); 
    //gContext.fillStyle = 'black';
    //gContext.fillRect(0, 0, kPieceWidth, kPieceHeight);
    /*
    path
    .map(function(pos) {
        gContext.fillStyle='black';
        gContext.fillRect(pos.column, pos.row, kPieceWidth, kPieceHeight);
    })
    */
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
    gContext.closePath();
    /* draw */
    gContext.strokeStyle = 'blue';
    gContext.stroke();
    drawCharacters(currentPosition);
}

document.addEventListener("keydown", function (e) {
    if (!gameEnded) {
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
        if (newPosition.column == nbCols - 1 && newPosition.row == nbRows - 1) { // End of the game
            endGame();
        }
        if (isInsideGrid(newPosition)) {
            mushrooms =
                mushrooms
                    .filter(function (position) {
                        return (position.column != newPosition.column || position.row != newPosition.row);
                    })
            currentPosition = newPosition;
            pathUser.push(newPosition);
        }
        drawBoard();
    }
}, false);

function computeBestPath() {

}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function endGame() {
    console.log("End");
    gameEnded = true;
    drawPath(pathUser);
    //drawPath(pathRobot, null);
    //drawResults();
}

function WindowLoad(event) {
    gameEnded = false;
    // generate random mushrooms
    for (var i = 0; i < nbMushrooms; i++) {
        mushrooms.push({ column: getRandomIntInclusive(0, nbCols - 1), row: getRandomIntInclusive(0, nbRows - 1) });
    }

    var canvas = document.getElementById('canvas');
    canvas.width = kPixelWidth;
    canvas.height = kPixelHeight;
    var context = canvas.getContext("2d");
    gContext = context;
    drawBoard();
}        