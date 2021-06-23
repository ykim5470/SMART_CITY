const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");
const sequelize = require("sequelize");
const models = require("./models/index");
const nunjucks = require("nunjucks");
const methodOverride = require("method-override");
const socket = require("socket.io")


//routers
const index_router = require("./routes/index");

models.sequelize
	.sync()
	.then(() => {
		console.log("DB connected");
	})
	.catch((err) => {
		console.log(`DB connection fail: ${err}`);
	});

dotenv.config();
const app = express();
app.set("port", process.env.PORT || 4000);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "html");
nunjucks.configure("views", {
	express: app,
	watch: true,
});

app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use("/", index_router);

const server = app.listen(app.get("port"), () => {
	console.log(`http://localhost:${app.get("port")}`);
});


// Socket setup
const io = socket(server, {
  allowEIO3: true // false by default
})


const activeUsers = new Set();

io.on("connection", function (socket) {
  console.log("Made socket connection");

  socket.on("new user", function (data) {
    socket.userId = data;
    activeUsers.add(data);
    io.emit("new user", [...activeUsers]);
  });

  socket.on("disconnect", () => {
    activeUsers.delete(socket.userId);
    io.emit("user disconnected", socket.userId);
  });

  socket.on("chat message", function (data) {
    io.emit("chat message", data);
  });
  
  socket.on("typing", function (data) {
    socket.broadcast.emit("typing", data);
  });
});