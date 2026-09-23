import { ScriptEditor } from "./script-editor.js";

export const itemScriptT20 = {
  ID: "item-script-t20"
};

// Função auxiliar que adiciona o botão (evitando duplicatas)
function addScriptButton(sheet, html) {
  if (html.find(".script-btn").length) return; // evita duplicar

  // Botão nativo do Foundry v14 (mesmo estilo dos outros do cabeçalho)
  const btn = $(`<button type="button" class="header-control icon fa-solid fa-terminal" data-tooltip="Script"></button>`);
  btn.addClass("script-btn"); // usamos essa classe só para controle interno
  btn.click(() => new ScriptEditor(sheet.item).render(true));

  // Posiciona o botão logo ANTES do botão de fechar
  html.find(".window-header .close").before(btn);
}

Hooks.on("renderItemSheet", (sheet, html) => addScriptButton(sheet, html));

// Fallback para sheets V2 (se o sistema já tiver migrado)
Hooks.on("renderItemSheetV2", (sheet, html) => addScriptButton(sheet, html));

Hooks.once("ready", () => {
  const ItemT20 = CONFIG.Item.documentClass;
  if (ItemT20?.prototype?.roll) {
    window.ItemT20 = ItemT20;
    libWrapper.register(
      "item-script-t20",
      "ItemT20.prototype.roll",
      async function (wrapped, ...args) {
        const result = await wrapped(...args);
        await runItemScript(this, result); // <-- Passa o resultado
        return result;
      },
      "WRAPPER"
    );
  } else {
    console.warn("Item Script T20: método roll não encontrado.");
  }
});

async function runItemScript(item, rollResult) {
  const script = item.getFlag("item-script-t20", "script");
  if (!script) return;

  let message = null;

  // 1. Se o resultado já for uma ChatMessage, usa ela
  if (rollResult instanceof ChatMessage) {
    message = rollResult;
  } else {
    // 2. Caso contrário, espera a criação de uma nova mensagem de chat
    //    que contenha rolagens e que seja do item atual.
    message = await waitForItemRollMessage(item);
  }

  // Se não conseguiu capturar a mensagem, avisa e sai
  if (!message || !message.rolls || message.rolls.length === 0) {
    ui.notifications.warn("Item Script T20: Não foi possível capturar a rolagem do item.");
    return;
  }

  const roll = message.rolls[0]; // A primeira rolagem da mensagem

  try {
    const actor = item.actor;
    const token = actor?.getActiveTokens()[0];
    const speaker = ChatMessage.getSpeaker({ actor, token });

    // Passa a rolagem para o script do item
    const fn = new Function(
      "actor", "item", "token", "speaker", "ChatMessage", "canvas", "game", "ui", "roll",
      `"use strict";(async()=>{${script}})();`
    );
    await fn(actor, item, token, speaker, ChatMessage, canvas, game, ui, roll);

  } catch (err) {
    console.error("Erro ao executar script do item:", err);
    ui.notifications.error("Erro no script do item (veja o console).");
  }
}

/**
 * Espera ativamente a criação de uma mensagem de chat que contenha rolagens
 * e que seja do item especificado. Tem um timeout para evitar loop infinito.
 */
function waitForItemRollMessage(item, timeout = 5000) {
  return new Promise((resolve) => {
    const startTime = Date.now();

    // Função que verifica se a última mensagem é a que queremos
    const check = () => {
      // Verifica timeout
      if (Date.now() - startTime > timeout) {
        resolve(null);
        return;
      }

      // Pega a última mensagem do chat
      const lastMessage = game.messages.contents[game.messages.contents.length - 1];

      // Verifica se a mensagem tem rolagens e se é do item atual
      if (lastMessage && lastMessage.rolls && lastMessage.rolls.length > 0) {
        // Tenta identificar se a mensagem é do item atual.
        // O sistema Tormenta 20 geralmente coloca o nome do item no "flavor" ou no "speaker".
        // Vamos verificar o "speaker" (ator) e o "flavor" (nome do item).
        const speaker = lastMessage.speaker;
        const flavor = lastMessage.flavor || "";

        // Verifica se o ator é o mesmo
        if (speaker.actor === item.actor.id) {
          // Verifica se o nome do item está no flavor ou no conteúdo
          if (flavor.includes(item.name) || lastMessage.content.includes(item.name)) {
            resolve(lastMessage);
            return;
          }
        }
      }

      // Se não for, agenda a próxima verificação em 100ms
      setTimeout(check, 100);
    };

    check();
  });
}