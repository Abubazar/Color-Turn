const canvas = document.getElementById("game")
const ctx = canvas.getContext("2d")
canvas.width = window.innerWidth
canvas.height = window.innerHeight


function drawPolygon(n,posx,posy,rad,deg){
    ctx.beginPath()
    for(let i=0; i<n; i++){
        const angle = ((Math.PI/3)*i-Math.PI/2)+deg
        const x = posx+rad*Math.cos(angle)
        const y = posy+rad*Math.sin(angle)

        if(i===0){
            ctx.moveTo(x,y)
        } else {
            ctx.lineTo(x,y)
        }
    }
    ctx.closePath()
    ctx.stroke()
}

function render(){
    ctx.clearRect(0,0,canvas.width,canvas.height)
}

drawPolygon(6,canvas.width/2,canvas.height/2,100,0)