import helper from './helper';
import fleet from './fleetManager';
import Game from '../factories/battleManager';
import Component from './reusables';
import Message from '../utils/message';
import Sound from '../utils/sound';

class battleDOMS {

  loadBattleContent() {
    helper.clearContent();

    const app = document.getElementById('app');
    app.classList.replace('setup', 'battle');

    app.appendChild(this.createBattleWrapper());
    this.displayPlayerShips();

    // autoPlace CPU ships
    Game.getCPU().autoPosition();

    this.displayBattleStartMessage('agent');
    this.displayBattleStartMessage('enemy');

    this.initBoardFields();
    this.styleOnTurn(document.querySelector('.message.battle.agent'));
  }

  createBattleWrapper() {
    const wrapper = helper.create('div', { className: 'battle-wrapper' });

    helper.appendAll(wrapper, [
      this.createPlayerMap(),
      this.createComputerMap(),
      Component.createMessageSection(['battle', 'agent']),
      Component.createMessageSection(['battle', 'enemy']),
    ]);

    return wrapper;
  }

  createPlayerMap() {
    const map = helper.createMap('friendly');
    map.appendChild(this.createMapTitle('FRIENDLY WATERS'));
    return map;
  }

  createComputerMap() {
    const map = helper.createMap('enemy');
    map.appendChild(this.createMapTitle('ENEMY WATERS'));
    return map;
  }

  createMapTitle(titleText) {
    const container = helper.create('div', { className: 'map-title-container' });

    const title = helper.create('h3', {
      className: 'map-title',
      textContent: titleText,
    });

    container.appendChild(title);
    return container;
  }

  createWinnerModal(data) {
    const winModal = helper.create('section', {
      id: 'win-modal-container',
      className: 'win-modal-container',
    });

    winModal.classList.add(data.className);

    const title = helper.create('h4', {
      id: `title-${data.id}`,
      className: `title-${data.id}`,
      textContent: data.title,
    });
    const message = Component.createMessageSection(['battle', data.id]);

    const button = helper.create('button', {
      id: 'new-game-button',
      className: 'new-game-button',
      textContent: 'New Battle',
    });

    helper.appendAll(winModal, [title, message, button]);
    return winModal;
  }

  createWinOverlay() {
    return helper.create('div', { className: 'win-overlay' });
  }

  showPlayerWinModal() {
    const app = document.getElementById('app');

    helper.appendAll(app, [
      this.createWinnerModal({
        title: 'YOU WIN!',
        id: 'agent-win',
        className: 'player',
      }),
      this.createWinOverlay(),
    ]);

    this.displayWinMessage('agent-win');
    this.initNewGameButton();
    this.unInitBoardFields();

    return 'win';
  }

  showEnemyWinModal() {
    const app = document.getElementById('app');

    helper.appendAll(app, [
      this.createWinnerModal({
        title: 'YOU LOSE!',
        id: 'enemy-win',
        className: 'enemy',
      }),
      this.createWinOverlay(),
    ]);

    this.displayWinMessage('enemy-win');
    this.initNewGameButton();

    return 'win';
  }

  // LISTENERS

  initNewGameButton() {
    const button = document.getElementById('new-game-button');
    button.addEventListener('click', () => window.location.reload());
  }

  initBoardFields() {
    const enemyMap = document.getElementById('board-enemy');
    const enemyBoard = enemyMap.querySelector('.field-container');
    enemyBoard.childNodes.forEach((field) => {
      field.addEventListener('click', (event) => this.handleFieldClick(event));
    });
    this.addFieldHoverWhenOnTurn();
  }

  unInitBoardFields() {
    const fields = document.querySelectorAll('.field');
    fields.forEach((field) => field.removeEventListener('click', this.handleFieldClick));
    this.removeFieldHoverWhenOffTurn();
  }

  // HANDLERS

  async handleFieldClick(event) {
    const { target } = event;
    this.disableField(target);

    // Player's turn
    const playerTurn = await this.playerPlays(target);
    if (playerTurn === 'win' || playerTurn === 'hit') return;

    // CPU's turn
    let cpuTurn = await this.cpuPlays();
    if (cpuTurn === 'win') return;

    while (cpuTurn === 'hit') {
        cpuTurn = await this.cpuPlays();
        if (cpuTurn === 'win' || cpuTurn === 'miss') break; // Exit loop on miss or win
    }
}


  async playerPlays(fieldNode) {
    const cpu = Game.getCPU();
    const index = [...fieldNode.parentNode.children].indexOf(fieldNode);
    const [row, col] = helper.getCoordinatesFromIndex(index);

    const board = cpu.getGrid().getBoard();
    const boardElement = board[row][col];
    const shipName = this.getShipNameFromBoard(boardElement);
    const battleship = cpu.getGrid().getShip(shipName);

    this.unInitBoardFields();
    await this.shotOnTurnPlay('player');

    if (boardElement === 'x') {
        await this.playerMiss(fieldNode);
    } else {
        return await this.playerHit(fieldNode);
    }

    this.displayPlayerMessage(boardElement, battleship);
    await this.timeoutOneSecond();
    await this.turnEnd('player');

    return 'miss';
  }


  async cpuPlays() {
    const player = Game.getPlayer();
    const [row, col] = player.computerTurn();

    const board = player.getGrid().getBoard();
    const boardElement = board[row][col];
    const shipName = this.getShipNameFromBoard(boardElement);
    const battleship = player.getGrid().getShip(shipName);

    console.log("computer shot at " + row + " " + col);

    await this.shotOnTurnPlay('cpu');

    if (boardElement === 'miss' || boardElement === 'x') {
        await this.cpuMiss(row, col);
        this.displayEnemyMessage(boardElement, battleship);
        await this.timeoutOneSecond();
        await this.turnEnd('cpu');
        return 'miss'; // Ensure the loop breaks if it's a miss
    } else {
        return await this.cpuHit(row, col);
    }
  }

  async shotOnTurnPlay(playerOrCpu) {
    if (playerOrCpu === 'player') {
      Sound.shot();
      await this.timeoutHalfSecond();
    } else {
      this.displayPlayerNoCommentMessage();
      await this.timeoutOneSecond();
      Sound.shot();
      await this.timeoutHalfSecond();
    }
  }

  async playerMiss(fieldNode) {
    this.addMissStyle(fieldNode);
    await this.timeoutMissileLength();
    Sound.miss();
  }

  async cpuMiss(row, col) {
    const friendlyBoard = document.getElementById('field-container-friendly');
    const player = Game.getPlayer(); 
    const index = helper.getIndexFromCoordinates(row, col);

    this.addMissStyle(friendlyBoard.children[index]);
    player.getGrid().getBoard()[row][col] = 'miss'; 
    await this.timeoutMissileLength();
    Sound.miss();
  }

  async playerHit(fieldNode) {
    const cpu = Game.getCPU();  
    const index = [...fieldNode.parentNode.children].indexOf(fieldNode);
    const [row, col] = helper.getCoordinatesFromIndex(index);

    const boardElement = cpu.getGrid().getBoard()[row][col]; 
    const shipName = this.getShipNameFromBoard(boardElement);
    const battleship = cpu.getGrid().getShip(shipName); 

    this.addHitStyle(fieldNode);
    this.loadShipIfSunk({ cpu, battleship, row, col });
    await this.timeoutMissileLength();
    Sound.hit();
    this.displayPlayerMessage(boardElement, battleship);

    await this.timeoutOneSecond();
    if (cpu.hasLost()) return this.showPlayerWinModal();
    this.initBoardFields();

    return 'hit';
}

async cpuHit(row, col) {
  const friendlyBoard = document.getElementById('field-container-friendly');
  const player = Game.getPlayer();  
  const index = helper.getIndexFromCoordinates(row, col);

  const boardElement = player.getGrid().getBoard()[row][col]; 
  const shipName = this.getShipNameFromBoard(boardElement);
  const battleship = player.getGrid().getShip(shipName);  

  this.addHitStyle(friendlyBoard.children[index]);
  player.getGrid().getBoard()[row][col] = 'hit';  
  await this.timeoutMissileLength();
  Sound.hit();
  this.displayEnemyMessage(boardElement, battleship);
  if (player.hasLost()) return this.showEnemyWinModal(); 

  return 'hit';
}


  async turnEnd(playerOrCpu) {
    await this.timeoutOneAndHalfSecond();

    if (playerOrCpu === 'player') {
      this.styleOffTurn(document.querySelector('.message.battle.agent'));
      this.styleOnTurn(document.querySelector('.message.battle.enemy'));
      this.resizePlayerOffTurn();
    } else {
      this.styleOffTurn(document.querySelector('.message.battle.enemy'));
      this.styleOnTurn(document.querySelector('.message.battle.agent'));
      this.resizePlayerOnTurn();
      this.initBoardFields();
    }
  }

  displayPlayerShips() {
    const friendlyBoard = document.getElementById('field-container-friendly');
    const player = Game.getPlayer();
    const playerMap = player.getGrid();
    playerMap.setAllShipsNotFound();
    fleet.loadFleet(friendlyBoard);
  }

  loadShipIfSunk(data) {
    const board = document.getElementById('field-container-enemy');
    const map = data.cpu.getGrid();
    const boardArray = map.getBoard();

    map.receiveAttack([data.row, data.col]);
    if (data.battleship.isSunk) {
      const element = boardArray[data.row][data.col];
      const [row, col] = this.findOrigin(boardArray, boardArray[data.row][data.col]);
      fleet.loadShipOnBoard(data.cpu, { map, board, element, row, col });
    }
  }

  findOrigin(board, element) {
    for (let i = 0; i < board.length; i += 1) {
      for (let j = 0; j < board[0].length; j += 1) {
        if (board[i][j] === element) return [i, j];
      }
    }
    return [0, 0];
  }

  getShipNameFromBoard(boardElement) {
    return boardElement.slice(0, boardElement.length - 1);
  }

  displayBattleStartMessage(character) {
    const message = document.getElementById(`message-${character}`);
    if (character === 'agent') {
      Component.addTypeWriterMessage(message, Message.getBattleStartMessage());
    } else {
      Component.addTypeWriterMessage(
        message,
        Message.getNewEnemyBattleStartMessage()
      );
    }
  }

  displayPlayerMessage(boardElement, ship = false) {
    const agent = document.getElementById('message-agent');
    const enemy = document.getElementById('message-enemy');

    if (boardElement !== 'x') {
      if (ship && !ship.isSunk) {
        this.displayMessage(agent, Message.getNewEnemyHitMessage(agent.textContent));
      } else if (ship.isSunk) {
        this.displayMessage(agent, Message.getNewEnemySunkMessage(agent.textContent));
      }
    } else {
      this.displayMessage(agent, Message.getNewPlayerMissMessage(agent.textContent));
    }

    if (enemy.textContent !== '...') {
      this.displayMessage(enemy, Message.getNoCommentMessage()[0]);
    }
  }

  displayEnemyMessage(boardElement, ship = false) {
    const enemy = document.getElementById('message-enemy');

    if (boardElement !== 'x' && boardElement !== 'miss') {
      if (ship && !ship.isSunk) {
        this.displayMessage(enemy, Message.getNewPlayerHitMessage(enemy.textContent));
      } else if (ship.isSunk) {
        this.displayMessage(enemy, Message.getNewPlayerSunkMessage(enemy.textContent));
      }
    } else {
      this.displayMessage(enemy, Message.getNewEnemyMissMessage(enemy.textContent));
    }
  }

  displayPlayerNoCommentMessage() {
    const agent = document.getElementById('message-agent');
    this.displayMessage(agent, Message.getNoCommentMessage()[0]);
  }

  displayWinMessage(character) {
    const message = document.getElementById(`message-${character}`);
    if (character === 'agent-win') {
      Component.addTypeWriterMessage(message, Message.getPlayerWinMessage());
    } else if (character === 'enemy-win') {
      Component.addTypeWriterMessage(message, Message.getEnemyWinMessage());
    }
  }

  displayMessage(node, message) {
    this.clearTypeWriter(node);
    Component.addTypeWriterMessage(node, [message]);
  }

  clearTypeWriter(node) {
    if (node.nextElementSibling) {
      node.textContent = '';
      node.nextElementSibling.remove();
    }
  }

  removeFieldHoverWhenOffTurn() {
    const container = document.getElementById('field-container-enemy');
    this.disableField(container);
  }

  resizePlayerOnTurn() {
    this.styleOffTurn(document.getElementById('board-enemy'));
    this.styleOnTurn(document.getElementById('board-friendly'));
  }

  resizePlayerOffTurn() {
    this.styleOffTurn(document.getElementById('board-friendly'));
    this.styleOnTurn(document.getElementById('board-enemy'));
  }

  addFieldHoverWhenOnTurn() {
    const container = document.getElementById('field-container-enemy');
    this.enableField(container);
  }

  enableField(field) {
    field.classList.remove('disabled');
  }

  disableField(field) {
    field.classList.add('disabled');
  }

  addHitStyle(node) {
    node.classList.add('hit');
  }

  addMissStyle(node) {
    node.classList.add('miss');
  }

  styleOnTurn(node) {
    node.classList.remove('off-turn');
    node.classList.add('on-turn');
  }

  styleOffTurn(node) {
    node.classList.remove('on-turn');
    node.classList.add('off-turn');
  }

  // TIMEOUTS

  timeoutOneAndHalfSecond() {
    return new Promise((resolve) => setTimeout(resolve, 1500));
  }

  timeoutOneSecond() {
    return new Promise((resolve) => setTimeout(resolve, 1000));
  }

  timeoutHalfSecond() {
    return new Promise((resolve) => setTimeout(resolve, 500));
  }

  timeoutMissileLength() {
    return new Promise((resolve) => setTimeout(resolve, 300));
  }
}

export default new battleDOMS();