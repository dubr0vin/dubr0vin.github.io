const WebSocket = require("ws")
const express = require("express")
const http = require("http")

const app = express()

const server = http.createServer(app);

const ws =  new WebSocket.WebSocketServer({server})

app.use(express.static('client'));

server.listen(8999, () => console.log("Server started on port 8999"))
