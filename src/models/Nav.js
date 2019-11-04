const { noteDir, metafile } = require("../utils/constants");

const fs = require("fs").promises;
const Note = require("./Note");

const baseMeta = {
  notes: {},
  currentNote: null
};

const tabDiv = document.createElement("div");
tabDiv.className = "tab";

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
    this.updateNoteTitle = this.updateNoteTitle.bind(this);
    this.updateTab = this.updateTab.bind(this);
    this.switchNote = this.switchNote.bind(this);
    this.renderTab = this.renderTab.bind(this);
    this.renderTabs = this.renderTabs.bind(this);
  }

  async setup() {
    try {
      await fs.readdir(noteDir);
    } catch (err) {
      await this.createNotedDir();
    }

    await this.loadMetaFile();
  }

  async updateNoteTitle(note) {
    const noteTitle = note.body
      .split("\n")[0]
      .replace("#", "")
      .substring(0, 50);
    if (this.meta.notes[note.name].title !== noteTitle) {
      this.meta.notes[note.name].title = noteTitle;
      await this.updateMetaFile();
      this.updateTab(note.index, noteTitle);
    }
  }

  async loadMetaFile() {
    let file;
    try {
      file = await fs.open(metafile, "r+");
    } catch (err) {
      if (err.code === "ENOENT") {
        file = await fs.open(metafile, "w+");
      }
    }
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
    const file = await fs.open(metafile, "w+");
    await file.writeFile(JSON.stringify(this.meta));

    await file.close();
  }

  async createNote() {
    const noteIndex = Object.keys(this.meta.notes).length;
    const note = new Note(noteIndex, this);
    await note.resetFile();
    this.meta.notes[note.name] = {
      createdAt: new Date().toISOString(),
      title: ""
    };
    await this.switchNote(noteIndex);
  }

  async switchNote(noteIndex) {
    if (this.currentNote) {
      this.currentNote.clearTimer();
      await this.currentNote.writeFile();
    }
    let noteTab = document.getElementById(`tab-${this.meta.currentNote}`);
    noteTab.className = "tab";
    this.meta.currentNote = noteIndex;
    this.currentNote = null;
    await this.updateMetaFile();
    await this.getCurrentNote();
    noteTab = document.getElementById(`tab-${noteIndex}`);
    noteTab.className = "tab selected";
  }

  async deleteNote(noteName) {
    delete this.meta.notes[noteName];
  }

  async createNotedDir() {
    await fs.mkdir(noteDir, { recursive: true });
  }

  async getCurrentNote() {
    const noteIndex = this.meta.currentNote;
    if (!this.currentNote) {
      this.currentNote = new Note(noteIndex, this);
      await this.currentNote.readFile();
    }

    return this.currentNote;
  }

  updateTab(index, title) {
    const tab = document.getElementById(`tab-${index}`);
    const tabs = document.getElementById("tabs");
    const newTab = tabDiv.cloneNode();
    newTab.id = `tab-${index}`;
    let t = document.createTextNode(title);
    newTab.appendChild(t);
    if (!tab) {
      tabs.prepend(newTab);
      return;
    }
    tabs.replaceChild(newTab, tab);
  }

  renderTab(i) {
    const key = `note_${i}`;

    const noteTab = tabDiv.cloneNode();
    noteTab.id = `tab-${i}`;

    let t = document.createTextNode(this.meta.notes[key].title);
    noteTab.appendChild(t);
    noteTab.onclick = function() {
      if (this.onTabClick) {
        this.onTabClick(i);
      }
    }.bind(this);
    return noteTab;
  }

  renderTabs() {
    const noteKeys = Object.keys(this.meta.notes);
    const tabs = document.getElementById("tabs");

    for (let i = noteKeys.length - 1; i >= 0; i--) {
      const noteTab = this.renderTab(i);
      if (this.meta.currentNote === i) {
        noteTab.className = "tab selected";
      }
      tabs.append(noteTab);
    }
  }
}

module.exports = Nav;
