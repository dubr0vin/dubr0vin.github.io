const wsConnection = new WebSocket(`${window.location.protocol === "http:" ? "ws" : "wss"}://${window.location.host}`);

wsConnection.onclose = function (event) {
    if (!event.wasClean) {
        alert('Обрыв соединения');
    }
};
wsConnection.onerror = function (error) {
    alert("Ошибка " + error.message);
};

let callbacks = {}
wsConnection.onmessage = function (message) {
    let data = JSON.parse(message.data);
    for (let callback of (callbacks[data.type] || [])) {
        callback(data.from, data.value)
    }
}

export function send(to, type, value) {
    wsConnection.send(JSON.stringify({to, type, value}))
}

export function on(type, callback) {
    callbacks[type] = callback[type] || []
    callbacks[type].push(callback)
}