const WebSocket = require("ws")
const express = require("express")
const http = require("http")

const app = express()

const server = http.createServer(app);

const wsServer = new WebSocket.WebSocketServer({server})


function generateId() {
    return String(Math.floor(Math.random() * 1000))
}

wsServer.on('connection', (ws) => {
    ws.id = generateId()
    ws.send(JSON.stringify({
        "type": "id",
        "from": "server",
        "value": ws.id
    }))
    ws.on('message', m => {
        const decoded = JSON.parse(m);
        const to = decoded.to;
        for (let client of wsServer.clients) {
            if (client.id === to) {
                client.send(JSON.stringify({"type": decoded.type, "from": ws.id, "value": decoded.value}))
            }
        }
    });
    ws.on('close', () => {
    })
})

app.use(express.static('client'));

server.listen(8999, () => console.log("Server started on port 8999"))
