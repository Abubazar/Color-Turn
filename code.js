const canvas = document.getElementById("game")
const ctx = canvas.getContext("2d")
canvas.width = window.innerWidth
canvas.height = window.innerHeight

const colorSet={
    rotatingBlock:['grey']
}

const allBlocks=[]

const stackedBlocks={
    top:[],
    right:[],
    left:[],
    bottom:[]
}

const playerWidth=100
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
        currentPhase=Math.round(playerRotation/90)%4
    }
}

function getRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let generateBlockTimer=0
function generateBlocks(delta){
    if(generateBlockTimer<=0){
        generateBlockTimer=getRandomInteger(1,3)
        allBlocks.push(new Block(getRandomInteger(1,4)))
    }
    generateBlockTimer-=delta
}


function checkMatchingBlock(block){
    const sides=['bottom','left','top','right']
    const samsies=[]
    const sidename = block.sideName
    const stackindex=block.sideStackIndex
    const color=block.color
    const id=block.id
    if(stackindex>0){
        if(stackedBlocks[sidename][stackindex-1][0] == color){
            samsies.push(stackedBlocks[sidename])
            console.log(id)
            allBlocks.splice(id,1)
            stackedBlocks[sidename].splice(stackindex,1)
        }
    }
}



class Block {
    constructor(colorCode) {
        this.color = ''
        switch (colorCode) {
            case 1: this.color = 'rgba(255, 76, 76, 1)'; break
            case 2: this.color = 'rgba(76, 255, 76, 1)'; break
            case 3: this.color = 'rgba(76, 76, 255, 1)'; break
            case 4: this.color = 'rgba(255, 229, 58, 1)'; break
        }

        this.distance = 300
        this.phase = getRandomInteger(0, 3) * 90
        this.stationed = false
        this.deg = 0
        this.stationedPhase = 0
        this.sideName
        this.sideStackIndex
        this.id=allBlocks.length
    }

    update(delta) {
        if (!this.stationed) {
            let landingAngle = ((this.phase - playerRotation) % 360 + 360) % 360
            landingAngle = Math.round(landingAngle)

            let temporarySide = ''
            switch (landingAngle) {
                case 0:   temporarySide = 'bottom'; break
                case 90:  temporarySide = 'left';   break
                case 180: temporarySide = 'top';    break
                case 270: temporarySide = 'right';  break
            }

            const currentStackCount = stackedBlocks[temporarySide] ? stackedBlocks[temporarySide].length : 0
            const dynamicStopDistance = (playerWidth / 2) + (currentStackCount * blockHeight)

            if (this.distance <= dynamicStopDistance && !isPlayerRotating) {
                this.stationed = true
                this.sideName = temporarySide
                
                this.distance = dynamicStopDistance
                
                this.stationedPhase = this.phase - playerRotation

                stackedBlocks[this.sideName].push([this.color,this.id])
                this.sideStackIndex=stackedBlocks[this.sideName].length-1
                checkMatchingBlock(this)
                console.log(this.id)
            } else {
                this.distance -= delta * 60
            }


            
        }

        if (this.stationed) {
            this.deg = playerRotation + this.stationedPhase - this.phase
        }
    }

    draw() {
        drawBlock(this.phase + this.deg, canvas.width / 2, canvas.height / 2, playerWidth, blockHeight, this.color, 0, this.distance)
    }
}

let distance = 0

function update(delta){
    rotatePlayer(delta)
    distance+=delta*10
    generateBlocks(delta)

    for(let i=0;i<allBlocks.length;i++){
        allBlocks[i].update(delta)
    }
}

function render(){
    ctx.clearRect(0,0,canvas.width,canvas.height)
    drawPlayer(playerRotation)
    for(let i=0;i<allBlocks.length;i++){
        allBlocks[i].draw()
    }
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

requestAnimationFrame((time) => {
    lastTime = time
    requestAnimationFrame(gameLoop)
})

window.addEventListener("keydown", (e) => {
    if(e.key=='c'){
        if(!isPlayerRotating){targetRotation+=90}
    }
})
