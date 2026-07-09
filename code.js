const canvas = document.getElementById("game")
const ctx = canvas.getContext("2d")
canvas.width = window.innerWidth
canvas.height = window.innerHeight

const colorSet={
    rotatingBlock:['grey']
}


function drawPlayer(phase){
    ctx.fillStyle='grey'
    ctx.fillRect(canvas.width/2-100,canvas.height/2-100,200,200)
}

function drawBlock(phase,x,y,width,height,color){
    dwidth=width/2
    bWidth=y+10
    tWidth=y-10
    ctx.beginPath()
    ctx.moveTo(x-(dwidth+height), y+(height/2))
    ctx.lineTo(x+dwidth+height, y+(height/2))
    ctx.lineTo(x+dwidth, y-height)
    ctx.lineTo(x-dwidth, y-height)
    ctx.closePath()
    ctx.fillStyle=color
    ctx.fill()
}



rotation = 90

function update(delta){
    //rotation+=delta*1
}

function render(){
    ctx.clearRect(0,0,canvas.width,canvas.height)
    drawPlayer(canvas.width/2,canvas.height/2,200,rotation)
    drawBlock(0,300,300,200,20,'red')
}


let lastTime = 0
const FPS = 60
const timestep = 1000/FPS
function gameLoop(ctime){
    const deltaTime = (ctime - lastTime)/1000

    if (ctime - lastTime >= timestep){
        update(deltaTime)
        render()
        lastTime = ctime
    }

    requestAnimationFrame(gameLoop)
}
requestAnimationFrame(gameLoop)