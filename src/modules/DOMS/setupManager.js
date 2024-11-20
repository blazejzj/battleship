import helper from "./helper";
import Game from "../factories/battleManager";
import Battle from "./battleDOMS";
import Component from "./reusables";
import Message from "../utils/message";
import DragDrop from "./dragDropManager";

class SetupManager {
    initButtons() {
        this.initAxisButtons();
        this.initResetContinueButtons();
        this.disableContinueButton();
        this.setTabIndex();
    }

    loadSetupContent() {
        const app = document.getElementById("app");
        app.classList.replace("pregame", "setup");

        app.appendChild(this.createSetupWrapper());
        this.displayWelcomeMessage();
        this.initButtons();
    }

    createSetupWrapper() {
        const wrapper = helper.create("div", { className: "setup-wrapper" });

        helper.appendAll(wrapper, [
            Component.createMessageSection(["setup", "agent"]),
            this.createMapFleetSection(),
            this.createResetContinueSection(),
        ]);

        return wrapper;
    }

    createMapFleetSection() {
        const section = helper.create("section", {
            id: "setup-container",
            className: "setup-container",
        });

        section.appendChild(this.createMapFleet());

        return section;
    }

    createMapFleet() {
        const container = helper.create("div", {
            className: "board-fleet-container",
        });

        helper.appendAll(container, [
            helper.createMap("setup"),
            this.createFleetSelectSection(),
        ]);

        container
            .querySelector("#board-setup")
            .appendChild(this.createAxisButtons());

        return container;
    }

    createAxisButtons() {
        const container = helper.create("div", {
            id: "axis-button-container",
            className: "axis-button-container",
        });

        const buttonX = helper.create("button", {
            id: "x-button",
            className: "axis-button",
            textContent: "Horizontal",
        });
        const buttonY = helper.create("button", {
            id: "y-button",
            className: "axis-button",
            textContent: "Vertical",
        });

        buttonX.classList.add("selected");

        helper.appendAll(container, [buttonX, buttonY]);

        return container;
    }

    createFleetSelectSection() {
        const section = helper.create("section", {
            id: "fleet-setup",
            className: "fleet-setup",
        });

        const fleet = [
            "carrier",
            "battleship",
            "cruiser",
            "submarine",
            "destroyer",
        ];

        fleet.forEach((ship) => {
            const shipCard = Component.createShipCard(ship);
            section.appendChild(shipCard);
        });

        return section;
    }

    createResetContinueSection() {
        const container = helper.create("section", {
            id: "reset-continue-section",
            className: "reset-continue-section",
        });

        const resetButton = helper.create("button", {
            id: "reset-button",
            className: "reset-button",
            textContent: "Reset",
        });

        const continueButton = helper.create("button", {
            id: "continue-button",
            className: "continue-button",
            textContent: "Confirm",
        });

        helper.appendAll(container, [resetButton, continueButton]);

        return container;
    }

    displayWelcomeMessage() {
        const message = document.getElementById("message-agent");
        Component.addTypeWriterMessage(message, Message.getWelcomeMessage());
    }

    initAxisButtons() {
        const buttonX = document.getElementById("x-button");
        const buttonY = document.getElementById("y-button");

        buttonX.addEventListener("click", () =>
            this.handleAxisButton(buttonX, buttonY)
        );
        buttonY.addEventListener("click", () =>
            this.handleAxisButton(buttonY, buttonX)
        );
    }

    handleAxisButton(button, oppositeButton) {
        const map = Game.getPlayer().getGrid();

        if (button.id === "x-button") {
            map.setAxisX();
        } else {
            map.setAxisY();
        }
        button.classList.add("selected");
        oppositeButton.classList.remove("selected");
    }

    initResetContinueButtons() {
        const resetButton = document.getElementById("reset-button");
        const continueButton = document.getElementById("continue-button");
        const board = Game.getPlayer().getGrid().getBoard();

        resetButton.addEventListener("click", () => this.handleReset(board));
        continueButton.addEventListener("click", this.handleContinue);
    }

    handleReset(board) {
        const fieldContainer = document.getElementById("field-container-setup");

        this.resetFleetSelect();
        this.resetArray(board);
        this.removePlacedShips(fieldContainer);
        this.disableContinueButton();
        this.setTabIndex();
    }

    resetFleetSelect() {
        const map = Game.getPlayer().getGrid();

        this.resetFleetSelectMenu();
        map.getFleet().forEach((warship) => warship.toggleFound());
        map.setFleetEmpty();
    }

    resetFleetSelectMenu() {
        const fleet = document.getElementById("fleet-setup");
        const message = document.getElementById("message-agent");

        fleet.childNodes.forEach((node) => {
            if (node.classList.contains("hidden")) {
                node.classList.remove("hidden");
                message.classList.add("reset");
            }
        });
    }

    setTabIndex() {
        const shipCards = document.querySelectorAll(".ship-card");
        shipCards.forEach((shipCard) => shipCard.setAttribute("tabindex", 0));
    }

    resetArray(array) {
        // reset the array to its initial state
        for (let i = 0; i < array.length; i += 1) {
            for (let j = 0; j < array[0].length; j += 1) {
                array[i][j] = "x";
            }
        }
    }

    removePlacedShips(parentNode) {
        const ships = parentNode.querySelectorAll(".ship-image-container");
        ships.forEach((ship) => ship.remove());
    }

    handleContinue() {
        if (Game.getPlayer().getGrid().areAllShipsFound()) {
            Battle.loadBattleContent();
        }
    }

    disableContinueButton() {
        const button = document.getElementById("continue-button");

        button.classList.add("disabled");
        button.addEventListener("keydown", DragDrop.preventEnterDefault);
    }
}

export default new SetupManager();
