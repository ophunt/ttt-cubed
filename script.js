"use strict";
let game = {
    turn: 1,
};

const sizes = [150, 500];
const margins = [5, 25];
const pts = [1, 3];
const radii = [10 * Math.SQRT2, (100 / 3) * Math.SQRT2];

function setup() {
    console.log("loading");
    const leftBoard = document.getElementById("left-board");
    const rightBoard = document.getElementById("right-board");
    const lctx = leftBoard.getContext("2d");
    const rctx = rightBoard.getContext("2d");

    game.board = new Board(2);

    return [lctx, rctx];
}

function draw(ctxs) {
    const [lctx, rctx] = ctxs;
    game.board.draw(lctx, 1, [0, 0]);
    game.board.board[0][0].draw(rctx, 0, [0, 0]);
}

function drawLine(ctx, p1, p2) {
    ctx.beginPath();
    ctx.moveTo(...p1);
    ctx.lineTo(...p2);
    ctx.stroke();
}

function drawItem(ctx, p, r, pt, e) {
    if (e === 1) {
        // x
        drawX(ctx, p, r, pt);
    } else if (e === 2) {
        // o
        drawO(ctx, p, r, pt);
    }
}

function drawO(ctx, p, r, pt) {
    ctx.strokeStyle = "blue";
    ctx.lineWidth = pt;
    ctx.beginPath();
    ctx.arc(p[0], p[1], r, 0, 2 * Math.PI);
    ctx.stroke();
}

function drawX(ctx, p, r, pt) {
    ctx.strokeStyle = "red";
    ctx.lineWidth = pt;
    const [x1, x2] = [p[0] - r, p[0] + r];
    const [y1, y2] = [p[1] - r, p[1] + r];
    drawLine(ctx, [x1, y1], [x2, y2]);
    drawLine(ctx, [x1, y2], [x2, y1]);
}

class Board {
    // 0 = none, 1 = x, 2 = o
    constructor(depth) {
        this.winner = Math.ceil(Math.random() - 0.5)+1;
        this.depth = depth;

        if (depth === 0) {
            this.board = [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
            ];
        } else {
            this.board = [
                [new Board(depth - 1), new Board(depth - 1), new Board(depth - 1)],
                [new Board(depth - 1), new Board(depth - 1), new Board(depth - 1)],
                [new Board(depth - 1), new Board(depth - 1), new Board(depth - 1)],
            ];
        }
    }

    draw(ctx, isL, topLeft) {
        // Get size, margin, and pt
        let size = sizes[this.depth - isL];
        const m = margins[this.depth - isL];
        const pt = pts[this.depth - isL];
        const radius = radii[this.depth - isL];

        // Set up stroke style
        ctx.strokeStyle = "black";
        ctx.lineWidth = pt;

        // Calculate line locations
        size -= 2 * m;
        const [x, y] = topLeft;
        const [l1x, l2x] = [x + m + size / 3, x + m + (2 * size) / 3];
        const [l1y, l2y] = [y + m + size / 3, y + m + (2 * size) / 3];

        // Draw board lines
        drawLine(ctx, [x + m, l1y], [x + m + size, l1y]);
        drawLine(ctx, [x + m, l2y], [x + m + size, l2y]);
        drawLine(ctx, [l1x, y + m], [l1x, y + m + size]);
        drawLine(ctx, [l2x, y + m], [l2x, y + m + size]);

        // If not the lowest depth, draw lower down boards
        if (this.depth !== 0 && !(isL && this.depth === 1)) {
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    const newSize = sizes[this.depth - isL - 1];
                    const newX = x + m + c * newSize;
                    const newY = y + m + r * newSize;
                    this.board[r][c].draw(ctx, isL, [newX, newY]);
                }
            }
        }

        // Draw x's and o's
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                let e;
                if (this.depth === 0) {
                    e = this.board[r][c];
                } else {
                    e = this.board[r][c].winner;
                    if (e === 0) continue;
                }

                const s = (size) / 6;
                const newPos = [x + m + (2*c + 1) * s, y + m + (2*r + 1) * s];
                drawItem(ctx, newPos, radius, pt, e);
            }
        }
    }

    play(player, coords) {
        if (coords.length !== this.depth + 1) {
            console.error(
                `invalid amount of row-cols passed to board, got ${coords.length}, expected ${this.depth + 1}`
            );
        }

        const [r, c] = coords[0];
        if (this.depth === 0) {
            this.board[r][c] = player;
        } else {
            this.board[r][c].play(player, coords.slice(1));
        }
    }
}

function main() {
    const [lctx, rctx] = setup();
    draw([lctx, rctx]);
}

main();
