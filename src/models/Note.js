const { md } = require("../utils/md");
const fs = require("fs").promises;
const { noteDir } = require("../utils/constants");

const WAIT_INTERVAL = 200;

class Note {
  constructor(index, nav) {
    this.index = index;
    this.name = `note_${index}`;
    this.file = `${noteDir}/${this.name}.md`;
    this.nav = nav;
    this.body = "";
    this.dirty = false;
    this.writing = false;

    this.fileContents = this.fileContents.bind(this);
    this.readFile = this.readFile.bind(this);
    this.writeFile = this.writeFile.bind(this);
    this.updateNote = this.updateNote.bind(this);
    this.resetFile = this.resetFile.bind(this);
    this.clearTimer = this.clearTimer.bind(this);
  }

  async resetFile() {
    let file;
    try {
      file = await fs.open(this.file, "r+");
    } catch (err) {
      if (err.code === "ENOENT") {
        file = await fs.open(this.file, "w+");
      }
    }
    await file.writeFile("");
    await file.close();
  }

  async fileContents(refresh = false) {
    if (refresh || typeof this.body !== "string") {
      await this.readFile();
    }

    return this.body;
  }

  async readFile() {
    this.body = await fs.readFile(this.file, "utf8");
  }

  async writeFile() {
    if (this.dirty && !this.writing) {
      this.writing = true;
      await fs.writeFile(this.file, this.body, { encoding: "utf8" });
      await this.nav.updateNoteTitle(this);
      this.dirty = false;
      this.writing = false;
    }
  }

  renderMD() {
    return md.render(this.body);
  }

  updateNote(value) {
    console.log(this);
    this.body = value;
    this.dirty = true;
    this.clearTimer();
    this.timer = setTimeout(this.writeFile, WAIT_INTERVAL);
  }

  clearTimer() {
    clearTimeout(this.timer);
  }
}

module.exports = Note;
