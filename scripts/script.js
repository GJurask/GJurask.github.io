document.addEventListener("DOMContentLoaded", function () {
  let wordBank = [];
  let wordToGuess = "";
  let attemptsLeft = 6;
  let correctLetters = [];
  let incorrectPositions = [];
  let incorrectLetter = [];
  let timerInterval;
  let timer = 0;
  let dicasDadas = 0;
  const PONTUACAO_MAXIMA = 2000;
  let pontuacaoFinal = PONTUACAO_MAXIMA;
  let custoDica = 0;
  const API = "https://seed-unexpected-rhythm.glitch.me/";
  const chaveSecreta = 5;

  const timerAudio = document.getElementById("timerAudio");
  const victoryAudio = document.getElementById("victoryAudio");
  const fAudio = document.getElementById("fAudio");

  function playAudio(audioElement) {
    const playPromise = audioElement.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {})
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
  

  function decifraDeSubstituicao(palavraCriptografada) {
    const alfabeto = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    const decifrarLetra = (letra, chaveSecreta) => {
      const indice = alfabeto.indexOf(letra);
      if (indice === -1) return letra;

      let indiceDecifrado = (indice - chaveSecreta) % alfabeto.length;
      if (indiceDecifrado < 0) indiceDecifrado += alfabeto.length;
      return alfabeto[indiceDecifrado];
    };

    const palavraDescriptografada = palavraCriptografada
      .toUpperCase()
      .split("")
      .map((letra) => decifrarLetra(letra, chaveSecreta))
      .join("");

    return palavraDescriptografada;
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
        wordToGuess = decifraDeSubstituicao(output.palavra.trim());

        getPontuacoes();
        initiateGame();
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      const title = document.querySelector(".title");
      title.innerHTML = title.textContent;
    }
  }


  async function getPontuacoes() {
    try {
      const response = await fetch(`${API}pontuacoes/${wordToGuess.length}`);

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
          const playerDicasCell = document.createElement("td");

          playerNameCell.textContent = score.nome;
          playerScoreCell.textContent = score.pontuacao;
          playerWordCell.textContent = score.palavra;
          playerDataCell.textContent = score.data;
          playerTimeCell.textContent = score.time;
          playerDicasCell.textContent = score.dicas ? score.dicas : 0;

          row.appendChild(playerNameCell);
          row.appendChild(playerScoreCell);
          row.appendChild(playerWordCell);
          row.appendChild(playerTimeCell);
          row.appendChild(playerDicasCell);
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
    updateScore();
  }
  

  function updateScore() {
    const pontuacaoBase = 1400;
    const tentativasBonus = attemptsLeft * 100;

    let corretasDistintas = new Set(correctLetters);
    let posicoesInconrretasDistintas = new Set(incorrectPositions);
    const letras =
      incorrectLetter.length * 25 +
      posicoesInconrretasDistintas.size * 30 +
      corretasDistintas.size * 50;

    pontuacaoFinal =
      pontuacaoBase + tentativasBonus - timer - letras - dicasDadas * custoDica;

    const timerDisplay = document.getElementById("pontos");
    timerDisplay.textContent = pontuacaoFinal;

    if (pontuacaoFinal <= 500 && !timerDisplay.classList.contains("red-font")) {
      timerDisplay.classList.add("red-font");
    } else if (
      pontuacaoFinal > 500 &&
      timerDisplay.classList.contains("red-font")
    ) {
      timerDisplay.classList.remove("red-font");
    }
  }


  function formatTime(timeInSeconds) {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  function initiateGame() {
    const guessInput = document.getElementById("guess-input");
    guessInput.maxLength = wordToGuess.length;

    attemptsLeft = 6;
    correctLetters = [];
    incorrectPositions = [];
    incorrectLetter = [];
    timer = 0;
    pontuacaoFinal = PONTUACAO_MAXIMA;
    dicasDadas = 0;

    document.getElementById("guess-input").value = "";
    document.getElementById("attempts-left").textContent = attemptsLeft;
    document.getElementById("attempts-left-message").textContent =
      "Tentativas restantes: ";
    document.getElementById("guess-button").disabled = false;

    custoDica = Math.floor(PONTUACAO_MAXIMA / (wordToGuess.length - 1));
    document.getElementById(
      "custo-dica"
    ).textContent = `Você perde ${custoDica} pontos por dica!`;

    updateTimerDisplay();
    createLetterGrid();
    clearKeyStyles();
  }

  function initUI() {
    document
      .getElementById("guess-button")
      .addEventListener("click", checkGuess);

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

    const buttons = document.querySelectorAll(".change-size-game");
    buttons.forEach((button) => {
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


  function createLetterGrid() {
    const preencher = document.getElementById("preencher");
    const espelho = document.getElementById("espelho-resposta");

    while (preencher.firstChild) {
      preencher.removeChild(preencher.firstChild);
    }
    if (espelho.firstChild) {
      espelho.removeChild(espelho.firstChild);
    }

    for (let i = attemptsLeft; i > 0; i--) {
      preencher.appendChild(createRow(i));
    }
    espelho.appendChild(createRow("espelho"));
  }


  function createRow(n) {
    const wordDisplay = document.createElement("div");
    wordDisplay.className = "word-display";
    wordDisplay.id = "word-display" + n;

    for (const letterToGuess of wordToGuess) {
      const letter = document.createElement("div");
      letter.className = "letter";
      wordDisplay.appendChild(letter);
    }
    return wordDisplay;
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

  function openEndScreen() {
    const modalFim = document.getElementById("modal-fim");
    modalFim.classList.remove("hide");
    modalFim.classList.add("show");
  }


  function savePlayerScore() {
    const playerName = document.getElementById("player-name").value;
    if (playerName.trim() === "") {
      showToast("Digite seu nome para salvar a pontuação.");
      return;
    }

    savePoints();
    closeFim();
  }
  

  function provideHint() {
    let respelhoResposta = document.getElementById("espelho-resposta");
    const espelhoLetras = respelhoResposta.querySelectorAll(".letter");
    const posicoes = arrayPosicoesAleatorias(wordToGuess.length);

    for (let i = espelhoLetras.length - 1; i >= 0; i--) {
      const j = posicoes[i];
      if (espelhoLetras[j].textContent === "") {
        espelhoLetras[j].textContent = wordToGuess[j];
        espelhoLetras[j].style.backgroundColor = "#00919c";
        correctLetters.push(wordToGuess[j]);
        startTimer();
        dicasDadas++;
        highlightKeyboardKeys();
        break;
      }
    }
  }
  

  function arrayPosicoesAleatorias(tamanho) {
    let arrayBase = Array.from({ length: tamanho }, (_, index) => index);

    for (let i = arrayBase.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arrayBase[i], arrayBase[j]] = [arrayBase[j], arrayBase[i]];
    }

    return arrayBase;
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

  /*
        function toggleConfigModal() {
          const modal = document.getElementById("modal-config");
          if (modal.style.display == "block") {
            modal.style.display = "none";
          } else {
            modal.style.display = "block";
          }
        }
*/


  function toggleThemeMode() {
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
    timerInterval = undefined;
  }

  function checkGuess() {
    startTimer();

    const guessInput = document.getElementById("guess-input");
    const guess = guessInput.value.toUpperCase();
    const normalizedGuess = removeAccents(guess);

    if (guess.length !== wordToGuess.length) {
      showToast("Não sabe contar? Nem falo nada");
      return;
    }

    const resultMessage = document.getElementById("attempts-left-message");
    const wordDisplay = document.getElementById("word-display" + attemptsLeft);
    const letters = wordDisplay.querySelectorAll(".letter");

    const espelhoWordDisplay = document.getElementById("word-displayespelho");
    const espelhoLetters = espelhoWordDisplay.querySelectorAll(".letter");

    let copiaWordToGuess = removeAccents(wordToGuess).split('');;

    let correctCount = 0;

    for (let i = 0; i < wordToGuess.length; i++) {
      letters[i].textContent = guess[i];
      if (normalizedGuess[i] === removeAccents(wordToGuess[i])) {
        letters[i].style.backgroundColor = "#00919c";
        espelhoLetters[i].style.backgroundColor = "#00919c";
        espelhoLetters[i].textContent = guess[i];
        correctLetters.push(normalizedGuess[i]);
        correctCount++;
        copiaWordToGuess[i] = "_";
      }
    }

    for (let i = 0; i < wordToGuess.length; i++) {
      if (normalizedGuess[i] === removeAccents(wordToGuess[i])) {
      } else if (copiaWordToGuess.join('').includes(normalizedGuess[i])) {
        letters[i].style.backgroundColor = "#f7f603";
        incorrectPositions.push(normalizedGuess[i]);
        copiaWordToGuess[copiaWordToGuess.indexOf(normalizedGuess[i])] = "_";
      } else {
        letters[i].style.backgroundColor = "lightgray";
        incorrectLetter.push(normalizedGuess[i]);
      }
    }

    if (correctCount === wordToGuess.length) {
      stopTimer();
      playAudio(victoryAudio);
      document.getElementById("guess-button").disabled = true;
      openEndScreen();

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
        document.getElementById("attempts-left").textContent = ".";
        resultMessage.textContent = `Suas tentativas acabaram. F`;

        for (let i = 0; i < wordToGuess.length; i++) {
          espelhoLetters[i].textContent = wordToGuess[i];
          if (espelhoLetters[i].style.backgroundColor != "#00919c")
            espelhoLetters[i].style.backgroundColor = "red";
        }
        document.getElementById("guess-button").disabled = true;
      }
    }

    guessInput.value = "";
    guessInput.focus();

    highlightKeyboardKeys();
  }
  

  function highlightKeyboardKeys() {
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
      key.style.backgroundColor = "#00919c";
      key.style.color = "white";
    });
  }


  function clearKeyStyles() {
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

  function removeAccents(texto) {
    return texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase();
  }


  function savePoints() {
    const nome = document.getElementById("player-name").value.toUpperCase();
    const pontuacao = pontuacaoFinal;
    const palavra = wordToGuess;
    const dicas = dicasDadas;
    const data = new Date().toLocaleDateString("pt-BR");
    const time = formatTime(timer);
    const novaPontuacao = {
      nome,
      pontuacao,
      palavra,
      data,
      time,
      dicas,
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
        getPontuacoes();
      })
      .catch((error) => {
        console.error(error);
      });
  }

  initUI();
  lerArquivoEPreencherArray(0);
});
