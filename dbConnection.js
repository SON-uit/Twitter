const mongoose = require("mongoose");

class DBConnection {
  constructor(dbUser, dbPassword) {
      this.dbUser = dbUser;
      this.dbPassword = dbPassword;
      this.connect();
  }
  connect() {
    const mongoURL = mongoose.connect(
      `mongodb+srv://${this.dbUser}:${this.dbPassword}@cluster0.8cg5t.mongodb.net/TwitterDB?retryWrites=true&w=majority`
    ,{
        useUnifiedTopology:true,
        useNewUrlParser:true,
        useUnifiedTopology:true,
    });
    mongoose.connection.on("open", () => {
      console.log("Mongoose connection ready");
    });
    mongoose.connection.on("error", (err) => {
      console.log(err.message);
    });
  }
}
module.exports = DBConnection;
