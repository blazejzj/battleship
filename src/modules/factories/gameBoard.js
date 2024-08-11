import Ship from './ship';

class gameBoard {
  constructor() {
    this.board = new Array(10).fill('x').map(() => new Array(10).fill('x'));
    this.shipOnDrag = { name: '', length: 0 };
    this.fleet = [];
    this.axis = 'X';
  }

  // getters
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

  // setters
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

  // methods
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
  }


  setFleetEmpty() {
    this.fleet = [];
  }

  placeX(ship, start) {
    let shipLength = ship.getLength();
    const [x, y] = start;
    const shipPlacement = [];

    if (this.isOutOfBounds(shipLength, this.board.length, y)) return false;

    for (let j = y; j < this.board.length; j++) {
      if (this.board[x][j] !== 'x') return false;

      shipPlacement.push([x, j]);
      shipLength -= 1;
      if (shipLength === 0) break;
    }

    shipPlacement.forEach(([i, j]) => {
      this.board[i][j] = `${ship.getName()}X`;
    });

    this.addToFleet(ship);

    return true;
  }

  placeY(ship, start) {
    let shipLength = ship.getLength();
    const [x, y] = start;
    const shipPlacement = [];

    if (this.isOutOfBounds(shipLength, this.board.length, x)) return false;

    for (let i = x; i < this.board.length; i++) {
      if (this.board[i][y] !== 'x') return false;

      shipPlacement.push([i, y]);
      shipLength -= 1;
      if (shipLength === 0) break;
    }

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
    return this.fleet.length === 5;
  }

  isEveryShipSunk() {
    return this.fleet.every(ship => ship.getSunk());
  }
}

export default gameBoard;