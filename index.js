const canvas = document.getElementById('pokemon');
canvas.width = window.innerWidth-50;
canvas.height = window.innerHeight-50;
const ctx = canvas.getContext('2d');

const battleMap = [];

for (let index = 0; index < battleCollision.length; index+=53) {
    battleMap.push(battleCollision.slice(index, 53 + index));
}

const collisionsMap = [];

for (let index = 0; index < collisions.length; index+=53) {
    collisionsMap.push(collisions.slice(index, 53 + index));
}

const mapImage = new Image();
mapImage.src = './assets/map.png';

const playerRight = new Image();
playerRight.src = './assets/HEROS8bit_Adventurer Walk R.png'

const playerLeft = new Image();
playerLeft.src = './assets/HEROS8bit_Adventurer Walk L.png'

const playerUp = new Image();
playerUp.src = './assets/HEROS8bit_Adventurer Walk U.png'

const playerDown = new Image();
playerDown.src = './assets/HEROS8bit_Adventurer Walk D.png'

const OFFSET = {
    x: -((mapImage.width-1300)/2),
    y: -((mapImage.width-1300)/2)
}

class Boundary{
    static width = 72;
    static height = 72;
    constructor(position){
        this.position = position;
        this.width = 72;
        this.height = 72;
    }
    draw(){
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
}

const boundaries = [];

collisionsMap.forEach((rows, i)=>{
    rows.forEach((symbol, j)=>{
        if(symbol == 2){
            boundaries.push(new Boundary({x:j*Boundary.width+OFFSET.x ,y:i*Boundary.height+OFFSET.y})); 
        }
    })
})

const battleZones = [];

battleMap.forEach((rows, i)=>{
    rows.forEach((symbol, j)=>{
        if(symbol == 457){
            battleZones.push(new Boundary({x:j*Boundary.width+OFFSET.x ,y:i*Boundary.height+OFFSET.y})); 
        }
    })
})

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
    constructor({position, image, frames = {max:1}, sprite}){
        this.position = position;
        this.image = image;
        this.frames = {...frames, val: 0, elapsed: 0};
        this.image.onload = () =>{
            this.width = this.image.width / this.frames.max;
            this.height = this.image.height;
        }
        this.moving = false;
        this.sprite = sprite;
    }
    draw(){
        
      ctx.drawImage(this.image, this.frames.val*this.width, 0, this.image.width/this.frames.max, this.image.height, this.position.x, this.position.y, this.image.width/this.frames.max, this.image.height);

      if(!this.moving) return;

      if (this.frames.max>1) this.frames.elapsed++;
      if (this.frames.elapsed%10 === 0){
         if (this.frames.val<this.frames.max-1)this.frames.val++
        else this.frames.val = 0; 
      }
      
    }
}

const player = new Sprite({
    position:{
        x:(canvas.width/2)-((572/4)/2),
        y: (canvas.height/2)-((72/4)/2)
    },
    frames: {max: 4},
    image: playerDown,
    sprite: {
        up: playerUp,
        down:playerDown,
        left:playerLeft,
        right:playerRight
    }
})
const map = new Sprite({position:{
    x: OFFSET.x,
    y: OFFSET.y
},
image: mapImage
})


const movables = [map, ...boundaries, ...battleZones]; //Everything we want to move with the background

function keyPressed(arr) {
    let keyPressed = false;
    for (var key in arr) {
        if (arr.hasOwnProperty(key)) {
            if(arr[key].pressed)keyPressed=true;
        }
      }
      
    // console.log(keyPressed);
    return keyPressed;
}

function rectangularCollision({rectangle1, rectangle2}) {
    return(
        rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
        rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
        rectangle1.position.y <= rectangle2.position.y + rectangle2.height &&
        rectangle1.position.y + rectangle1.height >= rectangle2.position.y 
    );
}

function animate(){
    window.requestAnimationFrame(animate);
    let moving = true;

    canvas.width = window.innerWidth-50;
    canvas.height = window.innerHeight-50;
    map.draw();
    boundaries.forEach((bound)=>{
        bound.draw();
        
    });

    battleZones.forEach((battlezone)=>{
        battlezone.draw();
        
    });

    player.draw();

    player.moving = false;

    if(keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed){
        for (let i = 0; i < battleZones.length; i++) {
            const battlezone = battleZones[i];

            const overlappingArea = 
            (Math.min(
                player.position.x + player.width,
                battlezone.position.x+battlezone.width
            ) -
            Math.max(player.position.x, battlezone.position.x)) *
            (Math.min(
                player.position.y + player.height,
                battlezone.position.y + battlezone.height
            ) -
            Math.max(player.position.y, battlezone.position.y));

            if (rectangularCollision({
                rectangle1: player, 
                rectangle2: battlezone
            }) && 
            overlappingArea > (player.width*player.height)/2){
                console.log('collide');

                break;
            }
            
        }
    }

    if(keys.w.pressed){
        player.moving = true;
        player.image = player.sprite.up;
        for (let i = 0; i < boundaries.length; i++) {
            const bound = boundaries[i];
            if (rectangularCollision({
                rectangle1: player, 
                rectangle2: {...bound, position:{
                    x: bound.position.x,
                    y: bound.position.y + 3
                }}
            })){
                moving=false;
                // console.log('collide');
                break;
            }
            
        }
        
        if (moving){
           movables.forEach((movable)=>{
            movable.position.y +=3;
        }); 
        }
        
    }else if(lastKey === 'w' && !keyPressed(keys)){
        player.frames.val = 0;
    }
    if(keys.s.pressed){
        player.moving = true;
        player.image = player.sprite.down;
        for (let i = 0; i < boundaries.length; i++) {
            const bound = boundaries[i];
            if (rectangularCollision({
                rectangle1: player, 
                rectangle2: {...bound, position:{
                    x: bound.position.x,
                    y: bound.position.y - 3
                }}
            })){
                moving=false;
                // console.log('collide');
                break;
            }
            
        }
        if (moving){
           movables.forEach((movable)=>{
            movable.position.y -=3;
        }); 
        }
        
    }else if(lastKey === 's' && !keyPressed(keys)){
        player.frames.val = 0;
    }
    if(keys.a.pressed){
        player.moving = true;
        player.image = player.sprite.left;
        for (let i = 0; i < boundaries.length; i++) {
            const bound = boundaries[i];
            if (rectangularCollision({
                rectangle1: player, 
                rectangle2: {...bound, position:{
                    x: bound.position.x + 3,
                    y: bound.position.y
                }}
            })){
                moving=false;
                // console.log('collide');
                break;
            }
            
        }
        if (moving){
           movables.forEach((movable)=>{
            movable.position.x +=3;
        }); 
        }
        
    }else if(lastKey === 'a' && !keyPressed(keys)){
        player.frames.val = 0;
    }
    if(keys.d.pressed){
        player.moving = true;
        player.image = player.sprite.right;
        for (let i = 0; i < boundaries.length; i++) {
            const bound = boundaries[i];
            if (rectangularCollision({
                rectangle1: player, 
                rectangle2: {...bound, position:{
                    x: bound.position.x - 3,
                    y: bound.position.y
                }}
            })){
                moving=false;
                // console.log('collide');
                break;
            }
            
        }
        if (moving){
           movables.forEach((movable)=>{
            movable.position.x -=3;
        }); 
        }
    }else if(lastKey === 'd' && !keyPressed(keys)){
        player.frames.val = 0;
    }



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
