import Game from "../factories/battleManager";

class MessageManager {
    constructor() {
        this.messages = {
            welcome: [
                "Ahoy, Captain!",
                "Prepare our fleet by selecting the axis and placing the ships on the grid.",
            ],
            battleStartPlayer: [
                "All systems are green. Let's give them a battle they'll never forget!",
            ],
            battleStartEnemy: [
                "No mercy will be shown, just as your father showed none to mine.",
            ],
            enemyHit: [
                "Direct hit, Captain! They're starting to take on water.",
                "Another hit, sir! Their ship is taking serious damage.",
                "Bullseye! We’re breaking their defenses.",
                "Captain, that shot landed perfectly. The enemy is faltering.",
                "We're hitting them hard, Captain. They won't last long.",
                "Excellent shot! The enemy ship is heavily damaged.",
                "That's a solid hit, Captain. They're on the brink!",
                "Another successful hit, sir! The enemy ship is reeling.",
                "The enemy ship took that hit hard! Well done, Captain.",
                "Target struck! Their ship is barely holding together.",
            ],
            enemySunk: [
                "Well done, Captain! That enemy vessel is sinking fast.",
                "Enemy ship down! Another victory for us, Captain.",
                "Captain, we've sunk their ship. One less threat to worry about.",
                "Another one bites the dust, Captain. Enemy ship has been sunk.",
                "Direct hit! The enemy ship is going under.",
                "Victory, Captain! That enemy ship is no more.",
                "The enemy ship has been sent to the bottom of the ocean. Well done.",
                "That ship is toast, Captain. It’s going down!",
                "The enemy ship has been obliterated. We’re unstoppable!",
                "We’ve sent another ship to the depths. Victory is ours, Captain!",
            ],
            playerMiss: [
                "So close, Captain! We’ll get them next time.",
                "No luck with that shot, Captain.",
                "Missed that one, but we’ll hit the next.",
                "Our aim was off, but we’ll adjust.",
                "No hit, Captain. The enemy evaded us.",
                "That was a miss, but don’t lose hope, Captain.",
                "The enemy slipped away this time, Captain.",
                "We need to recalibrate our aim, Captain.",
                "They dodged our shot, but we’ll strike again soon.",
                "Not quite, Captain. We’ll nail them with the next one.",
            ],
            playerHit: [
                "Your ship is under fire!",
                "Brace yourself! We’ve just scored a hit.",
                "Direct hit on your vessel! Damage sustained.",
                "You're in our sights now!",
                "Another hit! Your ship is taking on water.",
                "Gotcha! Your defenses are failing.",
                "Bullseye! Your ship won’t last much longer.",
                "You're taking serious damage! Ready to surrender?",
                "We’ve got you cornered. Prepare for the final blow!",
                "Your ship is barely holding together. Time to give up?",
            ],
            playerSunk: [
                "Your ship's going down. Better start swimming!",
                "Another one of your ships bites the dust.",
                "Your ship has been sunk! What’s next, Captain?",
                "We’ve sent your ship to the bottom of the sea!",
                "Another one of your ships meets a watery grave.",
                "It's over for that ship. You’re running out of options!",
                "Your fleet is dwindling, Captain. Another ship down.",
                "The ocean claims another one of your ships. Too bad!",
                "Your ship couldn’t withstand the assault. It’s done for.",
                "Another ship sunk! How long can you last, Captain?",
            ],
            enemyMiss: [
                "Missed again? Seriously? I must be losing my edge.",
                "Wow, that shot was way off. Maybe I should get my eyes checked.",
                "Can't believe I missed! I'm really outdoing myself today.",
                "Another miss? I’m really on a roll here… of failure.",
                "Great job, me! Missing like a pro.",
                "Didn't hit a thing. I should give myself a medal for that one.",
                "Missed again? Clearly, I’m just giving them a sporting chance.",
                "What a shot! Too bad it hit absolutely nothing.",
                "Another shot, another miss. I’m really out of practice.",
                "Missed? Of course, I did. Wouldnt want to make it too easy for them.",
            ],

            noComment: ["..."],
            playerWin: [
                "Victory is ours, Captain! You truly are the ruler of the seas.",
            ],
            enemyWin: [
                "Defeated! This is for my father. You were no match for me.",
            ],
        };
    }

    getWelcomeMessage() {
        const playerName = Game.getPlayer().getAlias();
        this.messages.welcome[0] += ` ${playerName}!`;
        return this.messages.welcome;
    }

    getBattleStartMessage() {
        const playerName = Game.getPlayer().getAlias();
        return [`${playerName}, ${this.messages.battleStartPlayer[0]}`];
    }

    getNewEnemyBattleStartMessage() {
        return this.messages.battleStartEnemy;
    }

    getNewEnemyHitMessage(previousMessage) {
        return this.getRandomMessage(this.messages.enemyHit, previousMessage);
    }

    getNewEnemySunkMessage(previousMessage) {
        return this.getRandomMessage(this.messages.enemySunk, previousMessage);
    }

    getNewPlayerMissMessage(previousMessage) {
        return this.getRandomMessage(this.messages.playerMiss, previousMessage);
    }

    getNewPlayerHitMessage(previousMessage) {
        return this.getRandomMessage(this.messages.playerHit, previousMessage);
    }

    getNewPlayerSunkMessage(previousMessage) {
        return this.getRandomMessage(this.messages.playerSunk, previousMessage);
    }

    getNewEnemyMissMessage(previousMessage) {
        return this.getRandomMessage(this.messages.enemyMiss, previousMessage);
    }

    getNoCommentMessage() {
        return this.messages.noComment;
    }

    getPlayerWinMessage() {
        return this.messages.playerWin;
    }

    getEnemyWinMessage() {
        return this.messages.enemyWin;
    }

    getRandomMessage(messageArray, previousMessage) {
        let newMessage = previousMessage;
        while (newMessage === previousMessage) {
            newMessage = messageArray[this.randomIndex(messageArray.length)];
        }
        return newMessage;
    }

    randomIndex(max) {
        return Math.floor(Math.random() * max);
    }
}

export default new MessageManager();
