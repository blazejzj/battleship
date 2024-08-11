import pregame from './prelaunch';
import setup from './setupManager';
import helper from './helper';
import DragDrop from './dragDropManager';
import Sound from '../utils/sound';
import Game from '../factories/battleManager';

class ViewManager {
  loadContent() {
    helper.clearContent(); 
    pregame.loadCard();
    this.initPlayButton();
  }

  initPlayButton() {
    const button = document.getElementById('play-now-button');
    button.addEventListener('click', () => this.loadSetup());
  }

  loadSetup() {
    this.setPlayerName();
    helper.clearContent(); 
    setup.loadSetupContent();
    DragDrop.initDraggableFields();
  }

    setPlayerName() {
    const name = document.getElementById('name-input').value.toString().trim();
    if (name) {
        Game.getPlayer().setAlias(`Captain ${name}`); 
    }
    console.log(name);
    }

}

export default new ViewManager();
