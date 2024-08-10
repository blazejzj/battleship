import helper from './helper';
import Component from './reusables';

class Prelaunch {

  loadCard() {
    const app = document.getElementById('app');
    app.classList.add('pregame');

    const pregameCard = this.createPregameCard();
    const gitHubButton = Component.createGitHubButton();

    helper.appendAll(app, [pregameCard, gitHubButton]);
  }

  createPregameCard() {
    const section = helper.create('section', { className: 'pregame-card' });

    const title = this.createTitle();
    const nameForm = this.createNameForm();
    const playNowButton = this.createPlayNowButton();

    helper.appendAll(section, [title, nameForm, playNowButton]);

    return section;
  }

  createTitle() {
    return helper.create('h1', { textContent: 'BATTLESHIP' });
  }

  createNameForm() {
    const container = helper.create('div', { className: 'name-form' });

    const input = helper.create('input', {
      type: 'text',
      id: 'name-input',
      className: 'name-input',
      placeholder: 'Captain name',
      minLength: 0,
      maxLength: 15,
    });

    const border = helper.create('span', { className: 'input-border' });

    helper.appendAll(container, [input, border]);

    return container;
  }

  createPlayNowButton() {
    const button = helper.create('button', {
      type: 'button',
      id: 'play-now-button',
      className: 'play-now-button',
    });

    const text = helper.create('span', {
      className: 'text-play-button',
      textContent: 'ENTER COMBAT',
    });

    button.appendChild(text);

    return button;
  }
}

module.exports = Prelaunch;
