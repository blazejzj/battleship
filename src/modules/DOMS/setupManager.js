import helper from './helper';
import Game from '../factories/battleManager';
import Battle from './battleDOMS';
import Component from './reusables';
import Message from '../utils/message';
import DragDrop from './dragDropManager';

class SetupManager {
  loadSetupContent() {
    const app = document.getElementById('app');
    app.classList.replace('pregame', 'setup');

    app.appendChild(this.createSetupWrapper());
    this.displayWelcomeMessage();
    this.initButtons();
  }

  createSetupWrapper() {
    const wrapper = helper.create('div', { className: 'setup-wrapper' });

    helper.appendAll(wrapper, [
      Component.createMessageSection(['setup', 'agent']),
      this.createMapFleetSection(),
      this.createResetContinueSection(),
    ]);

    return wrapper;
  }

  createMapFleetSection() {
    const section = helper.create('section', {
      id: 'setup-container',
      className: 'setup-container',
    });

    section.appendChild(this.createMapFleet());

    return section;
  }

  createMapFleet() {
    const container = helper.create('div', {
      className: 'board-fleet-container',
    });

    helper.appendAll(container, [
      helper.createMap('setup'),
      this.createFleetSelectSection(),
    ]);

    container.querySelector('#board-setup').appendChild(this.createAxisButtons());

    return container;
  }

  createAxisButtons() {
    const container = helper.create('div', {
      id: 'axis-button-container',
      className: 'axis-button-container',
    });

    const buttonX = helper.create('button', {
      id: 'x-button',
      className: 'axis-button',
      textContent: 'X axis',
    });
    const buttonY = helper.create('button', {
      id: 'y-button',
      className: 'axis-button',
      textContent: 'Y axis',
    });

    buttonX.classList.add('selected');

    helper.appendAll(container, [buttonX, buttonY]);

    return container;
  }

  createFleetSelectSection() {
    const section = helper.create('section', {
      id: 'fleet-setup',
      className: 'fleet-setup',
    });

    const fleet = ['carrier', 'battleship', 'cruiser', 'submarine', 'destroyer'];

    fleet.forEach((ship) => {
      const shipCard = Component.createShipCard(ship);
      section.appendChild(shipCard);
    });

    return section;
  }

  createResetContinueSection() {
    const container = helper.create('section', {
      id: 'reset-continue-section',
      className: 'reset-continue-section',
    });

    const resetButton = helper.create('button', {
      id: 'reset-button',
      className: 'reset-button',
      textContent: 'Reset',
    });

    const continueButton = helper.create('button', {
      id: 'continue-button',
      className: 'continue-button',
      textContent: 'Confirm',
    });

    helper.appendAll(container, [resetButton, continueButton]);

    return container;
  }

  displayWelcomeMessage() {
    const message = document.getElementById('message-agent');
    Component.addTypeWriterMessage(message, Message.getWelcomeMessage());
  }

  initButtons() {
    this.initAxisButtons();
    this.initResetContinueButtons();
    this.disableContinueButton();
    this.setTabIndex();
  }

  initAxisButtons() {
    const buttonX = document.getElementById('x-button');
    const buttonY = document.getElementById('y-button');

    buttonX.addEventListener('click', () => this.handleAxisButton(buttonX, buttonY));
    buttonY.addEventListener('click', () => this.handleAxisButton(buttonY, buttonX));
  }

  handleAxisButton(button, oppositeButton) {
    const map = Game.getState().getPlayer().getMap();

    if (button.id === 'x-button') {
      map.setAxisX();
    } else {
      map.setAxisY();
    }
    button.classList.add('selected');
    oppositeButton.classList.remove('selected');
  }

  initResetContinueButtons() {
    const resetButton = document.getElementById('reset-button');
    const continueButton = document.getElementById('continue-button');
    const board = Game.getState().getPlayer().getMap().getBoard();

    resetButton.addEventListener('click', () => this.handleReset(board));
    continueButton.addEventListener('click', this.handleContinue);
  }

  handleReset(board) {
    const fieldContainer = document.getElementById('field-container-setup');

    this.resetFleetSelect();
    this.resetArray(board);
    this.removePlacedShips(fieldContainer);
    this.disableContinueButton();
    this.setTabIndex();
  }

  resetFleetSelect() {
    const map = Game.getState().getPlayer().getMap();

    this.resetFleetSelectMenu();
    map.getFleet().forEach((warship) => warship.resetFound());
    map.setFleetEmpty();
  }

  resetFleetSelectMenu() {
    const fleet = document.getElementById('fleet-setup');
    const message = document.getElementById('message-agent');

    fleet.childNodes.forEach((node) => {
      if (node.classList.contains('hidden')) {
        node.classList.remove('hidden');
        message.classList.add('reset');
      }
    });
  }

  setTabIndex() {
    const shipCards = document.querySelectorAll('.ship-card');
    shipCards.forEach((shipCard) => shipCard.setAttribute('tabindex', 0));
  }

  resetArray(array) {
    for (let i = 0; i < array.length; i += 1) {
      for (let j = 0; j < array[0].length; j += 1) {
        array[i][j] = 'x';
      }
    }
  }

  removePlacedShips(parentNode) {
    const ships = parentNode.querySelectorAll('.ship-image-container');
    ships.forEach((ship) => ship.remove());
  }

  handleContinue() {
    if (Game.state.getPlayer().getMap().areAllShipsFound()) {
      Battle.loadBattleContent(); // move to the battle phase if all ships are placed
    }
  }

  disableContinueButton() {
    const button = document.getElementById('continue-button');

    button.classList.add('disabled');
    button.addEventListener('keydown', DragDrop.preventEnterDefault);
  }
}

module.exports = new SetupManager();
