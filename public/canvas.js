const canvas = document.querySelector("canvas");
canvas.width = window.innerWidth
canvas.height = window.innerHeight


const pencilWidthElem = document.querySelector(".pencil-width")
const eraserWidthElem = document.querySelector(".eraser-width")
const pencilColors = document.querySelectorAll(".pencil-color")
const download = document.querySelector(".download")
const redo = document.querySelector(".redo")
const undo = document.querySelector(".undo")

let penColor = "red"
let eraserColor = "white"
let penWidth = pencilWidthElem.value
let eraserWidth = eraserWidthElem.value

let undoRedoTracker = []  // data
let track = -1

// API
let tool = canvas.getContext("2d")


tool.strokeStyle = penColor
tool.lineWidth = penWidth

// mousedown -> begin graphics, mousemove -> fill graphics

function startDrawing(e){
  isMouseDown = true

  let data = {
    x: e.clientX,
    y: e.clientY
  }
  socket.emit("beginPath", data)
}

function drawCanvas(e){
  if(isMouseDown){

    let data = {
      x: e.clientX,
      y: e.clientY,
      color: eraserFlag ? eraserColor : penColor,
      width: eraserFlag ? eraserWidth : penWidth
    }
    socket.emit("drawStroke", data)
  }
}

function stopDrawing(){
  isMouseDown = false

  let url = canvas.toDataURL()
  undoRedoTracker.push(url)
  track = undoRedoTracker.length - 1

  let data = {
    undoRedoTracker,
    track
  }
  socket.emit("undoRedoTrack", data)
}

let isMouseDown = false

canvas.addEventListener("mousedown", startDrawing)
canvas.addEventListener("mousemove", drawCanvas)
canvas.addEventListener("mouseup", stopDrawing)

// Touch events for mobile devices
canvas.addEventListener("touchstart", startDrawing)
canvas.addEventListener("touchmove", drawCanvas)
canvas.addEventListener("touchend", stopDrawing)


function beginPath(strokeObj){
  tool.beginPath()
  tool.moveTo(strokeObj.x, strokeObj.y)
}
function drawStroke(strokeObj){
  tool.lineWidth = strokeObj.width
  tool.strokeStyle = strokeObj.color
  tool.lineTo(strokeObj.x, strokeObj.y)
  tool.stroke()
}

pencilColors.forEach(colorElem => {
  colorElem.addEventListener("click", (e) => {
    const color = colorElem.classList[0]
    penColor = color
    tool.strokeStyle = penColor
  })
})

pencilWidthElem.addEventListener("change", (e) => {
  penWidth = pencilWidthElem.value
  tool.lineWidth = penWidth
})

eraserWidthElem.addEventListener("change", (e) => {
  eraserWidth = eraserWidthElem.value
  tool.lineWidth = eraserWidth
})
eraser.addEventListener("click", (e) => {
  if(eraserFlag){
    tool.strokeStyle = eraserColor
    tool.lineWidth = eraserWidth
  }
  else{
    tool.strokeStyle = penColor
    tool.lineWidth = penWidth
  }

})

download.addEventListener("click", (e) => {
  const url = canvas.toDataURL()

  const a = document.createElement("a")
  a.setAttribute("href", url)
  a.setAttribute("download", "board.jpg")
  a.click()
})

undo.addEventListener("click", (e) => {
  if(track >= 0){
    track--

    let data = {
      trackValue: track,
      undoRedoTracker
    }
    socket.emit("undoRedoCanvas", data)
  }
})

redo.addEventListener("click", (e) => {
  if(track < undoRedoTracker.length - 1){
    track++

    let data = {
      trackValue: track,
      undoRedoTracker
    }
    socket.emit("undoRedoCanvas", data)
  } 
})

function undoRedoCanvas(trackObj){
  track = trackObj.trackValue;
  undoRedoTracker = trackObj.undoRedoTracker

  let url = undoRedoTracker[track]
  let img = new Image()
  tool.clearRect(0, 0, canvas.width, canvas.height)
  img.src = url
  img.onload = (e) => {
    tool.drawImage(img, 0, 0, canvas.width, canvas.height)
  } 
}

socket.on("beginPath", (data) => {
  beginPath(data)
})

socket.on("drawStroke", (data) => {
  drawStroke(data)
})

socket.on("undoRedoTrack", (data) => {
  track = data.track;
  undoRedoTracker = data.undoRedoTracker
})

socket.on("undoRedoCanvas", (data) => {
  undoRedoCanvas(data)
})

