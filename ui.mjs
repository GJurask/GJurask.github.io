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

  for (const letterToGuess of gameData.wordToGuess) {
    const letter = document.createElement("div");
    letter.className = "letter";
    wordDisplay.appendChild(letter);
  }
  return wordDisplay;
}

function closeConfig() {
  const modalConfig = document.getElementById("modal-config");
  modalConfig.classList.add("hide");
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
  if (modalConfig.classList.contains("hide")) {
    modalConfig.classList.remove("hide");
    modalConfig.classList.add("show");
  } else {
    //modalConfig.classList.remove("show");
    modalConfig.classList.add("hide");
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
    key.style.backgroundColor = "";
    key.style.color = "";
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

  document
    .getElementById("close-button-config")
    .addEventListener("click", closeConfig);

  const buttonsSubjectButton = document.querySelectorAll(
    ".change-subject-game"
  );
  buttonsSubjectButton.forEach((button) => {
    button.addEventListener("click", () => {
      stopTimer();
      changeSubject(button.id);
      lerArquivoEPreencherArray(0);
      closeConfig();
    });
  });

  const buttonsSizeButton = document.querySelectorAll(".change-size-game");
  buttonsSizeButton.forEach((button) => {
    button.addEventListener("click", () => {
      const size = parseInt(button.textContent);

      if (!isNaN(size)) {
        stopTimer();
        lerArquivoEPreencherArray(size);
        closeConfig();
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
