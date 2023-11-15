import { gameData } from "./main.mjs";

export function animateTitleLetters() {
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

      if (!gameData.gotResponse) {
        setTimeout(function () {
          animateTitleLetters();
        }, 500);
      }
    }
  }, 100);
}