
let toolsCont = document.querySelector(".tools-cont")
let optionsCont = document.querySelector(".options-cont");
let optionFlag = true

let pencilToolCont = document.querySelector(".pencil-tool-cont")
let eraserToolCont = document.querySelector(".eraser-tool-cont")

let pencil = document.querySelector(".pencil")
let eraser = document.querySelector(".eraser")
let sticky = document.querySelector(".sticky")
let upload = document.querySelector(".upload")

let pencilCont = document.querySelector(".pencil-cont")
let pencilFlag = false
let eraserCont = document.querySelector(".eraser-cont")
let eraserFlag = false


// true -> show tools, false -> hide tools
optionsCont.addEventListener("click", (e) => {
  optionFlag = !optionFlag

  if(optionFlag) openTools()
  else closeTools()

})

function openTools(){
  toolsCont.classList.toggle("open")
  let childElem = optionsCont.children[0]
  childElem.classList.remove("fa-xmark")
  childElem.classList.add("fa-bars")

  toolsCont.style.animationName = "scale-tools"
  toolsCont.style.display = "flex"
}

function closeTools(){
  let childElem = optionsCont.children[0]
  childElem.classList.remove("fa-bars")
  childElem.classList.add("fa-xmark")

  toolsCont.style.animationName = "down-scale-tools"

  setTimeout(() => {
    toolsCont.style.display = "none"
    pencilToolCont.style.display = "none"
    eraserToolCont.style.display = "none"
  }, 300)
}

pencil.addEventListener("click", (e) => {
  // true -> show pencil tool, false -> hide pencil tool
  pencilFlag = !pencilFlag

  if(pencilFlag) pencilToolCont.style.display = "block"
  else pencilToolCont.style.display = "none"
})

eraser.addEventListener("click", (e) => {
  eraserFlag = !eraserFlag

  if(eraserFlag) eraserToolCont.style.display = "flex"
  else eraserToolCont.style.display = "none"
})

function createStickyCont(stickyTemplateHTML){
  const stickyCont = document.createElement("div")
  stickyCont.setAttribute("class", "sticky-cont")
  stickyCont.setAttribute("data-id", Date.now())

  stickyCont.innerHTML = `
      <div class="header-cont">
        <div class="minimize">-</div>
        <div class="remove">x</div>
      </div>
      <div class="note-cont">
        ${stickyTemplateHTML}
      </div>
  `;

  document.body.appendChild(stickyCont)

  let minimize = stickyCont.querySelector(".minimize")
  let remove = stickyCont.querySelector(".remove")
  noteActions(minimize, remove, stickyCont)

  stickyCont.addEventListener("mousedown", (e) => {
    dragAndDrop(stickyCont, e)
  })
}

sticky.addEventListener("click", () => {
  const textarea = `<textarea spellcheck="false"></textarea>`
  createStickyCont(textarea)
 
})

function noteActions(minimize, remove, element){
  minimize.addEventListener("click", (e) => {
    const noteCont = element.querySelector(".note-cont")
    let display = getComputedStyle(noteCont).getPropertyValue("display")
    if(display === "none") noteCont.style.display = "block"
    else noteCont.style.display = "none"
  })

  remove.addEventListener("click", (e) => {
    element.remove()
  })
}

function dragAndDrop(element, e){
  let isDragging = true
  let shiftX = e.clientX - element.getBoundingClientRect().left
  let shiftY = e.clientY - element.getBoundingClientRect().top
  element.style.cursor = 'grabbing';

  function handleMouseMove(event){
      if(isDragging){
        element.style.left = event.pageX - shiftX + "px"
        element.style.top = event.pageY - shiftY + "px"
      }
  }

  function handleMouseUp(){
    element.style.cursor = 'grab';
    isDragging = false
    element.removeEventListener('mousemove', handleMouseMove);
    element.removeEventListener('mouseup', handleMouseUp);
  }

  element.addEventListener("mousemove", handleMouseMove)
  element.addEventListener("mouseup", handleMouseUp)
}

upload.addEventListener("click", (e) => {
  const input = document.createElement("input")
  input.setAttribute("type", "file")
  input.click()

  input.addEventListener("change", (e) => {
    const file = e.target.files[0]

    if(file){
      const reader = new FileReader()

      reader.onload = (e) => {
        const imgUrl = e.target.result;
        socket.emit("uploadClip", imgUrl)
      }
      reader.readAsDataURL(file)
    }
  })
})

function uploadFile(imgUrl){
  const img = `<img src=${imgUrl}>`
  createStickyCont(img)
}

socket.on("uploadClip", (file) => {
  uploadFile(file)
})