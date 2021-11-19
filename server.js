require("dotenv").config();
const http = require("http");
const fs = require("fs");
const dayjs = require("dayjs");
require("dayjs/locale/fr");
var localizedFormat = require("dayjs/plugin/localizedFormat");
dayjs.extend(localizedFormat);
dayjs.locale("fr");

let students = [
  { id: "1", name: "Sonia", birth: "2019-05-14" },
  { id: "2", name: "Antoine", birth: "2000-05-12" },
  { id: "3", name: "Alice", birth: "1990-09-14" },
  { id: "4", name: "Sophie", birth: "2001-02-10" },
  { id: "5", name: "Bernard", birth: "1980-08-21" },
];

const host = process.env.APP_LOCALHOST;
const port = process.env.APP_PORT;

http
  .createServer((req, res) => {
    const url = req.url.replace("/", "");

    if (url === "favicon.ico") {
      res.writeHead(200, { "Content-Type": "image/x-icon" });
      res.end();
      return;
    }
    if (url === "bootstrap") {
      res.writeHead(200, { "Content-Type": "text/css" });
      const css = fs.readFileSync("./css/style.css");
      res.write(css);
      res.end();
      return;
    }

    if (url === "") {
      const home = fs.readFileSync("./view/home.html");
      res.writeHead(200, { "Content-Type": "text/html" });
      res.write(home);
      res.end();
    }

    if (url === "students") {
      res.writeHead(200, { "Content-Type": "text/html" });
      let users =
        "<!DOCTYPE html><html><head><meta charset='utf-8'><title>Ajoutez un utilisateur</title><link href='/bootstrap' rel='stylesheet' type='text/css' /></head>";

      for (let i = 0; i < students.length; i++) {
        birth = dayjs(students[i].birth).format("LLLL");
        users += `
                <li> 
                        <b>Name :</b> ${students[i].name} <br/> 
                        <b>Birthday :</b>  ${birth} 
                        <a type="submit" href="/delete:${students[i].id}" class="btn btn-danger">X</a>
                </li>`;
      }
      res.end(`
        <h1>List of students</h1>
        <ul>
            ${users}
        </ul>
        <a href="http://${host}:${port}"><button type="button" class="btn btn-info">Home</button></a>
        `);
    }

    if (url.startsWith("delete:")) {
      const id = url.split(":").pop();
      students = students.filter((elt) => elt.id !== id);

      res.writeHead(301, { Location: `http://${host}:${port}/students` });

      res.end();
    }

    if (req.method === "POST") {
      let body = "";
      req.on("data", (data) => {
        body += data;
      });

      req.on("end", () => {
        let ParamUrl = [];
        let variables = body.split("&");
        const name = variables[0].split("=").pop();
        const birth = variables[1].split("=").pop();

        if (name && birth) {
          students.push({ id: "" + (students.length + 1), name, birth });
        }

        for (let i = 0; i < variables.length; i++) {
          let recup = variables[i].split("=");
          let value = {};
          value[recup[0]] = recup[1];
          ParamUrl.push({ value });
        }

        res.writeHead(301, {
          Location: `http://${host}:${port}`,
        });
        res.end();
      });
    }
  })
  .listen(3000);
console.log(`Server running at http://${host}:${port}`);
