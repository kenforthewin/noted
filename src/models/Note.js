const { md } = require("../utils/md");
const fs = require("fs").promises;

const WAIT_INTERVAL = 200;

class Note {
  constructor(file) {
    this.file = file;

    this.fileContents = this.fileContents.bind(this);
    this.readFile = this.readFile.bind(this);
    this.writeFile = this.writeFile.bind(this);
    this.updateNote = this.updateNote.bind(this);
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
    await fs.writeFile(this.file, this.body, { encoding: "utf8" });
  }

  async renderMD() {
    return md.render(await this.fileContents(true));
  }

  updateNote(value) {
    this.body = value;
    clearTimeout(this.timer);
    this.timer = setTimeout(this.writeFile, WAIT_INTERVAL);
  }
}

module.exports = Note;
