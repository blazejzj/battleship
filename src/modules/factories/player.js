import Gameboard from "./gameBoard";
import Ship from "./ship";

class Player {
    constructor(playerAlias, playerType) {
        this.alias = playerAlias;
        this.type = playerType; // Playertype -> human or computer
        this.grid = new Gameboard(); // initialize a new gameboard
        this.attackQueue = [];
        this.moves = 0;
    }

    // Getters

    getAlias() {
        return this.alias;
    }

    getGrid() {
        return this.grid;
    }

    getType() {
        return this.type;
    }

    // Setters

    setAlias(newAlias) {
        this.alias = newAlias;
    }

    // Methods
    isFieldEmpty(coordinate) {
        const [x, y] = coordinate;
        return (
            this.getGrid().getBoard()[x][y] !== "miss" &&
            this.getGrid().getBoard()[x][y] !== "hit"
        );
    }

    hasLost() {
        return this.getGrid()
            .getFleet()
            .every((ship) => ship.getSunk() === true);
    }

    autoPosition() {
        const ships = [
            { name: "carrier", length: 5 },
            { name: "battleship", length: 4 },
            { name: "cruiser", length: 3 },
            { name: "submarine", length: 3 },
            { name: "destroyer", length: 2 },
        ];

        ships.forEach((ship) => {
            let placed = false;

            while (!placed) {
                const direction = this.randomDirection();
                const row = this.randomCoordinate();
                const col = this.randomCoordinate();
                const currentShip = new Ship(ship.name, ship.length);

                if (direction === "x") {
                    placed = this.getGrid().placeX(currentShip, [row, col]);
                } else {
                    placed = this.getGrid().placeY(currentShip, [row, col]);
                }
            }
        });
    }

    computerTurn() {
        let invalidMove = true;
        let x;
        let y;

        while (invalidMove) {
            if (this.attackQueue.length > 1)
                [x, y] = this.getRandomAndRemove(this.attackQueue);
            else {
                x = this.randomCoordinate();
                y = this.randomCoordinate();
            }
            if (this.isFieldEmpty([x, y])) {
                invalidMove = false;
                this.getGrid().receiveAttack([x, y]);
            }
        }

        this.populateQueue(x, y);
        this.moves++;
        return [x, y];
    }

    populateQueue(row, col) {
        if (this.attackQueue.length === 1) {
            this.attackQueue = [];
        }

        if (this.getGrid().getBoard()[row][col] === "miss") {
            return;
        }

        let initial = false;

        if (this.attackQueue.length === 0) {
            this.attackQueue.push([row, col]);
            initial = true;
        }

        // Add adjacent fields to the queue
        const adjacentFields = [
            [row - 1, col], // above
            [row + 1, col], // below
            [row, col - 1], // left
            [row, col + 1], // right
        ];

        adjacentFields.forEach(([r, c]) => {
            if (r >= 0 && r <= 9 && c >= 0 && c <= 9) {
                this.attackQueue.push([r, c]);
            }
        });

        // Filter the queue to keep only the fields that are in the same row or column as the first hit
        if (this.attackQueue.length > 1 && !initial) {
            const [firstRow, firstCol] = this.attackQueue[0];
            if (row === firstRow) {
                this.attackQueue = [
                    this.attackQueue[0],
                    ...this.attackQueue.slice(1).filter(([r]) => r === row),
                ];
            } else if (col === firstCol) {
                this.attackQueue = [
                    this.attackQueue[0],
                    ...this.attackQueue.slice(1).filter(([, c]) => c === col),
                ];
            }
        }
    }

    playTurn(coordinate) {
        const [x, y] = coordinate;
        if (this.isFieldEmpty([x, y])) {
            this.getGrid().receiveAttack([x, y]);
            this.moves++;
        }
    }

    randomCoordinate() {
        return Math.floor(Math.random() * (9 + 1));
    }

    randomDirection() {
        const directions = ["x", "y"];
        return directions[Math.round(Math.random())];
    }

    getRandomAndRemove(array) {
        const randomIndex = Math.floor(Math.random() * (array.length - 1)) + 1;
        const randomElement = array[randomIndex];
        array.splice(randomIndex, 1);
        return randomElement;
    }
}

export default Player;
