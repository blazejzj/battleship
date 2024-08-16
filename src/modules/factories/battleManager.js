import Player from './player';

class battleManager {
  constructor() {
    this.state = this.initializeGame(); 
  }

  // Getters

  getPlayer() {
    return this.state.player; 
  }

  getCPU() {
    return this.state.cpu; 
  }

  // Setters

  setPlayerName(name = 'Captain') {
    this.getPlayer().setAlias(name);
  }

  // Methods

  initializeGame() {
    const player = new Player('Captain', 'player'); 
    const cpu = new Player('cpu', 'cpu'); 

    return { player, cpu }; 
  }
}

export default new battleManager();