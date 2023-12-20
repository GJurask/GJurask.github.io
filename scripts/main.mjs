import { lerArquivoEPreencherArray } from './fetchData.mjs';
import { initUI } from './ui.mjs';
export const PONTUACAO_MAXIMA = 2000;
export const API = "https://seed-unexpected-rhythm.glitch.me/";
export const HINT_API = "https://api.dicionario-aberto.net/word/#/1";

export const gameData = {
  wordToGuess : "",
  attemptsLeft: 6,
  correctLetters : [],
  incorrectPositions : [],
  incorrectLetter : [],
  timer : 0,
  dicasDadas : 0,
  pontuacaoFinal : PONTUACAO_MAXIMA,
  gotResponse : false,
  subject: "all",
  leaderboard: []
}

document.addEventListener("DOMContentLoaded", function () {
  initUI();
  lerArquivoEPreencherArray(0,true);
});

export function f5(){
  if(gameData.attemptsLeft == 0){
    window.location.reload();
    return true;
  } else return false;
}