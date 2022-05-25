const resultContainer = document.querySelector(".resultContainer");

function getOtherChatUser(users) {
  if (users.length === 1) return users;
  return users.filter((user) => user._id !== userLoggedIn._id);
}
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
}
function getChatImgElements(chatData) {
  const otherChatUsers = getOtherChatUser(chatData.users);
  let chatImg = getChatUserImg(otherChatUsers[0]);
  let groupChatImgClass = "";
  if (otherChatUsers.length > 1) {
    groupChatImgClass = "groupChatImg";
    chatImg += getChatUserImg(otherChatUsers[1]);
  }
  return `<div class='resultImgContainer ${groupChatImgClass}'>${chatImg}</div>`;
}
function getChatUserImg(user) {
  if (!user || !user.profileImg) return;
  return `<img src="${user.profileImg}" alt="User profile">`;
}
function getLatestMesaage(latestMessages) {
  if (latestMessages !== undefined) {
    const sender = latestMessages.sender;
    return `${sender.firstName} ${sender.lastName}: ${latestMessages.content}`;
  }
  return "New Chat";
}
function createChatHtml(chatData) {
  const chatName = getChatName(chatData);
  const image = getChatImgElements(chatData);
  const latestMessage = getLatestMesaage(chatData.latestMessage);
  const activeClass =
    !chatData.latestMessage || chatData.latestMessage.sender._id === userLoggedIn._id ||
    chatData.latestMessage.readBy.includes(userLoggedIn._id)
      ? ""
      : "active";
  return `<a href="/messages/${chatData._id}" class='resultsListItem ${activeClass} '>
            ${image}  
            <div class='resultsDetailsContainer'>
                <span class='heading'>${chatName}</span>
                <span class='subText ${activeClass}'>${latestMessage}</span>
            </div>
          </a>`;
}
function outputChatLists(chatLists) {
  resultContainer.innerHTML = "";
  chatLists.forEach((chat) => {
    const renderHtml = createChatHtml(chat);
    resultContainer.insertAdjacentHTML("afterbegin", renderHtml);
  });
}
window.addEventListener("load", async function () {
  const response = await axios({
    method: "get",
    url: "/api/chats",
  });
  if (response.status === 200) {
    outputChatLists(response.data);
  }
});
