require('dotenv').config();

const express = require("express")
const http = require("http")
const { Server } = require("socket.io")

const app = express()
const port = process.env.PORT
console.log(process.env)
app.use(express.static("public"))

const server = http.createServer(app)
const io = new Server(server)

io.on("connection", (socket) => {

  socket.on("beginPath", (data) => {
    io.sockets.emit("beginPath", data)
  })

  socket.on("drawStroke", (data) => {
    io.sockets.emit("drawStroke", data)
  })

  socket.on("undoRedoTrack", (data) => {
    io.sockets.emit("undoRedoTrack", data)
  })

  socket.on("undoRedoCanvas", (data) => {
    io.sockets.emit("undoRedoCanvas", data)
  })

  socket.on("uploadClip", (file) => {
    io.sockets.emit("uploadClip", file)
  })
})


server.listen(port, () => {
  console.log("server listening on port"+port)
})