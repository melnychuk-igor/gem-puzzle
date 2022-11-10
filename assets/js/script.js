document.body.innerHTML = `
        <div class="gem-puzzle">
            <div class="gem-puzzle__top">
                <button class="btn gem-puzzle__btn-start">Shuffle and start</button>
                <button class="btn gem-puzzle__btn-save">Save game</button>
                <button class="btn gem-puzzle__btn-results">Results</button>
                <button class="btn gem-puzzle__btn-sound on-sound">Sound on</button>
                <button class="btn gem-puzzle__btn-saved">Saved games</button>
                <button class="btn gem-puzzle__btn-light">Light version (only for 4x4)</button>
                <audio class="gem-puzzle__audio" src="assets/sound/sound.mp3"></audio>
            </div>
            <div class="gem-puzzle__data">
                <p class="gem-puzzle__timer">
                    Time: <span class="gem-puzzle__time">0</span>
                </p>
                <p>
                    Moves: <span class="gem-puzzle__move">0</span>
                </p>
            </div>
            <div class="gem-puzzle__wrapper-box">
              <div class="gem-puzzle__box gem-puzzle__box-4x4">
              </div>
              <div class="popup-victory">
                <img class="popup-victory__close" src="assets/img/cross.svg" alt="close">
                <p class="popup-victory__text">Hooray! You solved the puzzle in <span class="popup-victory__time">##:##</span> and <span class="popup-victory__move">N</span> moves!</p>
              </div>
              <div class="popup-saved">
                <img class="popup-saved__close" src="assets/img/cross.svg" alt="close">
                <p class="popup-saved__title">Saved game</p>
                <p class="popup-saved__text">Has no saved games</p>
                <div class="popup-saved__description">
                  <p>Time: <span class="popup-saved__time"></span></p>
                  <p>Size: <span class="popup-saved__size"></span></p>
                  <p>Moves: <span class="popup-saved__moves"></span></p>
                </div>
                <button class="btn popup-saved__btn-load">Load save</button>
              </div>

              <div class="popup-result">
                <img class="popup-result__close" src="assets/img/cross.svg" alt="close">
                <p class="popup-result__title">Best Results</p>
                <div class="popup-result__box">
                  <div class="popup-result__column">
                    <p>Size</p>
                    <div class="popup-result__size"></div>
                  </div>
                  <div class="popup-result__column">
                    <p>Time</p>
                    <div class="popup-result__time"></div>
                  </div>
                  <div class="popup-result__column">
                  <p>Moves</p>
                  <div class="popup-result__moves"></div>
                </div>
                </div>
              </div>

            </div>
            <pre class="gem-puzzle__current-size">Frame size:   <span class="gem-puzzle__current-size-number">4x4</span></pre>
            <p class="gem-puzzle__sizes">Other sizes: <a href="#">3x3</a> <a href="#">4x4</a> <a href="#">5x5</a> <a href="#">6x6</a> <a href="#">7x7</a> <a href="#">8x8</a></p>
        </div>
  `;

const TIME = document.querySelector('.gem-puzzle__time');
const MOVE = document.querySelector('.gem-puzzle__move');
const GEM_PUZZLE_BOX = document.querySelector('.gem-puzzle__box');
const POPUP_VICTORY = document.querySelector('.popup-victory');
const POPUP_VICTORY_TIME = document.querySelector('.popup-victory__time');
const POPUP_VICTORY_MOVE = document.querySelector('.popup-victory__move');
const POPUP_RESULT = document.querySelector('.popup-result');
const CURRENT_SIZE_NUMBER = document.querySelector(
  '.gem-puzzle__current-size-number'
);
const SOUND = document.querySelector('.gem-puzzle__btn-sound');
const POPUP_SAVED = document.querySelector('.popup-saved');
const POPUP_RESULT_CLOSE = document.querySelector('.popup-result__close');

let sizeField = 276;
let cellSize = 100;
let cellCurrentNumber = 4;
let allCells;
const EMPTY = {
  value: 0,
  top: 0,
  left: 0,
  size: null,
  element: null,
};
const TIME_COUNT = {
  minutes: 0,
  seconds: 0,
};
let timerId;
let countMoves = 0;
let cells = [];
let easyVariant = false;

let numbers = [];

let savedGameCount = {};
let bestResultsCount = [];

function initGame() {
  TIME.innerHTML = `${addZero(TIME_COUNT.minutes)}:${addZero(
    TIME_COUNT.seconds
  )}`;
  MOVE.innerText = countMoves;

  timerId = window.setInterval(startTimer, 1000);
  createNewGame();

  document
    .querySelector('.gem-puzzle__btn-start')
    .addEventListener('click', () => {
      startNewGame();
    });

  SOUND.addEventListener('click', () => {
    onOffSound();
  });

  document.querySelectorAll('.gem-puzzle__sizes a').forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      GEM_PUZZLE_BOX.className =
        'gem-puzzle__box gem-puzzle__box-' + e.target.textContent;
      CURRENT_SIZE_NUMBER.textContent = e.target.textContent;

      cellCurrentNumber = +e.target.textContent.slice(0, 1);

      startNewGame();
    });
  });

  document
    .querySelector('.gem-puzzle__btn-save')
    .addEventListener('click', () => {
      savedGameRecord();
    });

  document
    .querySelector('.gem-puzzle__btn-saved')
    .addEventListener('click', () => {
      POPUP_RESULT.classList.remove('active');
      showPopupSaved();
    });

  document
    .querySelector('.gem-puzzle__btn-results')
    .addEventListener('click', () => {
      POPUP_SAVED.classList.remove('active');
      POPUP_RESULT.classList.add('active');
      bestResultshow();
    });

  POPUP_RESULT_CLOSE.addEventListener('click', () => {
    POPUP_RESULT.classList.remove('active');
  });

  document
    .querySelector('.gem-puzzle__btn-light')
    .addEventListener('click', () => {
      if(cellCurrentNumber === 4) {
        easyVariant = true;
        startNewGame();
      }
    });
}

function createArrayNumbers() {
  allCells = cellCurrentNumber * cellCurrentNumber;
  numbers = [...Array(allCells).keys()].sort(() => Math.random() - 0.5);

  if(easyVariant) {
    numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 0, 15]
  }
}

function createNewGame() {
  createArrayNumbers();

  MOVE.textContent = countMoves;
  cellSize = sizeField / cellCurrentNumber;
  countMoves = 0;

  GEM_PUZZLE_BOX.innerHTML = '';

  for (let i = 0; i <= allCells - 1; i++) {
    if (numbers[i] === 0) {
      const cell = document.createElement('div');
      cell.classList.add('empty');
      EMPTY.value = allCells;

      const left = i % cellCurrentNumber;
      const top = (i - left) / cellCurrentNumber;
      EMPTY.left = left;
      EMPTY.top = top;
      EMPTY.size = sizeField / cellCurrentNumber;
      EMPTY.element = cell;
      cells.push(EMPTY);

      cell.style.left = `${left * cellSize}px`;
      cell.style.top = `${top * cellSize}px`;

      cell.style.width = `${sizeField / cellCurrentNumber}px`;
      cell.style.height = `${sizeField / cellCurrentNumber}px`;

      GEM_PUZZLE_BOX.appendChild(cell);
    } else {
      const cell = document.createElement('div');
      cell.classList.add('gem-puzzle__item');
      const value = numbers[i];
      cell.innerHTML = value;

      const left = i % cellCurrentNumber;
      const top = (i - left) / cellCurrentNumber;

      cells.push({
        value: value,
        left: left,
        top: top,
        size: sizeField / cellCurrentNumber,
        element: cell,
      });

      cell.style.left = `${left * cellSize}px`;
      cell.style.top = `${top * cellSize}px`;

      cell.style.width = `${sizeField / cellCurrentNumber}px`;
      cell.style.height = `${sizeField / cellCurrentNumber}px`;

      GEM_PUZZLE_BOX.appendChild(cell);

      cell.addEventListener('click', () => {
        move(i);
      });

      cell.addEventListener('mousedown', (event) => {
        dragDrop(i, event);
      });
    }
  }

  easyVariant = false;
}

function clearCell() {
  while (GEM_PUZZLE_BOX.firstChild) {
    GEM_PUZZLE_BOX.removeChild(GEM_PUZZLE_BOX.firstChild);
  }
}

function startNewGame() {
  numbers.length = 0;
  cells.length = 0;
  countMoves = 0;
  clearCell();
  clearTimer();
  createNewGame();
}

function move(index) {
  const cell = cells[index];
  const leftDiff = Math.abs(EMPTY.left - cell.left);
  const topDiff = Math.abs(EMPTY.top - cell.top);

  if (leftDiff + topDiff > 1) {
    cell.element.removeAttribute('draggable');
    return;
  }

  cell.element.style.left = `${EMPTY.left * cellSize}px`;
  cell.element.style.top = `${EMPTY.top * cellSize}px`;
  const emptyLeft = EMPTY.left;
  const emptyTop = EMPTY.top;
  EMPTY.left = cell.left;
  EMPTY.top = cell.top;
  EMPTY.element.style.left = `${EMPTY.left * cellSize}px`;
  EMPTY.element.style.top = `${EMPTY.top * cellSize}px`;
  cell.left = emptyLeft;
  cell.top = emptyTop;
  countMoves += 1;
  MOVE.innerText = countMoves;

  if (SOUND.classList.contains('on-sound')) {
    playSound();
  }

  cell.element.removeAttribute('draggable');
  const isFinished = cells.every((cell) => {
    return cell.value === cell.top * cellCurrentNumber + cell.left + 1;
  });

  if (isFinished) {
    stopTimer();
    setTimeout(showPopupVictory, 500);
  }
}

function showPopupVictory() {
  stopTimer();
  POPUP_VICTORY.classList.add('active');
  POPUP_VICTORY_TIME.textContent = TIME.textContent;
  POPUP_VICTORY_MOVE.textContent = MOVE.textContent;
  bestResultsRecord();

  document
    .querySelector('.popup-victory__close')
    .addEventListener('click', () => {
      POPUP_VICTORY.classList.remove('active');
    });
}

function dragDrop(index) {
  const cell = cells[index];
  cell.element.setAttribute('draggable', true);

  document.addEventListener(
    'dragstart',
    function (event) {
      event.target.style.opacity = 0;
    },
    false
  );

  document.addEventListener(
    'dragend',
    function (event) {
      event.target.style.opacity = '';
      cell.element.style.transition = '';
    },
    false
  );

  document.addEventListener(
    'dragover',
    function (event) {
      event.preventDefault();
    },
    false
  );

  document.addEventListener(
    'dragenter',
    function (event) {
      if (event.target.className === 'empty') {
        event.target.style.background = 'rgb(191, 253, 175)';
      }
    },
    false
  );

  document.addEventListener(
    'dragleave',
    function (event) {
      if (event.target.className == 'empty') {
        event.target.style.background = '';
      }
    },
    false
  );

  document.addEventListener(
    'drop',
    function (event) {
      event.preventDefault();
      if (
        event.target.className === 'empty' &&
        cell.element.hasAttribute('draggable')
      ) {
        move(index);
        event.target.style.background = '';
        cell.element.style.transition = 'none';
      }
    },
    false
  );
}

function startTimer() {
  TIME_COUNT.seconds += 1;
  if (TIME_COUNT.seconds === 60) {
    TIME_COUNT.seconds = 0;
    TIME_COUNT.minutes += 1;
  }

  TIME.innerHTML = `${addZero(TIME_COUNT.minutes)}:${addZero(
    TIME_COUNT.seconds
  )}`;
}

function stopTimer() {
  window.clearInterval(timerId);
}

function clearTimer() {
  TIME_COUNT.seconds = 0;
  TIME_COUNT.minutes = 0;
  TIME.innerHTML = `${addZero(TIME_COUNT.minutes)}:${addZero(
    TIME_COUNT.seconds
  )}`;
}

function addZero(num) {
  if(parseInt(num, 10) < 10) {
    return '0' + num;
  } else {
    return '' + num;
  }
}

function onOffSound() {
  SOUND.classList.toggle('on-sound');

  if (SOUND.classList.contains('on-sound')) {
    SOUND.textContent = 'Sound on';
  } else {
    SOUND.textContent = 'Sound off';
  }
}

function playSound() {
  const AUDIO = document.querySelector('.gem-puzzle__audio');
  AUDIO.currentTime = 0;
  AUDIO.play();
}

function showPopupSaved() {
  POPUP_SAVED.classList.remove('popup-saved--not-save');
  POPUP_SAVED.classList.add('active');
  const PAST_GAME = JSON.parse(localStorage.getItem('past-game'));

  if (PAST_GAME !== null) {
    document.querySelector('.popup-saved__time').textContent = `${addZero(
      PAST_GAME.timeminutes
    )}:${addZero(PAST_GAME.timeseconds)}`;
    document.querySelector('.popup-saved__size').textContent = PAST_GAME.size;
    document.querySelector('.popup-saved__moves').textContent = PAST_GAME.move;
  } else {
      POPUP_SAVED.classList.add('popup-saved--not-save');
  }

  document
    .querySelector('.popup-saved__btn-load')
    .addEventListener('click', () => {
      POPUP_SAVED.classList.remove('active');
      savedGameChangeCells();
      savedGameLoad();
    });

  document
    .querySelector('.popup-saved__close')
    .addEventListener('click', () => {
      POPUP_SAVED.classList.remove('active');
    });
}

function savedGameRecord() {
  savedGameCount.name = '1';
  savedGameCount.size = cellCurrentNumber;
  savedGameCount.timeminutes = TIME_COUNT.minutes;
  savedGameCount.timeseconds = TIME_COUNT.seconds;
  savedGameCount.move = countMoves;
  savedGameCount.arrayValue = [...cells];

  savedGameCount.arrEmptyValue = EMPTY.value;
  savedGameCount.arrEmptyTop = EMPTY.top;
  savedGameCount.arrEmptyLeft = EMPTY.left;
  savedGameCount.arrEmptySize = EMPTY.size;

  savedGameCount.arrEmptyElement = EMPTY.element;
  localStorage.setItem('past-game', JSON.stringify(savedGameCount));
}

function savedGameChangeCells() {
  if (
    localStorage.getItem('past-game') !== null &&
    localStorage.getItem('past-game') !== '' &&
    localStorage.getItem('past-game') !== undefined
  ) {
    savedGameCount = JSON.parse(localStorage.getItem('past-game'));
    const sizeFieldSave = savedGameCount.size * savedGameCount.size;

    for (let i = 0; i <= sizeFieldSave - 1; i++) {
      const cell = document.createElement('div');

      if (savedGameCount.arrayValue[i].value === sizeFieldSave) {
        cell.classList.add('empty');
        cell.innerHTML = '';
        cell.style.left = `${
          savedGameCount.arrayValue[i].left * (sizeField / savedGameCount.size)
        }px`;
        cell.style.top = `${
          savedGameCount.arrayValue[i].top * (sizeField / savedGameCount.size)
        }px`;
        cell.style.width = `${sizeField / savedGameCount.size}px`;
        cell.style.height = `${sizeField / savedGameCount.size}px`;
        savedGameCount.arrayValue[i].element = cell;
        savedGameCount.arrEmptyElement = cell;
      } else {
        cell.classList.add('gem-puzzle__item');
        cell.innerHTML = savedGameCount.arrayValue[i].value;
        cell.style.left = `${
          savedGameCount.arrayValue[i].left * (sizeField / savedGameCount.size)
        }px`;
        cell.style.top = `${
          savedGameCount.arrayValue[i].top * (sizeField / savedGameCount.size)
        }px`;
        cell.style.width = `${sizeField / savedGameCount.size}px`;
        cell.style.height = `${sizeField / savedGameCount.size}px`;
        savedGameCount.arrayValue[i].element = cell;
      }

      cell.addEventListener('click', () => {
        move(i);
      });

      cell.addEventListener('mousedown', (event) => {
        dragDrop(i, event);
      });
    }
  }
}

function savedGameLoad() {
  clearCell();
  cells.length = 0;
  clearTimer();

  cellSize = savedGameCount.arrEmptySize;
  cellCurrentNumber = savedGameCount.size;
  countMoves = savedGameCount.move;
  TIME_COUNT.minutes = savedGameCount.timeminutes;
  TIME_COUNT.seconds = savedGameCount.timeseconds;
  MOVE.textContent = countMoves;
  TIME.textContent = `${addZero(TIME_COUNT.minutes)}:${addZero(
    TIME_COUNT.seconds
  )}`;
  const sizeFieldSave = savedGameCount.size * savedGameCount.size;

  for (let i = 0; i <= sizeFieldSave - 1; i++) {
    cells[i] = savedGameCount.arrayValue[i];

    if (cells[i].value === sizeFieldSave) {
      EMPTY.value = savedGameCount.arrEmptyValue;
      EMPTY.left = savedGameCount.arrEmptyLeft;
      EMPTY.top = savedGameCount.arrEmptyTop;
      EMPTY.size = savedGameCount.arrEmptySize;
      EMPTY.element = savedGameCount.arrEmptyElement;
      cells[i] = EMPTY;
    }

    GEM_PUZZLE_BOX.appendChild(cells[i].element);
  }
}

function bestResultsRecord() {
  if (
    localStorage.getItem('best-results') !== null &&
    localStorage.getItem('best-results') !== '' &&
    localStorage.getItem('best-results') !== undefined
  ) {
    bestResultsCount = JSON.parse(localStorage.getItem('best-results'));
  }

  if (bestResultsCount.length < 11) {
    bestResultsCount.push({
      moves: countMoves,
      time: `${addZero(TIME_COUNT.minutes)}:${addZero(TIME_COUNT.seconds)}`,
      size: `${cellCurrentNumber}x${cellCurrentNumber}`,
    });
  } else {
    const lastBest = bestResultsCount.length - 1;
    if (countMoves < bestResultsCount[lastBest].moves) {
      bestResultsCount[lastBest].moves = countMoves;
      bestResultsCount[lastBest].time = `${addZero(
        TIME_COUNT.minutes
      )}:${addZero(TIME_COUNT.seconds)}`;
      bestResultsCount[
        lastBest
      ].size = `${cellCurrentNumber}x${cellCurrentNumber}`;
    }
  }
  bestResultsCount.sort(function (a, b) {
    return a.moves - b.moves;
  });

  localStorage.setItem('best-results', JSON.stringify(bestResultsCount));
}

function bestResultshow() {
  if (
    localStorage.getItem('best-results') !== null &&
    localStorage.getItem('best-results') !== '' &&
    localStorage.getItem('best-results') !== undefined
  ) {
    bestResultsCount = JSON.parse(localStorage.getItem('best-results'));
  }

  const resultMove = document.querySelector('.popup-result__moves');
  const resultTime = document.querySelector('.popup-result__time');
  const resultSize = document.querySelector('.popup-result__size');

  resultMove.innerHTML = '';
  resultTime.innerHTML = '';
  resultSize.innerHTML = '';

  for (let i = 0; i < bestResultsCount.length; i++) {
    resultMove.innerHTML += `<p>${bestResultsCount[i].moves}</p>`;
    resultTime.innerHTML += `<p>${bestResultsCount[i].time}</p>`;
    resultSize.innerHTML += `<p>${bestResultsCount[i].size}</p>`;
  }
}

initGame();

console.log('Чтобы пройти быстро игру рекомендую нажать на кнопку Light version');
