import { gameData } from "./main.mjs";
import { changeLetterColor } from "./ui.mjs";

export function highlightKeyboardKeys() {
  gameData.incorrectLetter.forEach((letter) => {
    const key = document.querySelector(`[data-key="${letter}"]`);
    changeLetterColor(key);
  });

  gameData.incorrectPositions.forEach((letter) => {
    const key = document.querySelector(`[data-key="${letter}"]`);
    changeLetterColor(key, false);
  });

  gameData.correctLetters.forEach((letter) => {
    const key = document.querySelector(`[data-key="${letter}"]`);
    changeLetterColor(key, true);
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

export function handleTextUpdateInput(text) {
  if (gameData.attemptsLeft > 0) {
    const guessInput = document.getElementById("guess-input");
    guessInput.value = text.toUpperCase();
  }
}
