// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const hljs = require("highlight.js");
var md = require("markdown-it")({
  highlight: function(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return (
          '<pre class="hljs"><code>' +
          hljs.highlight(lang, str, true).value +
          "</code></pre>"
        );
      } catch (__) {}
    }

    return (
      '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + "</code></pre>"
    );
  }
});

let monacoEditor;
const mdElement = document.getElementById("md-container");

let str =
  "# Abc\n\nHi\n\n# Def\n\n1. what\n1. ok\n\n# Ghi\n\n1. ok\n1. Why tho\n\n# What\n\nwhy\n\n# Where\n\n ok Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam sem nisi, finibus sit amet dolor vel, faucibus viverra dui. Donec pulvinar orci nibh, sed dictum quam fringilla ut. Vivamus pulvinar, quam vel rutrum feugiat, augue magna hendrerit tellus, mattis luctus nulla lorem non tortor. Proin quis molestie justo. Sed suscipit pretium ultrices. Mauris ac nisl vulputate elit fermentum sagittis a id risus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae;";
const tabDiv = document.createElement("div");
tabDiv.className = "tab";
const monacoContainer = document.getElementById("container");

(function() {
  const path = require("path");
  const amdLoader = require("monaco-editor/min/vs/loader");
  const amdRequire = amdLoader.require;
  function uriFromPath(_path) {
    var pathName = path.resolve(_path).replace(/\\/g, "/");
    if (pathName.length > 0 && pathName.charAt(0) !== "/") {
      pathName = "/" + pathName;
    }
    return encodeURI("file://" + pathName);
  }
  amdRequire.config({
    baseUrl: uriFromPath(
      path.join(__dirname, "./node_modules/monaco-editor/min")
    )
  });
  // workaround monaco-css not understanding the environment
  self.module = undefined;
  amdRequire(["vs/editor/editor.main"], function() {
    monacoEditor = monaco.editor.create(monacoContainer, {
      value: str,
      language: "markdown",
      quickSuggestions: false,
      codeLens: false,
      wordWrap: "on",
      theme: "vs-dark"
    });

    monacoEditor.onDidChangeModelContent(onDidChangeModelContent);
    monacoEditor.onKeyDown(onMonacoKeyDown);
  });
})();

function onMonacoKeyDown(e) {
  if (e.keyCode === 9) {
    mdElement.className = "md-container";
    monacoContainer.className = "container hidden";
    mdElement.innerHTML = md.render(str);
  }
}

window.addEventListener("resize", function() {
  if (!monacoEditor) return;

  monacoEditor.layout();
});

function onDidChangeModelContent(e) {
  str = monacoEditor.getValue();
}

const tabs = document.getElementById("tabs");
for (let i = 0; i < 15; i++) {
  tabs.append(tabDiv.cloneNode());
}

mdElement.innerHTML = md.render(str);
mdElement.onclick = function(e) {
  mdElement.className = "md-container hidden";
  monacoContainer.className = "container";
  monacoEditor.layout();
};
