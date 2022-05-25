let connect = false;
const socket = io();

socket.emit('setup', userLoggedIn);
socket.on('connected',() => {
    connect = true;
})
socket.on('receive message',async (message) => {
    // check user in chat page 
    if(!isUserInChatRoom(message)) {
        //show popup notification
        showMessagePopup(message);
        //addChatMessageHtml(message);
        await getMessagesUnread() // this function in common.js
    }
  })
socket.on("notification recieved",async () => {
    const response = await axios({
        method: 'get',
        url:'/api/notifications/latest'
    })
    if(response.status === 200) {
        console.log(response.data);
        showNotificationPopup(response.data) // this function from common.js
        getNotificationUnread()// this function from common.js
    }
})
function emitNotification (userId) {
    if(userId === userLoggedIn._id) return;
    socket.emit("notification recieved",userId);
}
function isUserInChatRoom (message) {
    const currentURL = window.location.href.split('/')
    // currentURL ['http:', '', 'localhost:3000', 'messages', '6283449f91595a57327e7a1a']
    const chatId = currentURL[currentURL.length - 1];
    return chatId === message.chat._id
} 