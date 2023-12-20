import { lerArquivoEPreencherArray } from "./fetchData.mjs";
import {
  changeSubject,
  checkGuess,
  provideHint,
  stopTimer,
  updateScore,
} from "./gameLogic.mjs";
import { handleLetterGuessInput } from "./keyboard.mjs";
import { gameData } from "./main.mjs";
import { savePlayerScore } from "./score.mjs";
import { formatTime } from "./utils.mjs";

export function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.style.display = "block";
  toast.classList.add("active");

  setTimeout(function () {
    toast.classList.remove("active");
  }, 4000);
}
export function createConfetti() {
  const confettiContainer = document.getElementById("confetti-container");

  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement("div");
    confetti.classList.add("confetti");
    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.animationDelay = Math.random() + "s";
    confettiContainer.appendChild(confetti);
  }
}

export function createLetterGrid() {
  const preencher = document.getElementById("preencher");
  const espelho = document.getElementById("espelho-resposta");

  while (preencher.firstChild) {
    preencher.removeChild(preencher.firstChild);
  }
  if (espelho.firstChild) {
    espelho.removeChild(espelho.firstChild);
  }

  for (let i = gameData.attemptsLeft; i > 0; i--) {
    preencher.appendChild(createRow(i));
  }
  espelho.appendChild(createRow("espelho"));
}

function createRow(n) {
  const wordDisplay = document.createElement("div");
  wordDisplay.className = "word-display";
  wordDisplay.id = "word-display" + n;

  const userIcon = document.createElement("div");
  if (n == "espelho"){
    userIcon.textContent = "✓";
  }
  userIcon.className = "user-icon";  
  wordDisplay.appendChild(userIcon);

  const arrowText = document.createElement("div");
  arrowText.className = "arrow-text";
  arrowText.textContent = "→";
  wordDisplay.appendChild(arrowText);

  for (const letterToGuess of gameData.wordToGuess) {
    const letter = document.createElement("div");
    if (n == "espelho"){
      letter.textContent = "?";
    }
    letter.className = "letter";
    
    wordDisplay.appendChild(letter);
  }
  const pointsText = document.createElement("div");
  pointsText.classList.add("points-text");
  pointsText.textContent = '+0';	
  pointsText.classList.add("invisible");
  wordDisplay.appendChild(pointsText);
  

  return wordDisplay;
}

export function closeFim() {
  const modalFim = document.getElementById("modal-fim");
  modalFim.classList.add("hide");
}

export function openEndScreen() {
  const modalFim = document.getElementById("modal-fim");
  modalFim.classList.remove("hide");
  modalFim.classList.add("show");
}

function toggleConfigModal() {
  const modalConfig = document.getElementById("modal-config");
  const configToggle = document.getElementById("config-toggle");
  if (modalConfig.classList.contains("hide")) {
    modalConfig.classList.remove("hide");
    modalConfig.classList.add("show");
    configToggle.checked = true;
  } else {
    modalConfig.classList.add("hide");
    configToggle.checked = false;
  }
}

function toggleThemeMode() {
  const body = document.body;
  if (body.classList.contains("dark-theme")) {
    body.classList.remove("dark-theme");
  } else {
    body.classList.add("dark-theme");
  }
}

export function clearKeyStyles() {
  const keys = document.querySelectorAll(".key");
  keys.forEach((key) => {
    key.classList.remove(
      "incorrect-position-letter",
      "incorrect-letter",
      "correct-letter"
    );
  });
}

export function updateTimerDisplay() {
  const timerDisplay = document.getElementById("timer");
  timerDisplay.textContent = formatTime(gameData.timer);
  updateScore();
}

export function initUI() {
  document
    .getElementById("guess-input")
    .addEventListener("keyup", function (event) {
      if (event.key === "Enter") {
        checkGuess();
      }
    });

  document
    .getElementById("player-name")
    .addEventListener("keyup", function (event) {
      if (event.key === "Enter") {
        document.getElementById("save-score-button").click();
      }
    });

  document.querySelectorAll(".key").forEach((letter) => {
    letter.addEventListener("click", () => {
      handleLetterGuessInput(letter);
    });
  });

  document.getElementById("guess-button").addEventListener("click", checkGuess);

  document
    .getElementById("theme-toggle")
    .addEventListener("click", toggleThemeMode);

  document
    .getElementById("config-toggle")
    .addEventListener("click", toggleConfigModal);

  document.getElementById("dica-button").addEventListener("click", provideHint);

  document
    .getElementById("save-score-button")
    .addEventListener("click", savePlayerScore);

  document
    .getElementById("close-button-fim")
    .addEventListener("click", closeFim);

  const buttonsSubjectButton = document.querySelectorAll(
    ".change-subject-game"
  );
  buttonsSubjectButton.forEach((button) => {
    button.addEventListener("click", () => {
      newGame(button.id);
      toggleConfigModal();
    });
  });

  const buttonsSizeButton = document.querySelectorAll(".change-size-game");
  buttonsSizeButton.forEach((button) => {
    button.addEventListener("click", () => {
      const size = parseInt(button.textContent);

      if (!isNaN(size)) {
        stopTimer();
        lerArquivoEPreencherArray(size);
        toggleConfigModal();
      }
    });
  });

  setTimeout(function () {
    const nones = document.querySelectorAll(".display-none");
    nones.forEach((none) => {
      //none.classList.remove("display-none");
    });
  }, 2000);
}

export function newGame(subject) {
  stopTimer();
  changeSubject(subject);
  lerArquivoEPreencherArray(0);
}

export function loadingLayer(showLoading) {
  if (showLoading) {
    const loadingLayer = document.getElementById("loading-layer");
    loadingLayer.classList.remove("hide");
    loadingLayer.classList.add("show");
  } else {
    const loadingLayer = document.getElementById("loading-layer");
    loadingLayer.classList.add("hide");
  }
}

export function changeLetterColor(element, correctPos = null) {
  if (element) {
    element.classList.remove("incorrect-position-letter", "incorrect-letter");
    if (correctPos == null) element.classList.add("incorrect-letter");
    else if (correctPos) element.classList.add("correct-letter");
    else element.classList.add("incorrect-position-letter");
  } else {
    //rever pq está caindo aqui
  }
}

export function showAnswer(espelhoLetters) {
  for (let i = 0; i < gameData.wordToGuess.length; i++) {
    espelhoLetters[i].textContent = gameData.wordToGuess[i];
    if (!espelhoLetters[i].classList.contains("correct-letter")) {
      changeLetterColor(espelhoLetters[i]);
    }
  }
}
