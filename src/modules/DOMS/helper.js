class Helper {

    constructor() {
        this.BOARD_SIZE = 10;
    }

    clearContent() {
      const app = document.getElementById('app');
      app.replaceChildren('');
    };
  
    getHeader(className) {
      const header = document.createElement('header');
      header.classList.add('header', `${className}`);
  
      const title = document.createElement('h1');
      title.textContent = 'BATTLESHIP';
  
      header.appendChild(title);
  
      return header;
    }
  
    createMap(description) {
      const map = document.createElement('div');
      map.id = `board-${description}`;
      map.classList.add('board', description);
  
      map.appendChild(this.createLettersSection());
      map.appendChild(this.createNumbersSection());
      map.appendChild(this.createBoard(description));
  
      return map;
    };
  
    createLettersSection() {
      const letterContainer = document.createElement('div')
      letterContainer.classList = 'letter-container';
      const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  
      letters.forEach((element) => {
        const letter = document.createElement('div');
        letter.className = 'letter';
        letter.textContent = element;
        letterContainer.appendChild(letter);
      });
  
      return letterContainer;
    };
  
    createNumbersSection() {
      const numberContainer = document.createElement('div');
      numberContainer.id = 'number-container';
      numberContainer.classList = 'number-container';
      const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  
      numbers.forEach((element) => {
        const number = document.createElement('div');
        number.classList = 'number';
        number.textContent = element;
        numberContainer.appendChild(number);
      });
  
      return numberContainer;
    };
  
    createBoard(description) {
      const board = document.createElement('div');
      board.id = `field-container-${description}`;
      board.className = `field-container`;

      const boardSize = this.BOARD_SIZE;

      for (let i = 0; i < boardSize; i += 1) {
        console.log("ROW NR: ", i);
        for (let j = 0; j < boardSize; j += 1) {
          console.log("FIELD NR: ", i * boardSize + j);
          const field = document.createElement('div');
          field.className = 'field';
          board.appendChild(field);
        };
      };
  
      return board;
    };
  
    create(type, data) {
      if (!type) {
        console.log('missing type');
      } // debug
  
      const element = document.createElement(type);
  
      for (const [key, value] of Object.entries(data)) {
        element[key] = value;
      };
  
      return element;
    };
  
    getCoordinatesFromIndex(index) {
      const x = parseInt(index / this.BOARD_SIZE, 10);
      const y = index % this.BOARD_SIZE;
  
      return [x, y];
    };
  
    getIndexFromCoordinates(x, y) {
      return x * this.BOARD_SIZE + y;
    };
  
    roundNearestTenExceptZero(num) {
      while (num % 10 !== 0) {
        num += 1;
      };
      return num;
    };
  
    appendAll(container, nodeArray) {
      nodeArray.forEach((node) => container.appendChild(node));
    };
  };
  
export default new Helper();