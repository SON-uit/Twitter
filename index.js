const http = require("http");
const path = require("path");
const express = require("express");
const pug = require("pug");
const bodyParser = require("body-parser");
const session = require("express-session");
const { Server } = require("socket.io");
const passport = require("passport"); // passport is middleware
const cookieParser = require("cookie-parser");
require("dotenv").config();

const DBConnect = require("./dbConnection");
const connect = new DBConnect(process.env.DB_USERNAME, process.env.DB_PASSWORD);
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = 3000;

//session config (should above passport)
app.use(
  session({
    name:'session',
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: {
      httpOnly:true,
      secure:false,
      maxAge: 14 * 60 * 60 * 24 * 1000 
    }
  })
);
const googleAuth = require('./controllers/googleAuthController');
const facebookAuth = require('./controllers/facebookAuthController');
app.use(passport.initialize()); // this set up passport session
app.use(passport.session()) // to request can understand  object in coookie middleware(create req.user)
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

//Api route
const userRoutes = require("./routes/api/userRoutes");
const postRoutes = require("./routes/api/postRoutes");
const chatRoutes = require("./routes/api/chatRoutes");
const messageRoutes = require("./routes/api/messageRoutes");
const notificationRoutes = require("./routes/api/notificationRoutes");
const authRoutes = require("./routes/api/authRoutes");
//Route
const viewRoutes = require("./routes/viewRoutes");
app.get('/test',(req,res) => {
  return res.cookie('hello','dsdd');
})
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/auths",authRoutes)
app.use("/", viewRoutes);

server.listen(port, () => {
  console.log("listening on port " + port);
});

//socket
io.on("connection", (socket) => {
  /* console.log('connect socket...') */
  socket.on("setup", (userData) => {
    /* console.log(`${userData.firstName} connected`) */
    socket.join(userData._id);
    socket.emit("connected");
  });
  socket.on("join room", (room) => {
    socket.join(room);
  });
  socket.on("typing", (room) => {
    socket.to(room).emit("typing");
  });
  socket.on("stop typing", (room) => {
    socket.to(room).emit("stop typing");
  });
  socket.on("send message", (message) => {
    const chat = message.chat;
    if (!chat.users) return console.log("No users in room");
    chat.users.forEach((user) => {
      if (user._id === message.sender._id) return;
      socket.to(user._id).emit("receive message", message);
    });
  });
  socket.on("notification recieved", (room) => {
    socket.to(room).emit("notification recieved");
  });
});
