import { lerArquivoEPreencherArray } from './fetchData.mjs';
import { initUI } from './ui.mjs';
export const PONTUACAO_MAXIMA = 2000;
export const API = "https://seed-unexpected-rhythm.glitch.me/";
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
  subject: "dev"
}

document.addEventListener("DOMContentLoaded", function () {
  initUI();
  lerArquivoEPreencherArray(0);
});
