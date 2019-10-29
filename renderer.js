const { uriFromPath } = require("./src/utils/uriFromPath");

// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

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
  // monacoEditor.onKeyDown(onMonacoKeyDown);

  let note;
  nav.setup().then(async function() {
    note = nav.getCurrentNote();
    const el = await note.renderMD();
    mdElement.innerHTML = el;

    monacoEditor.getModel().setValue(note.body);
  });

  function onDidChangeModelContent(e) {
    if (note) {
      note.updateNote(monacoEditor.getValue());
    }
  }

  async function switchToMDMode(e) {
    editMode = false;
    mdElement.className = "md-container";
    monacoContainer.className = "container hidden";
    mdElement.innerHTML = await note.renderMD();
  }

  window.addEventListener("resize", function() {
    if (!monacoEditor) return;

    monacoEditor.layout();
  });

  const tabs = document.getElementById("tabs");
  for (let i = 0; i < 15; i++) {
    tabs.append(tabDiv.cloneNode());
  }

  function switchToEditMode(e) {
    editMode = true;
    mdElement.className = "md-container hidden";
    monacoContainer.className = "container";
    monacoEditor.layout();
  }
  mdElement.ondblclick = switchToEditMode;

  document.addEventListener("keydown", onMonacoKeyDown);

  async function onMonacoKeyDown(e) {
    if (editMode && e.keyCode === 27 /*esc*/) {
      switchToMDMode();
    } else if (!editMode && e.keyCode === 73 /*i*/) {
      switchToEditMode();
    }
  }
});
