const tab = document.querySelectorAll(".tab");
const postPinnedContainer = document.querySelector('.postPinnedContainer');
function outputPosts(results) {
  postContainer.innerHTML = "";
  results.forEach((el) => {
    const renderHtml = createPostHtml(el);
    postContainer.insertAdjacentHTML("afterbegin", renderHtml);
  });
}
function outputPinnedPost(results) {
  postPinnedContainer.innerHTML = "";
  const renderHtml = createPostHtml(results);
  postPinnedContainer.insertAdjacentHTML("afterbegin", renderHtml);
}
let profileId = profile._id;
window.addEventListener("load", async function () {
  const pinnedPost = await axios({
    method: "get",
    url: "/api/posts",
    params: {
      postedBy: profileId,
      isReply:false,
      pinned:true,
    },
  });
  if (pinnedPost.data.length !== 0) {
    outputPinnedPost(pinnedPost.data[0]);
  }
  const response = await axios({
    method: "get",
    url: "/api/posts",
    params: {
      postedBy: profileId,
      isReply: false,
      pinned:false,
    },
  });
  outputPosts(response.data);
});
tab.forEach((el) => {
  el.addEventListener("click", async (e) => {
    postPinnedContainer.innerHTML = "";
    const isReply = e.target.dataset.isreply;
    if (isReply == "false") {
      const pinnedPost = await axios({
        method: "get",
        url: "/api/posts",
        params: {
          postedBy: profileId,
          isReply:false,
          pinned:true,
        },
      });
      if (pinnedPost.data.length !== 0) {
        outputPinnedPost(pinnedPost.data[0]);
      }
    }
    const response = await axios({
      method: "get",
      url: "/api/posts",
      params: {
        postedBy: profile._id,
        isReply,
        pinned:false
      },
    });
    outputPosts(response.data);
    // toggle Class active
    tab.forEach((el) => {
      el.classList.remove("active");
    });
    e.target.classList.add("active");
  });
});
