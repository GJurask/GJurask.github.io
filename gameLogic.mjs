import { highlightKeyboardKeys } from "./keyboard.mjs";
import { gameData, PONTUACAO_MAXIMA } from "./main.mjs";
import { clearKeyStyles, createLetterGrid, openEndScreen, showToast, updateTimerDisplay } from "./ui.mjs";
import { arrayPosicoesAleatorias, playAudio, removeAccents } from "./utils.mjs";

const timerAudio = document.getElementById("timerAudio");
const victoryAudio = document.getElementById("victoryAudio");
const fAudio = document.getElementById("fAudio");
let custoDica = 0;
let timerInterval;
function startTimer() {
  playAudio(timerAudio);

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

  custoDica = Math.floor(
    PONTUACAO_MAXIMA / (gameData.wordToGuess.length - 1)
  );
  document.getElementById(
    "custo-dica"
  ).textContent = `Você perde ${custoDica} pontos por dica!`;

  updateTimerDisplay();
  createLetterGrid();
  clearKeyStyles();
}

export function provideHint() {
  let respelhoResposta = document.getElementById("espelho-resposta");
  const espelhoLetras = respelhoResposta.querySelectorAll(".letter");
  const posicoes = arrayPosicoesAleatorias(gameData.wordToGuess.length);

  for (let i = espelhoLetras.length - 1; i >= 0; i--) {
    const j = posicoes[i];
    if (espelhoLetras[j].textContent === "") {
      espelhoLetras[j].textContent = gameData.wordToGuess[j];
      espelhoLetras[j].style.backgroundColor = "green";
      gameData.correctLetters.push(gameData.wordToGuess[j]);
      startTimer();
      gameData.dicasDadas++;
      highlightKeyboardKeys();
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
    gameData.timer -
    letras -
    gameData.dicasDadas * custoDica;

  const timerDisplay = document.getElementById("pontos");
  timerDisplay.textContent = gameData.pontuacaoFinal;

  if (gameData.pontuacaoFinal <= 500 && !timerDisplay.classList.contains("red-font")) {
    timerDisplay.classList.add("red-font");
  } else if (
    gameData.pontuacaoFinal > 500 &&
    timerDisplay.classList.contains("red-font")
  ) {
    timerDisplay.classList.remove("red-font");
  }
}

export function stopTimer() {
  timerAudio.pause();
  clearInterval(timerInterval);
  timerInterval = undefined;
}

export function checkGuess() {
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

  const espelhoWordDisplay = document.getElementById("word-displayespelho");
  const espelhoLetters = espelhoWordDisplay.querySelectorAll(".letter");

  let copiaWordToGuess = removeAccents(gameData.wordToGuess).split("");

  let correctCount = 0;

  for (let i = 0; i < gameData.wordToGuess.length; i++) {
    letters[i].textContent = guess[i];
    if (normalizedGuess[i] === removeAccents(gameData.wordToGuess[i])) {
      letters[i].style.backgroundColor = "green";
      espelhoLetters[i].style.backgroundColor = "green";
      espelhoLetters[i].textContent = guess[i];
      gameData.correctLetters.push(normalizedGuess[i]);
      correctCount++;
      copiaWordToGuess[i] = "_";
    }
  }

  for (let i = 0; i < gameData.wordToGuess.length; i++) {
    if (normalizedGuess[i] === removeAccents(gameData.wordToGuess[i])) {
    } else if (copiaWordToGuess.join("").includes(normalizedGuess[i])) {
      letters[i].style.backgroundColor = "#f7f603";
      gameData.incorrectPositions.push(normalizedGuess[i]);
      copiaWordToGuess[copiaWordToGuess.indexOf(normalizedGuess[i])] = "_";
    } else {
      letters[i].style.backgroundColor = "lightgray";
      gameData.incorrectLetter.push(normalizedGuess[i]);
    }
  }

  if (correctCount === gameData.wordToGuess.length) {
    stopTimer();
    playAudio(victoryAudio);
    document.getElementById("guess-button").disabled = true;
    openEndScreen();

    //createConfetti();
  } else {
    for (let i = 0; i < gameData.wordToGuess.length; i++) {
      letters[i].classList.add("shake");
    }

    gameData.attemptsLeft--;

    document.getElementById("attempts-left").textContent =
      gameData.attemptsLeft;
    if (gameData.attemptsLeft === 0) {
      stopTimer();
      playAudio(fAudio);
      document.getElementById("attempts-left").textContent = ".";
      resultMessage.textContent = `Suas tentativas acabaram. F`;

      for (let i = 0; i < gameData.wordToGuess.length; i++) {
        espelhoLetters[i].textContent = gameData.wordToGuess[i];
        if (espelhoLetters[i].style.backgroundColor != "green")
          espelhoLetters[i].style.backgroundColor = "red";
      }
      document.getElementById("guess-button").disabled = true;
    }
  }

  guessInput.value = "";
  guessInput.focus();

  highlightKeyboardKeys();
}
