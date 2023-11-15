export function playAudio(audioElement) {
  const playPromise = audioElement.play();

  if (playPromise !== undefined) {
    playPromise
      .then(() => {})
      .catch((error) => {
        console.error("Erro ao iniciar a reprodução:", error);
      });
  }
}

export function formatTime(timeInSeconds) {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;
  return `${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}
export function arrayPosicoesAleatorias(tamanho) {
  let arrayBase = Array.from({ length: tamanho }, (_, index) => index);

  for (let i = arrayBase.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arrayBase[i], arrayBase[j]] = [arrayBase[j], arrayBase[i]];
  }

  return arrayBase;
}

export function removeAccents(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}