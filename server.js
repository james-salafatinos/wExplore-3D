// server.js
// where your node app starts

// init project
const express = require("express");
const port = 3000;
const app = express();
const path = require('path')


app.use(express.static("public"));

app.get("/", function (request, response) {
  app.use('/static', express.static('static'))
  app.use('/modules', express.static('modules'))
  // app.use('/data', express.static('data'))
  response.sendFile(__dirname + "/views/wikipedia_fly.html");
});


//Listening with a link
app.listen(port, () => {
  console.log(`wExplore-3D app listening at http://localhost:${port}`);
});