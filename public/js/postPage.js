window.addEventListener("load", async function () {
    const response = await axios({
      method: "get",
      url: `/api/posts/${postId}`,
    });
    outputPostsWithReplies(response.data);
  });
  function outputPostsWithReplies(results) {
    postContainer.innerHTML = "";
    const renderHtml = createPostHtml(results.postData);
    postContainer.insertAdjacentHTML("afterbegin", renderHtml);
    if(results.replies.length !==0) {
        results.replies.forEach(el => {
            const html = createPostHtml(el)
            postContainer.insertAdjacentHTML("beforeend", html);
        })
    }
  }