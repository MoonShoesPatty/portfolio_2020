// ==================================
//  Init
// ==================================
var SQUARE = 25;
var MARGIN = 0;
var SQUARE_SIZE = SQUARE + MARGIN;
var container = $('#splash-container');
var squaresArray = [[]];
var rowsArray = [];
var colorsArray = {
    base: 'rgba(255, 255, 255, 0.01)',
    hover: 'rgba(255, 255, 255, 0.2)',
    hoverfade01: 'rgba(255, 255, 255, 0.1)',
    hoverfade02: 'rgba(255, 255, 255, 0.05)',
    drawColor: '#12B4E9'
};
function init() {
    initListeners();
    createSquares();
}
// ==================================
//  Document Listeners
// ==================================
document.addEventListener('DOMContentLoaded', function () {
    init();
});
window.addEventListener('resize', function () {
    container.empty();
    createSquares();
});
function initListeners() {
    document.addEventListener('mousemove', function (e) {
        if (squaresArray[Math.floor(e.clientY / SQUARE_SIZE)] != null && squaresArray[Math.floor(e.clientY / SQUARE_SIZE)][Math.floor(e.clientX / SQUARE_SIZE)] != null)
            squaresArray[Math.floor(e.clientY / SQUARE_SIZE)][Math.floor(e.clientX / SQUARE_SIZE)].hoverHandler();
    });
}
// ==================================
//  Build Functions
// ==================================
function createSquares() {
    var canvasWidth = window.innerWidth;
    var canvasHeight = window.innerHeight;
    var sqsPerRow = Math.ceil(canvasWidth / SQUARE_SIZE);
    var sqsPerCol = Math.ceil(canvasHeight / SQUARE_SIZE);
    // Draw each row
    for (var i = 0; i < sqsPerCol; i++) {
        squaresArray[i] = [];
        var rowContainer = $('<div class="squaresRow"></div>').appendTo(container);
        // rowContainer.width(sqsPerRow * SQUARE_SIZE);
        rowsArray[i] = rowContainer;
        // Fill the row with squares
        for (var j = 0; j < sqsPerRow; j++) {
            var coords = { x: i, y: j };
            var square = new Square(rowContainer, coords);
            squaresArray[i][j] = square;
        }
    }
}
var Square = /** @class */ (function () {
    function Square(container, coords) {
        this.container = container;
        this.coords = coords;
        this.revertToColor = colorsArray.base;
        this.square = $('<div class="square" data-row="' + this.coords.x + '" data-col="' + this.coords.y + '"></div>').appendTo(this.container);
        this.square.css('backgroundColor', colorsArray.base);
        this.color = colorsArray.base;
    }
    // ===========================================
    //  COLOR CHANGES
    // ===========================================
    Square.prototype.hoverHandler = function () {
        var colorChangeTo = colorsArray.hover;
        colorChangeTo = colorsArray.hover;
        var temporary = true;
        this.hoverAdjeacentHandler(this.coords);
        this.changeColor(colorChangeTo, temporary, colorsArray.base);
    };
    Square.prototype.changeColor = function (colorToChangeTo, temporary, fadeColorBackTo) {
        var __this = this;
        // If color is bolder than the current color, change to the new bolder one
        if (!temporary || colorToChangeTo == colorsArray.hover ||
            (colorToChangeTo == colorsArray.hoverfade01 && this.color != colorsArray.hover) ||
            (colorToChangeTo == colorsArray.hoverfade02 && this.color != colorsArray.hover && this.color != colorsArray.hoverfade01)) {
            this.square.css('backgroundColor', colorToChangeTo);
            this.color = colorToChangeTo;
        }
        this.revertToColor = fadeColorBackTo;
        if (temporary) {
            clearTimeout(this.timeoutFunction);
            this.timeoutFunction = setTimeout(function () {
                __this.changeColor(__this.revertToColor, false);
                __this.timeoutFunction = null;
            }, 750);
        }
    };
    // HANDLERS
    Square.prototype.hoverAdjeacentHandler = function (coords) {
        for (var i = -1; i < 2; i += 2) {
            // Right & Left (loop iterates twice with -1 and +1)
            if (squaresArray[coords.x + i] != null) {
                squaresArray[coords.x + i][coords.y].changeColor(colorsArray.hoverfade01, true, colorsArray.base);
            }
            // Above & Below
            if (squaresArray[coords.x][coords.y + i] != null) {
                squaresArray[coords.x][coords.y + i].changeColor(colorsArray.hoverfade01, true, colorsArray.base);
            }
            for (var j = -1; j < 2; j += 2) {
                if (squaresArray[coords.x + i] != null) {
                    if (squaresArray[coords.x + i][coords.y + j] != null) {
                        squaresArray[coords.x + i][coords.y + j].changeColor(colorsArray.hoverfade02, true, colorsArray.base);
                    }
                }
            }
        }
    };
    return Square;
}());
