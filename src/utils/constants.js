const homedir = require("os").homedir();
const notedDir = `${homedir}/.noted`;
const noteDir = `${notedDir}/notes`;
exports.noteDir = noteDir;
const metafile = `${notedDir}/meta.json`;
exports.metafile = metafile;
