const canvas = document.getElementById('pokemon');
canvas.width = window.innerWidth-50;
canvas.height = window.innerHeight-50;
const ctx = canvas.getContext('2d');
const collisionsMap = [];

for (let index = 0; index < collisions.length; index+=53) {
    collisionsMap.push(collisions.slice(index, 53 + index));
}

const mapImage = new Image();
mapImage.src = './assets/map.png';

const playerImage = new Image();
playerImage.src = './assets/HEROS8bit_Adventurer Walk R.png'

const keys = {
    w:{
        pressed:false
    },
    s:{
        pressed:false
    },
    a:{
        pressed:false
    },
    d:{
        pressed:false
    },
    space:{
        pressed:false
    }
}
let lastKey = '';

class Sprite {
    constructor({position, image}){
        this.position = position;
        this.image = image;
    }
    draw(){
      ctx.drawImage(this.image, this.position.x, this.position.y);
    }
}

const map = new Sprite({position:{
    x: -((mapImage.width-1300)/2),
    y: -((mapImage.width-1300)/2)
},
image: mapImage
})

function animate(){
    window.requestAnimationFrame(animate);
    canvas.width = window.innerWidth-50;
    canvas.height = window.innerHeight-50;
    map.draw();
    ctx.drawImage(playerImage, 0, 0, playerImage.width/8, playerImage.height, (canvas.width/2)-((playerImage.width/8)/2), (canvas.height/2)-((playerImage.height/8)/2), playerImage.width/8, playerImage.height);

    if(keys.w.pressed)map.position.y += 3;
    if(keys.s.pressed)map.position.y -= 3;
    if(keys.a.pressed)map.position.x += 3;
    if(keys.d.pressed)map.position.x -= 3;
    // if(keys.w.pressed && lastKey === 'w')map.position.y += 3;
    // if(keys.s.pressed && lastKey === 's')map.position.y -= 3;
    // if(keys.a.pressed && lastKey === 'a')map.position.x += 3;
    // if(keys.d.pressed && lastKey === 'd')map.position.x -= 3;
}

animate();

window.addEventListener('keydown', (e)=>{
    switch (e.key) {
        case 'w':
        case 'ArrowUp':
            keys.w.pressed = true;
            lastKey = 'w';
            break;
        case 's':
        case 'ArrowDown':
            keys.s.pressed = true;
            lastKey = 's';
            break;
        case 'd':
        case 'ArrowRight':
            keys.d.pressed = true;
            lastKey = 'd';
            break;
        case 'a':
        case 'ArrowLeft':
            keys.a.pressed = true;
            lastKey = 'a';
            break;
        case ' ':
            keys.space.pressed = true;
            lastKey = 'space';
            break;
    
        default:
            break;
    }
})
window.addEventListener('keyup', (e)=>{
    switch (e.key) {
        case 'w':
        case 'ArrowUp':
            keys.w.pressed = false;
            break;
        case 's':
        case 'ArrowDown':
            keys.s.pressed = false;
            break;
        case 'd':
        case 'ArrowRight':
            keys.d.pressed = false;
            break;
        case 'a':
        case 'ArrowLeft':
            keys.a.pressed = false;
            break;
        case ' ':
            keys.space.pressed = false;
            break;
    
        default:
            break;
    }
})
