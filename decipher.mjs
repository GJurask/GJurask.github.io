const chaveSecreta = 5;

export function decifraDeSubstituicao(palavraCriptografada) {
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