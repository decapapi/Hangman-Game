const hiddenWord = document.getElementById('hidden-word');

const input = document.getElementById('input');
const languageSelector = document.getElementById('langauge');
const difficultySelector = document.getElementById('difficulty');

const checkButton = document.getElementById('check');
const hintButton = document.getElementById('hint');
const resetButton = document.getElementById('reset');

const gallow = document.getElementById("gallow");
const svg = document.querySelector("svg");
const s = Snap(svg);
const windowWidth = window.innerWidth;

document.getElementById('check').addEventListener('click', checkInput);
document.getElementById('hint').addEventListener('click', hint);
document.getElementById('reset').addEventListener('click', restart);

var usedLetters = [];
var wrongLetters = [];
var timesFailed = 0;
var hits = 0;
var hints = 1;

var choosenWord;

var wrongLettersText;

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

function updateWrongLettersText() {
    if (wrongLettersText === undefined) {
      wrongLettersText = s.text(gallow.offsetWidth / 1.5, gallow.offsetHeight * 0.9, "Wrong letters:");
      wrongLettersText.attr({
        "font-size": gallow.offsetWidth / 45,
        "font-family": "Quicksand, sans-serif",
        "text-anchor": "start"
      });
    }
  
    wrongLettersText.attr({
      text: "Wrong letters: " + wrongLetters.join(", ")
    });
}

function startGame() {
    if (localStorage.getItem('difficulty') !== null)
      difficultySelector.value = localStorage.getItem('difficulty');
  
    if (localStorage.getItem('language') !== null)
      languageSelector.value = localStorage.getItem('language');
  
    updateWrongLettersText();

    getRandomWord()
        .then(word => {
            updateGallow();
        })
        .catch(error => {
            console.error(error);
    });
}
  

function getRandomWord() {
    return new Promise((resolve, reject) => {
      let word;
      let wordLength;
  
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
        default:
          wordLength = getRandomInt(3, 15);
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
          resolve(word);
        })
        .catch(error => reject(error));
    });
  }
  

function restart() {
    if (confirm("This action will reset the game. Are you sure?")) {
        usedLetters.splice(0, usedLetters.length);
        wrongLetters.splice(0, wrongLetters.length);
        timesFailed = 0;
        hits = 0;
        hints = 1;
        choosenWord = getRandomWord();
        hiddenWord.innerHTML = '';
        svg.innerHTML = '';
        updateGallow();
        difficultySelector.dataset.previousValue = difficultySelector.value;
        updateWrongLettersText();
    } else {
        difficultySelector.value = difficultySelector.dataset.previousValue == null ? "medium" : difficultySelector.dataset.previousValue;
    }
}

function updateGallow() {
    const mastile = s.rect(gallow.offsetWidth / 3.5, gallow.offsetHeight * 0.3, gallow.offsetWidth / 50, gallow.offsetHeight * 0.6);
    const base = s.rect(gallow.offsetWidth / 3.95, gallow.offsetHeight * 0.87, gallow.offsetHeight * 0.2, gallow.offsetWidth / 60);
    const top = s.rect(gallow.offsetWidth / 3.5, gallow.offsetHeight * 0.29, gallow.offsetHeight * 0.3, gallow.offsetWidth / 60);
    const support = s.line(gallow.offsetWidth / 2.7, gallow.offsetHeight * 0.31, gallow.offsetWidth / 3.45, gallow.offsetHeight * 0.5);
    
    support.attr({
      'stroke-width': gallow.offsetWidth / 125,
      stroke: 'black'
    });

    // Append the elements to the SVG
    s.append(mastile, base, top, support);

    if (timesFailed >= 7) {
        var text = s.text(gallow.offsetWidth / 2, gallow.offsetHeight * 0.17, "Game Over!");
        text.attr({
            "font-size": gallow.offsetWidth / 25,
            "font-family": "Quicksand, sans-serif",
            "font-weight" : "bold",
            "fill": "red",
            "text-anchor": "middle"
        });
    }
    
    if (hits === choosenWord.length) {
        var text = s.text(gallow.offsetWidth / 2, gallow.offsetHeight * 0.17, "You Won!");
        text.attr({
            "font-size": gallow.offsetWidth / 25,
            "font-family": "Quicksand, sans-serif",
            "font-weight" : "bold",
            "fill": "green",
            "text-anchor": "middle"
        });
    }

    if (timesFailed >= 1) {
        var rope = s.rect(gallow.offsetWidth / 2.55, gallow.offsetHeight * 0.3, gallow.offsetWidth / 120, gallow.offsetHeight * 0.08);
        rope.attr({
            "stroke": "black"
        });
        rope.addClass("rope");
    }

    if (timesFailed >= 2) {
        var head = s.circle(gallow.offsetWidth / 2.525, gallow.offsetHeight * 0.425, gallow.offsetWidth / 50);
        head.attr({
            "stroke": "black",
            "stroke-width": gallow.offsetHeight * 0.015,
            "fill": "none"
        });
        head.addClass("head");
    }

    if (timesFailed >= 3) {
        var body = s.rect(gallow.offsetWidth / 2.55, gallow.offsetHeight * 0.47, gallow.offsetWidth / 110, gallow.offsetHeight * 0.1);
        body.addClass("body");
    }

    if (timesFailed >= 4) {
        var leftArm = s.line(gallow.offsetWidth / 2.55, gallow.offsetHeight * 0.48, gallow.offsetWidth / 2.7, gallow.offsetHeight * 0.54);
        leftArm.attr({
            "stroke-width": gallow.offsetWidth / 125,
            "stroke": "black"
        });
        leftArm.addClass("left-arm");
    }

    if (timesFailed >= 5) {
        var rightArm = s.line(gallow.offsetWidth / 2.51, gallow.offsetHeight * 0.48, gallow.offsetWidth / 2.36, gallow.offsetHeight * 0.54);
        rightArm.attr({
            "stroke-width": gallow.offsetWidth / 125,
            "stroke": "black"
        });
        rightArm.addClass("right-arm");
    }

    if (timesFailed >= 6) {
        var rightLeg = s.line(gallow.offsetWidth / 2.52, gallow.offsetHeight * 0.56, gallow.offsetWidth / 2.7, gallow.offsetHeight * 0.64);
        rightLeg.attr({
            "stroke-width": gallow.offsetWidth / 125,
            "stroke": "black"
        });
        rightLeg.addClass("right-leg");
    }

    if (timesFailed >= 7) {
        var leftLeg = s.line(gallow.offsetWidth / 2.52, gallow.offsetHeight * 0.56, gallow.offsetWidth / 2.36, gallow.offsetHeight * 0.64);
        leftLeg.attr({
            "stroke-width": gallow.offsetWidth / 125,
            "stroke": "black"
        });
        leftLeg.addClass("left-leg");
    }
}

function checkInput() {
    if (choosenWord == null || choosenWord == undefined ||
        timesFailed >= 7 || hits == choosenWord.length)
        return;

    var userInput = input.value.toLowerCase();;

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
        timesFailed++;
        wrongLetters.push(userInput.toLowerCase());
        updateWrongLettersText();
    }
  
    input.value = '';
    updateGallow();
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
    updateGallow();
});
