
const changeChatNameBtn = document.querySelector("#changeChatNameBtn");
const chatNameTextBox = document.querySelector("#chatNameTextBox");
const chatName = document.querySelector("#chatName");
const sendMessageBtn = document.querySelector("#sendMessageBtn");
const inputTextBox = document.querySelector("#inputTextBox");
const chatMessages = document.querySelector(".chatMessages");
const chatContainer = document.querySelector(".chatContainer");
const loadingSpinner = document.querySelector(".loadingSpinnerContainer");
const typingDots = document.querySelector(".typingDots img");
// hide until data loaded///
chatContainer.style.visibility = "hidden";

window.addEventListener("load", async function () {
  // socket join room
  socket.emit("join room", chatId);
  // socket on event typing
  socket.on("typing", () => {
    typingDots.style.display = "block";
  });
  // stop typing
  socket.on("stop typing", () => {
    typingDots.style.display = "none";
  });
  // get messager from other user
  socket.on('receive message',async (message) => {
    addChatMessageHtml(message);
    if(isUserInChatRoom(message)) { // this function from clientSocket
      markAllMessageAsRead()
    }
   // await getMessagesUnread() // this function in common.js
  })
  const chat = await axios({
    method: "get",
    url: `/api/chats/${chatId}`,
  });
  if (chat.status === 200) {
    chatName.innerText = getChatName(chat.data);
  } else {
    alert("Error");
  }
  const messages = await axios({
    method: "get",
    url: `/api/chats/${chatId}/messages`,
  });
  if (messages.status === 200) {
    let lastSenderId = "";
    const arrMessageHtml = [];
    messages.data.forEach((message, index) => {
      const html = creatMessageHtml(
        message,
        messages.data[index + 1],
        lastSenderId
      );
      arrMessageHtml.push(html);
      lastSenderId = message.sender._id;
    });
    const messagesHtml = arrMessageHtml.join("");
    chatMessages.insertAdjacentHTML("beforeend", messagesHtml);
    /// SCROLL TO LATEST MESSAGE
    scrollToBottom();
    //hidden spinner
    loadingSpinner.remove();
    chatContainer.style.removeProperty("visibility");
    // mark current user already read all messages
    markAllMessageAsRead()
  } else {
    alert("Error");
  }
});

function getOtherChatUser (users) {
  if (users.length === 1) return users;
  return users.filter((user) => user._id !== userLoggedIn._id);
};
 function getChatName(chatData) {
  let chatName = chatData.chatName;
  if (!chatName) {
    const otherChatUsers = getOtherChatUser(chatData.users);
    const namesArray = otherChatUsers.map(
      (user) => `${user.firstName} ${user.lastName}`
    );
    chatName = namesArray.join(", ");
  }
  return chatName;
};

changeChatNameBtn.addEventListener("click", async (e) => {
  const chatName =
    chatNameTextBox.value.trim().length !== 0
      ? chatNameTextBox.value.trim()
      : "";
  const response = await axios({
    method: "PUT",
    url: `/api/chats/${chatId}`,
    data: {
      chatName,
    },
  });
  if (response.status === 200) {
    location.reload();
  } else {
    alert("Error,Try again");
  }
});
inputTextBox.addEventListener("keydown", (e) => {
  // socket event
  updateTyping();
  if (e.keyCode === 13) {
    e.preventDefault(); // ngăn chặn xuống dòng khi nhấn Enter
    messageSubmit();
  }
});
let timeout = 0;
function updateTyping() {
  clearTimeout(timeout);
  socket.emit("typing", chatId);
  timeout = setTimeout(() => {
    socket.emit("stop typing", chatId);
  }, 3000);
}
sendMessageBtn.addEventListener("click", async (e) => {
  messageSubmit();
});
function messageSubmit() {
  const content = inputTextBox.value.trim();
  if (content !== "") {
    sendMessage(content);
    //clear input
    inputTextBox.value = "";
    // stop typing
    socket.emit("stop typing", chatId);
  }
}
async function sendMessage(content) {
  const response = await axios({
    method: "POST",
    url: "/api/messages",
    data: {
      content: content,
      chatId: chatId,
    },
  });
  if (response.status !== 200) {
    alert("Could not send message.Try Again");
    inputTextBox.value = content;
  }
  if (response.status === 200) {
    await getMessagesUnread(); // this function from common.js
    addChatMessageHtml(response.data);
    if(connect) {
      socket.emit('send message',response.data)
    }
  } else {
    alert("Errorr");
  }
}
function addChatMessageHtml(message) {
  if (!message || !message._id) {
    alert("Error");
    return;
  }
  const messageDiv = creatMessageHtml(message, null, "");

  chatMessages.insertAdjacentHTML("beforeend", messageDiv);

  /// SCROLL TO LATEST MESSAGE
  scrollToBottom();
}
function creatMessageHtml(message, nextMessage, lastSenderId) {
  const currentSender = message.sender;
  const currentSenderId = currentSender._id;
  const currentSenderName = `${currentSender.firstName} ${currentSender.lastName}`;

  const nextSenderId = nextMessage ? nextMessage.sender._id : "";

  const isFirst = currentSenderId !== lastSenderId;
  const isLast = currentSenderId !== nextSenderId;

  const isMine = message.sender._id === userLoggedIn._id;
  let liClassName = isMine ? "mine" : "theirs";

  let nameElement = "";
  if (isFirst) {
    liClassName += " first";
    if (!isMine) {
      nameElement += `<span class="senderName">${currentSenderName}</span>`;
    }
  }
  let profileImg = "";
  if (isLast) {
    liClassName += " last";
    profileImg = `<img src="${currentSender.profileImg}" alt="User's profile Image">`;
  }
  let imageContainer = "";
  if (!isMine) {
    imageContainer += `<div class="imgContainer">
                          ${profileImg}
                      </div>`;
  }
  return `<li class="message ${liClassName}">
                ${imageContainer}
                <div class="messageContainer">
                    ${nameElement}
                    <span class="messageBody">
                        ${message.content}
                    </span>    
                </div>
            </li>`;
}
function scrollToBottom() {
  const scrollHight = chatMessages.scrollHeight;
  chatMessages.scrollTo({
    top: scrollHight,
    left: 0,
    behavior: "smooth",
  });
}

 async function markAllMessageAsRead () {
    const response = await axios({
      method: "PUT",
      url: `/api/chats/${chatId}/messages/markAsRead`,
    })
    if(response.status === 204) {
      getMessagesUnread() //this function from common.js
    }
}