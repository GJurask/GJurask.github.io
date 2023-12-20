import { getHint } from "./fetchData.mjs";
import { highlightKeyboardKeys } from "./keyboard.mjs";
import { gameData, PONTUACAO_MAXIMA } from "./main.mjs";
import { saveTwitchPoints } from "./score.mjs";
import {
  changeLetterColor,
  clearKeyStyles,
  createLetterGrid,
  newGame,
  openEndScreen,
  showAnswer,
  showToast,
  updateTimerDisplay,
} from "./ui.mjs";
import { arrayPosicoesAleatorias, playAudio, removeAccents } from "./utils.mjs";

const timerAudio = document.getElementById("timerAudio");
const victoryAudio = document.getElementById("victoryAudio");
const fAudio = document.getElementById("fAudio");
let custoDica = 0;
let timerInterval;
function startTimer() {
  //playAudio(timerAudio);

  if (!timerInterval) {
    timerInterval = setInterval(function () {
      gameData.timer++;
      updateTimerDisplay();
    }, 1000);
  }
}

export function initiateGame() {
  const guessInput = document.getElementById("guess-input");
  guessInput.maxLength = gameData.wordToGuess.length;

  gameData.attemptsLeft = 6;
  gameData.correctLetters = [];
  gameData.incorrectPositions = [];
  gameData.incorrectLetter = [];
  gameData.timer = 0;
  gameData.pontuacaoFinal = PONTUACAO_MAXIMA;
  gameData.dicasDadas = 0;

  document.getElementById("guess-input").value = "";
  document.getElementById("attempts-left").textContent = gameData.attemptsLeft;
  document.getElementById("attempts-left-message").textContent =
    "Tentativas restantes: ";
  document.getElementById("guess-button").disabled = false;

  custoDica = Math.floor(PONTUACAO_MAXIMA / (gameData.wordToGuess.length - 1));
  document.getElementById(
    "custo-dica"
  ).textContent = `Você perde ${custoDica} pontos por dica!`;

  updateTimerDisplay();
  createLetterGrid();
  clearKeyStyles();
}

export function provideHint(username) {
  let respelhoResposta = document.getElementById("espelho-resposta");
  const espelhoLetras = respelhoResposta.querySelectorAll(".letter");
  const posicoes = arrayPosicoesAleatorias(gameData.wordToGuess.length);

  for (let i = espelhoLetras.length - 1; i >= 0; i--) {
    const j = posicoes[i];
    let letter = espelhoLetras[j].textContent;
    if (letter === "" || letter === "?") {
      espelhoLetras[j].textContent = gameData.wordToGuess[j];
      changeLetterColor(espelhoLetras[j], true);
      gameData.correctLetters.push(gameData.wordToGuess[j]);
      startTimer();
      gameData.dicasDadas++;
      highlightKeyboardKeys();
      
      saveTwitchPoints(username, -2);
      break;
    }
  }
}

export function updateScore() {
  const pontuacaoBase = 1400;
  const tentativasBonus = gameData.attemptsLeft * 100;

  let corretasDistintas = new Set(gameData.correctLetters);
  let posicoesInconrretasDistintas = new Set(gameData.incorrectPositions);
  const letras =
    gameData.incorrectLetter.length * 25 +
    posicoesInconrretasDistintas.size * 30 +
    corretasDistintas.size * 50;

  gameData.pontuacaoFinal =
    pontuacaoBase +
    tentativasBonus -
    gameData.timer * 3 -
    letras -
    gameData.dicasDadas * custoDica;

  const timerDisplay = document.getElementById("pontos");
  timerDisplay.textContent = gameData.pontuacaoFinal;

  if (
    gameData.pontuacaoFinal <= 500 &&
    !timerDisplay.classList.contains("red-font")
  ) {
    timerDisplay.classList.add("red-font");
  } else if (
    gameData.pontuacaoFinal > 500 &&
    timerDisplay.classList.contains("red-font")
  ) {
    timerDisplay.classList.remove("red-font");
  }
}

export function stopTimer() {
  //timerAudio.pause();
  clearInterval(timerInterval);
  timerInterval = undefined;
}

export function changeSubject(subject) {
  gameData.subject = subject;
}

export function checkGuess(username, userImg) {
  startTimer();

  const guessInput = document.getElementById("guess-input");
  const guess = guessInput.value.toUpperCase();
  const normalizedGuess = removeAccents(guess);

  if (guess.length !== gameData.wordToGuess.length) {
    showToast("Não sabe contar? Nem falo nada");
    return;
  }

  const resultMessage = document.getElementById("attempts-left-message");
  const wordDisplay = document.getElementById(
    "word-display" + gameData.attemptsLeft
  );
  const letters = wordDisplay.querySelectorAll(".letter");
  const userIcon = wordDisplay.querySelector(".user-icon");
  userIcon.style.backgroundImage = `url('${userImg}')`;

  const espelhoWordDisplay = document.getElementById("word-displayespelho");
  const espelhoLetters = espelhoWordDisplay.querySelectorAll(".letter");

  let copiaWordToGuess = removeAccents(gameData.wordToGuess).split("");

  let correctCount = 0;
  let points = 0;
  for (let i = 0; i < gameData.wordToGuess.length; i++) {
    letters[i].textContent = guess[i];
    if (normalizedGuess[i] === removeAccents(gameData.wordToGuess[i])) {
      changeLetterColor(espelhoLetters[i], true);
      changeLetterColor(letters[i], true);

      if (espelhoLetters[i].textContent == "?") {
        points++;
        //adiciono um ponto, animação de +1
        //parar de dar o get e atualizar a pontuação em tela quando der sucesso.
      }

      espelhoLetters[i].textContent = guess[i];
      gameData.correctLetters.push(normalizedGuess[i]);
      correctCount++;
      copiaWordToGuess[i] = "_";
      letters[i].classList.add("flip");
    }
  }
  for (let i = 0; i < gameData.wordToGuess.length; i++) {
    if (normalizedGuess[i] === removeAccents(gameData.wordToGuess[i])) {
    } else if (copiaWordToGuess.join("").includes(normalizedGuess[i])) {
      changeLetterColor(letters[i], false);
      gameData.incorrectPositions.push(normalizedGuess[i]);
      copiaWordToGuess[copiaWordToGuess.indexOf(normalizedGuess[i])] = "_";
      letters[i].classList.add("shake");
    } else {
      letters[i].classList.add("shake");
      changeLetterColor(letters[i]);
      gameData.incorrectLetter.push(normalizedGuess[i]);
    }
  }

  if (correctCount === gameData.wordToGuess.length) {
    stopTimer();
    playAudio(victoryAudio);
    document.getElementById("guess-button").disabled = true;
    //openEndScreen();
    for (let i = gameData.attemptsLeft - 1; i > 0; i--) {
      const wordDisplayX = document.getElementById("word-display" + i);
      wordDisplayX.innerHTML = "";
    }

    savePointsAndShow(wordDisplay, username, points + 2, userImg);

    setTimeout(function () {
      newGame("all");
    }, 10000);

    highlightKeyboardKeys();
    return true;
    //createConfetti();
  } else {
    gameData.attemptsLeft--;

    document.getElementById("attempts-left").textContent =
      gameData.attemptsLeft;
    if (gameData.attemptsLeft === 0) {
      stopTimer();
      playAudio(fAudio);
      document.getElementById("attempts-left").textContent = ".";
      resultMessage.textContent = `Suas tentativas acabaram. F`;

      showAnswer(espelhoLetters);
      document.getElementById("guess-button").disabled = true;
      savePointsAndShow(wordDisplay, username, points -2, userImg);
      setTimeout(function () {
        newGame("all");
      }, 10000);
    } else if (points != 0) {
      savePointsAndShow(wordDisplay, username, points, userImg);
  }

  }

  guessInput.value = "";
  guessInput.focus();

  highlightKeyboardKeys();
}
function savePointsAndShow(htmlWordDisplayComponent, username, points, userImg, extraPointsToShow = 0) {
  let sinal = "+";
  if (points + extraPointsToShow < 0) sinal = "";
  const pointsText = htmlWordDisplayComponent.querySelector(".points-text");
  pointsText.textContent = `${sinal}${(points + extraPointsToShow)}`;
  pointsText.classList.remove('invisible');
  saveTwitchPoints(username, points, userImg);
}

