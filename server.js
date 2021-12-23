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
  app.use('/data', express.static('data'))
  // app.use('/data', express.static('data'))
  response.sendFile(__dirname + "/views/wikipedia_fly.html");
});

app.get("/sketch", function (request, response) {
  app.use('/static', express.static('static'))
  app.use('/modules', express.static('modules'))
  // app.use('/data', express.static('data'))
  response.sendFile(__dirname + "/views/sketch.html");
});



// //Listening with a link
// app.listen(port, () => {
//   console.log(`wExplore-3D app listening at http://localhost:${port}`);
// });

var server = app.listen(process.env.PORT || 3000, listen);

// This call back just tells us that the server has started
function listen() {
    var host = server.address().address;
    var port = server.address().port;
    console.log('App listening at http://' + host + ':' + port);
    console.log('App listening at http://localhost:'+ port);
}


// // WebSocket Portion
// // WebSockets work with the HTTP server
// const io = require('socket.io')(server, {
//   cors: {
//       origin: "http://localhost:3000",
//       methods: ["GET", "POST"],
//       transports: ['websocket', 'polling'],
//       credentials: true
//   },
//   allowEIO3: true
// });



// // Register a callback function to run when we have an individual connection
// // This is run for each individual user that connects
// io.sockets.on('connection',
//   // We are given a websocket object in our function
//   function (socket) {

//       console.log("We have a new client: " + socket.id);

//       // When this user emits, client side: socket.emit('otherevent',some data);
//       socket.on('mouse',
//           function (data) {
//               // Data comes in as whatever was sent, including objects
//               console.log("Received: 'mouse' " + data.x + " " + data.y);

//               // Send it to all other clients
//               socket.broadcast.emit('mouse', data);

//               // This is a way to send to everyone including sender
//               // io.sockets.emit('message', "this goes to everyone");

//           }
//       );

//       // When this user emits, client side: socket.emit('otherevent',some data);
//       socket.on('msg',
//           function (msg) {
//               // Data comes in as whatever was sent, including objects
//               // console.log(msg);

//               // Send it to all other clients
//               socket.broadcast.emit('msg', msg);

//               // This is a way to send to everyone including sender
//               // io.sockets.emit('message', "this goes to everyone");

//           }
//       );
//       socket.on('disconnect', function () {
//           console.log("Client has disconnected");
//       });
//   }
// );
