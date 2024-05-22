import { createServer } from "http";
import url from "url";
import fs from "fs";
import path from "path";

const port = process.env.PORT || 3000;
let allInformation = [];

const server = createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  if (parsedUrl.pathname === "/") {
    const filePath = path.join(process.cwd(), 'form.html');
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    });
  } else if (parsedUrl.pathname === "/submit" && req.method === "POST") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      const formData = new URLSearchParams(body);
      const newInformation = {
        firstName: formData.get("fname"),
        lastName: formData.get("lname"),
        otherName: formData.get("oname"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        gender: formData.get("gender"),
      };

      const databasePath = path.join(process.cwd(), "database.json");
      fs.readFile(databasePath, "utf8", (readErr, data) => {
        if (readErr && readErr.code !== "ENOENT") {
          console.error("Error reading from database: ", readErr);
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Internal server error");
          return;
        }

        if (data) {
          try {
            allInformation = JSON.parse(data);
          } catch (err) {
            console.error("Error parsing data: ", err);
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Internal server error");
            return;
          }
        }

        allInformation.push(newInformation);

        fs.writeFile(
          databasePath,
          JSON.stringify(allInformation),
          (err) => {
            if (err) {
              console.error("Error writing to file: ", err);
              res.writeHead(500, { "Content-Type": "text/plain" });
              res.end("Internal server error");
              return;
            } else {
              console.log("data saved");
              res.writeHead(200, { "Content-Type": "text/plain" });
              res.end("data has been saved");
            }
          }
        );
      });
    });
  } else if (parsedUrl.pathname == "/list") {
    const databasePath = path.join(process.cwd(), "database.json");
    fs.readFile(databasePath, (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
        return;
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(data);
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Not Found");
  }
});

server.listen(port, () => {
  console.log(`server listening at port: ${port}`);
});
