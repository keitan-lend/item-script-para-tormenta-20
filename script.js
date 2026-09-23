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
        await runItemScript(this);
        return result;
      },
      "WRAPPER"
    );
  } else {
    console.warn("Item Script T20: método roll não encontrado.");
  }
});

async function runItemScript(item) {
  const script = item.getFlag("item-script-t20", "script");
  if (script) {
    try {
      const actor = item.actor;
      const token = actor?.getActiveTokens()[0];
      const speaker = ChatMessage.getSpeaker({ actor, token });
      const fn = new Function(
        "actor", "item", "token", "speaker", "ChatMessage", "canvas", "game", "ui",
        `"use strict";(async()=>{${script}})();`
      );
      await fn(actor, item, token, speaker, ChatMessage, canvas, game, ui);
    } catch (err) {
      console.error("Erro ao executar script do item:", err);
      ui.notifications.error("Erro no script do item (veja o console).");
    }
  }
}