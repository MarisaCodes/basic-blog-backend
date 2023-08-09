const fs = require("fs");
const path = require("path");

const d = fs.readFileSync(
  path.resolve(__dirname, "../static/default/default_pfp.png"),
  {
    encoding: "base64",
  }
);
fs.writeFileSync("./bs64.txt", d);
