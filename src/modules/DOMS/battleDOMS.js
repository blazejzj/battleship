import helper from "./helper";
import fleet from "./fleetManager";
import Game from "../factories/battleManager";
import Component from "./reusables";
import Message from "../utils/message";
import Sound from "../utils/sound";

class battleDOMS {
    constructor() {
        this.isPlayerTurn = true;
    }

    loadBattleContent() {
        helper.clearContent();

        const app = document.getElementById("app");
        app.classList.replace("setup", "battle");

        const battleWrapper = this.createBattleWrapper();
        app.appendChild(battleWrapper);

        this.displayPlayerShips();
        Game.getCPU().autoPosition();

        ["agent", "enemy"].forEach((role) =>
            this.displayBattleStartMessage(role)
        );

        this.initBoardFields();
        const agentMessage = document.querySelector(".message.battle.agent");
        this.styleOnTurn(agentMessage);
    }

    createBattleWrapper() {
        const wrapper = helper.create("div", { className: "battle-wrapper" });

        const playerMap = this.createPlayerMap();
        const computerMap = this.createComputerMap();
        const agentMessageSection = Component.createMessageSection([
            "battle",
            "agent",
        ]);
        const enemyMessageSection = Component.createMessageSection([
            "battle",
            "enemy",
        ]);

        helper.appendAll(wrapper, [
            playerMap,
            computerMap,
            agentMessageSection,
            enemyMessageSection,
        ]);

        return wrapper;
    }

    createPlayerMap() {
        const map = helper.createMap("friendly");
        map.appendChild(this.createMapTitle("SAFE ZONE"));
        return map;
    }

    createComputerMap() {
        const map = helper.createMap("enemy");
        map.appendChild(this.createMapTitle("CONFLICT ZONE"));
        return map;
    }

    createMapTitle(titleText) {
        const container = helper.create("div", {
            className: "map-title-container",
        });

        const title = helper.create("h3", {
            className: "map-title",
            textContent: titleText,
        });

        container.appendChild(title);
        return container;
    }

    createWinnerModal(data) {
        const modalContainer = helper.create("section", {
            id: "win-modal-container",
            className: "win-modal-container",
        });

        modalContainer.classList.add(data.className);

        const modalTitle = helper.create("h4", {
            id: `title-${data.id}`,
            className: `title-${data.id}`,
            textContent: data.title,
        });
        const modalMessage = Component.createMessageSection([
            "battle",
            data.id,
        ]);

        const newGameButton = helper.create("button", {
            id: "new-game-button",
            className: "new-game-button",
            textContent: "New Battle",
        });

        helper.appendAll(modalContainer, [
            modalTitle,
            modalMessage,
            newGameButton,
        ]);
        return modalContainer;
    }

    createWinOverlay() {
        return helper.create("div", { className: "win-overlay" });
    }

    showPlayerWinModal() {
        const appElement = document.getElementById("app");

        const winnerModal = this.createWinnerModal({
            title: "YOU WIN!",
            id: "agent-win",
            className: "player",
        });

        const winOverlay = this.createWinOverlay();

        helper.appendAll(appElement, [winnerModal, winOverlay]);

        this.displayWinMessage("agent-win");
        this.initNewGameButton();
        this.unInitBoardFields();

        return "win";
    }

    showEnemyWinModal() {
        const appElement = document.getElementById("app");

        const winnerModal = this.createWinnerModal({
            title: "YOU LOSE!",
            id: "enemy-win",
            className: "enemy",
        });

        const winOverlay = this.createWinOverlay();

        helper.appendAll(appElement, [winnerModal, winOverlay]);

        this.displayWinMessage("enemy-win");
        this.initNewGameButton();

        return "win";
    }

    initNewGameButton() {
        const button = document.getElementById("new-game-button");
        button.addEventListener("click", () => window.location.reload());
    }

    initBoardFields() {
        const enemyMapElement = document.getElementById("board-enemy");
        const enemyFieldContainer =
            enemyMapElement.querySelector(".field-container");

        enemyFieldContainer.childNodes.forEach((field) => {
            field.addEventListener("click", (event) =>
                this.handleFieldClick(event)
            );
        });

        this.addFieldHoverWhenOnTurn();
    }

    unInitBoardFields() {
        const fieldElements = document.querySelectorAll(".field");
        fieldElements.forEach((field) =>
            field.removeEventListener("click", this.handleFieldClick)
        );
        this.removeFieldHoverWhenOffTurn();
    }

    async handleFieldClick(event) {
        if (!this.isPlayerTurn) {
            return;
        }

        this.isPlayerTurn = false;

        const clickedField = event.target;
        this.disableField(clickedField);

        // Player turn
        const playerTurnResult = await this.playerPlays(clickedField);
        if (playerTurnResult === "win" || playerTurnResult === "hit") {
            this.isPlayerTurn = true;
            return;
        }

        // CPU turn
        let cpuTurnResult = await this.cpuPlays();
        if (cpuTurnResult === "win") {
            this.isPlayerTurn = true;
            return;
        }

        while (cpuTurnResult === "hit") {
            cpuTurnResult = await this.cpuPlays();
        }

        // Player's turn can start again
        this.isPlayerTurn = true;
    }

    async playerPlays(fieldNode) {
        const cpu = Game.getCPU();
        const fieldIndex = [...fieldNode.parentNode.children].indexOf(
            fieldNode
        );
        const [row, col] = helper.getCoordinatesFromIndex(fieldIndex);

        const cpuBoard = cpu.getGrid().getBoard();
        const boardElement = cpuBoard[row][col];
        const shipName = this.getShipNameFromBoard(boardElement);
        const battleship = cpu.getGrid().getShip(shipName);

        this.unInitBoardFields();
        await this.shotOnTurnPlay("player");

        if (boardElement === "x") {
            await this.playerMiss(fieldNode);
        } else {
            return await this.playerHit(fieldNode);
        }

        this.displayPlayerMessage(boardElement, battleship);
        await this.timeoutOneSecond();
        await this.turnEnd("player");

        return "miss";
    }

    async cpuPlays() {
        const player = Game.getPlayer();
        const [row, col] = player.computerTurn();

        const board = player.getGrid().getBoard();
        const boardElement = board[row][col];
        const shipName = this.getShipNameFromBoard(boardElement);
        const battleship = player.getGrid().getShip(shipName);

        await this.shotOnTurnPlay("cpu");

        if (boardElement === "miss" || boardElement === "x") {
            await this.cpuMiss(row, col);
            this.displayEnemyMessage(boardElement, battleship);
            await this.timeoutOneSecond();
            await this.turnEnd("cpu");
            return "miss";
        } else {
            return await this.cpuHit(row, col);
        }
    }

    async shotOnTurnPlay(playerOrCpu) {
        if (playerOrCpu === "player") {
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
        const friendlyBoardElement = document.getElementById(
            "field-container-friendly"
        );
        const player = Game.getPlayer();
        const fieldIndex = helper.getIndexFromCoordinates(row, col);

        this.addMissStyle(friendlyBoardElement.children[fieldIndex]);
        player.getGrid().getBoard()[row][col] = "miss";
        await this.timeoutMissileLength();
        Sound.miss();
    }

    async playerHit(fieldNode) {
        const cpuPlayer = Game.getCPU();
        const fieldIndex = [...fieldNode.parentNode.children].indexOf(
            fieldNode
        );
        const [row, col] = helper.getCoordinatesFromIndex(fieldIndex);

        const boardElement = cpuPlayer.getGrid().getBoard()[row][col];
        const shipName = this.getShipNameFromBoard(boardElement);
        const battleship = cpuPlayer.getGrid().getShip(shipName);

        this.addHitStyle(fieldNode);
        this.loadShipIfSunk({ cpu: cpuPlayer, battleship, row, col });
        await this.timeoutMissileLength();
        Sound.hit();
        this.displayPlayerMessage(boardElement, battleship);

        await this.timeoutOneSecond();

        if (cpuPlayer.hasLost()) {
            return this.showPlayerWinModal();
        }

        this.initBoardFields();
        return "hit";
    }

    async cpuHit(row, col) {
        const friendlyBoardElement = document.getElementById(
            "field-container-friendly"
        );
        const player = Game.getPlayer();
        const fieldIndex = helper.getIndexFromCoordinates(row, col);

        const boardElement = player.getGrid().getBoard()[row][col];
        const shipName = this.getShipNameFromBoard(boardElement);
        const battleship = player.getGrid().getShip(shipName);

        this.addHitStyle(friendlyBoardElement.children[fieldIndex]);
        player.getGrid().getBoard()[row][col] = "hit";
        await this.timeoutMissileLength();
        Sound.hit();
        this.displayEnemyMessage(boardElement, battleship);
        if (player.hasLost()) return this.showEnemyWinModal();

        return "hit";
    }

    async turnEnd(playerOrCpu) {
        await this.timeoutOneAndHalfSecond();

        if (playerOrCpu === "player") {
            this.styleOffTurn(document.querySelector(".message.battle.agent"));
            this.styleOnTurn(document.querySelector(".message.battle.enemy"));
            this.resizePlayerOffTurn();
        } else {
            this.styleOffTurn(document.querySelector(".message.battle.enemy"));
            this.styleOnTurn(document.querySelector(".message.battle.agent"));
            this.resizePlayerOnTurn();
            this.initBoardFields();
        }
    }

    displayPlayerShips() {
        const friendlyBoard = document.getElementById(
            "field-container-friendly"
        );
        const player = Game.getPlayer();
        const playerMap = player.getGrid();
        playerMap.setAllShipsNotFound();
        fleet.loadFleet(friendlyBoard);
    }

    loadShipIfSunk(data) {
        const enemyBoardElement = document.getElementById(
            "field-container-enemy"
        );
        const cpuGrid = data.cpu.getGrid();
        const boardArray = cpuGrid.getBoard();

        cpuGrid.receiveAttack([data.row, data.col]);
        if (data.battleship.isSunk) {
            const element = boardArray[data.row][data.col];
            const [originRow, originCol] = this.findOrigin(boardArray, element);
            fleet.loadShipOnBoard(data.cpu, {
                map: cpuGrid,
                board: enemyBoardElement,
                element,
                row: originRow,
                col: originCol,
            });
        }
    }

    findOrigin(board, element) {
        for (let row = 0; row < board.length; row++) {
            for (let col = 0; col < board[row].length; col++) {
                if (board[row][col] === element) {
                    return [row, col];
                }
            }
        }
        return [0, 0];
    }

    getShipNameFromBoard(boardElement) {
        return boardElement.slice(0, boardElement.length - 1);
    }

    displayBattleStartMessage(character) {
        const message = document.getElementById(`message-${character}`);
        if (character === "agent") {
            Component.addTypeWriterMessage(
                message,
                Message.getBattleStartMessage()
            );
        } else {
            Component.addTypeWriterMessage(
                message,
                Message.getNewEnemyBattleStartMessage()
            );
        }
    }

    displayPlayerMessage(boardElement, ship = false) {
        const agent = document.getElementById("message-agent");
        const enemy = document.getElementById("message-enemy");

        if (boardElement !== "x") {
            if (ship && !ship.isSunk) {
                this.displayMessage(
                    agent,
                    Message.getNewEnemyHitMessage(agent.textContent)
                );
            } else if (ship.isSunk) {
                this.displayMessage(
                    agent,
                    Message.getNewEnemySunkMessage(agent.textContent)
                );
            }
        } else {
            this.displayMessage(
                agent,
                Message.getNewPlayerMissMessage(agent.textContent)
            );
        }

        if (enemy.textContent !== "...") {
            this.displayMessage(enemy, Message.getNoCommentMessage()[0]);
        }
    }

    displayEnemyMessage(boardElement, ship = false) {
        const enemy = document.getElementById("message-enemy");

        if (boardElement !== "x" && boardElement !== "miss") {
            if (ship && !ship.isSunk) {
                this.displayMessage(
                    enemy,
                    Message.getNewPlayerHitMessage(enemy.textContent)
                );
            } else if (ship.isSunk) {
                this.displayMessage(
                    enemy,
                    Message.getNewPlayerSunkMessage(enemy.textContent)
                );
            }
        } else {
            this.displayMessage(
                enemy,
                Message.getNewEnemyMissMessage(enemy.textContent)
            );
        }
    }

    displayPlayerNoCommentMessage() {
        const agent = document.getElementById("message-agent");
        this.displayMessage(agent, Message.getNoCommentMessage()[0]);
    }

    displayWinMessage(character) {
        const message = document.getElementById(`message-${character}`);
        if (character === "agent-win") {
            Component.addTypeWriterMessage(
                message,
                Message.getPlayerWinMessage()
            );
        } else if (character === "enemy-win") {
            Component.addTypeWriterMessage(
                message,
                Message.getEnemyWinMessage()
            );
        }
    }

    displayMessage(node, message) {
        this.clearTypeWriter(node);
        Component.addTypeWriterMessage(node, [message]);
    }

    clearTypeWriter(node) {
        if (node.nextElementSibling) {
            node.textContent = "";
            node.nextElementSibling.remove();
        }
    }

    removeFieldHoverWhenOffTurn() {
        const container = document.getElementById("field-container-enemy");
        this.disableField(container);
    }

    resizePlayerOnTurn() {
        this.styleOffTurn(document.getElementById("board-enemy"));
        this.styleOnTurn(document.getElementById("board-friendly"));
    }

    resizePlayerOffTurn() {
        this.styleOffTurn(document.getElementById("board-friendly"));
        this.styleOnTurn(document.getElementById("board-enemy"));
    }

    addFieldHoverWhenOnTurn() {
        const container = document.getElementById("field-container-enemy");
        this.enableField(container);
    }

    enableField(field) {
        field.classList.remove("disabled");
    }

    disableField(field) {
        field.classList.add("disabled");
    }

    addHitStyle(node) {
        node.classList.add("hit");
    }

    addMissStyle(node) {
        node.classList.add("miss");
    }

    styleOnTurn(node) {
        node.classList.remove("off-turn");
        node.classList.add("on-turn");
    }

    styleOffTurn(node) {
        node.classList.remove("on-turn");
        node.classList.add("off-turn");
    }

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
        return new Promise((resolve) => setTimeout(resolve, 500));
    }
}

export default new battleDOMS();
