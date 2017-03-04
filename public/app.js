// board description
var nbRows = 3;
var nbCols = nbRows; // squared grid : n x n
var kPieceWidth = ~~((screen.availHeight - 250) / nbCols);
var kPieceHeight = ~~((screen.availHeight - 250) / nbRows);
var kPixelWidth = 1 + (nbRows * kPieceWidth);
var kPixelHeight = 1 + (nbCols * kPieceHeight);
// characters positions
var initPos = { column: 0, row: 0 };
var currentPosition = initPos;
var nbMushrooms = 3;
var mushroomsCopy = [];
var pathUser = [initPos];
var gContext;

var game = new Vue({
    el: '#scores',
    data: {
        mushrooms: [],
        timer: '',
        gameEnded: false,
        robotMushrooms: 0
    },
    computed: {                        
    },
    methods: {
        nbMushrooms: function() {
            return mushroomsCopy.length - this.mushrooms.length;
        },
        newGame: function() {
            newGame();
        },
        win: function() {
            return this.gameEnded && (mushroomsCopy.length - this.mushrooms.length >= this.robotMushrooms);
        },
        loose: function() {
            return this.gameEnded && !(mushroomsCopy.length - this.mushrooms.length >= this.robotMushrooms);
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
        game.mushrooms
        .map(function (pos) {
            var xMushroom = (pos.column * kPieceWidth);
            var yMushroom = (pos.row * kPieceHeight);
            gContext.drawImage(imgMushroom, xMushroom, yMushroom, kPieceWidth, kPieceHeight)
        })
    }
    imgMushroom.src = "./assets/red.png";
}

function drawResults() {
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
    gContext.strokeStyle = 'black';
    gContext.stroke();   
    /* red mushrooms */
    var imgMushroomR = new Image();
    imgMushroomR.onload = function () {
        game.mushrooms
            .map(function (pos) {
                var xMushroom = (pos.column * kPieceWidth);
                var yMushroom = (pos.row * kPieceHeight);
                gContext.drawImage(imgMushroomR, xMushroom, yMushroom, kPieceWidth, kPieceHeight)
            })
    }
    imgMushroomR.src = "./assets/red.png";
    /* green mushrooms */
    var imgMushroomG = new Image();
    imgMushroomG.onload = function () {
        mushroomsCopy.filter(function(e){
            return game.mushrooms.indexOf(e) < 0;
        })
        .map(function (pos) {
            var xMushroom = (pos.column * kPieceWidth);
            var yMushroom = (pos.row * kPieceHeight);
            gContext.drawImage(imgMushroomG, xMushroom, yMushroom, kPieceWidth, kPieceHeight)
        })
    }
    imgMushroomG.src = "./assets/green.png";       
    /* pathUser */
    pathUser
    .map(function(pos) {
        gContext.fillStyle = 'rgba(71,156,242,0.5)';
        var x = (pos.column * kPieceWidth);
        var y = (pos.row * kPieceHeight);        
        gContext.fillRect(x, y, kPieceWidth, kPieceHeight);
    });
    /* pathRobot */
    var best = bestPath();
    best
    .map(function(pos) {
        gContext.fillStyle = 'rgba(237,3,34,0.5)';
        var x = (pos.column * kPieceWidth);
        var y = (pos.row * kPieceHeight);        
        gContext.fillRect(x, y, kPieceWidth, kPieceHeight);
    });  
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
    gContext.strokeStyle = 'black';
    gContext.stroke();
    drawCharacters(currentPosition);
}

document.addEventListener("keydown", function (e) {
    if (!game.gameEnded) {
        var newPosition = {column: currentPosition.column, row: currentPosition.row};
        if (e.keyCode == 68 || e.keyCode == 39) { // D or Right
            newPosition.column += 1;
        }
        if (e.keyCode == 83 || e.keyCode == 40) { // S or Down
            newPosition.row += 1;
        }     
        if (newPosition.column == nbCols - 1 && newPosition.row == nbRows - 1) { // End of the game
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

function nbAccessible(col, row) {
    var nb = 0;
    mushroomsCopy
    .map(function(e,i,arr){
        if (e.column >= col && e.row >= row) {
            nb++
        }
    })
    return nb;
}

function bestPath() {
    var path = [];
    var maxLength = Math.max(nbCols, nbRows);
    var temp;
    var max = 0;
    var borders = [];
    var border = [];
    for (var k = 0; k <= 2 * (maxLength - 1); ++k) {
        temp = [];
        for (var y = nbCols - 1; y >= 0; --y) {
            var x = k - y;
            if (x >= 0 && x < nbRows) {
                temp.push({data: nbAccessible(x, y), column: x, row: y});
            }
        }
        border = [];
        /* find the max */
        max = temp[0];
        temp
        .map(function(e, i, arr){
            if (e.data > max.data) {
                max = e;
            }
        });
        /* get all max : border */
        temp
        .map(function(e, i, arr){
            if (e.data == max.data) {
                border.push(e);
            }
        });
        borders.push(border);
        max--;
    }
    var locked = borders[0][0];
    path.push(locked);
    borders
    .map(function(e, i, arr){
        for (var i = 0; i < e.length; i++) {
            if (e[i].column >= locked.column && e[i].row >= locked.row) {
                locked = e[i];
                path.push(locked);
                break;
            }
        }
    })
    path.push({column: nbCols-1, row: nbRows-1});
    game.robotMushrooms = path.length;
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
    startTimer(nbRows);

    // generate random mushrooms
    for (var i = 0; i < nbMushrooms; i++) {
        var rand;
        do { // Not on Mario or Peach
            rand = {column: getRandomIntInclusive(0, nbCols - 1), row: getRandomIntInclusive(0, nbRows - 1)};  
        } while ((rand.column == nbCols-1 && rand.row == nbRows-1) || (rand.column == 0 && rand.row == 0))
        game.mushrooms.push({column: rand.column, row: rand.row});
    }
    // remove duplicates
    game.mushrooms = game.mushrooms.filter(function(e,i,self){
        return self.findIndex(function(p){
            return p.row === e.row && p.column === e.column; 
        }) === i;
    })
    mushroomsCopy = game.mushrooms;

    var canvas = document.getElementById('canvas');
    canvas.width = kPixelWidth;
    canvas.height = kPixelHeight;
    var context = canvas.getContext("2d");
    gContext = context;

    drawBoard(); 
}

function WindowLoad(event) {
    newGame();
}        