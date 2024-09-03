class Ship {
  constructor(shipName, shipLength) {
    this.name = shipName;
    this.length = shipLength;
    this.hits = 0;
    this.isSunk = false;
    this.isFound = false;
  }

  // Getters
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
  
  getHits() {
    return this.hits;
  }

  // Setters
  setName(newName) {
    this.name = newName;
  }

  setFound(newFound) {
    this.isFound = newFound;
  }

  setSunk(newSunk) {
    this.isSunk = newSunk;
  }

  setLength(newLength) {
    this.length = newLength;
  }

  setHits(newHits) {
    this.hits = newHits;
  }

  // Methods
  hit() {
    this.hits += 1;
    if (this.hits === this.length) {
      this.sink(); 
    }
  }

  sink() {
    this.isSunk = true;
  }

  toggleFound() {
    this.isFound = !this.isFound; 
  }

  resetFound() {
    this.isFound = false;
  }

  found() {
    this.isFound = true;
  }
}

export default Ship;