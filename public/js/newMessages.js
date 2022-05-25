const userSearchTextBox = document.querySelector("#userSearchTextBox");
const resultSearchContainer = document.querySelector(".resultSearchContainer");
const createChatButton = document.querySelector("#createChatButton");
const selectedUser = document.querySelector("#selectedUser");
function createUserHtml(userData, showFollowButton) {
  const userFullName = `${userData.firstName} ${userData.lastName}`;
  const isFollowing =
    userLoggedIn.followings && userLoggedIn.followings.includes(userData._id);
  const text = isFollowing ? "Following" : "Follow";
  const buttonClass = isFollowing ? "followBtn following" : "followBtn";
  let followBtn = "";
  if (showFollowButton && userLoggedIn._id !== userData._id) {
    followBtn = `<div class="followBtnContainer">
                          <button class="${buttonClass}"data-user="${userData._id}">${text}</button>
                      </div>`;
  }
  return `<div class="user">
                  <div class="userImageContainer">
                    <a href ="/profile/${userData._id}"> 
                      <img src="${userData.profileImg}">
                    </a> 
                  </div>
                  <div class="userDetailsContainer">
                      <div class ="header">
                          <a href="/profile/${userData._id}">${userFullName}</a>
                          <span class="username">@${userData.userName}</span>
                      </div>
                  </div>
                  ${followBtn}
              </div>`;
}
function outputNotFound(text) {
  resultSearchContainer.innerHTML = "";
  const html = `<span>${text}</span>`;
  resultSearchContainer.insertAdjacentHTML("afterbegin", html);
}
function updateSelectedUserHtml() {
  const elements = [];
  arrSelectedUser.forEach((user) => {
    const fullName = `${user.firstName} ${user.lastName}`;
    const element = $(
      `<span class="selectedUser">${fullName}</span>`)
    elements.push(element);
  });
  // append to selected User;
  $(".selectedUser").remove();
  $("#selectedUser").prepend(elements)
}
let arrSelectedUser = [];
function userSelected(user) {
  // check if user already selected
  if (arrSelectedUser.some((el) => user._id === el._id)) return;
  // push unselected user to array
  arrSelectedUser.push(user);
  //clear input and result
  userSearchTextBox.value = "";
  resultSearchContainer.html = "";
  createChatButton.removeAttribute("disabled");
  // update selected user html
  updateSelectedUserHtml();
}
function outputSelectedUser(users) {
  resultSearchContainer.innerHTML = "";
  users.forEach((user) => {
    if (
      user._id === userLoggedIn._id ||
      arrSelectedUser.some((el) => el._id === user._id)
    )
      return;
    const renderHtml = createUserHtml(user, false);
    const element = $(renderHtml);
    element.click(() => userSelected(user));
    $(".resultSearchContainer").append(element);
  });
}
/// search User by text
async function searchUser(value) {
  resultSearchContainer.innerHTML = "";
  const response = await axios({
    method: "get",
    url: "/api/users",
    params: {
      search: value,
    },
  });
  if (response.status === 200 && response.data.length !== 0) {
    outputSelectedUser(response.data);
  } else {
    outputNotFound("No item matched");
  }
}
// Type on userSearch Textbox
let timer;

userSearchTextBox.addEventListener("keydown", function (e) {
  clearTimeout(timer);
  const textValue = e.target.value.trim();
  // un seleted user with backspace key pressed
  if (textValue === "" && e.keyCode === 8) {
    arrSelectedUser.pop();
    updateSelectedUserHtml();
    resultSearchContainer.innerHTML = "";
    if (arrSelectedUser.length === 0) {
      createChatButton.setAttribute("disabled", true);
    }
    return;
  }
  timer = setTimeout(async function () {
    if (textValue === "") {
      resultSearchContainer.innerHTML = "";
    }
    await searchUser(textValue);
  }, 1000);
});

// create new chat with button click //
createChatButton.addEventListener("click",async () =>{
  const reponse = await axios({
    method: "POST",
    url: '/api/chats/',
    data: {
      users: arrSelectedUser,
    }
  })// return chat object
  if (reponse && reponse.status === 200) {
    window.location.href = `/messages/${reponse.data._id}`
  }
})