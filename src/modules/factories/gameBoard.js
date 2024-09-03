import Ship from './ship';

class gameBoard {
  constructor() {
    this.board = new Array(10).fill('x').map(() => new Array(10).fill('x'));
    this.shipOnDrag = { name: '', length: 0 };
    this.fleet = [];
    this.axis = 'X';
  }

  // Getters
  getBoard() {
    return this.board;
  }

  getFleet() {
    return this.fleet;
  }

  getAxis() {
    return this.axis;
  }

  getShipOnDrag() {
    return this.shipOnDrag;
  }

  getShip(shipName) {
    return this.fleet.find(ship => ship.getName() === shipName);
  }

  // Setters
  setAxisX() {
    this.axis = 'X';
  }

  setAxisY() {
    this.axis = 'Y';
  }

  setShipOnDrag(shipInfoObj) {
    this.shipOnDrag.name = shipInfoObj.name;
    this.shipOnDrag.length = shipInfoObj.length;
  }

  setAllShipsNotFound() {
    this.fleet.forEach(ship => ship.resetFound());
  }

  addToFleet(ship) {
    let newShip;
    switch (ship.getName()) {
      case 'carrier':
        newShip = new Ship('carrier', 5);
        break;
      case 'battleship':
        newShip = new Ship('battleship', 4);
        break;
      case 'cruiser':
        newShip = new Ship('cruiser', 3);
        break;
      case 'submarine':
        newShip = new Ship('submarine', 3);
        break;
      default:
        newShip = new Ship('destroyer', 2);
    }
    this.fleet.push(newShip);
  };

  setFleetEmpty() {
    this.fleet = [];
  };

  placeX(ship, start) {
    const shipLength = ship.getLength();
    const [x, y] = start;
    const shipPlacement = [];
  
    if (this.isOutOfBounds(shipLength, this.board.length, y)) {
      return false;
    }
  
    // check if ship can be placed
    for (let j = 0; j < shipLength; j++) {
      const currentY = y + j;
      if (currentY >= this.board.length || this.board[x][currentY] !== 'x') {
        return false;
      }
      shipPlacement.push([x, currentY]);
    }
  
    // place ship on board
    shipPlacement.forEach(([i, j]) => {
      this.board[i][j] = `${ship.getName()}X`;
    });
  
    this.addToFleet(ship);
  
    return true;
  }

  placeY(ship, start) {
    const shipLength = ship.getLength();
    const [x, y] = start;
    const shipPlacement = [];
  
    if (this.isOutOfBounds(shipLength, this.board.length, x)) {
      return false;
    }
  
    // check if ship can be placed
    for (let i = 0; i < shipLength; i++) {
      const currentX = x + i;
      if (currentX >= this.board.length || this.board[currentX][y] !== 'x') {
        return false;
      }
      shipPlacement.push([currentX, y]);
    }
  
    // place ship on board
    shipPlacement.forEach(([i, j]) => {
      this.board[i][j] = `${ship.getName()}Y`;
    });
  
    this.addToFleet(ship);
  
    return true;
  }

  isOutOfBounds(shipLength, boardLength, field) {
    return shipLength > boardLength - field;
  }

  receiveAttack(coords) {
    const [x, y] = coords;
    this.recordHit(x, y);
  }

  recordHit(x, y) {
    switch (this.board[x][y]) {
      case 'carrierX':
      case 'carrierY':
        this.getShip('carrier').hit();
        break;
      case 'battleshipX':
      case 'battleshipY':
        this.getShip('battleship').hit();
        break;
      case 'cruiserX':
      case 'cruiserY':
        this.getShip('cruiser').hit();
        break;
      case 'submarineX':
      case 'submarineY':
        this.getShip('submarine').hit();
        break;
      case 'destroyerX':
      case 'destroyerY':
        this.getShip('destroyer').hit();
        break;
      default:
        this.board[x][y] = 'miss';
    }
  }

  areAllShipsFound() {
    return this.fleet.length === 5; // 5 ships total in the fleet at start
  }

  isEveryShipSunk() {
    return this.fleet.every(ship => ship.getSunk()); 
  }
}

export default gameBoard;