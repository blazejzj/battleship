import ship from '../factories/ship';
import fleet from './fleetManager';
import Game from '../factories/battleManager';
import helper from './helper';
import Component from './reusables';

class DragDropManager {
  constructor() {
    this.fieldQueue = [];
    this.touchMove = false;
  }

  initDraggableFields() {
    this.dragStart();
    this.dragEnter();
    this.dragOver();
    this.dragLeave();
    this.dragDrop();
    this.mobileDrag();
    this.mobileDrop();
  }

  emptyFieldQueue() {
    this.fieldQueue = [];
  }

  // LISTENERS

  dragStart() {
    const fleetContainer = document.getElementById('fleet-setup');

    fleetContainer.childNodes.forEach((node) => {
      node.addEventListener('dragstart', (event) => {
        this.dragStartHandler(event, node);
      });
    });
  }

  dragEnter() {
    const fieldContainer = document.getElementById('field-container-setup');
    fieldContainer.childNodes.forEach((node) => {
      node.addEventListener('dragenter', this.dragEnterHandler.bind(this));
    });
  }

  dragOver() {
    const fieldContainer = document.getElementById('field-container-setup');

    fieldContainer.childNodes.forEach((node, index) => {
      node.addEventListener('dragover', (event) => {
        this.dragOverHandler(event, fieldContainer, index);
      });
    });
  }

  dragLeave() {
    const fieldContainer = document.getElementById('field-container-setup');
    fieldContainer.childNodes.forEach((node) => {
      node.addEventListener('dragleave', this.dragLeaveHandler.bind(this));
    });
  }

  dragDrop() {
    const fieldContainer = document.getElementById('field-container-setup');

    fieldContainer.childNodes.forEach((node, index) => {
      node.addEventListener('drop', () => {
        this.dragDropHandler(fieldContainer, index);
      });
    });
  }

  mobileDrag() {
    const fleetContainer = document.getElementById('fleet-setup');
    const fieldContainer = document.getElementById('field-container-setup');
    const app = document.getElementById('app');
    const hoveredElement = [null];

    fleetContainer.childNodes.forEach((node) => {
      node.addEventListener(
        'touchmove',
        (event) =>
          this.touchMoveHandler(
            event,
            node,
            fieldContainer,
            fleetContainer,
            app,
            hoveredElement
          ),
        { passive: false }
      );
    });
  }

  mobileDrop() {
    const fleetContainer = document.getElementById('fleet-setup');

    fleetContainer.childNodes.forEach((node) => {
      node.addEventListener('touchend', (event) => {
        this.touchEndHandler(event, node);
      });
    });
  }

  // HANDLERS

  dragStartHandler(event, node) {
    this.addShipOnDragStart(node);
    event.stopPropagation();
  }

  dragEnterHandler(event) {
    event.preventDefault();
  }

  dragOverHandler(event, fieldContainer, index) {
    event.preventDefault();
    this.styleFieldsForDrop(fieldContainer, index);
  }

  dragLeaveHandler() {
    this.resetFieldStyling();
  }

  dragDropHandler(fieldContainer, index) {
    const [x, y] = helper.getCoordinatesFromIndex(index);
    const [isPlaced, shipOnDrag] = this.dropIfValid(x, y);

    fleet.loadFleet(fieldContainer);
    this.hideIfPlaced(isPlaced, shipOnDrag);
    this.resetFieldStyling();
    this.removePlacedShipsTabIndex();
  }

  removePlacedShipsTabIndex() {
    const shipCards = document.querySelectorAll('.ship-card.hidden');
    shipCards.forEach((shipCard) => shipCard.setAttribute('tabindex', '-1'));
  }

  dropIfValid(x, y) {
    const map = Game.getPlayer().getGrid();
    const shipOnDrag = map.getShipOnDrag();

    if (map.getAxis() === 'X') {
      return [
        map.placeX(new ship(shipOnDrag.name, shipOnDrag.length), [x, y]),
        shipOnDrag.name,
      ];
    }
    return [
      map.placeY(new ship(shipOnDrag.name, shipOnDrag.length), [x, y]),
      shipOnDrag.name,
    ];
  }

  touchMoveHandler(
    event,
    node,
    fieldContainer,
    fleetContainer,
    app,
    hoveredElement
  ) {
    this.touchMove = true;

    event.stopPropagation();
    event.preventDefault();
    app.appendChild(node);
    this.addShipOnDragStart(node);

    const shipOnDrag = Game.getPlayer().getGrid().getShipOnDrag();
    const touchLocation = event.targetTouches[0];
    const touchX = event.touches[0].clientX;
    const touchY = event.touches[0].clientY;

    this.reInsertShipIfMissing(this.touchMove, fleetContainer, shipOnDrag);
    this.positionNodeOnScreen(node, touchLocation.clientX, touchLocation.clientY);

    const newHoveredElement = document.elementFromPoint(touchX, touchY);
    if (hoveredElement[0] !== newHoveredElement) {
      this.resetFieldStyling();
    }

    hoveredElement[0] = newHoveredElement;
    if (hoveredElement[0] && hoveredElement[0].classList.contains('field')) {
      this.styleFieldsForDrop(fieldContainer, this.getNodeIndex(hoveredElement[0]));
    }
  }

  touchEndHandler(event, node) {
    if (!this.touchMove) return;

    const touchX = event.changedTouches[0].clientX;
    const touchY = event.changedTouches[0].clientY;
    const data = node.dataset.shipName;
    const fieldContainer = document.getElementById('field-container-setup');
    const hoveredElement = document.elementFromPoint(touchX, touchY);
    const copy = document.querySelector(`[data-ship-name="${data}"]`);

    if (hoveredElement && hoveredElement.classList.contains('field')) {
      const index = this.getNodeIndex(hoveredElement);
      const [x, y] = helper.getCoordinatesFromIndex(index);
      const [isPlaced, shipOnDrag] = this.dropIfValid(x, y);

      fleet.loadFleet(fieldContainer);
      this.resetFieldStyling();
      this.hideIfPlaced(isPlaced, shipOnDrag);

      if (!isPlaced) copy.classList.remove('hidden');
    } else {
      copy.classList.remove('hidden');
    }

    this.touchMove = false;
    node.remove();
    this.resetListenersForCopyNode(copy);
  }

  resetListenersForCopyNode(node) {
    const fleetContainer = document.getElementById('fleet-setup');
    const fieldContainer = document.getElementById('field-container-setup');
    const app = document.getElementById('app');
    const hoveredElement = [null];

    node.addEventListener('dragstart', (event) => {
      this.dragStartHandler(event, node);
    });
    node.addEventListener(
      'touchmove',
      (event) =>
        this.touchMoveHandler(
          event,
          node,
          fieldContainer,
          fleetContainer,
          app,
          hoveredElement
        ),
      { passive: false }
    );
    node.addEventListener('touchend', (event) => this.touchEndHandler(event, node));
  }

  reInsertShipIfMissing(isTouchActive, fleetContainer, shipOnDrag) {
    if (isTouchActive && fleetContainer.childNodes.length < 5) {
      const copy = Component.createShipCard(shipOnDrag.name);
      fleetContainer.appendChild(copy);
      copy.classList.add('hidden');
    }
  }

  positionNodeOnScreen(node, x, y) {
    node.style.position = 'fixed';
    node.style.zIndex = '5';
    node.style.left = `${x}px`;
    node.style.top = `${y}px`;
  }

  getNodeIndex(node) {
    return [...node.parentNode.children].indexOf(node);
  }

  addShipOnDragStart(node) {
    const shipName = node.dataset.shipName;
    const shipLength = parseInt(node.dataset.shipLength, 10);

    if (isNaN(shipLength)) {
      console.error('Invalid ship length:', shipLength);
      return;
    }

    Game.getPlayer().getGrid().setShipOnDrag({
      name: shipName,
      length: shipLength,
    });
  }

  resetFieldStyling() {
    const fieldContainer = document.getElementById('field-container-setup');
    this.fieldQueue.forEach((index) => {
      if (fieldContainer.children[index]) {
        fieldContainer.children[index].className = 'field';
      }
    });
    this.emptyFieldQueue();
  }

  hideIfPlaced(isPlaced, shipOnDrag) {
    if (!isPlaced) return;

    const battleship = document.querySelector(`[data-ship-name=${shipOnDrag}]`);
    if (battleship) {
      battleship.classList.add('hidden');
    }

    this.enableContinueButtonIfAllPlaced();
  }

  styleFieldsForDrop(parentNode, index) {
    const player = Game.getPlayer();
    const map = player.getGrid();
    const board = map.getBoard();
    const axis = map.getAxis();
    const shipOnDrag = map.getShipOnDrag();
    let { length } = shipOnDrag;
    this.emptyFieldQueue();

    console.log("player:", player);
    console.log("map:", map);
    console.log("board:", board);
    console.log("axis:", axis);
    console.log("shipOnDrag:", shipOnDrag);
    console.log("index:", index);

    let isTaken = false;
    if (axis === 'X') {
        for (let i = index; i < helper.roundNearestTenExceptZero(index + 1); i += 1) {
            const [x, y] = helper.getCoordinatesFromIndex(i);
            console.log(`X axis - i: ${i}, x: ${x}, y: ${y}`);
            if (length === 0) break;
            parentNode.children[i].classList.add('hovering');
            this.fieldQueue.push(i);
            length -= 1;
            if (board[x][y] !== 'x') {
                isTaken = true;
            }
        }
    }
    if (axis === 'Y') {
        for (let i = index; i < 100; i += 10) {
            const [x, y] = helper.getCoordinatesFromIndex(i);
            console.log(`Y axis - i: ${i}, x: ${x}, y: ${y}`);
            if (length === 0) break;
            parentNode.children[i].classList.add('hovering');
            this.fieldQueue.push(i);
            length -= 1;
            if (board[x][y] !== 'x') {
                isTaken = true;
            }
        }
    }

    if (isTaken || length !== 0) {
        this.fieldQueue.forEach((field) => {
            parentNode.children[field].classList.add('red');
        });
    }
  }

  enableContinueButtonIfAllPlaced() {
    const ships = document.querySelectorAll('.ship-image-container');
    const button = document.getElementById('continue-button');

    if (ships.length !== 5) return;

    button.classList.remove('disabled');
    button.removeEventListener('keydown', this.preventEnterDefault);
  }

  preventEnterDefault(event) {
    if (event.key === 'Enter') event.preventDefault();
  }
}

export default new DragDropManager();
