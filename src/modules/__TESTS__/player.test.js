import Player from "../factories/player";

let fighter;
let ai;

describe("Player", () => {
    // Initialize players before each test
    beforeEach(() => {
        fighter = new Player("fighter");
        ai = new Player("ai", true);
    });

    test("Player turn increments", () => {
        fighter.playTurn([0, 0]);
        expect(fighter.moves).toBe(1);
    });

    test("Each coordinate can be played only once", () => {
        fighter.playTurn([0, 0]);
        fighter.playTurn([0, 0]);
        expect(fighter.moves).toBe(1);
    });

    test("AI plays random turns", () => {
        ai.playTurn(ai.computerTurn());
        ai.playTurn(ai.computerTurn());
        ai.playTurn(ai.computerTurn());
        expect(ai.moves).toBe(3);
    });
});
