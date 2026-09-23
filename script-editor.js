const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class ScriptEditor extends HandlebarsApplicationMixin(ApplicationV2) {
  constructor(item) {
    super();
    this.item = item;
  }

  static DEFAULT_OPTIONS = {
    id: "item-script-editor",
    classes: ["item-script-editor-app"],
    position: { width: 620, height: 520 },
    window: {
      title: "Script do Item",
      resizable: true,
      contentClasses: ["item-script-editor-content"]
    },
    actions: {
      save: ScriptEditor._onSave
    }
  };

  static PARTS = {
    form: {
      template: "modules/item-script-t20/templates/script-editor.html"
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