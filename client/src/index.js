function updateUI() {
    document.getElementsByTagName("chat-app")[0].connectedCallback()
}

let state = "loading"
let myId = ''
let destId = ''
let whoId = ''

let acceptCall = null;
let dismissCall = null;
let closeBothCalls = null

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
peer.on('open', function (id) {
    myId = id
    state = "start"
    updateUI()
});
peer.on('error', function (err) {
    console.log(err)
})

peer.on('call', async function (c) {
    state = "loading"
    updateUI()
    call = c;
    call.answer(await getStream());
    setupCall();
});
peer.on('connection', function (c) {
    setupConnection(c)

    /*conn.on('close', function () {
        for (let conns in peer.connections) {
            peer.connections[conns].forEach((conn, index, array) => {
                console.log(`closing ${conn.connectionId} peerConnection (${index + 1}/${array.length})`, conn.peerConnection);
                conn.peerConnection.close();

                // close it using peerjs methods
                if (conn.close)
                    conn.close();
            });
        }
        callClosed()
    })*/
})

let call = null;

let localStream

async function getStream() {
    let stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true})

    localStream = stream;
    return stream
}

function setupCall() {
    call.on('stream', function (stream) {
        state = "chatting"
        updateUI()
        let mv = document.getElementById("main-video")
        mv.height = innerHeight
        mv.width = innerWidth
        mv.srcObject = stream
        console.log(stream.id, localStream.id)

        mv = document.getElementById("my-video")
        mv.height = localStream.getVideoTracks()[0].getSettings().height / 3
        mv.width = localStream.getVideoTracks()[0].getSettings().width / 3
        console.log(localStream.getVideoTracks()[0].getSettings().width, mv.width)
        mv.srcObject = localStream
    });
    call.on('close', function () {
        console.log('close')
    });
}

async function realCall(conn) {
    call = peer.call(conn.peer, await getStream());
    closeBothCalls = () => {
        closeCall()
        conn.send({
            type: "close-call"
        })
    }
    setupCall()
}


function updateButtons() {
    {
        let el = document.getElementById("micro-button");
        if (localStream.getAudioTracks()[0].enabled) {
            el.classList.replace("uk-button-secondary", "uk-button-primary");
        } else {
            el.classList.replace("uk-button-primary", "uk-button-secondary");
        }
    }
    {
        let el = document.getElementById("camera-button");
        if (localStream.getVideoTracks()[0].enabled) {
            el.classList.replace("uk-button-secondary", "uk-button-primary");
        } else {
            el.classList.replace("uk-button-primary", "uk-button-secondary");
        }
    }
}

function muteCamera() {
    localStream.getVideoTracks()[0].enabled ^= true
    updateButtons();
}

function muteMicro() {
    localStream.getAudioTracks()[0].enabled ^= true
    updateButtons();
}


function closeCall() {
    call.close();
    state = "start"
    if (localStream != null) {
        const tracks = localStream.getTracks();
        tracks.forEach(function (track) {
            track.stop();
        });
        localStream = null
    }
    updateUI()
}

function doCall() {
    state = "calling"
    updateUI()

    let c = peer.connect(destId)
    setupConnection(c, true)
}