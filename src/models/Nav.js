const fs = require("fs").promises;
const Note = require("./Note");

const homedir = require("os").homedir();
const notedDir = `${homedir}/.noted`;
const noteDir = `${notedDir}/notes`;
const metafile = `${notedDir}/meta.json`;

const baseMeta = {
  notes: {},
  currentNote: null
};

class Nav {
  constructor() {
    this.setup = this.setup.bind(this);
    this.createNotedDir = this.createNotedDir.bind(this);
    this.loadMetaFile = this.loadMetaFile.bind(this);
    this.createNote = this.createNote.bind(this);
    this.updateMetaFile = this.updateMetaFile.bind(this);
    this.firstSetup = this.firstSetup.bind(this);
    this.deleteNote = this.deleteNote.bind(this);
    this.getCurrentNote = this.getCurrentNote.bind(this);
  }

  async setup() {
    try {
      await fs.readdir(noteDir);
    } catch (err) {
      await this.createNotedDir();
    }

    await this.loadMetaFile();
  }

  async loadMetaFile() {
    const file = await fs.open(metafile, "r+");
    const fileContents = await file.readFile({ encoding: "utf8" });

    if (fileContents.length === 0) {
      await this.firstSetup();
    } else {
      this.meta = JSON.parse(fileContents);
    }
    await file.close();
  }

  async firstSetup() {
    this.meta = baseMeta;
    await this.createNote();
  }

  async updateMetaFile() {
    const file = await fs.open(metafile, "r+");
    await file.writeFile(JSON.stringify(this.meta));

    await file.close();
  }

  async createNote() {
    const noteName = `note_${Object.keys(this.meta.notes).length}`;
    this.meta.notes[noteName] = {
      createdAt: new Date().toDateString(),
      title: ""
    };
    this.meta.currentNote = noteName;
    await this.updateMetaFile();
    const file = await fs.open(`${noteDir}/${noteName}.md`, "r+");
    await file.writeFile("");
    await file.close();

    return noteName;
  }

  async deleteNote(noteName) {
    delete this.meta.notes[noteName];
  }

  async createNotedDir() {
    await fs.mkdir(noteDir, { recursive: true });
  }

  getCurrentNote() {
    const noteName = this.meta.currentNote;
    this.currentNote =
      this.currentNote || new Note(`${noteDir}/${noteName}.md`);
    return this.currentNote;
  }
}

module.exports = Nav;
