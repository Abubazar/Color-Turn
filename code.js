const canvas = document.getElementById("game")
const ctx = canvas.getContext("2d")
canvas.width = window.innerWidth
canvas.height = window.innerHeight

const colorSet={
    rotatingBlock:['grey']
}

const playerWidth=200


function drawPlayer(phase){
    ctx.save()
    ctx.translate(canvas.width/2,canvas.height/2)
    ctx.rotate(phase*Math.PI/180)

    ctx.fillStyle='grey'
    ctx.fillRect(-playerWidth/2,-playerWidth/2,playerWidth,playerWidth)

    ctx.restore()
}


function drawBlock(phase,posx,posy,width,height,color,x=0,y=0){
    ctx.save()
    ctx.translate(posx,posy)
    ctx.rotate(phase*Math.PI/180)

    dheight=height/2
    width=y*2
    y=y+dheight
    
    dwidth=width/2
    ctx.beginPath()
    ctx.moveTo(x-(dwidth+height), y+(dheight))
    ctx.lineTo(x+dwidth+height, y+(dheight))
    ctx.lineTo(x+dwidth, y-dheight)
    ctx.lineTo(x-dwidth, y-dheight)
    ctx.closePath()
    ctx.fillStyle=color
    ctx.fill()
    ctx.fillStyle='white'
    ctx.fillRect(-1,-1,2,2)

    ctx.restore()
}



rotation = 0
distance = 0

function update(delta){
    rotation+=delta*40
    distance+=delta*10
}

function render(){
    ctx.clearRect(0,0,canvas.width,canvas.height)
    drawPlayer(rotation)
    drawBlock(180+rotation,canvas.width/2,canvas.height/2,200,20,'blue',0,100+distance)
    drawBlock(0+rotation,canvas.width/2,canvas.height/2,200,20,'rgb(255, 0, 0)',0,100+distance)
    drawBlock(90+rotation,canvas.width/2,canvas.height/2,200,20,'rgb(30, 255, 0)',0,100+distance)
    drawBlock(270+rotation,canvas.width/2,canvas.height/2,200,20,'rgb(255, 196, 0)',0,100+distance)
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