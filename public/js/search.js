const searchBox = document.querySelector("#searchBox");
const tabSearch = document.querySelectorAll(".tab");
const resultSearchContainer = document.querySelector(".resultSearchContainer");
function outputPosts(results) {
  resultSearchContainer.innerHTML = "";
  results.forEach((el) => {
    const renderHtml = createPostHtml(el);
    resultSearchContainer.insertAdjacentHTML("afterbegin", renderHtml);
  });
}
function outputNotFound(text) {
  resultSearchContainer.innerHTML = "";
  const html = `<span>${text}</span>`;
  resultSearchContainer.insertAdjacentHTML("afterbegin", html);
}
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
function outputUsers(results) {
  results.forEach((el) => {
    const renderHtml = createUserHtml(el, true);
    resultSearchContainer.insertAdjacentHTML("afterbegin", renderHtml);
  });
}
async function searchTerm(value, searchType) {
  resultSearchContainer.innerHTML = ""
  const url = searchType === "posts" ? "/api/posts" : "/api/users";
  const params = { search: value };
  if (searchType === "posts") {
    params.isReply = false;
  }
  const response = await axios({
    method: "get",
    url,
    params: params,
  });
  if (response.status === 200 && response.data.length !== 0) {
    if (searchType === "posts") {
      outputPosts(response.data);
    } else {
      outputUsers(response.data);
    }
  } else {
    outputNotFound("No item matched");
  }
}
// type on search box
let timer;
searchBox.addEventListener("keydown", function (e) {
  clearTimeout(timer);
  const textBox = e.target;
  const searchType = textBox.dataset.search;
  timer = setTimeout(async function () {
    const textValue = e.target.value.trim();
    await searchTerm(textValue, searchType);
  }, 1000);
});
tabSearch.forEach((el) => {
  el.addEventListener("click", async (e) => {
    // toggle Class active
    const tabType = e.target.dataset.tab;
    searchBox.dataset.search = tabType;
    tabSearch.forEach((el) => {
      el.classList.remove("active");
    });
    e.target.classList.add("active");
  });
});
