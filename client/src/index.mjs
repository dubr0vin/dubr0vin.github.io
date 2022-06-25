import {on, send} from "./ws.mjs";

on("id", (from, value) => {
    send(value, "ping", "test")
    console.log(value)
})

on("ping", (from, value) => {
    send(from, "pong", value)
})
on("pong", (from, value) => {
    console.log("pong", value)
})