import BattleManager from '../factories/battleManager';

describe('BattleManager', () => {
  let simulator;

  beforeEach(() => {
    simulator = new BattleManager(); 
  });

  test('should initialize with correct player names', () => {
    expect(simulator.getPlayer().getAlias()).toBe('Captain'); 
    expect(simulator.getCPU().getAlias()).toBe('cpu'); 
  });

  test('should allow changing the player name', () => {
    simulator.setPlayerName('Admiral'); 
    expect(simulator.getPlayer().getAlias()).toBe('Admiral'); 
  });

  test('should return the correct game state', () => {
    const state = simulator.getState(); 
    expect(state.player.getAlias()).toBe('Captain'); 
    expect(state.cpu.getAlias()).toBe('cpu'); 
  });
});
