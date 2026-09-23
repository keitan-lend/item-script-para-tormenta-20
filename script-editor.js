const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class ScriptEditor extends HandlebarsApplicationMixin(ApplicationV2) {
  constructor(item) {
    super();
    this.item = item;
  }

  static DEFAULT_OPTIONS = {
    id: "item-script-editor",
    title: "Script do Item",
    template: "modules/item-script-t20/templates/script-editor.html",   // ← trocado
    width: 600,
    height: "auto",
    actions: {
      save: ScriptEditor._onSave
    }
  };

  async _prepareContext(options) {
    const script = this.item.getFlag("item-script-t20", "script") || "";   // ← trocado
    return {
      item: this.item,
      script: script
    };
  }

  static async _onSave(event, target) {
    const form = this.element.querySelector("form");
    const formData = new foundry.applications.ux.FormDataExtended(form);
    const script = formData.object.script;
    await this.item.setFlag("item-script-t20", "script", script);   // ← trocado
    ui.notifications.info("Script salvo.");
    this.close();
  }
}