document.addEventListener("DOMContentLoaded", function () {
    const wordListElement = document.getElementById("word-list");

    fetch("words.txt")
        .then(response => response.text())
        .then(data => {
            const words = data.split("\n"); // Supondo que as palavras estão separadas por quebras de linha
            words.forEach(word => {
                const listItem = document.createElement("li");
                listItem.textContent = word;
                wordListElement.appendChild(listItem);
            });
        })
        .catch(error => console.error("Erro ao carregar o arquivo:", error));
});
