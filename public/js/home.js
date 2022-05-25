window.addEventListener("load", async function () {
  const response = await axios({
    method: "get",
    url: "/api/posts",
    params: {
      isFollwingOnly:true,
    }
  });
  outputPosts(response.data);
});
function outputPosts(results) {
  postContainer.innerHTML = "";
  results.forEach((el) => {
    const renderHtml = createPostHtml(el);
    postContainer.insertAdjacentHTML("afterbegin", renderHtml);
  });
}

