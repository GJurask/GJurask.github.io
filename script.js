document.addEventListener("DOMContentLoaded", function () {
  let wordBank = [];
  let wordToGuess = "";
  let attemptsLeft = 6;
  let correctLetters = [];
  let incorrectPositions = [];
  let incorrectLetter = [];
  let timerInterval;
  let timer = 0;
  let pontuacaoFinal = 2000;
  const API = "https://seed-unexpected-rhythm.glitch.me/";

  const timerAudio = document.getElementById("timerAudio");
  const victoryAudio = document.getElementById("victoryAudio");
  const fAudio = document.getElementById("fAudio");

  function playAudio(audioElement) {
    const playPromise = audioElement.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log("Reprodução iniciada com sucesso");
        })
        .catch((error) => {
          console.error("Erro ao iniciar a reprodução:", error);
        });
    }
  }

  let gotResponse = false;
  function animateTitleLetters() {
    const title = document.querySelector(".title");
    const letters = title.textContent.split("");
    title.innerHTML = "";

    let index = 0;

    const intervalId = setInterval(function () {
      if (index < letters.length) {
        const span = document.createElement("span");
        span.textContent = letters[index];
        span.classList.add("bounce");
        title.appendChild(span);
        index++;
      } else {
        clearInterval(intervalId);

        if (!gotResponse) {
          setTimeout(function () {
            animateTitleLetters();
          }, 500);
        }
      }
    }, 100);
  }

  async function lerArquivoEPreencherArray(size) {
    try {
      animateTitleLetters();

      const response = await fetch(API + `palavra/${size}`);

      gotResponse = true;
      if (response.ok) {
        const title = document.querySelector(".title");
        title.innerHTML = title.textContent;

        const output = await response.json();
        wordToGuess = output.palavra.trim();

        getPontuacoes();
        initializeGame();
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      // Certifique-se de remover a classe mesmo em caso de erro
      const title = document.querySelector(".title");
      title.innerHTML = title.textContent; // Isso remove as tags <span>
    }
  }

  async function getPontuacoes() {
    try {
      const response = await fetch(API + "pontuacoes");

      if (response.ok) {
        const scoreboardTable = document.getElementById("scoreboard");
        const scoreboardBody = scoreboardTable.querySelector("tbody");
        while (scoreboardBody.firstChild) {
          scoreboardBody.removeChild(scoreboardBody.firstChild);
        }

        const scores = await response.json();

        scores.forEach((score) => {
          const row = document.createElement("tr");
          const playerNameCell = document.createElement("td");
          const playerScoreCell = document.createElement("td");
          const playerWordCell = document.createElement("td");
          const playerDataCell = document.createElement("td");
          const playerTimeCell = document.createElement("td");

          playerNameCell.textContent = score.nome;
          playerScoreCell.textContent = score.pontuacao;
          playerWordCell.textContent = score.palavra;
          playerDataCell.textContent = score.data;
          playerTimeCell.textContent = score.time;

          row.appendChild(playerNameCell);
          row.appendChild(playerScoreCell);
          row.appendChild(playerWordCell);
          row.appendChild(playerTimeCell);
          row.appendChild(playerDataCell);

          scoreboardBody.appendChild(row);
        });
      } else {
        console.error("Failed to fetch scores:", response.status);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  function chooseRandomWord() {
    const randomIndex = Math.floor(Math.random() * wordBank.length);
    return wordBank[randomIndex];
  }

  function startTimer() {
    playAudio(timerAudio);
    console.log(timerInterval);
    if (!timerInterval) {
      timerInterval = setInterval(function () {
        timer++;
        updateTimerDisplay();
      }, 1000);
    }
  }

  function updateTimerDisplay() {
    const timerDisplay = document.getElementById("timer");
    timerDisplay.textContent = formatTime(timer);
    atualizarPontuacao();
  }

  function atualizarPontuacao() {
    const pontuacaoBase = 1400;
    const tentativasBonus = attemptsLeft * 100;

    let corretasDistintas = new Set(correctLetters);
    let posicoesInconrretasDistintas = new Set(incorrectPositions);
    const letras =
      incorrectLetter.length * 25 +
      posicoesInconrretasDistintas.size * 30 +
      corretasDistintas.size * 50;

    pontuacaoFinal = pontuacaoBase + tentativasBonus - timer - letras;

    const timerDisplay = document.getElementById("pontos");
    timerDisplay.textContent = pontuacaoFinal;
  }

  function formatTime(timeInSeconds) {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  function initializeGame() {
    const guessInput = document.getElementById("guess-input");
    guessInput.maxLength = wordToGuess.length;

    attemptsLeft = 6;
    correctLetters = [];
    incorrectPositions = [];
    incorrectLetter = [];
    timer = 0;
    pontuacaoFinal = 2000;
    document.getElementById("attempts-left").textContent = attemptsLeft;

    criaGridLetras();
    limparStyleKeys();
  }

  function initialize() {
    document
      .getElementById("guess-button")
      .addEventListener("click", checkGuess);

    document
      .getElementById("theme-toggle")
      .addEventListener("click", toggleTheme);

    document
      .getElementById("config-toggle")
      .addEventListener("click", toggleConfig);

    document
      .getElementById("save-score-button")
      .addEventListener("click", saveScore);

    document
      .getElementById("close-button-fim")
      .addEventListener("click", closeFim);

    document
      .getElementById("close-button-config")
      .addEventListener("click", closeConfig);

    const buttons = document.querySelectorAll(".button-change-game");
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const size = parseInt(button.textContent);

        if (!isNaN(size)) {
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

  function criaGridLetras() {
    const preencher = document.getElementById("preencher");
    while (preencher.firstChild) {
      preencher.removeChild(preencher.firstChild);
    }
    for (let i = attemptsLeft; i > 0; i--) {
      const wordDisplay = document.createElement("div");
      wordDisplay.className = "word-display";
      wordDisplay.id = "word-display" + i;

      for (const letterToGuess of wordToGuess) {
        const letter = document.createElement("div");
        letter.className = "letter";
        wordDisplay.appendChild(letter);
      }
      preencher.appendChild(wordDisplay);
    }
  }
  /*
  function closeConfig() {
    const modalConfig = document.getElementById("modal-config");
    modalConfig.style.display = "none";
  }

  function closeFim() {
    const modalFim = document.getElementById("modal-fim");
    modalFim.style.display = "none";
  }
*/
  function closeConfig() {
    const modalConfig = document.getElementById("modal-config");
    modalConfig.classList.add("hide");
  }

  function closeFim() {
    const modalFim = document.getElementById("modal-fim");
    modalFim.classList.add("hide");
  }

  function openFim() {
    const modalFim = document.getElementById("modal-fim");
    modalFim.classList.remove("hide");
    modalFim.classList.add("show");
  }

  function saveScore() {
    const playerName = document.getElementById("player-name").value;
    if (playerName.trim() === "") {
      showToast("Digite seu nome para salvar a pontuação.");
      return;
    }

    salvaPontos();
    closeFim();
  }

  function toggleConfig() {
    const modalConfig = document.getElementById("modal-config");
    if (modalConfig.classList.contains("hide")) {
      modalConfig.classList.remove("hide");
      modalConfig.classList.add("show");
    } else {
      //modalConfig.classList.remove("show");
      modalConfig.classList.add("hide");
    }
  }

  /*
  function toggleConfig() {
    const modal = document.getElementById("modal-config");
    if (modal.style.display == "block") {
      modal.style.display = "none";
    } else {
      modal.style.display = "block";
    }
  }

*/
  function toggleTheme() {
    const body = document.body;
    if (body.classList.contains("dark-theme")) {
      body.classList.remove("dark-theme");
    } else {
      body.classList.add("dark-theme");
    }
  }

  function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.style.display = "block";
    toast.classList.add("active");

    setTimeout(function () {
      toast.classList.remove("active");
    }, 4000);
  }

  const guessInput = document.getElementById("guess-input");
  guessInput.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
      checkGuess();
    }
  });

  const playerNameInput = document.getElementById("player-name");
  playerNameInput.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
      document.getElementById("save-score-button").click();
    }
  });

  function createConfetti() {
    const confettiContainer = document.getElementById("confetti-container");

    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement("div");
      confetti.classList.add("confetti");
      confetti.style.left = Math.random() * 100 + "vw";
      confetti.style.animationDelay = Math.random() + "s";
      confettiContainer.appendChild(confetti);
    }
  }

  function stopTimer() {    
    timerAudio.pause();
    clearInterval(timerInterval);
  }

  function checkGuess() {
    startTimer();

    const guessInput = document.getElementById("guess-input");
    const guess = guessInput.value.toUpperCase();
    const normalizedGuess = removerAcentos(guess);

    if (guess.length !== wordToGuess.length) {
      showToast("Não sabe contar? Nem falo nada");
      return;
    }

    const resultMessage = document.getElementById("attempts");
    const wordDisplay = document.getElementById("word-display" + attemptsLeft);
    const letters = wordDisplay.querySelectorAll(".letter");

    let correctCount = 0;

    for (let i = 0; i < wordToGuess.length; i++) {
      letters[i].textContent = guess[i];
      if (normalizedGuess[i] === removerAcentos(wordToGuess[i])) {
        letters[i].style.backgroundColor = "green";
        correctLetters.push(normalizedGuess[i]);
        correctCount++;
      } else if (removerAcentos(wordToGuess).includes(normalizedGuess[i])) {
        letters[i].style.backgroundColor = "#f7f603";
        incorrectPositions.push(normalizedGuess[i]);
      } else {
        letters[i].style.backgroundColor = "lightgray";
        incorrectLetter.push(normalizedGuess[i]);
      }
    }

    if (correctCount === wordToGuess.length) {
      stopTimer();      
      playAudio(victoryAudio);
      document.getElementById("guess-button").disabled = true;
      openFim();

      //createConfetti();
    } else {
      for (let i = 0; i < wordToGuess.length; i++) {
        letters[i].classList.add("shake");
      }

      attemptsLeft--;

      document.getElementById("attempts-left").textContent = attemptsLeft;
      if (attemptsLeft === 0) {
        stopTimer();
        playAudio(fAudio);
        resultMessage.textContent = `Suas tentativas acabaram. A palavra era "${wordToGuess}".`;
        document.getElementById("guess-button").disabled = true;
      }
    }

    guessInput.value = "";
    guessInput.focus();

    incorrectLetter.forEach((letter) => {
      const key = document.querySelector(`[data-key="${letter}"]`);
      key.style.backgroundColor = "black";
      key.style.color = "white";
    });

    incorrectPositions.forEach((letter) => {
      const key = document.querySelector(`[data-key="${letter}"]`);
      key.style.backgroundColor = "#f7f603";
      key.style.color = "black";
    });

    correctLetters.forEach((letter) => {
      const key = document.querySelector(`[data-key="${letter}"]`);
      key.style.backgroundColor = "green";
      key.style.color = "white";
    });
  }

  function limparStyleKeys() {
    const keys = document.querySelectorAll(".key");
    keys.forEach((key) => {
      key.style.backgroundColor = "";
      key.style.color = "";
    });
  }

  const keyboardLetters = document.querySelectorAll(".key");
  keyboardLetters.forEach((letter) => {
    letter.addEventListener("click", () => {
      if (attemptsLeft > 0) {
        const guessInput = document.getElementById("guess-input");
        const guess = guessInput.value.toUpperCase();
        const letterGuess = letter.textContent;

        if (guess.length < guessInput.maxLength) {
          guessInput.value += letterGuess;
        }
      }
    });
  });

  const keyboardKeys = document.querySelectorAll(".key");
  keyboardKeys.forEach((key) => {
    key.addEventListener("click", () => {
      const letter = key.getAttribute("data-key");
      const firstRow = document.querySelector(".word-display");
      const firstRowInputs = firstRow.querySelectorAll(".letter");

      for (const input of firstRowInputs) {
        if (input.value === "") {
          input.value = letter;
          key.style.backgroundColor = "gray";
          break;
        }
      }
    });
  });

  function removerAcentos(texto) {
    return texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase();
  }

  function salvaPontos() {
    const nome = document.getElementById("player-name").value.toUpperCase();
    const pontuacao = pontuacaoFinal;
    const palavra = wordToGuess;
    const data = new Date().toLocaleDateString("pt-BR");
    const time = formatTime(timer);
    const novaPontuacao = {
      nome,
      pontuacao,
      palavra,
      data,
      time,
    };
    fetch(API + "salvarPontuacao", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(novaPontuacao),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  initialize();
  lerArquivoEPreencherArray(0);
});
