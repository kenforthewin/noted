const { uriFromPath } = require("./src/utils/uriFromPath");
const { remote, ipcRenderer } = require("electron");
const { Menu, MenuItem } = remote;
let monacoEditor;
const mdElement = document.getElementById("md-container");
let editMode = false;
const tabDiv = document.createElement("div");
tabDiv.className = "tab";

const monacoContainer = document.getElementById("container");
const path = require("path");
const amdLoader = require("monaco-editor/min/vs/loader");
const amdRequire = amdLoader.require;
const Nav = require("./src/models/Nav");
amdRequire.config({
  baseUrl: uriFromPath(path.join(__dirname, "./node_modules/monaco-editor/min"))
});

const nav = new Nav();
// workaround monaco-css not understanding the environment
self.module = undefined;
amdRequire(["vs/editor/editor.main"], function() {
  monacoEditor = monaco.editor.create(monacoContainer, {
    language: "markdown",
    quickSuggestions: false,
    codeLens: false,
    wordWrap: "on",
    theme: "vs-dark"
  });

  monacoEditor.onDidChangeModelContent(onDidChangeModelContent);

  let note;
  nav.setup().then(async function() {
    nav.onTabClick = onTabClick;
    note = await nav.getCurrentNote();
    const el = await note.renderMD();
    mdElement.innerHTML = el;

    monacoEditor.getModel().setValue(note.body);

    nav.renderTabs();
    ipcRenderer.on("new-note", async () => {
      await nav.createNote();
      note = await nav.getCurrentNote();
      monacoEditor.getModel().setValue(note.body);

      nav.updateTab(note.index);
      switchToEditMode();
    });
  });

  async function onTabClick(i) {
    await this.switchNote(i);
    note = await this.getCurrentNote();
    monacoEditor.getModel().setValue(note.body);
    switchToMDMode();
  }

  function onDidChangeModelContent(e) {
    if (note) {
      note.updateNote(monacoEditor.getValue());
    }
  }

  function switchToMDMode(e) {
    editMode = false;
    mdElement.className = "md-container";
    monacoContainer.className = "container hidden";
    mdElement.innerHTML = note.renderMD();
  }

  window.addEventListener("resize", function() {
    if (!monacoEditor) return;

    monacoEditor.layout();
  });

  function switchToEditMode(e) {
    editMode = true;
    mdElement.className = "md-container hidden";
    monacoContainer.className = "container";
    monacoEditor.layout();
    monacoEditor.setSelection(
      new monaco.Selection(Infinity, Infinity, Infinity, Infinity)
    );
    setTimeout(() => {
      monacoEditor.focus();
    }, 200);
  }

  document.addEventListener("keydown", onMonacoKeyDown);

  function onMonacoKeyDown(e) {
    if (editMode && e.key === "Escape") {
      switchToMDMode();
    } else if (!editMode && e.key === "i") {
      switchToEditMode();
    } else if (!editMode && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
      if (!note) return;
      const keylength = Object.keys(nav.meta.notes).length;
      const newIndex = note.index + (e.key === "ArrowUp" ? 1 : -1);

      if (newIndex < 0 || newIndex >= keylength) {
        return;
      }

      onTabClick.bind(nav)(newIndex);
    }
  }
});
