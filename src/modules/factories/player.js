import Gameboard from './gameBoard'
import Ship from './ship'

class Player {
  constructor(playerAlias, playerType) {
    this.alias = playerAlias;
    this.type = playerType; // human or ai
    this.grid = new Gameboard();
    this.attackQueue = [];
    this.moves = 0;
  }

  // getters
  getAlias() {
    return this.alias;
  }

  getGrid() {
    return this.grid;
  }

  getType() {
    return this.type;
  }

  // setters
  setAlias(newAlias) {
    this.alias = newAlias;
  }

  // methods
  isFieldEmpty(coordinate) {
    const [x, y] = coordinate;
    // checks if a specific field on the board has already been hit or missed
    return (
      this.getGrid().getBoard()[x][y] !== 'miss' &&
      this.getGrid().getBoard()[x][y] !== 'hit'
    );
  }

  hasLost() {
    return this.getGrid().getFleet().every((ship) => ship.getSunk() === true);
  }

  autoPosition() {
    const ships = ['carrier', 'battleship', 'cruiser', 'submarine', 'destroyer'];
    const lengths = [5, 4, 3, 3, 2]; // corresponding lengths of the ships
  
    while (ships.length) {
      const direction = this.randomDirection();
      const row = this.randomCoordinate();
      const col = this.randomCoordinate();
      let placed = false;

      const currentShip = new Ship(ships[0], lengths[0]);
  
      // try to place the ship on the board based on the chosen direction
      if (direction === 'x') {
        placed = this.getGrid().placeX(currentShip, [row, col]);
      } else {
        placed = this.getGrid().placeY(currentShip, [row, col]);
      }
  
      if (placed) {
        ships.shift();
        lengths.shift();
      }
    }
  }

  computerTurn() {
    let invalidMove = true;
    let x;
    let y;

    // loop until a valid move (not already hit or missed) is found
    while (invalidMove) {
      if (this.attackQueue.length > 1)
        // if there are potential targets in the queue, pick one
        [x, y] = this.getRandomAndRemove(this.attackQueue);
      else {
        // otherwise, choose random coordinates
        x = this.randomCoordinate();
        y = this.randomCoordinate();
      }

      // check if the chosen field hasn't been attacked yet
      if (this.isFieldEmpty([x, y])) {
        invalidMove = false;
        // attack the field on the board
        this.getGrid().receiveAttack([x, y]);
      }
    }

    this.populateQueue(x, y)
    console.log(this.attackQueue);
    this.moves++;
    return [x, y];
  }

  populateQueue(row, col) {
    if (this.attackQueue.length === 1) {
      this.attackQueue = [];
    };

    if (this.getGrid().getBoard()[row][col] === 'miss') {
        return
    };

    let initial = false;

    if (this.attackQueue.length === 0) {
      this.attackQueue.push([row, col]);
      initial = true;
    };

    // add adjacent fields to the queue
    if (row > 0 && row <= 9) {
      this.attackQueue.push([row - 1, col]); // add field above
    };

    if (row >= 0 && row < 9) {
      this.attackQueue.push([row + 1, col]); // add field below
    };

    if (col > 0 && col <= 9) {
      this.attackQueue.push([row, col - 1]); // add field to the left
    };

    if (col >= 0 && col < 9) {
      this.attackQueue.push([row, col + 1]); // add field to the right
    };

    // filter the queue to keep only the fields that are in the same row or column as the first hit
    if (this.attackQueue.length > 1 && !initial) {
      if (row === this.attackQueue[0][0]) {
        this.attackQueue = [
          ...this.attackQueue.slice(0, 1),
          ...this.attackQueue.slice(1).filter((subArr) => subArr[0] === row),
        ]
      } else if (col === this.attackQueue[0][1]) {
        this.attackQueue = [
          ...this.attackQueue.slice(0, 1),
          ...this.attackQueue.slice(1).filter((subArr) => subArr[1] === col),
        ];
      };
    };
  };

  playTurn(coordinate) {
    const [x, y] = coordinate;
    if (this.isFieldEmpty([x, y])) {
      this.getGrid().receiveAttack([x, y]);
      this.moves++;
    };
  }

  randomCoordinate() {
    return Math.floor(Math.random() * (9 + 1));
  }

  randomDirection() {
    const directions = ['x', 'y'];
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
