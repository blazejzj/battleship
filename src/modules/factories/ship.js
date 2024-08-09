class Ship {
  constructor(shipName, shipLength) {
    this.name = shipName;
    this.length = shipLength;
    this.hits = 0;
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
  
  getHits() {
    return this.hits;
  }


  // methods

  found() {
    this.isFound = true;
  }

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
}

module.exports = Ship;
