const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class ScriptEditor extends HandlebarsApplicationMixin(ApplicationV2) {
  constructor(item) {
    super();
    this.item = item;
  }

  static DEFAULT_OPTIONS = {
    id: "item-script-editor",
    title: "Script do Item",
    template: "modules/item-script-t20/templates/script-editor.html",
    position: { width: 620, height: 500 },
    window: {
      resizable: true,
      contentClasses: ["item-script-editor-window"]
    },
    actions: {
      save: ScriptEditor._onSave
    }
  };

  async _prepareContext(options) {
    const script = this.item.getFlag("item-script-t20", "script") || "";
    return {
      item: this.item,
      script: script
    };
  }

  static async _onSave(event, target) {
    const textarea = this.element.querySelector("textarea[name='script']");
    const script = textarea?.value ?? "";
    await this.item.setFlag("item-script-t20", "script", script);
    ui.notifications.info("Script salvo.");
    this.close();
  }
}