const hiddenWord = document.getElementById('hidden-word');
const wrongLetters = document.getElementById('wrong-letters');

const input = document.getElementById('input');
const languageSelector = document.getElementById('langauge');
const difficultySelector = document.getElementById('difficulty');

const checkButton = document.getElementById('check');
const hintButton = document.getElementById('hint');
const resetButton = document.getElementById('reset');

const gallow = document.getElementById("gallow");
const svg = document.querySelector("svg");
const svgns = "http://www.w3.org/2000/svg";
const windowWidth = window.innerWidth;

document.getElementById('check').addEventListener('click', checkInput);
document.getElementById('hint').addEventListener('click', hint);
document.getElementById('reset').addEventListener('click', restart);

var usedLetters = [];
var timesFailed = 0;
var hits = 0;
var hints = 1;

var choosenWord = getRandomWord();

window.onload = startGame;

function hideWord(word) {
    return word.replace(/[a-zA-Z]/g, "_");
}

function replaceChar(str, index, chr) {
    if (index > str.length - 1) return str;
    return str.substring(0, index) + chr + str.substring(index + 1);
}

function hasNumbers(str) {
    const latinLettersRegex = new RegExp(/^[0-9]+$/);
    return latinLettersRegex.test(str);
}

function normalizeLetters(str) {
    return str.replace(/[ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]/g, function(letter) {
        return letter.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    });
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function drawGallow() {
    let mastile = document.createElementNS(svgns, "rect");
    let base = document.createElementNS(svgns, "rect");
    let top = document.createElementNS(svgns, "rect");
    let support = document.createElementNS(svgns, "line");

    gsap.set(mastile, {
        attr: { x: gallow.offsetWidth / 3.5, y: gallow.offsetHeight * 0.3, width: gallow.offsetWidth / 50, height: gallow.offsetHeight * 0.6 }
    });

    gsap.set(base, {
        attr: { x: gallow.offsetWidth / 3.93, y: gallow.offsetHeight * 0.87, width: gallow.offsetHeight * 0.2, height: gallow.offsetWidth / 60 }
    });

    gsap.set(top, {
        attr: { x: gallow.offsetWidth / 3.5, y: gallow.offsetHeight * 0.29, width: gallow.offsetHeight * 0.3, height: gallow.offsetWidth / 60 }
    });

    gsap.set(support, {
        attr: { x1: gallow.offsetWidth / 2.7, y1: gallow.offsetHeight * 0.31, x2: gallow.offsetWidth / 3.45, y2: gallow.offsetHeight * 0.5, 'stroke-width': gallow.offsetWidth / 125, stroke: 'black' }
    });

    svg.appendChild(mastile);
    svg.appendChild(base);
    svg.appendChild(top);
    svg.appendChild(support);
}

function startGame() {
    drawGallow();

    if (localStorage.getItem('difficulty') !== null)
        difficultySelector.value = localStorage.getItem('difficulty');
}

function getRandomWord() {
    let word;
    let wordLength;
    let wordLanguage;

    switch (difficultySelector.value) {
        case 'easy':
        wordLength = getRandomInt(3, 5);
        break;
        case 'medium':
        wordLength = getRandomInt(6, 8);
        break;
        case 'hard':
        wordLength = getRandomInt(9, 12);
        break;
        case 'expert':
        wordLength = getRandomInt(13, 15);
        break;
    }

    fetch(`https://random-word-api.herokuapp.com/word?length=${Math.floor(wordLength)}&&lang=${languageSelector.value}`)
        .then(response => response.json())
        .then(data => {
        word = String(data);
        hits += word.match(/\S+/g).length - 1;
        word = normalizeLetters(word);
        hiddenWord.innerText = hideWord(word);
        choosenWord = word;
        });
}

function restart() {
    if (confirm("This action will reset the game. Are you sure?")) {
        usedLetters.splice(0, usedLetters.length);
        timesFailed = 0;
        hits = 0;
        hints = 1;
        choosenWord = getRandomWord();
        hiddenWord.innerHTML = '';
        wrongLetters.innerText = 'Wrong letters:';
        svg.innerHTML = '';
        drawGallow();
        difficultySelector.dataset.previousValue = difficultySelector.value;
    } else {
        difficultySelector.value = difficultySelector.dataset.previousValue == null ? "medium" : difficultySelector.dataset.previousValue;
    }
}

function update() {
    if (timesFailed >= 7) {
        hiddenWord.innerHTML = choosenWord + '<br> <span style="color: red; letter-spacing: normal;">Game over!</span>';
    }

    if (timesFailed >= 1) {
        let rope = document.createElementNS(svgns, "rect");
        gsap.set(rope, {
        attr: { x: gallow.offsetWidth / 2.55, y: gallow.offsetHeight * 0.3, width: gallow.offsetWidth / 110, height: gallow.offsetHeight * 0.08 }
        });
        svg.appendChild(rope);
    }

    if (timesFailed >= 2) {
        let head = document.createElementNS(svgns, "circle");
        gsap.set(head, {
        cx: gallow.offsetWidth / 2.525, cy: gallow.offsetHeight * 0.425, r: gallow.offsetWidth / 50, stroke: 'black', strokeWidth: gallow.offsetHeight * 0.015, fill: 'none'
        });
        svg.appendChild(head);
    }

    if (timesFailed >= 3) {
        let body = document.createElementNS(svgns, "rect");
        gsap.set(body, {
        attr: { x: gallow.offsetWidth / 2.55, y: gallow.offsetHeight * 0.47, width: gallow.offsetWidth / 110, height: gallow.offsetHeight * 0.1 }
        });
        svg.appendChild(body);
    }

    if (timesFailed >= 4) {
        let leftArm = document.createElementNS(svgns, "line");
        gsap.set(leftArm, {
        attr: { x1: gallow.offsetWidth / 2.55, y1: gallow.offsetHeight * 0.48, x2: gallow.offsetWidth / 2.7, y2: gallow.offsetHeight * 0.54, 'stroke-width': gallow.offsetWidth / 125, stroke: 'black' }
        });
        svg.appendChild(leftArm);
    }

    if (timesFailed >= 5) {
        let rightArm = document.createElementNS(svgns, "line");
        gsap.set(rightArm, {
        attr: { x1: gallow.offsetWidth / 2.51, y1: gallow.offsetHeight * 0.48, x2: gallow.offsetWidth / 2.36, y2: gallow.offsetHeight * 0.54, 'stroke-width': gallow.offsetWidth / 125, stroke: 'black' }
        });
        svg.appendChild(rightArm);
    }

    if (timesFailed >= 6) {
        let rightLeg = document.createElementNS(svgns, "line");
        gsap.set(rightLeg, {
        attr: { x1: gallow.offsetWidth / 2.52, y1: gallow.offsetHeight * 0.56, x2: gallow.offsetWidth / 2.7, y2: gallow.offsetHeight * 0.64, 'stroke-width': gallow.offsetWidth / 125, stroke: 'black' }
        });
        svg.appendChild(rightLeg);
    }

    if (timesFailed >= 7) {
        let leftLeg = document.createElementNS(svgns, "line");
        gsap.set(leftLeg, {
        attr: { x1: gallow.offsetWidth / 2.52, y1: gallow.offsetHeight * 0.56, x2: gallow.offsetWidth / 2.36, y2: gallow.offsetHeight * 0.64, 'stroke-width': gallow.offsetWidth / 125, stroke: 'black' }
        });
        svg.appendChild(leftLeg);
    }
}

function checkInput() {
    const letter = input.value.toLowerCase();

    if (letter.length === 0 || hasNumbers(letter)) {
        alert("Please enter a valid letter.");
        return;
    }

    if (usedLetters.includes(letter)) {
        alert("You already guessed that letter.");
        return;
    }

    usedLetters.push(letter);

    if (choosenWord.includes(letter)) {
        let temp = hiddenWord.innerText;

        for (let i = 0; i < choosenWord.length; i++) {
        if (choosenWord[i] === letter) {
            temp = replaceChar(temp, i, letter);
            hits++;
        }
        }

        hiddenWord.innerText = temp;

        if (hits === choosenWord.length) {
        hiddenWord.innerHTML += '<br> <span style="color: green; letter-spacing: normal;">You won!</span>';
        input.disabled = true;
        checkButton.disabled = true;
        }
    } else {
        timesFailed++;
        wrongLetters.innerText += letter;

        if (timesFailed === 7) {
        update();
        hiddenWord.innerHTML = choosenWord + '<br> <span style="color: red; letter-spacing: normal;">Game over!</span>';
        input.disabled = true;
        checkButton.disabled = true;
        } else {
        update();
        }
    }

    input.value = '';
}

function hint() {
    if (hints <= 0) {
        alert("You don't have any hints left!");
        return;
    }

    var hintLetter;
    var trys = 0;
    var ready = false;

    while (!ready) {
        if (trys >= choosenWord.length)
        return;

        hintLetter = getRandomInt(0, choosenWord.length - 1);
        if (hiddenWord.innerText[hintLetter] == '_') {
        ready = true;
        hiddenWord.innerText = replaceChar(hiddenWord.innerText, hintLetter, choosenWord[hintLetter]);
        hits++;
        }
        trys++;
    }

    hints--;
}

function checkInput() {
    if (choosenWord == null || choosenWord == undefined ||
      timesFailed >= 7 || hits == choosenWord.length)
      return;

    var userInput = input.value;

    if (userInput.length != 1) {
      alert('You must enter one letter each time!');
      return;
    }
  
    if (hasNumbers(userInput)) {
      alert("You can't use numbers!");
      return;
    }

    if (usedLetters.includes(userInput.toLowerCase())) {
      alert('That letter has already been used!');
      return;
    } else {
      usedLetters.push(userInput.toLowerCase());
    }
  
    let correct = false;
    for (let i = 0; i <= choosenWord.length; i++) {
      if (choosenWord.toLowerCase()[i] == userInput.toLowerCase()) {
        hiddenWord.innerText = replaceChar(hiddenWord.innerText, i, userInput.toLowerCase());
        correct = true;
        hits++;
      }
    }
  
    if (!correct) {
      if (timesFailed === 0)
        wrongLetters.innerText += ' ' + userInput;
      else
        wrongLetters.innerText += ', ' + userInput;
        
      timesFailed++;
      update();
    }
  
    if (hits == choosenWord.length) {
      hiddenWord.innerHTML = choosenWord + '<br> <span style="color: green;">You won!</span>';
    }
  
    input.value = '';
}


languageSelector.addEventListener('change', function() {
    localStorage.setItem('language', languageSelector.value);
    restart();
});

difficultySelector.addEventListener('change', function() {
  localStorage.setItem('difficulty', difficultySelector.value);
  restart();
});

window.addEventListener('resize', function() {
    svg.innerHTML = '';
    drawGallow();
    update();
});
