const resultContainer = document.querySelector(".resultContainer");
const markNotificationAsRead = document.querySelector("#markNotificationAsRead")
window.addEventListener("load", async function () {
  const response = await axios({
    method: "get",
    url: "/api/notifications",
  });
  if (response.status === 200) {
    outputNotifications(response.data);
  }
});
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
function outputNotFound(text) {
  const html = `<span>${text}</span>`;
  resultContainer.insertAdjacentHTML("afterbegin", html);
}
function outputNotifications(notifications) {
  if (notifications.length === 0) {
    outputNotFound("You don't have a notification now");
  }
  notifications.forEach((notification) => {
    if (notification.userFrom._id === notification.userTo._id) return;
    const html = createNotificationHtml(notification);
    resultContainer.insertAdjacentHTML("afterbegin", html);
  });
}
async function markNotificationAsOpened(
  notificationId = null,
  callback = location.reload()
) {
  const url =
    notificationId !== null
      ? `/api/notifications/${notificationId}/markAsOpened`
      : `/api/notifications/markAsOpened`;
  const reponse = await axios({
    method: "put",
    url,
  });
  if (reponse.status === 204) {
    callback();
  }
}
// click to read notification
$(document).on("click", ".notification.active", async (e) => {
  e.preventDefault();
  const container = $(e.target);
  const notificationId = container.closest(".notification").data().id;
  const href = container.closest(".notification").attr("href");
  const callback = () => (window.location.href = href);
  await markNotificationAsOpened(notificationId, callback);
});
// mark all notifications as read
markNotificationAsRead.addEventListener("click",() => {
    markNotificationAsOpened();
})
