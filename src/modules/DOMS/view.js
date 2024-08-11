import pregame from './prelaunch';
import setup from './setupManager';
import helper from './helper';
import DragDrop from './dragDropManager';
import Sound from '../utils/sound';
import Game from '../factories/battleManager';

class ViewManager {
  loadContent() {
    helper.deleteAppContent();
    pregame.loadCard();
    this.initPlayButton();
  }

  initPlayButton() {
    const button = document.getElementById('play-now-button');
    button.addEventListener('click', () => this.loadSetup());
  }

  loadSetup() {
    this.setPlayerName();
    helper.deleteAppContent();
    setup.loadSetupContent();
    DragDrop.initDraggableFields();
    Sound.unMuteIOS();
  }

  setPlayerName() {
    const name = document.getElementById('name-input').value.toString().trim();
    if (name) {
      Game.getState().getPlayer().setName(`Captain ${name}`);
    }
    console.log(name);
  }
}


module.exports = new ViewManager();
