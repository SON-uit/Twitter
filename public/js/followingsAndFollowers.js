
const tab = document.querySelectorAll(".tab");
const resultFollowContainer = document.querySelector(".resultFollowContainer")
const profileId = profile._id;
function createUserHtml (userData, showFollowButton) {
    const userFullName = `${userData.firstName} ${userData.lastName}`
    const isFollowing = userLoggedIn.followings && userLoggedIn.followings.includes(userData._id);
    const text = isFollowing ? "Following" : "Follow"
    const buttonClass = isFollowing ? "followBtn following" : "followBtn";
    let followBtn = "";
    if (showFollowButton && userLoggedIn._id !== userData._id) {
        followBtn = `<div class="followBtnContainer">
                        <button class="${buttonClass}"data-user="${userData._id}">${text}</button>
                    </div>`
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
            </div>`
}
function outputUsers(results) {
resultFollowContainer.innerHTML = "";
  results.forEach((el) => {
    const renderHtml = createUserHtml(el,true);
    resultFollowContainer.insertAdjacentHTML("afterbegin", renderHtml);
  });
}
window.addEventListener("load", async function () {
  const response = await axios({
    method: "get",
    url: `/api/users/${profileId}`,
  });
  outputUsers(response.data.followings,true);
});
tab.forEach((el) => {
  el.addEventListener("click", async (e) => {
    const isFollowing = e.target.dataset.isfollowing;
    const response = await axios({
      method: "get",
      url: `/api/users/${profileId}`,
    });
    if (isFollowing === "true") {
        outputUsers(response.data.followings,true);
    }else {
        outputUsers(response.data.followers,true);
    }
    // toggle Class active
    tab.forEach((el) => {
      el.classList.remove("active");
    });
    e.target.classList.add("active");
  });
});
