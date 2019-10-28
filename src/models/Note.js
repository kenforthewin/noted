const { md } = require("../utils/md");
const fs = require("fs").promises;

class Note {
  constructor(file) {
    this.file = file;

    this.fileContents = this.fileContents.bind(this);
    this.readFile = this.readFile.bind(this);
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

  async renderMD() {
    return md.render(await this.fileContents(true));
  }
}

module.exports = Note;
