import { animateTitleLetters } from "./animation.mjs";
import { decifraDeSubstituicao } from "./decipher.mjs";
import { initiateGame } from "./gameLogic.mjs";
import { gameData, API, HINT_API } from "./main.mjs";
import { loadingLayer } from "./ui.mjs";

export async function getHint(word) {
  word = word.toLowerCase()
  let hint = "";
  try {
    const url = HINT_API.replace("#", word); //letras minusculas);
    let response = await fetch(url);
    if (response.ok) {
      const output = await response.json();
      if (output.length > 0) {
        hint = output[0].xml
          .replace(/(<([^>]+)>)/gi, "")
          .replace(/(\r\n|\n|\r)/gm, " ");
        hint = hint.toLowerCase().trim();

        let replacer = new RegExp(word, "g");
        hint = hint.replace(replacer, "#".repeat(word.length));

        replacer = new RegExp("\\(.+\\) *$", "g");
        hint = hint.replace(replacer, "");
        console.log(hint)
      } else {
        console.log(`SIGNIFICADO NÃO ENCONTRADO`);
        return "";
      }
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    loadingLayer(false);
    const title = document.querySelector(".title");
    title.innerHTML = title.textContent;
  }

  return hint;
}

export async function lerArquivoEPreencherArray(size,twitch) {
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
      if (twitch){
        getPontuacoesTwitch();
      } else {
        getPontuacoes();
      }
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
      putPoints(response, "");      
    } else {
      console.error("Failed to fetch scores:", response.status);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

export async function getPontuacoesTwitch() {
  try {
    const response = await fetch(
      `${API}pontuacoesTwitch`
    );

    if (response.ok) {    
      putPoints(response, "Twitch")
    } else {
      console.error("Failed to fetch scores:", response.status);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}


export async function putPoints(response, leaderboard) {
  console.log('atualizando pontuação')
  const scoreboardTable = document.getElementById("scoreboard" + leaderboard);
  const scoreboardBody = scoreboardTable.querySelector("tbody");
  while (scoreboardBody.firstChild) {
    scoreboardBody.removeChild(scoreboardBody.firstChild);
  }
  const scores = await response.json();
  gameData.leaderboard = scores;

  scores.slice(0, 9).forEach((score, index) => {
    const row = document.createElement("tr");
    const playerPosCell = document.createElement("td");
    playerPosCell.textContent = `${index + 1}º`;
    row.appendChild(playerPosCell);

    const playerImgCell = document.createElement("td");        
    const userIcon = document.createElement("div");
    userIcon.classList.add("user-icon");
    userIcon.style.backgroundImage = `url('${score.img}')`;
    playerImgCell.appendChild(userIcon);
    row.appendChild(playerImgCell);

    const playerNameCell = document.createElement("td");
    playerNameCell.textContent = score.nome;    
    row.appendChild(playerNameCell);

    if (!leaderboard){
      const playerWordCell = document.createElement("td");
      const playerDataCell = document.createElement("td");
      const playerTimeCell = document.createElement("td");
      const playerDicasCell = document.createElement("td");
      playerWordCell.textContent = score.palavra;
      playerDataCell.textContent = score.data;
      playerTimeCell.textContent = score.time;
      playerDicasCell.textContent = score.dicas ? score.dicas : 0;
      row.appendChild(playerWordCell);
      row.appendChild(playerTimeCell);
      row.appendChild(playerDicasCell);
      row.appendChild(playerDataCell);
    } else {
      const nullCell = document.createElement("td");
      nullCell.textContent = "     ";
      row.appendChild(nullCell);
    }
    const playerScoreCell = document.createElement("td");
    playerScoreCell.textContent = score.pontuacao;
    row.appendChild(playerScoreCell);

    scoreboardBody.appendChild(row);
  });
}