import { ScriptEditor } from "./script-editor.js";

export const itemScriptT20 = {
  ID: "item-script-t20"   // ← trocado
};

// Função auxiliar que adiciona o botão (evitando duplicatas)
function addScriptButton(sheet, html) {
  if (html.find(".script-btn").length) return;
  const btn = $(`<a class="script-btn"><i class="fas fa-terminal"></i> Script</a>`);
  btn.click(() => new ScriptEditor(sheet.item).render(true));
  html.find(".window-header").append(btn);
}

Hooks.on("renderItemSheet", (sheet, html) => addScriptButton(sheet, html));

Hooks.on("renderItemSheetV2", (sheet, html) => addScriptButton(sheet, html));

Hooks.once("ready", () => {
  const ItemT20 = CONFIG.Item.documentClass;
  if (ItemT20?.prototype?.roll) {
    window.ItemT20 = ItemT20;
    libWrapper.register(
      "item-script-t20",   // ← trocado (o nome do módulo registrado no libWrapper)
      "ItemT20.prototype.roll",
      async function (wrapped, ...args) {
        const result = await wrapped(...args);
        await runItemScript(this);
        return result;
      },
      "WRAPPER"
    );
  } else {
    console.warn("Item Script T20: método roll não encontrado. O script não será executado automaticamente.");
  }
});

async function runItemScript(item) {
  const script = item.getFlag("item-script-t20", "script");   // ← trocado
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