
var BACKEND_CONFIG = {
    restHost: "http://localhost:8080",
    wsHost: "ws://localhost:8080",

    pingInterval: 3000,
    pongTolerance: 9000
}



var ws = null



function getTicket(token) {
    const options = {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token }
    }
    return fetch(BACKEND_CONFIG.restHost + '/v1/ticket', options)
        .then(response => response.json())
        .then(response => response.ticket)
}


function connectWebSocket(onOpen, onClose, onMessage, autoReconnect) {
    var isOpen = ws && [WebSocket.CONNECTING, WebSocket.OPEN].includes(ws.readyState)
    if (isOpen) return Promise.resolve()

    var reconnect = function () {
        console.log("reconnecting in 3 seconds...")
        setTimeout(function () {
            connectWebSocket(onOpen, onClose, onMessage, autoReconnect).catch(reconnect)
        }, 3000)
    }

    return getJwt()
        .then(function (jwt) { return getTicket(jwt) })
        .then(function (ticket) {
            var pingInterval = null
            var lastPong = null

            ws = new WebSocket(BACKEND_CONFIG.wsHost + "/chat?ticket=" + ticket)

            ws.onopen = function (event) {
                pingInterval = setInterval(function () {
                    if (lastPong && (Date.now() - lastPong > BACKEND_CONFIG.pongTolerance)) {
                        clearInterval(pingInterval)
                        ws.close()
                    } else {
                        ws.send("ping")
                    }
                }, BACKEND_CONFIG.pingInterval)
                onOpen(event)
            }

            ws.onclose = function (event) {
                clearInterval(pingInterval)
                onClose(event)
                if (autoReconnect) reconnect()
            }

            ws.onmessage = function (event) {
                if (event.data === "pong") {
                    lastPong = Date.now()
                } else {
                    onMessage(event)
                }
            }
        })
        .catch(reconnect)
}



function sendEvent(chatUserId, text) {
    var messagePayload = { to: chatUserId, text: text };
    console.log('Enviando mensagem:', messagePayload); // Verifique o payload da mensagem
    ws.send(JSON.stringify(messagePayload));
}