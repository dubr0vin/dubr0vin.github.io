function setupConnection(conn, doCall) {
    conn.on('open', () => {
        console.log('opened')
        conn.on('data', function (d) {
            console.log(d)
            if (d.type === "call") {
                acceptCall = () => {
                    state = "loading"
                    updateUI()
                    conn.send({
                        type: "accept-call"
                    })
                }
                dismissCall = () => {
                    state = "start"
                    updateUI()
                    conn.send({
                        type: "dismiss-call"
                    })
                }
                whoId = conn.peer
                state = "calling-to-me"
                updateUI()
            } else if (d.type === "dismiss-call") {
                state = "start"
                updateUI()
                console.log("Звонок сброшен")
            } else if (d.type === "accept-call") {
                state = "loading"
                updateUI()
                realCall(conn);
            } else if (d.type === "close-call") {
                closeCall()
            }
        })
        if (doCall) {
            conn.send({
                type: "call"
            })
            dismissCall = () => {
                state = "start"
                updateUI()
                conn.send({
                    type: "dismiss-call"
                })
            }
        }
    })
}