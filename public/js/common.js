
const postTextArea = document.querySelector("#postTextArea");
const replyTextArea = document.querySelector("#replyTextArea");
const submitPostBtn = document.querySelector("#submitPostBtn");
const submitReplyBtn = document.querySelector("#submitReplyBtn");
const deletePostBtn = document.querySelector("#deletePostBtn");
const imgUploadBtn = document.querySelector("#imgUploadBtn");
const confirmPinBtn = document.querySelector("#confirmPinBtn");
const unPinBtn = document.querySelector("#unPinBtn")
const coverImgUploadBtn = document.querySelector("#coverImgUploadBtn")
const currentPost = document.querySelector(".currentPost");
const postContainer = document.querySelector(".postContainer");
const logout = document.querySelector("#logout") //logoutbtn
console.log(logout);
// upload Photo Profile
const filePhoto = document.querySelector("#filePhoto");
// upload cover img
const fileCoverPhoto = document.querySelector("#fileCoverPhoto");
//number of message unread
const numberOfMessages = document.querySelector("#numberOfMessages")
//number of new notifications 
const numberOfNotifications = document.querySelector("#numberOfNotifications")

window.addEventListener("load", async function () {
  await getMessagesUnread();
  await getNotificationUnread();
})
//logout
logout.addEventListener('click',async () =>  {
  const response = await axios({
    method: 'post',
    url: 'api/auths/logout'
  });
  if(response.status === 200) {
    window.location.href = '/'
  }
} )
// Typing on Post
if (postTextArea) {
  postTextArea.addEventListener("keyup", (e) => {
    if (postTextArea.value.trim().length === 0) {
      submitPostBtn.setAttribute("disabled", true);
    } else {
      submitPostBtn.removeAttribute("disabled");
    }
  });
}
//Typing on ReplyModal
if (replyTextArea) {
  replyTextArea.addEventListener("keyup", (e) => {
    if (replyTextArea.value.trim().length === 0) {
      submitReplyBtn.setAttribute("disabled", true);
    } else {
      submitReplyBtn.removeAttribute("disabled");
    }
  });
}
// Get info to reply post modal
$("#replyModal").on("show.bs.modal", async (event) => {
  const btn = event.relatedTarget;
  const postID = btn.closest(".post").dataset.id;
  const response = await axios({
    method: "get",
    url: `/api/posts/${postID}`,
  });
  currentPost.innerHTML = "";
  const html = createPostHtml(response.data.postData);
  currentPost.insertAdjacentHTML("afterbegin", html);
  submitReplyBtn.dataset.postId = response.data.postData._id;
});
$("#replyModal").on("hidden.bs.modal", async (event) => {
  currentPost.innerHTML = "";
  replyTextArea.value = "";
});
//Submit reply to sever
if (submitReplyBtn) {
  submitReplyBtn.addEventListener("click", async (e) => {
    const postID = e.target.dataset.postId;
    const data = replyTextArea.value;
    const response = await axios({
      method: "post",
      url: "/api/posts",
      data: {
        replyTo: postID,
        content: data,
      },
    });
    if (response.data.replyToPost) {
      emitNotification(response.data.replyToPost.postedBy._id) // this function in clientSocket.js
      location.reload();
    }
  });
}
// Assign postId into deletePostBtn
$("#deletePostModal").on("show.bs.modal", async (event) => {
  const btn = event.relatedTarget;
  const postId = btn.dataset.id;
  deletePostBtn.dataset.postId = postId;
})
// Delete post button to server
if(deletePostBtn) {
  deletePostBtn.addEventListener('click',async (e) => {
    const postId = e.target.dataset.postId;
    const response = await axios({
      method: "delete",
      url: `/api/posts/${postId}`,
    });
    if (response.status === 200) {
      location.reload()
    }
  })
}
// Assign postId into confirmPinBtn
$("#pinConfirmModal").on("show.bs.modal", async (event) => {
  const btn = event.relatedTarget;
  const postId = btn.dataset.id;
  confirmPinBtn.dataset.postId = postId;
})
// Confirm pinned post to server
if (confirmPinBtn) {
  confirmPinBtn.addEventListener('click',async (e) => {
    const postId = e.target.dataset.postId;
    const response = await axios({
      method: "put",
      url: `/api/posts/${postId}`,
      data: {
        pinned: true
      }
    });
    if (response.status === 200) {
      location.reload()
    }
  }
)} 
// Assign postId into unPinBtn
$("#unPinModal").on("show.bs.modal", async (event) => {
  const btn = event.relatedTarget;
  const postId = btn.dataset.id;
  unPinBtn.dataset.postId = postId;
})
// Unpin post 
if (unPinBtn) {
  unPinBtn.addEventListener('click',async (e) => {
    const postId = e.target.dataset.postId;
    const response = await axios({
      method: "put",
      url: `/api/posts/${postId}`,
      data: {
        pinned: false
      }
    });
    if (response.status === 200) {
      location.reload()
    }
  })
}
//Submit Post to server
if (submitPostBtn) {
  submitPostBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const data = postTextArea.value;
    const post = await axios({
      method: "post",
      url: "/api/posts",
      data: {
        content: data,
      },
    });
    if (post.status === 201) {
      const html = createPostHtml(post.data);
      postContainer.insertAdjacentHTML("afterbegin", html);
      postTextArea.value = "";
      submitPostBtn.setAttribute("disabled", true);
    }
  });
}
//React with like button on post
$(document).on("click", ".likeBtn", async (event) => {
  const btn = event.target;
  const postID = btn.closest(".post").dataset.id;
  const response = await axios({
    method: "put",
    url: `/api/posts/${postID}/like`,
  });
  btn.querySelector("span").innerText = !response.data.likes.length
    ? ""
    : response.data.likes.length;
  if (response.data.likes.includes(userLoggedIn._id)) {
    btn.classList.add("active");
    emitNotification(response.data.postedBy._id) //this function in clientSocket.js
  } else {
    btn.classList.remove("active");
  }
});
//React with retweet button on post
$(document).on("click", ".retweetBtn", async (event) => {
  const btn = event.target;
  const postID = btn.closest(".post").dataset.id;
  const response = await axios({
    method: "post",
    url: `/api/posts/${postID}/retweet`,
  });
  btn.querySelector("span").innerText = !response.data.retweetUsers.length
    ? ""
    : response.data.retweetUsers.length;
  if (response.data.retweetUsers.includes(userLoggedIn._id)) {
    btn.classList.add("active");
    emitNotification(response.data.postedBy._id);//this function in clientSocket.js
  } else {
    btn.classList.remove("active");
  }
});
// React with following button (mixin)
$(document).on("click",".followBtn", async (event) => {
  const btn = event.target
  const userId = btn.dataset.user;
  const response = await axios({
    method: "put",
    url: `/api/users/${userId}/follow`,
  });
  const followersLabel = document.querySelector("#followersLabel");
  if(response.data.followings && response.data.followings.includes(userId)) {
    btn.classList.add("following")
    btn.innerText = "Following"
    emitNotification(userId) //this function in clientSocket.js;
    if(followersLabel) {
      followersLabel.innerText = response.data.followings.length;
    }
  }else {
    btn.classList.remove("following");
    btn.innerText = "Follow"
    if (followersLabel) {
      followersLabel.innerText = response.data.followings.length;
    }
  }
})
// Post click--> go to post page
$(document).on("click", ".post", async (event) => {
  const el = event.target;
  const postId = el.closest(".post").dataset.id;
  if (postId !== undefined && el.nodeName.toLowerCase() !== "button") {
    window.location.href = `/post/${postId}`;
  }
});
// Upload profile photo has changed 
// cropperjs
let cropper ;
if(filePhoto) {
filePhoto.addEventListener('change',function (e) {
  if (this.files && this.files[0]) {
    const reader = new FileReader();
    reader.readAsDataURL(this.files[0])
    reader.addEventListener('load',(e) => {
      const imgPreview = document.querySelector("#imgPreview");
      imgPreview.setAttribute("src",e.target.result)
      if(cropper !== undefined) {
        cropper.destroy()
      }
      cropper = new Cropper(imgPreview, {
        aspectRatio: 1/1,
        backgroundColor:false
      });
    })
  } 
})
}
if (imgUploadBtn) {
imgUploadBtn.addEventListener('click', async () => {
  const canvas = cropper.getCroppedCanvas();
  let formData = new FormData();
  if (canvas === null)  return;
  canvas.toBlob( async(blob) => {
    formData.append("croppedImg", blob);
    const response = await axios({
      method: "put",
      url: `/api/users/${userLoggedIn._id}/img`,
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    });
    if(response.status === 200) {
      location.reload();
    }
  })
})
}
// Upload cover Photo
if(fileCoverPhoto) {
fileCoverPhoto.addEventListener('change',function (e) {
  if (this.files && this.files[0]) {
    const reader = new FileReader();
    reader.readAsDataURL(this.files[0])
    reader.addEventListener('load',(e) => {
      const imgCoverPreview = document.querySelector("#imgCoverPreview");
      imgCoverPreview.setAttribute("src",e.target.result)
      if(cropper !== undefined) {
        cropper.destroy()
      }
      cropper = new Cropper(imgCoverPreview, {
        aspectRatio: 16/9,
        backgroundColor:false
      });
    })
  } 
})
}
if (coverImgUploadBtn) {
coverImgUploadBtn.addEventListener('click', async () => {
  const canvas = cropper.getCroppedCanvas();
  let formData = new FormData();
  if (canvas === null)  return;
  canvas.toBlob( async(blob) => {
    formData.append("croppedImg", blob);
    const response = await axios({
      method: "put",
      url: `/api/users/${userLoggedIn._id}/coverImg`,
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    });
    if(response.status === 200) {
      location.reload();
    }
  })
})
}
//Convert time to day ago
function convertTimestamp(current, previous) {
  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;
  const msPerMonth = msPerDay * 30;
  const msPerYear = msPerDay * 365;

  const elapsed = current - previous;

  if (elapsed < msPerMinute) {
    if (elapsed / 1000 < 30) return "Just now";
    return Math.round(elapsed / 1000) + " seconds ago";
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + " minutes ago";
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + " hours ago";
  } else if (elapsed < msPerMonth) {
    return Math.round(elapsed / msPerDay) + " days ago";
  } else if (elapsed < msPerYear) {
    return Math.round(elapsed / msPerMonth) + " months ago";
  } else {
    return Math.round(elapsed / msPerYear) + " years ago";
  }
}
// create html srting for postData
function createPostHtml(postData) {
  const displayName = `${postData.postedBy.lastName} ${postData.postedBy.firstName}`;
  const timestamp = convertTimestamp(
    new Date(Date.now()),
    new Date(postData.createdAt)
  );
  //check isRetweet
  const isRetweet = postData.retweetData !== undefined;
  const retweetedBy = isRetweet ? postData.postedBy.email : null;
  postData = isRetweet ? postData.retweetData : postData;
  // user who make retweet
  let reTweetText = "";
  if (isRetweet) {
    reTweetText = `<span>
                        <i class="fas fa-retweet"></i>
                        Retweeted by <a href="/profile/${retweetedBy}">${retweetedBy}</a>
                  </span>`;
  }
  // check isReplyPost
  let replyFlag = "";
  const isReplyPost = postData.replyToPost !== undefined;
  if (isReplyPost) {
    const replyTo = postData.replyToPost.postedBy.userName;
    replyFlag = `<div class="replyFlag">
                    <span>Reply to <a href="/profile/${postData.replyToPost.postedBy._id}">${replyTo}</a></span>
                 </div>`;
  }
  //create delete post button and pined button
  let buttons = "";
  if (postData.postedBy._id === userLoggedIn._id) {
    let dataTarget = "pinConfirmModal"
    if(postData.pinned) dataTarget = "unPinModal"
    buttons = `<button ${postData.pinned? "class='pinActive'":""} data-id=${postData._id} data-toggle="modal" data-target="#${dataTarget}">
                  <i class="fas fa-thumbtack"></i>
                </button>
                <button data-id=${postData._id} data-toggle="modal" data-target="#deletePostModal">
                    <i class="fas fa-times"></i>
                </button>`;
  }
  // check isPinned post
  let pinnedText = "";
  const isPinned = postData.pinned;
  if (isPinned) {
    pinnedText = `<span>
                      <i class="fas fa-thumbtack"></i>
                      <span>Pinned Post</span>
                </span>`;
  }
  const isActiveLike = postData.likes.includes(userLoggedIn._id)
    ? "active"
    : "";
  const isActiveRetweet = postData.retweetUsers.includes(userLoggedIn._id)
    ? "active"
    : "";
  return `  <div class='post' data-id=${postData._id}>
                <div class="userRetweet">${reTweetText}</div>
                <div class="pinnedPost">${pinnedText}</div>
                <div class='mainContentContainer'>
                    <div class='userImageContainer'>
                        <img src ='${postData.postedBy.profileImg}'>
                    </div>
                    <div class='postContentContainer'>
                        <div class='header'>
                            <a href="/profile/${
                              postData.postedBy._id
                            }" class='displayName'>${displayName}</a>
                            <span class='username'>${
                              postData.postedBy.userName
                            }</span>
                            <span class='email'>${
                              postData.postedBy.email
                            }</span>
                            <span class='date'>${timestamp}</span>
                            <div class="buttons">
                              ${buttons}
                            </div>
                        </div>
                        ${replyFlag}
                        <div class='postBody'>
                            <span>${postData.content}</span>
                        </div>
                        <div class='postFooter'>
                            <button data-toggle="modal" data-target="#replyModal">
                                <i class="fas fa-comment"></i>
                            </button>
                            <button class=" retweetBtn green ${isActiveRetweet} ">
                                <i class="fas fa-retweet"></i>
                                <span>${
                                  postData.retweetUsers.length === 0
                                    ? ""
                                    : postData.retweetUsers.length
                                }</span>
                            </button>
                            <button class="likeBtn red ${isActiveLike}">
                                <i class="fas fa-heart"></i>
                                <span>${
                                  postData.likes.length === 0
                                    ? ""
                                    : postData.likes.length
                                }</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
}
//get numberofMessage and Notifications Function
async function getMessagesUnread() {
  const response = await axios({
    method: 'GET',
    url: "/api/chats",
    params: {
      unreadOnly: true
    }
  })
  if(response.status === 200) {
    if (response.data.length > 0) {
    numberOfMessages.innerText = response.data.length;
    numberOfMessages.classList.add('active')
  } 
  if(response.data.length === 0) {
    numberOfMessages.innerText = "";
    numberOfMessages.classList.remove('active')
  }
}
}
async function getNotificationUnread() {
  const response = await axios({
    method: 'GET',
    url: "/api/notifications",
    params: {
      unreadOnly: true
    }
  })
  if(response.status === 200) {
    if (response.data.length > 0) {
    numberOfNotifications.innerText = response.data.length;
    numberOfNotifications.classList.add('active')
    }
    if(response.status === 0 ){
    numberOfNotifications.innerText = "";
    numberOfNotifications.classList.remove('active')
    }
  }
}

// create html for popup notification
function getNotificationText(userFrom, notificationType) {
  const userName = `${userFrom.firstName} ${userFrom.lastName}`;
  let text = "";
  if (notificationType === "retweet") {
    text = `${userName} retweeted one of your posts`;
  }
  if (notificationType === "follow") {
    text = `${userName} just followed you`;
  }
  if (notificationType === "postLike") {
    text = `${userName} just liked one of your posts`;
  }
  if (notificationType === "reply") {
    text = `${userName} just replied one of your posts`;
  }
  return text;
}
function getNotificationUrl(entityId, notificationType) {
  let url = "";
  if (
    notificationType === "retweet" ||
    notificationType === "postLike" ||
    notificationType === "reply"
  ) {
    url = `/post/${entityId}`;
  }
  if (notificationType === "follow") url = `/profile/${entityId}`;

  return url;
}
function createNotificationHtml(notification) {
  const { userFrom, notificationType, entityId } = notification;
  const notificationText = getNotificationText(userFrom, notificationType);
  const notificationUrl = getNotificationUrl(entityId, notificationType);
  const openClassName = notification.opened ? "" : "active";
  return `<a href="${notificationUrl}"class="resultsListItem notification ${openClassName}" data-id="${notification._id}">
            <div class ='resultImgContainer'>
                <img src="${userFrom.profileImg}">
            </div>
            <div class="resultsDetailsContainer">
                <span class="">${notificationText}</span>
            </div>
          </a>`;
}
const notificationList = document.querySelector("#notificationList")
function showNotificationPopup(notification) {
  const html = createNotificationHtml(notification)
  notificationList.insertAdjacentHTML('afterbegin',html);
  setTimeout(() =>{
    notificationList.innerHTML = "";
  },5000)
}

// create html for popup messsage
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
  return `<a href="/messages/${chatData._id}" class='resultsListItem'>
            ${image}  
            <div class='resultsDetailsContainer'>
                <span class='heading'>${chatName}</span>
                <span class='subText'>${latestMessage}</span>
            </div>
          </a>`;
}
function showMessagePopup(message) {
  const chatData = message.chat;
  chatData.latestMessage = message
  const html = createChatHtml(chatData) // get chatData of message
   notificationList.insertAdjacentHTML('afterbegin',html);
  setTimeout(() =>{
    notificationList.innerHTML = "";
  },5000) 
}