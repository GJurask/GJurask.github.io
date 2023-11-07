document.addEventListener("DOMContentLoaded", function () {
  let wordBank = [];
  let wordToGuess = "";
  let attemptsLeft = 6;
  let correctLetters = [];
  let incorrectPositions = [];
  let incorrectLetter = [];

  function lerArquivoEPreencherArray() {
    fetch("words.txt")
      .then((response) => response.text())
      .then((data) => {
        wordBank = data.split("\n");
        initializeGame();
        getPontuacoes();
      })
      .catch((error) => console.error("Erro ao carregar o arquivo:", error));
  }

  async function getPontuacoes() {
    try {
      const response = await fetch(
        "https://seed-unexpected-rhythm.glitch.me/pontuacoes"
      ); // Replace with your API endpoint

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

          playerNameCell.textContent = score.nome;
          playerScoreCell.textContent = score.pontuacao;
          playerWordCell.textContent = score.palavra;
          playerDataCell.textContent = score.data;

          row.appendChild(playerNameCell);
          row.appendChild(playerScoreCell);
          row.appendChild(playerWordCell);
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

  function initializeGame() {
    wordToGuess = chooseRandomWord().trim();
    const guessInput = document.getElementById("guess-input");
    guessInput.maxLength = wordToGuess.length;

    document.getElementById("attempts-left").textContent = attemptsLeft;

    document
      .getElementById("guess-button")
      .addEventListener("click", checkGuess);

    document
      .getElementById("theme-toggle")
      .addEventListener("click", toggleTheme);

    const preencher = document.getElementById("preencher");
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

  function checkGuess() {
    const guessInput = document.getElementById("guess-input");
    const guess = guessInput.value.toUpperCase();

    if (guess.length !== wordToGuess.length) {
      showToast("Não sabe contar? Nem falo nada");
      return;
    }

    const resultMessage = document.getElementById("result-message");
    const wordDisplay = document.getElementById("word-display" + attemptsLeft);
    const letters = wordDisplay.querySelectorAll(".letter");

    let correctCount = 0;

    for (let i = 0; i < wordToGuess.length; i++) {
      letters[i].textContent = guess[i];
      if (guess[i] === wordToGuess[i]) {
        letters[i].style.backgroundColor = "green";
        correctLetters.push(guess[i]);
        correctCount++;
      } else if (wordToGuess.includes(guess[i])) {
        letters[i].style.backgroundColor = "#f7f603";
        incorrectPositions.push(guess[i]);
      } else {
        letters[i].style.backgroundColor = "lightgray";
        incorrectLetter.push(guess[i]);
      }
    }

    if (correctCount === wordToGuess.length) {
      resultMessage.textContent = "Parabéns! Você adivinhou a palavra!";
      document.getElementById("guess-button").disabled = true;
      //createConfetti();
    } else {
      for (let i = 0; i < wordToGuess.length; i++) {
        letters[i].classList.add("shake");
      }

      attemptsLeft--;

      document.getElementById("attempts-left").textContent = attemptsLeft;
      if (attemptsLeft === 0) {
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

  lerArquivoEPreencherArray();
});
