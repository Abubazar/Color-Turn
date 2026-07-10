const canvas = document.getElementById("game")
const ctx = canvas.getContext("2d")
canvas.width = window.innerWidth
canvas.height = window.innerHeight

const colorSet={
    rotatingBlock:['grey']
}

const playerWidth=200
const blockHeight=20
let doubleTapSensor=0.3

let isPlayerRotating=false
let playerRotation=0
let targetRotation=0

let currentPhase=0

function drawPlayer(phase){
    ctx.save()
    ctx.translate(canvas.width/2,canvas.height/2)
    ctx.rotate(phase*Math.PI/180)

    ctx.fillStyle=colorSet.rotatingBlock[0]
    ctx.fillRect(-playerWidth/2,-playerWidth/2,playerWidth,playerWidth)

    ctx.restore()
}

function drawBlock(phase,posx,posy,width,height,color,x=0,y=0){
    ctx.save()
    ctx.translate(posx,posy)
    ctx.rotate(phase*Math.PI/180)

    let dheight=height/2
    width=y*2
    let y_calc=y+dheight
    
    let dwidth=width/2
    ctx.beginPath()
    ctx.moveTo(x-(dwidth+height), y_calc+(dheight))
    ctx.lineTo(x+dwidth+height, y_calc+(dheight))
    ctx.lineTo(x+dwidth, y_calc-dheight)
    ctx.lineTo(x-dwidth, y_calc-dheight)
    ctx.closePath()
    ctx.fillStyle=color
    ctx.fill()
    ctx.fillStyle='white'
    ctx.fillRect(-1,-1,2,2)

    ctx.restore()
}

function rotatePlayer(delta){
    if(playerRotation > targetRotation){
        isPlayerRotating = true
        playerRotation = Math.max(playerRotation-delta*400, targetRotation)
    }
    else if(playerRotation < targetRotation){
        isPlayerRotating = true
        playerRotation = Math.min(playerRotation+delta*400, targetRotation)
    }
    else{
        isPlayerRotating=false
        currentPhase=(playerRotation/90)%4
    }
}

class Block{
    constructor(color){
        this.color=color
        this.distance=300
        this.phase=90
        this.stationed=false
        this.deg=0
        this.stationedPhase=0
    }

    update(delta){
        if(this.distance<=playerWidth/2 && !isPlayerRotating && !this.stationed){
            this.stationed=true
            distance=playerWidth/2
            this.stationedPhase=currentPhase*90
        }
        
        if(this.stationed){
            this.deg=playerRotation+this.stationedPhase
        }
        else{
            this.distance-=delta*30
        }
    }

    draw(){
        drawBlock(this.phase+this.deg,canvas.width/2,canvas.height/2,playerWidth,blockHeight,this.color,0,this.distance)
    }
}

let distance = 0
let cat=new Block('rgba(203, 29, 29, 0.49)')

function update(delta){
    rotatePlayer(delta)
    distance+=delta*10
    cat.update(delta)
}

function render(){
    ctx.clearRect(0,0,canvas.width,canvas.height)
    drawPlayer(playerRotation)
    cat.draw()
}

let lastTime = 0
let accumulator = 0
const FPS = 60
const timestep = 1000 / FPS

function gameLoop(ctime){
    let deltaTime = ctime - lastTime
    lastTime = ctime

    if (deltaTime > 250) deltaTime = 250;

    accumulator += deltaTime

    while (accumulator >= timestep) {
        update(timestep / 1000)
        accumulator -= timestep
    }

    render()

    requestAnimationFrame(gameLoop)
}

// Initial kickoff
requestAnimationFrame((time) => {
    lastTime = time
    requestAnimationFrame(gameLoop)
})

window.addEventListener("keydown", (e) => {
    if(e.key=='c'){
        if(!isPlayerRotating){targetRotation+=90}
    }
})
