const game = {
    /*
     * 0: waiting for new game start
     * 1: in game
     * 2: waiting for new round start
     * 3: game over
     */
    status: 0,

    round: 0,
    snake: null,
    historySnakes: [],
    roundScore: 0,
    gameScore: 0,

    ctx: null,
    width: 800,
    height: 600,
    gridSize: 20,

    roundFrames: 0
};
game.gridWidth = game.width / game.gridSize;
game.gridHeight = game.height / game.gridSize;

init();

function init() {
    var canvas = document.getElementById('main');
    canvas.width = game.width;
    canvas.height = game.height;
    game.ctx = canvas.getContext('2d');

    document.addEventListener('keydown', onKeydown);

    newGame();
    newRound();
}

function newGame() {
    game.gameScore = 0;
    game.status = 1;
}

function newRound() {
    ++game.round;
    game.roundScore = 0;
    game.roundFrames = 0;

    var pos = getRandomPos();
    game.snake = new Snake(pos[0], pos[1], 3, 1 / 16);
    setFood();

    game.status = 1;

    tick();
}

function tick() {
    if (game.status !== 1) {
        return;
    }

    game.snake.tick();

    if (game.snake.checkCollision(game.gridWidth, game.gridHeight, game.historySnakes)) {
        game.status = 2;
        console.log('collision');

        game.historySnakes.push(game.snake.getHistory());

        setTimeout(function () {
            newRound();
        }, 3000);

        return;
    }

    if (game.snake.checkEat()) {
        ++game.gameScore;
        ++game.roundScore;
        console.log('eat!', game.gameScore);

        if (game.roundScore % 2 === 0) {
            game.snake.speedUp();
        }
        setFood();
        console.log(game.snake.food);
    }

    game.ctx.clearRect(0, 0, game.width, game.height);
    renderHistorySnakes();
    game.snake.render(game.ctx, game.gridSize);

    requestAnimationFrame(tick);
}

function renderHistorySnakes() {
    var ctx = game.ctx;
    ctx.fillStyle = 'rgba(255,0,0,0.3)';

    var frame = game.snake.totalFrames;
    for (var h = 0; h < game.historySnakes.length; ++h) {
        var history = game.historySnakes[h];
        var keys = history.keys;
        var lastFrame;
        for (var i = 1; i < keys.length; ++i) {
            if (keys[i] > frame) {
                lastFrame = history.items[keys[i - 1]];
                break;
            }
        }
        if (lastFrame) {
            renderList(game.ctx, lastFrame, game.gridSize);
        }
    }
}

function onKeydown(event) {
    var direction;
    if (event.keyCode > 36 && event.keyCode < 41) {
        // left, top, right, bottom
        direction = event.keyCode - 37;
    }
    else if (event.keyCode === 65) { // a
        direction = 0;
    }
    else if (event.keyCode === 87) { // w
        direction = 1;
    }
    else if (event.keyCode === 68) { // d
        direction = 2;
    }
    else if (event.keyCode === 88) { // s
        direction = 3;
    }
    if (direction !== null && Math.abs(direction - game.snake.direction) !== 2) {
        game.snake.direction = direction;
    }
}

function setFood() {
    game.snake.food = [getRandomPos()];
}

function getRandomPos() {
    return [
        Math.floor(Math.random() * game.gridWidth),
        Math.floor(Math.random() * game.gridHeight)
    ];
}