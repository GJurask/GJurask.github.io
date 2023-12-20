import { getPontuacoes, getPontuacoesTwitch, putPoints } from "./fetchData.mjs";
import { gameData, API } from "./main.mjs";
import { closeFim, showToast } from "./ui.mjs";
import { formatTime } from "./utils.mjs";

export function savePlayerScore() {
  const playerName = document.getElementById("player-name").value;
  if (playerName.trim() === "") {
    showToast("Digite seu nome para salvar a pontuação.");
    return;
  }

  savePoints();
  closeFim();
}

function savePoints() {
  const nome = document.getElementById("player-name").value.toUpperCase();
  const pontuacao = gameData.pontuacaoFinal;
  const palavra = gameData.wordToGuess;
  const dicas = gameData.dicasDadas;
  const data = new Date().toLocaleDateString("pt-BR");
  const time = formatTime(gameData.timer);
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

export function getPosicao(username){
  //filtrar o array leaderboard pelo nome do usaruio
  console.log(gameData.leaderboard)
  return gameData.leaderboard.findIndex((user) => user.nome == username) + 1;  
}

export async function saveTwitchPoints(nome, pontuacao, img) {
  const novaPontuacao = {
    nome,
    pontuacao,
    img
  };
  fetch(API + "salvarPontuacaoTwitch", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(novaPontuacao),
  })
    .then((response) => {
      putPoints(response, "Twitch")
    })
    .catch((error) => {
      console.error(error);
    });

}
