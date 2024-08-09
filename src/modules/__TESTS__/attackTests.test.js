const Ship = require('../factories/ship');
const GameBoard = require('../factories/gameBoard');

// Initialize the game board
const board = new GameBoard();

// Create new Ship instances directly
const carrier = new Ship('carrier', 5);
const battleship = new Ship('battleship', 4);
const cruiser = new Ship('cruiser', 3);
const submarine = new Ship('submarine', 3);
const destroyer = new Ship('destroyer', 2);

// Place ships on the board
board.placeX(carrier, [0, 0]);
board.placeX(battleship, [2, 0]);
board.placeX(cruiser, [3, 3]);
board.placeY(submarine, [7, 9]);
board.placeX(destroyer, [4, 2]);

describe('GameBoard attack handling', () => {
  test('should sink the carrier', () => {
    board.receiveAttack([0, 0]);
    board.receiveAttack([0, 1]);
    board.receiveAttack([0, 2]);
    board.receiveAttack([0, 3]);
    board.receiveAttack([0, 4]);

    expect(board.getShip('carrier').getHits()).toBe(5);
    expect(board.getShip('carrier').getSunk()).toBe(true);
  });

  test('should hit the battleship at its tail', () => {
    board.receiveAttack([2, 3]);
    expect(board.getShip('battleship').getHits()).toBe(1);
  });

  test('should hit the cruiser twice', () => {
    board.receiveAttack([3, 4]);
    board.receiveAttack([3, 5]);
    expect(board.getShip('cruiser').getHits()).toBe(2);
  });

  test('should hit the submarine in the middle', () => {
    board.receiveAttack([8, 9]);
    expect(board.getShip('submarine').getHits()).toBe(1);
  });

  test('should sink the destroyer', () => {
    board.receiveAttack([4, 2]);
    board.receiveAttack([4, 3]);

    expect(board.getShip('destroyer').getHits()).toBe(2);
    expect(board.getShip('destroyer').getSunk()).toBe(true);
  });

  test('should mark a miss in the middle of the board', () => {
    board.receiveAttack([4, 4]);
    expect(board.getBoard()[4][4]).toBe('miss');
  });
});

describe('GameBoard complete fleet handling', () => {
  test('should sink all ships', () => {
    // CARRIER SUNK
    board.receiveAttack([0, 0]);
    board.receiveAttack([0, 1]);
    board.receiveAttack([0, 2]);
    board.receiveAttack([0, 3]);
    board.receiveAttack([0, 4]);

    // BATTLESHIP SUNK
    board.receiveAttack([2, 0]);
    board.receiveAttack([2, 1]);
    board.receiveAttack([2, 2]);
    board.receiveAttack([2, 3]);

    // CRUISER SUNK
    board.receiveAttack([3, 3]);
    board.receiveAttack([3, 4]);
    board.receiveAttack([3, 5]);

    // SUBMARINE SUNK
    board.receiveAttack([7, 9]);
    board.receiveAttack([8, 9]);
    board.receiveAttack([9, 9]);

    // DESTROYER SUNK
    board.receiveAttack([4, 2]);
    board.receiveAttack([4, 3]);

    expect(board.isEveryShipSunk()).toBe(true);
  });
});
