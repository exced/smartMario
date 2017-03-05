Vue.config.debug = true;

var initPos = { column: 0, row: 0 };
var currentPosition = initPos;
var mushroomsCopy = [];
var pathUser = [initPos];
var gContext;
var height = screen.availHeight;
// init
var nRows = 4;
var nCols = 4;
var kPW = ~~((height - 250) / nCols);
var kPH = ~~((height - 250) / nRows);
var kPiW = 1 + (nCols * this.kPW);
var kPiH = 1 + (nRows * this.kPH);

var game = new Vue({
    el: '#scores',
    data: {
        // board description
        nbRows: nRows,
        nbCols: nCols,
        nbMushrooms: 5,
        mushrooms: [],
        kPieceWidth: kPW,
        kPieceHeight: kPH,
        kPixelWidth: kPiW,
        kPixelHeight: kPiH,
        timer: '',
        gameEnded: false,
        robotScore: 0
    },
    computed: {
    },
    methods: {
        score: function () {
            return mushroomsCopy.length - this.mushrooms.length;
        },
        newGame: function () {
            newGame();
        },
        win: function () {
            return this.gameEnded && (mushroomsCopy.length - this.mushrooms.length >= this.robotScore);
        },
        loose: function () {
            return this.gameEnded && !(mushroomsCopy.length - this.mushrooms.length >= this.robotScore);
        },
        updateGrid: function () {
            this.kPieceWidth = ~~((height - 250) / this.nbCols);
            this.kPieceHeight = ~~((height - 250) / this.nbRows);
            this.kPixelWidth = 1 + (this.nbRows * this.kPieceWidth);
            this.kPixelHeight = 1 + (this.nbCols * this.kPieceHeight);
            newGame();
        }
    }
});

if (window.addEventListener) { // Mozilla, Netscape, Firefox
    window.addEventListener('load', WindowLoad, false);
}
else if (window.attachEvent) { // IE
    window.attachEvent('onload', WindowLoad);
}

function isInsideGrid(position) {
    return (position.row >= 0 && position.row < game.nbRows) && (position.column >= 0 && position.column < game.nbCols);
}

function drawCharacters(position) {
    var imgMario = new Image();
    imgMario.onload = function () {
        // transform row / column to grid coords
        var x = (position.column * game.kPieceWidth);
        var y = (position.row * game.kPieceHeight);
        gContext.drawImage(imgMario, x, y, game.kPieceWidth, game.kPieceHeight)
    }
    imgMario.src = "./assets/mario.png";

    var imgPeach = new Image();
    imgPeach.onload = function () {
        var xPeach = ((game.nbRows - 1) * game.kPieceWidth);
        var yPeach = ((game.nbCols - 1) * game.kPieceHeight);
        gContext.drawImage(imgPeach, xPeach, yPeach, game.kPieceWidth, game.kPieceHeight)
    }
    imgPeach.src = "./assets/peach.png";

    var imgMushroom = new Image();
    imgMushroom.onload = function () {
        game.mushrooms
            .map(function (pos) {
                var xMushroom = (pos.column * game.kPieceWidth);
                var yMushroom = (pos.row * game.kPieceHeight);
                gContext.drawImage(imgMushroom, xMushroom, yMushroom, game.kPieceWidth, game.kPieceHeight)
            })
    }
    imgMushroom.src = "./assets/red.png";
}

function drawResults() {
    gContext.clearRect(0, 0, game.kPixelWidth, game.kPixelHeight);
    gContext.beginPath();
    /* vertical lines */
    for (var x = 0; x <= game.kPixelWidth; x += game.kPieceWidth) {
        gContext.moveTo(0.5 + x, 0);
        gContext.lineTo(0.5 + x, game.kPixelHeight);
    }
    /* horizontal lines */
    for (var y = 0; y <= game.kPixelHeight; y += game.kPieceHeight) {
        gContext.moveTo(0, 0.5 + y);
        gContext.lineTo(game.kPixelWidth, 0.5 + y);
    }
    gContext.closePath();
    /* draw */
    gContext.strokeStyle = 'black';
    gContext.stroke();
    /* red mushrooms */
    var imgMushroomR = new Image();
    imgMushroomR.onload = function () {
        game.mushrooms
            .map(function (pos) {
                var xMushroom = (pos.column * game.kPieceWidth);
                var yMushroom = (pos.row * game.kPieceHeight);
                gContext.drawImage(imgMushroomR, xMushroom, yMushroom, game.kPieceWidth, game.kPieceHeight)
            })
    }
    imgMushroomR.src = "./assets/red.png";
    /* green mushrooms */
    var imgMushroomG = new Image();
    imgMushroomG.onload = function () {
        mushroomsCopy.filter(function (e) {
            return game.mushrooms.indexOf(e) < 0;
        })
            .map(function (pos) {
                var xMushroom = (pos.column * game.kPieceWidth);
                var yMushroom = (pos.row * game.kPieceHeight);
                gContext.drawImage(imgMushroomG, xMushroom, yMushroom, game.kPieceWidth, game.kPieceHeight)
            })
    }
    imgMushroomG.src = "./assets/green.png";
    /* pathUser */
    pathUser
        .map(function (pos) {
            gContext.fillStyle = 'rgba(71,156,242,0.5)';
            var x = (pos.column * game.kPieceWidth);
            var y = (pos.row * game.kPieceHeight);
            gContext.fillRect(x, y, game.kPieceWidth, game.kPieceHeight);
        });
    /* pathRobot */
    var robotPath = search();
    /* path */
    robotPath
        .map(function (pos) {
            gContext.fillStyle = 'rgba(237,3,34,0.5)';
            var x = (pos.column * game.kPieceWidth);
            var y = (pos.row * game.kPieceHeight);
            gContext.fillRect(x, y, game.kPieceWidth, game.kPieceHeight);
        });
}

function drawBoard() {
    gContext.clearRect(0, 0, game.kPixelWidth, game.kPixelHeight);
    gContext.beginPath();
    /* vertical lines */
    for (var x = 0; x <= game.kPixelWidth; x += game.kPieceWidth) {
        gContext.moveTo(0.5 + x, 0);
        gContext.lineTo(0.5 + x, game.kPixelHeight);
    }
    /* horizontal lines */
    for (var y = 0; y <= game.kPixelHeight; y += game.kPieceHeight) {
        gContext.moveTo(0, 0.5 + y);
        gContext.lineTo(game.kPixelWidth, 0.5 + y);
    }
    gContext.closePath();
    /* draw */
    gContext.strokeStyle = 'black';
    gContext.stroke();
    drawCharacters(currentPosition);
}

document.addEventListener("keydown", function (e) {
    if (!game.gameEnded) {
        var newPosition = { column: currentPosition.column, row: currentPosition.row };
        if (e.keyCode == 68 || e.keyCode == 39) { // D or Right
            newPosition.column += 1;
        }
        if (e.keyCode == 83 || e.keyCode == 40) { // S or Down
            newPosition.row += 1;
        }
        if (newPosition.column == game.nbCols - 1 && newPosition.row == game.nbRows - 1) { // End of the game
            endGame();
        }
        if (isInsideGrid(newPosition)) {
            game.mushrooms =
                game.mushrooms
                    .filter(function (position) {
                        return (position.column != newPosition.column || position.row != newPosition.row);
                    })
            currentPosition = newPosition;
            pathUser.push(newPosition);
        }
        drawBoard();
    }
}, false);

function zero2D(rows, cols) {
    var array = [], row = [];
    while (cols--) row.push(0);
    while (rows--) array.push(row.slice());
    return array;
}

function search(strat) {
    var path = [];
    var matrix = zero2D(game.nbRows, game.nbCols);
    game.mushrooms
        .map(function (e, i, arr) {
            matrix[e.row][e.column]++;
        });
    var maxLength = Math.max(game.nbCols, game.nbRows);
    var temp;
    var max = 0;
    var borders = [];
    var border = [];
    /* mark matrix from end to begin */
    for (var k = 2 * (maxLength - 1); k >= 0; k--) {
        for (var y = game.nbCols - 1; y >= 0; --y) {
            var x = k - y;
            if (x >= 0 && x < game.nbRows) {
                var d = 0;
                if (y != game.nbRows - 1) {
                    d = matrix[y + 1][x];
                }
                if (x != game.nbCols - 1) {
                    if (matrix[y][x + 1] > d) {
                        d = matrix[y][x + 1];
                    }
                }
                matrix[y][x] += d;
            }
        }
    }
    /* score */
    game.robotScore = matrix[0][0];
    console.log(JSON.stringify(matrix));
    /* find the path */
    var curr = { column: 0, row: 0 };
    path.push({ column: 0, row: 0 });
    while (!(curr.column == game.nbCols - 1 && curr.row == game.nbRows - 1)) {
        if (curr.row < game.nbRows - 1) {
            if (curr.column < game.nbCols - 1) {
                if (matrix[curr.row + 1][curr.column] >= matrix[curr.row][curr.column + 1]) {
                    curr.row++;
                } else {
                    curr.column++;
                }
            } else {
                curr.row++;
            }
        } else {
            curr.column++;
        }
        path.push({ column: curr.column, row: curr.row });
    }
    console.log("PATH ", JSON.stringify(path));
    return path;
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function endGame() {
    drawResults();
    game.gameEnded = true;
}

function startTimer(duration) {
    var timer = duration, minutes, seconds;
    var t = setInterval(function () {
        minutes = parseInt(timer / 60, 10)
        seconds = parseInt(timer % 60, 10);
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        game.timer = minutes + ":" + seconds;
        if (--timer < 0 || game.gameEnded) {
            clearInterval(t);
            endGame();
        }
    }, 1000);
}

function newGame() {
    currentPosition = initPos;
    pathUser = [initPos];
    game.mushrooms = [];
    currentPosition = { column: 0, row: 0 };
    game.gameEnded = false;
    // timer
    startTimer(game.nbRows);
    // generate random mushrooms
    for (var i = 0; i < game.nbMushrooms; i++) {
        var rand;
        do { // Not on Mario or Peach
            rand = { column: getRandomIntInclusive(0, game.nbCols - 1), row: getRandomIntInclusive(0, game.nbRows - 1) };
        } while ((rand.column == game.nbCols - 1 && rand.row == game.nbRows - 1) || (rand.column == 0 && rand.row == 0))
        game.mushrooms.push({ column: rand.column, row: rand.row });
    }
    // remove duplicates
    game.mushrooms = game.mushrooms.filter(function (e, i, self) {
        return self.findIndex(function (p) {
            return p.row === e.row && p.column === e.column;
        }) === i;
    })
    mushroomsCopy = game.mushrooms;
    // canvas
    var canvas = document.getElementById('canvas');
    canvas.width = game.kPixelWidth;
    canvas.height = game.kPixelHeight;
    var context = canvas.getContext("2d");
    gContext = context;
    drawBoard();
}

function WindowLoad(event) {
    newGame();
}        