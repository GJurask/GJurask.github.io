import { animateTitleLetters } from "./animation.mjs";
import { decifraDeSubstituicao } from "./decipher.mjs";
import { initiateGame } from "./gameLogic.mjs";
import { gameData, API } from "./main.mjs";
import { loadingLayer } from "./ui.mjs";

export async function lerArquivoEPreencherArray(size) {
  try {
    loadingLayer(true);
    animateTitleLetters();
    let response = "";
    if (gameData.subject == "dev")
      response = await fetch(API + `palavra/${size}`);
    else if (gameData.subject == "all") {
      response = await fetch(API + `palavraAleatoria/${size}`);
    }

    gameData.gotResponse = true;
    if (response.ok) {
      const title = document.querySelector(".title");
      title.innerHTML = title.textContent;

      const output = await response.json();
      gameData.wordToGuess = decifraDeSubstituicao(output.palavra.trim());

      getPontuacoes();
      initiateGame();
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    loadingLayer(false);
    const title = document.querySelector(".title");
    title.innerHTML = title.textContent;
  }
}

export async function getPontuacoes() {
  try {
    const response = await fetch(
      `${API}pontuacoes/${gameData.wordToGuess.length}`
    );

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
