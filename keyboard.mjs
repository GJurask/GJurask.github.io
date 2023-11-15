import { gameData } from "./main.mjs";

export function highlightKeyboardKeys() {
  gameData.incorrectLetter.forEach((letter) => {
    const key = document.querySelector(`[data-key="${letter}"]`);
    key.style.backgroundColor = "black";
    key.style.color = "white";
  });

  gameData.incorrectPositions.forEach((letter) => {
    const key = document.querySelector(`[data-key="${letter}"]`);
    key.style.backgroundColor = "#f7f603";
    key.style.color = "black";
  });

  gameData.correctLetters.forEach((letter) => {
    const key = document.querySelector(`[data-key="${letter}"]`);
    key.style.backgroundColor = "green";
    key.style.color = "white";
  });
}

export function handleLetterGuessInput(letter) {
  if (gameData.attemptsLeft > 0) {
    const guessInput = document.getElementById("guess-input");
    const guess = guessInput.value.toUpperCase();
    const letterGuess = letter.textContent;

    if (guess.length < guessInput.maxLength) {
      guessInput.value += letterGuess;
    }
  }
}
