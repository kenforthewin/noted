// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

let monacoEditor

(function() {
  const path = require('path')
  const amdLoader = require('./node_modules/monaco-editor/min/vs/loader');
  const amdRequire = amdLoader.require;
  const amdDefine = amdLoader.require.define;
  function uriFromPath(_path) {
    var pathName = path.resolve(_path).replace(/\\/g, '/');
    if (pathName.length > 0 && pathName.charAt(0) !== '/') {
      pathName = '/' + pathName;
    }
    return encodeURI('file://' + pathName);
  }
  amdRequire.config({
    baseUrl: uriFromPath(path.join(__dirname, './node_modules/monaco-editor/min'))
  });
  // workaround monaco-css not understanding the environment
  self.module = undefined;
  amdRequire(['vs/editor/editor.main'], function() {
    monacoEditor = monaco.editor.create(document.getElementById('container'), {
      value: [
        '# Noted'
      ].join('\n'),
      language: 'markdown',
      quickSuggestions: false,
      codeLens: false,
      wordWrap: 'on',
      theme: 'vs-dark'
    });

    monacoEditor.onDidChangeModelContent(onDidChangeModelContent)
  });
})()

window.addEventListener('resize', function() {
  monacoEditor.layout()
})

function onDidChangeModelContent(e) {
  console.log(monacoEditor.getValue())
}
