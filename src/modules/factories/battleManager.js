import Player from './player';

class battleManager {
  constructor() {
    this.state = this.initializeGame(); 
  }

  initializeGame() {
    const player = new Player('Captain', 'player'); 
    const cpu = new Player('cpu', 'cpu'); 

    return { player, cpu }; 
  }

  // getters
  getState() {
    return this.state; 
  }

  getPlayer() {
    return this.state.player; 
  }

  getCPU() {
    return this.state.cpu; 
  }

  // setters
  setPlayerName(name = 'Captain') {
    this.getPlayer().setAlias(name);
  }
}

module.exports = battleManager;
