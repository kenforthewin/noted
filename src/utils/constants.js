const homedir = require("os").homedir();
const notedDir = `${homedir}/.noted`;
const noteDir = `${notedDir}/notes`;
exports.noteDir = noteDir;
const metafile = `${notedDir}/meta.json`;
exports.metafile = metafile;

exports.firstNote =
  "# Welcome to Noted\n\n---\n\nNoted is a Markdown notepad app. To see what you can do with Markdown, take a look at [this reference](https://commonmark.org/help/).\n\nNoted starts in view mode. In view mode, your current note is rendered based on its Markdown content, allowing you to view code, links, and other rich text elements.\n\nTo edit the current note's content, switch to edit mode by double-clicking anywhere in the note or by pressing the `i` key. Your notes are automatically saved to disk as you edit them. Once you're done editing your note, press the `esc` key to switch back to view mode.\n\nThe note you're reading right now is editable - go ahead and press `i` to try it out. To create a new note, click `File -> New note`. Enjoy!";
