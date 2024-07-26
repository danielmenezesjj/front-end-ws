
var loginButton = document.getElementById("login-button")
var logoutButton = document.getElementById("logout-button")
var connectButton = document.getElementById("connect-button")
var chatUsersSelect = document.getElementById("chat-users-select")
var chatMessageInput = document.getElementById("chat-message-input")
var sendButton = document.getElementById("send-button")
var sendButton = document.getElementById("send-button")
var chatMessagesDiv = document.getElementById("chat-messages-div")




function init() {
    handleRedirectCallback()
        .then(function () { return isAuthenticated() })
        .then(function (authenticated) {
            if (authenticated) window.history.replaceState({}, document.title, "/")
            setDisplay("auth-area", authenticated)
            setDisplay("non-auth-area", !authenticated)
            setDisplay("checking-auth-area", false)
            return authenticated && getUser()
        })
        .then(function (user) { if (user) setText("user-name", user.name) })
        .catch(function (error) {
            console.log("init failed:", error)
            setDisplay("auth-area", false)
            setDisplay("non-auth-area", true)
            setDisplay("checking-auth-area", false)
        })
}


function onChatUsersWereUpdated(chatUsers) {
    console.log('chat users:', chatUsers)
    clearSelect(chatUsersSelect)
    forEach(chatUsers, function (user) {
        addSelectOption(chatUsersSelect, user.id, user.name)
    })
}



function onChatMessageWasCreated(chatMessage) {
    console.log('chat message:', chatMessage); // Verifique o conteúdo da mensagem recebida
    getUser()
        .then(function (user) { return user.sub })
        .then(function (myUserId) {
            var isMine = chatMessage.from.id === myUserId;
            var text = (isMine ? ("Para " + chatMessage.to.name) : "De " + chatMessage.from.name) + ": " + chatMessage.text;
            console.log('formatted message text:', text); // Verifique o texto formatado
            appendParagraph(text, chatMessagesDiv);
            chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
        });
}




function onOpen(event) { console.log('Conexão WebSocket abriu', event) }
function onClose(event) { console.log('Conexão WebSocket fechou', event) }


function onMessage(event) {
    console.log('Evento chegou', event);
    var eventHandlers = {
        CHAT_USERS_WERE_UPDATED: onChatUsersWereUpdated,
        CHAT_MESSAGE_WAS_CREATED: onChatMessageWasCreated
    };
    var eventData = JSON.parse(event.data);
    console.log('Evento processado:', eventData); // Verifique o conteúdo do evento processado
    var eventHandler = eventHandlers[eventData.type];
    if (eventHandler) eventHandler(eventData.payload);
}



function connect() {
    connectWebSocket(onOpen, onClose, onMessage, true).catch(console.log)
}


function send() {
    var chatUserId = chatUsersSelect.value
    var text = chatMessageInput.value
    sendEvent(chatUserId, text)
    chatMessageInput.value = ""
}


function onKeyUp(event) {
    if (event.key === "Enter") send()
}

loginButton.onclick = login
logoutButton.onclick = logout
connectButton.onclick = connect
sendButton.onclick = send
chatMessageInput.addEventListener("keyup", onKeyUp)
window.onload = init