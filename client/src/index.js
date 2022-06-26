function updateUI() {
    document.getElementsByTagName("chat-app")[0].connectedCallback()
}

let state = "loading"
let myId = ''
let destId = ''
let whoId = ''


peer.on('open', function (id) {
    myId = id
    state = "start"
    updateUI()
});
peer.on('error', function (err) {
    console.log(err)
})


let call = null;

let localStream

let settings = {
    video: {
        deviceId: "default",
        width: {min: 640},
        height: {min: 480}
    },
    audio: {
        deviceId: "default",
        echoCancellation: true
    }
}

async function getStream() {
    let stream = await navigator.mediaDevices.getUserMedia(settings)

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


function doCall() {
    state = "calling"
    updateUI()

    /*let c = peer.connect(destId)
    setupConnection(c, true)*/
    send(destId, "call")
    whoId = destId
}

ondata("call", (from) => {
    whoId = from
    state = "calling-to-me"
    updateUI()
})

function dismissCall() {
    state = "start"
    updateUI()
    send(whoId, "dismiss-call")
}

ondata("dismiss-call", (from) => {
    state = "start"
    updateUI()
})

function acceptCall() {
    state = "loading"
    updateUI()
    send(whoId, "accept-call")
}

ondata("accept-call", async (from) => {
    call = peer.call(from, await getStream());
    setupCall()
})

peer.on('call', async function (c) {
    call = c;
    call.answer(await getStream());
    setupCall();
});

function closeBothCalls() {
    send(whoId, "close-call");
    closeCall()
}

ondata("close-call", () => {
    closeCall()
})

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

async function openSettings() {
    let videoDeviceId = settings.video.deviceId
    let audioDeviceId = settings.audio.deviceId
    state = "settings"
    updateUI()
    let devices = await navigator.mediaDevices.enumerateDevices();
    for (let device of devices) {
        //console.log(device)
        if (device.kind === "videoinput") {
            let section = document.createElement("option")
            section.setAttribute("value", device.deviceId);
            section.innerText = device.label + (device.deviceId === "default" ? " (Default)" : "")
            document.getElementById("video-devices").appendChild(section)
        }
        if (device.kind === "audioinput") {
            let section = document.createElement("option")
            section.setAttribute("value", device.deviceId);
            section.innerText = device.label + (device.deviceId === "default" ? " (Default)" : "")
            document.getElementById("audio-devices").appendChild(section)
        }
    }
    document.getElementById("video-devices").value = videoDeviceId
    document.getElementById("audio-devices").value = audioDeviceId
}

function closeSettings() {
    state = "start"
    updateUI()
}