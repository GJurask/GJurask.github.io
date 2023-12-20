//const fetch = require("node-fetch");
//const tmi = require('tmi.js');
import tmi from "tmi.js";
import { handleTextUpdateInput } from "./keyboard.mjs";
import { f5, gameData } from "./main.mjs";
import { checkGuess, provideHint } from "./gameLogic.mjs";
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
  } if (message.toLowerCase() === "!meajuda") {
    provideHint(tags.username);
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

  if (message.toLowerCase() === "!cardgame") {
    cooldown[indexChannel] = new Date().getTime();
    client.say(
      channel,
      `@${channel.substring(
        1,
        channel.length
      )}, vai jogar Yu-Gi-Oh! Se não vou ter que chamar o Exódia!!!!!!`
    );
  }
  if (message.toLowerCase() === "!paytowin") {
    cooldown[indexChannel] = new Date().getTime();
    client.say(
      channel,
      `O @${channel.substring(1, channel.length)} é muito pay to win`
    );
  }
  if (message.toLowerCase() === "!peru") {
    cooldown[indexChannel] = new Date().getTime();
    client.say(
      channel,
      `O tamanho do seu peru é de ` +
        (Math.floor(Math.random() * 50) + 5) +
        "cm"
    );
  }
  if (message.toLowerCase() === "!f") {
    cooldown[indexChannel] = new Date().getTime();
    client.say(channel, `@${channel.substring(1, channel.length)} faleceu`);
  }
  if (message.toLowerCase().includes("!gpt")) {
    addToHistory(
      tags.username,
      tags.username + ": " + message.split("!gpt")[1] + "\n"
    );
    body.messages[0].content = historicoGpt[tags.username];
    callGpt(channel, tags.username);
  }

  /*if (tags.username != 'magonegrodeolhosazuis' && tags.username != 'StreamElements'&& tags.username != 'JuraskPark') {
      //client.say(channel, `!redeem tts ${tags.username.substring(0, 5)}: ` + message);
  }*/
});
