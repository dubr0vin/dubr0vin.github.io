function setupConnection(conn) {
    conn.on('open', () => {
        if (buffers[conn.peer]) {
            for (let data of buffers[conn.peer]) {
                conn.send(data)
            }
        }
        conn.on('data', (data) => {
            let x = callbacks[data.type];
            if (x) {
                x(conn.peer, x.data)
            }
        })
    })
    conn.on('close', () => {
        connections[conn.peer] = undefined
    })
}

let peer = new Peer({
    config: {
        iceServers: [
            {
                urls: "stun:openrelay.metered.ca:80",
            },
            {
                urls: "turn:openrelay.metered.ca:80",
                username: "openrelayproject",
                credential: "openrelayproject",
            },
            {
                urls: "turn:openrelay.metered.ca:443",
                username: "openrelayproject",
                credential: "openrelayproject",
            },
            {
                urls: "turn:openrelay.metered.ca:443?transport=tcp",
                username: "openrelayproject",
                credential: "openrelayproject",
            },
        ],
        debug: 3
    }
});

let connections = {}
let buffers = {}
let callbacks = {}

function send(to, type, data = undefined) {
    if (connections[to] === undefined) {
        connections[to] = peer.connect(to)
        setupConnection(connections[to])
    }
    if (connections[to].open) {
        connections[to].send({type, data})
    } else {
        if (buffers[to] === undefined) {
            buffers[to] = []
        }
        buffers[to].push({type, data})
    }
}

function ondata(type, func) {
    callbacks[type] = func
}

peer.on('connection', function (c) {
    connections[c.peer] = c;
    setupConnection(c)
})