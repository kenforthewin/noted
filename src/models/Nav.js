const { noteDir, metafile, firstNote } = require("../utils/constants");

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
    this.orderedKeys = this.orderedKeys.bind(this);
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
      this.updateTab(note.index);
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
    await this.createNote(firstNote, false);
  }

  async updateMetaFile() {
    const file = await fs.open(metafile, "w+");
    await file.writeFile(JSON.stringify(this.meta));

    await file.close();
  }

  async createNote(body = "", updateTab = true) {
    let noteIndex = 0;
    if (this.orderedKeys().length > 0) {
      noteIndex = parseInt(this.orderedKeys()[0].split("_")[1]) + 1;
    }
    const note = new Note(noteIndex, this);
    await note.resetFile(body);
    this.meta.notes[note.name] = {
      createdAt: new Date().toISOString(),
      title: ""
    };
    if (updateTab) {
      this.orderedKeys(true);
      this.updateTab(noteIndex);
    }
    await this.switchNote(noteIndex);
  }

  async switchNote(noteIndex) {
    if (this.currentNote) {
      this.currentNote.clearTimer();
      await this.currentNote.writeFile();
    }
    let noteTab = document.getElementById(`tab-${this.meta.currentNote}`);
    if (noteTab) {
      noteTab.className = "tab";
    }
    this.meta.currentNote = noteIndex;
    this.currentNote = null;
    await this.updateMetaFile();
    await this.getCurrentNote();
    noteTab = document.getElementById(`tab-${noteIndex}`);
    if (noteTab) {
      noteTab.className = "tab selected";
    }
  }

  newNoteIndex(direction = "down") {
    if (!this.currentNote) return;
    const keylength = this.orderedKeys().length;
    const orderedIndex = this.orderedKeys().indexOf(this.currentNote.name);
    const newIndex = orderedIndex - (direction === "up" ? 1 : -1);

    if (newIndex < 0 || newIndex >= keylength) {
      return -1;
    }
    return parseInt(this.orderedKeys()[newIndex].split("_")[1]);
  }

  async deleteNote() {
    const noteName = this.currentNote.name;
    delete this.meta.notes[noteName];
    this.currentNote.clearTimer();
    await this.currentNote.deleteFile();

    const i = this.currentNote.index;

    if (this.orderedKeys(true).length === 0) {
      await this.createNote();
    } else {
      await this.onTabClick(this.newNoteIndex());
    }
    this.removeTab(i);
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

  removeTab(index) {
    document.getElementById(`tab-${index}`).remove();
  }

  updateTab(index) {
    const tab = document.getElementById(`tab-${index}`);

    const tabs = document.getElementById("tabs");
    if (!tab) {
      tabs.prepend(this.renderTab(index));
      return;
    }
    const key = `note_${index}`;
    const newTab = tab.cloneNode();
    newTab.id = `tab-${index}`;
    let t = document.createTextNode(this.meta.notes[key].title);
    newTab.appendChild(t);
    newTab.onclick = function() {
      if (this.onTabClick) {
        this.onTabClick(index);
      }
    }.bind(this);

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
    const tabs = document.getElementById("tabs");

    this.orderedKeys().forEach(key => {
      const i = parseInt(key.split("_")[1]);
      const noteTab = this.renderTab(i);
      if (this.meta.currentNote === i) {
        noteTab.className = "tab selected";
      }
      tabs.append(noteTab);
    });
  }

  orderedKeys(refresh = false) {
    if (this.keysOrdered && !refresh) {
      return this.keysOrdered;
    }
    this.keysOrdered = Object.keys(this.meta.notes).sort((a, b) => {
      if (this.meta.notes[a].createdAt > this.meta.notes[b].createdAt) {
        return -1;
      }

      return 1;
    });
    return this.keysOrdered;
  }
}

module.exports = Nav;
