const canvas=document.getElementById("game")
const ctx=canvas.getContext("2d")
canvas.width=800
canvas.height=800

const colorSet={
    rotatingBlock:['grey']
}

const allBlocks=[]

    const globalBlocksToDelete=[]

const playerWidth=100
const blockHeight=20
let doubleTapSensor=0.3

let isPlayerRotating=false
let playerRotation=0
let targetRotation=0
let globalScore=0

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
        isPlayerRotating=true
        playerRotation=Math.max(playerRotation-delta*400, targetRotation)
    }
    else if(playerRotation < targetRotation){
        isPlayerRotating=true
        playerRotation=Math.min(playerRotation+delta*400, targetRotation)
    }
    else{
        isPlayerRotating=false
        currentPhase=Math.round(playerRotation/90)%4
    }
}

function getRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

let generateBlockTimer=0
function generateBlocks(delta){
    if(generateBlockTimer<=0){
        generateBlockTimer=getRandomInteger(0.5,2)
        allBlocks.push(new Block(getRandomInteger(1,4)))
    }
    generateBlockTimer-=delta
}

function sortStack(side){
    const sorted=[]
    for(let i=0; i<allBlocks.length; i++){
        if(allBlocks[i].stationed && allBlocks[i].sideName==side){
            sorted.push(allBlocks[i])
        }
    }
    return sorted
}

function checkMatchingBlock(block) {
    const sides=['bottom', 'left', 'top', 'right']
    
    const myStack=sortStack(block.sideName).filter(b => b.stationed && !b.arrange)

    const otherStack1=sortStack(sides[(sides.indexOf(block.sideName) + 1) % 4]).filter(b => b.stationed && !b.arrange)
    const otherStack2=sortStack(sides[(sides.indexOf(block.sideName) + 3) % 4]).filter(b => b.stationed && !b.arrange)
    
    const myColor=block.color
    let matched=false
    let myIndex=myStack.indexOf(block)

    if (myIndex === -1) return

    function safePushToDelete(target) {
        if (target && !globalBlocksToDelete.includes(target)) {
            globalBlocksToDelete.push(target)
        }
    }

    if (myIndex > 0) {
        const blockBelow=myStack[myIndex - 1]
        if (blockBelow && !globalBlocksToDelete.includes(blockBelow) && blockBelow.color === myColor) {
            matched=true
            safePushToDelete(blockBelow)
        }
    }

    if (myIndex < otherStack1.length) {
        const neighborBlock=otherStack1[myIndex]
        if (neighborBlock && !globalBlocksToDelete.includes(neighborBlock) && neighborBlock.color === myColor) {
            matched=true
            safePushToDelete(neighborBlock)
        }
    }

    if (myIndex < otherStack2.length) {
        const neighborBlock=otherStack2[myIndex]
        if (neighborBlock && !globalBlocksToDelete.includes(neighborBlock) && neighborBlock.color === myColor) {
            matched=true
            safePushToDelete(neighborBlock)
        }
    }

    if (matched) {
        safePushToDelete(block)
        myStack.forEach((b, idx) => {
            if (idx > myIndex) {
                b.stationed=false
                b.arrange=true
            }
        })
    }
}


function deleteBlocks(delta) {
    for (let i=globalBlocksToDelete.length - 1; i >= 0; i--) {
        const targetBlock=globalBlocksToDelete[i]
        const renderIndex=allBlocks.indexOf(targetBlock)
        
        if (renderIndex === -1) continue

        const colorString=allBlocks[renderIndex].color
        let match=colorString.match(/,([^,]*)\)$/)

        if (match) {
            let currentAlpha=parseFloat(match[1].trim())
            
            let newAlpha=Math.max(0, currentAlpha - 2 * delta)
            
            allBlocks[renderIndex].color=colorString.replace(/,[^,]*\)$/, `, ${newAlpha})`)

            if (newAlpha <= 0) {
                const stackSide=sortStack(allBlocks[renderIndex].sideName)
                for (let i=0; i < stackSide.length; i++) {
                    stackSide[i].arrange=true
                }
                allBlocks.splice(renderIndex, 1)
                globalBlocksToDelete.splice(i, 1)

                globalScore+=10
            }
        }
    }
}

function displayScore(){
    ctx.fillStyle='white'
    ctx.font='30px Monospace'
    const pos={x:0, y:0}
    pos.x=(canvas.width - ctx.measureText(globalScore).width) / 2
    pos.y=(canvas.height/2) +10
    ctx.fillText(globalScore, pos.x, pos.y)
}

class Block {
    constructor(colorCode) {
        this.color=''
        switch (colorCode) {
            case 1: this.color='rgba(255, 76, 76, 1)'; break
            case 2: this.color='rgba(76, 255, 76, 1)'; break
            case 3: this.color='rgba(76, 76, 255, 1)'; break
            case 4: this.color='rgba(255, 229, 58, 1)'; break
        }

        this.distance=300
        this.phase=getRandomInteger(0, 3) * 90
        this.stationed=false
        this.deg=0
        this.stationedPhase=0
        this.sideName
        this.sideId
        this.id=allBlocks.length
        this.arrange=false
        this.removedFromBelow=0
        this.speed=100
    }

    update(delta) {
        if (!this.stationed) {
            let landingAngle=((this.phase - playerRotation) % 360 + 360) % 360
            landingAngle=Math.round(landingAngle)

            let temporarySide=''
            switch (landingAngle) {
                case 0:   temporarySide='bottom'; break
                case 90:  temporarySide='left';   break
                case 180: temporarySide='top';    break
                case 270: temporarySide='right';  break
            }
            const totalAtStack=sortStack(temporarySide).length
            const dynamicStopDistance=(playerWidth / 2) + (totalAtStack * blockHeight)

            if (this.distance <= dynamicStopDistance && !isPlayerRotating) {
                this.stationed=true
                this.sideName=temporarySide
                
                this.distance=dynamicStopDistance
                
                    this.stationedPhase=this.phase - playerRotation
                checkMatchingBlock(this)
            } else {
                this.distance -= delta * this.speed
            }


            
        }

        if (this.stationed) {
            this.deg=playerRotation + this.stationedPhase - this.phase
        }

        if (this.arrange) {
        const myIndex=sortStack(this.sideName).indexOf(this)
    
        const targetDistance=(playerWidth / 2) + (myIndex * blockHeight)

        if (this.distance <= targetDistance) {
            this.distance=targetDistance
            
            this.stationed=true
            this.arrange=false
            
            checkMatchingBlock(this)
        } else {
            this.distance -= delta * 120
        }
}
    }


    draw() {
        drawBlock(this.phase + this.deg, canvas.width / 2, canvas.height / 2, playerWidth, blockHeight, this.color, 0, this.distance)
    }
}

let distance=0

function update(delta){
    rotatePlayer(delta)
    distance+=delta*10
    generateBlocks(delta)
    deleteBlocks(delta)

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
    displayScore()
}

let lastTime=0
let accumulator=0
const FPS=60
const timestep=1000 / FPS

function gameLoop(ctime){
    let deltaTime=ctime - lastTime
    lastTime=ctime

    if (deltaTime > 250) deltaTime=250

    accumulator += deltaTime

    while (accumulator >= timestep) {
        update(timestep / 1000)
        accumulator -= timestep
    }

    render()

    requestAnimationFrame(gameLoop)
}

requestAnimationFrame((time) => {
    lastTime=time
    requestAnimationFrame(gameLoop)
})

window.addEventListener("keydown", (e) => {
    if(e.key=='c'){
        if(!isPlayerRotating){targetRotation+=90}
    }
})

window.addEventListener("touchstart", (e) => {
    e.preventDefault()
    if(!isPlayerRotating){targetRotation+=90}
}, { passive: false })