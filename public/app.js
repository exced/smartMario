Vue.config.debug = true;

var initPos = { column: 0, row: 0 };
var currentPosition = initPos;
var mushroomsCopy = [];
var pathUser = [initPos];
var gContext;
var height = screen.availHeight;
// init
var nRows = 5;
var nCols = 5;
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
        nbMushrooms: 8,
        mushrooms: [],
        kPieceWidth: kPW,
        kPieceHeight: kPH,
        kPixelWidth: kPiW,
        kPixelHeight: kPiH,
        timer: '',
        gameEnded: false,
        robotMushrooms: 0,
        pathAlgo: 'brute'
    },
    computed: {                        
    },
    methods: {
        score: function() {
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
        },
        updateGrid: function() {
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
        mushroomsCopy.filter(function(e){
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
    .map(function(pos) {
        gContext.fillStyle = 'rgba(71,156,242,0.5)';
        var x = (pos.column * game.kPieceWidth);
        var y = (pos.row * game.kPieceHeight);        
        gContext.fillRect(x, y, game.kPieceWidth, game.kPieceHeight);
    });
    /* pathRobot */
    var best;
    if (game.pathAlgo === 'brute') {
        best = bruteforce();
    }
    if (game.pathAlgo === 'bfs') {
        best = search('bfs');
    }    
    if (game.pathAlgo === 'dfs') {
        best = search('dfs');
    }        
    /* score */
    var robotScore = 0;
    best
    .map(function(e1, i1, arr1){
        mushroomsCopy
        .map(function(e2, i2, arr2){
            if (e2.column == e1.column && e2.row == e1.row) {
                robotScore++;
            }
        })
    })
    game.robotMushrooms = robotScore;
    /* path */
    best
    .map(function(pos) {
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
        var newPosition = {column: currentPosition.column, row: currentPosition.row};
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

function search(strat) {
    var path = [];
    var maxLength = Math.max(game.nbCols, game.nbRows);
    var temp;
    var max = 0;
    var borders = [];
    var border = [];
    for (var k = 0; k <= 2 * (maxLength - 1); ++k) {
        temp = [];
        for (var y = game.nbCols - 1; y >= 0; --y) {
            var x = k - y;
            if (x >= 0 && x < game.nbRows) {
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
    if (strat === 'dfs') {
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
    }
    if (strat === 'bfs') {
        console.log('BFS todo');
    }    
    return path;
}

/*
 * path from e1 to e2
 */
function microPath(e1, e2) {
    var path = [];
    for (var i = 1; i <= e2.column-e1.column; i++) {
        path.push({column:e1.column+i, row:e1.row});
    }
    for (var i = 1; i <= e2.row-e1.row; i++) {
        path.push({column:e2.column, row:e1.row+i});
    }
    return path;
}

/*
 * biggest path with movements constraints : Down and Right
 */
function possibleLength(arr) {
    if (arr.length <= 1) {
        return 1;
    }
    for (var i = 1; i < arr.length; i++) {
        if (!(arr[i].column >= arr[i-1].column && arr[i].row >= arr[i-1].row)) {
            return i;
        }
    }
    return arr.length;
}

function permutate(arr) {
    return arr
    .reduce(function permute(res, item, key, arr) {
        return res.concat(arr.length > 1 && arr.slice(0, key).concat(arr.slice(key + 1))
            .reduce(permute, [])
            .map(function(perm) {
                return [item].concat(perm);
        }) || item);
    }, []);
}

function bruteforce() {
    var path = [{column:0, row:0}];
    var max = {length: 0, path: []};
    var perm = permutate(mushroomsCopy);
    for (var i = 0; i < perm.length; i++) {
        var pLength = possibleLength(perm[i]);
        if (pLength == perm[i].length) {
            max = {length: pLength, path: perm[i]};
            break;
        }
        if (pLength > max.length) {
            max = {length: pLength, path: perm[i].slice(0,pLength)};
        }
    }
    game.robotMushrooms = max.length;
    var curr = path[0];
    for (var i = 0; i < max.length; i++) {
        path.push(microPath(curr, max.path[i]));
        curr = max.path[i];
    }
    path.push(microPath(curr, {column:game.nbCols-1, row:game.nbRows-1}));
    return [].concat(...path);
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
            rand = {column: getRandomIntInclusive(0, game.nbCols - 1), row: getRandomIntInclusive(0, game.nbRows - 1)};  
        } while ((rand.column == game.nbCols-1 && rand.row == game.nbRows-1) || (rand.column == 0 && rand.row == 0))
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
    canvas.width = game.kPixelWidth;
    canvas.height = game.kPixelHeight;
    var context = canvas.getContext("2d");
    gContext = context;

    drawBoard(); 
}

function WindowLoad(event) {
    newGame();
}        