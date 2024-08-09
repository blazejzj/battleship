const Ship = require('../factories/ship'); 

describe('Ship Class', () => {
  let ship;

  beforeEach(() => {
    ship = new Ship('Battleship', 4);
  });

  test('should correctly set the name and length of the ship', () => {
    expect(ship.getName()).toBe('Battleship');
    expect(ship.getLength()).toBe(4);
  });

  test('should initialize with zero hits and not sunk', () => {
    expect(ship.getSunk()).toBe(false);
  });

  test('should correctly handle hits and sink the ship when appropriate', () => {
    ship.hit();
    expect(ship.getSunk()).toBe(false);

    ship.hit();
    ship.hit();
    ship.hit();
    expect(ship.getSunk()).toBe(true);
  });

  test('should correctly mark the ship as found', () => {
    expect(ship.getFound()).toBe(false);
    ship.found();
    expect(ship.getFound()).toBe(true);
  });

  test('should toggle the found status of the ship', () => {
    ship.found();
    expect(ship.getFound()).toBe(true);
    ship.toggleFound();
    expect(ship.getFound()).toBe(false);
  });

  test('should not sink the ship if hits are less than its length', () => {
    ship.hit();
    ship.hit();
    expect(ship.getSunk()).toBe(false);
  });

  test('should sink the ship if hits are equal to its length', () => {
    for (let i = 0; i < ship.getLength(); i++) {
      ship.hit();
    }
    expect(ship.getSunk()).toBe(true);
  });

  test('should not exceed the ship length on hits', () => {
    for (let i = 0; i < 10; i++) {
      ship.hit();
    }
    expect(ship.getSunk()).toBe(true);
  });
});
