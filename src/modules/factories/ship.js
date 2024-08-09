class Ship {
  constructor(shipName, shipLength) {
    this.name = shipName;
    this.length = shipLength;
    this.timesHit = 0;
    this.isSunk = false;
    this.isFound = false;
  }

  // getters
  getName() {
    return this.name;
  }

  getFound() {
    return this.isFound;
  }

  getSunk() {
    return this.isSunk;
  }

  getLength() {
    return this.length;
  }

  // methods

  found() {
    this.isFound = true;
  }

  hit() {
    this.timesHit += 1;
    if (this.timesHit === this.length) {
      this.sink();  // fixed method name from `sunk` to `sink`
    }
  }

  sink() {  // fixed method name from `sunk` to `sink`
    this.isSunk = true;
  }

  toggleFound() {
    this.isFound = !this.isFound;  // fixed to toggle the found state correctly
  }
}

module.exports = Ship;
