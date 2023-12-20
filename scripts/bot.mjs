//const fetch = require("node-fetch");
//const tmi = require('tmi.js');
import tmi from "tmi.js";
import { handleTextUpdateInput } from "./keyboard.mjs";
import { f5, gameData } from "./main.mjs";
import { checkGuess } from "./gameLogic.mjs";
import { getPosicao } from "./score.mjs";

const channels = ["juraskpark"];
var cooldown = new Array(channels.length).fill(0);

const client = new tmi.Client({
  options: { debug: true, messagesLogLevel: "info" },
  connection: {
    reconnect: true,
    secure: true,
  },
  identity: {
    username: "",
    password: "oauth:",
  },
  channels: channels,
});

const userImageCache = {};

async function getUserImg(username) {
  if (userImageCache[username]) {
    return Promise.resolve(userImageCache[username]);
  } else {
    return fetch(`https://api.twitch.tv/helix/users?login=${username}`, {
      method: "GET",
      headers: {
        Authorization: "Bearer ",
        "Client-ID": "",
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error("Erro ao fazer a solicitação.");
      })
      .then((data) => {
        const imageUrl =
          data && data.data && data.data[0]
            ? data.data[0].profile_image_url
            : null;
        if (imageUrl) {
          userImageCache[username] = imageUrl;
        }
        return imageUrl;
      })
      .catch((error) => {
        console.error("Ocorreu um erro:", error);
        return null;
      });
  }
}

client.connect().catch(console.error);
client.on("message", async (channel, tags, message, self) => {
  let indexChannel = channels.indexOf(channel);
  let cooldownChannel = cooldown[indexChannel];
  let horaAtual = new Date().getTime();
  let diferenca = horaAtual - cooldownChannel;
  
  if (message.toLowerCase() === "!meuplacar") {
    client.say(channel, `@${tags.username} sua posição é ${getPosicao(tags.username)}º!`);
  } else if (message.toLowerCase() === "!restartgame") {
    if (!f5()){
      client.say(channel, `@${tags.username} primeiro temos que terminar o jogo atual!`);
    }
  } else if (message[0] === "!") {
    message = message.substring(1, message.length);
    if (message.length == gameData.wordToGuess.length) {
      handleTextUpdateInput(message);
      if(checkGuess(tags.username, await getUserImg(tags.username))){
        client.say(channel, `Parabéns @${tags.username}, você acertou a palavra!`);
      }
    } else {
      client.say(channel, `@${tags.username} tamanho incorreto`);
    }
  }
});
