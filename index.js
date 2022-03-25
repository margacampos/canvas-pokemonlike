// import {mapImage, playerDown, playerRight, playerUp, playerLeft} from './modules/images';

const canvas = document.getElementById('pokemon');
const transitionDiv = document.getElementById('transition');
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

const battleBackgImage = new Image();
battleBackgImage.src = './assets/battle-background.jpg';

//Enemy

const enemyBlobWalkImage = new Image();
enemyBlobWalkImage.src = './assets/enemies/ENEMIES8bit_Blob Walk.png'

const enemyBlobDeathImage = new Image();
enemyBlobDeathImage.src = './assets/enemies/ENEMIES8bit_Blob Death.png'

const enemyNegaBlobWalkImage = new Image();
enemyNegaBlobWalkImage.src = './assets/enemies/ENEMIES8bit_NegaBlob Walk.png'

const enemyNegaBlobDeathImage = new Image();
enemyNegaBlobDeathImage.src = './assets/enemies/ENEMIES8bit_NegaBlob Death.png'

//Player

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
        this.originalPosition = position;
        this.width = 72;
        this.height = 72;
    }
    draw(){
        ctx.fillStyle = 'rgba(255, 0, 0, 0)';
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
    constructor({position, image, frames = {max:1}, sprite }){
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
const battleBackground = new Sprite({position:{
    x: 0,
    y: 0,
    
},
image: battleBackgImage
})

//Enemies

const enemyBlob = new Sprite({
    position:{
        x:(canvas.width/2)-((572/4)/2)-25,
        y: (canvas.height/2)-((72/4)/2)
    },
    frames: {max: 5},
    image: enemyBlobWalkImage,
    sprite: {
        walkPink: enemyBlobWalkImage,
        deathPink: enemyBlobDeathImage,
        walkNega:enemyNegaBlobWalkImage,
        deathNega:enemyNegaBlobDeathImage
    }
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

const battle = {
    initiated: false
};

function animate(){
    const frameId = window.requestAnimationFrame(animate);
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

    if(battle.initiated) return;

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
                window.cancelAnimationFrame(frameId);
                transitionDiv.classList.add('animateIn');
                transitionDiv.classList.add('onScreen');
                player.image = player.sprite.down;
                player.frames.val = 0;
                player.draw();
                let initiateBattle =  new Promise((resolve, reject) => {
                    setTimeout(function(){
                      transitionDiv.classList.remove('animateIn');
                      animateBattle();
                      console.log('hey async no more')
                      resolve("¡Éxito!"); // ¡Todo salió bien!
                    }, 1000);
                  });
                initiateBattle.then((a)=>{
                    console.log(a);
                    battle.initiated = true;
                    setTimeout(function(){
                        transitionDiv.classList.add('animateOut');
                        transitionDiv.classList.remove('onScreen');
                        setTimeout(function(){
                            transitionDiv.classList.remove('animateOut');
                        }, 1000);
                    }, 50);
                });
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

let rangeX = 0;
let rangeY = 0;
let jumpX = 1;
let jumpY = 1;
let randomEnemy = 2;
function animateBattle() {
    const frameId = window.requestAnimationFrame(animateBattle);
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    battleBackground.draw();
    enemyBlob.frames.max = 5;

    if (keys.space.pressed){
        window.cancelAnimationFrame(frameId);
        map.position.x = OFFSET.x;
        map.position.y = OFFSET.y;
        boundaries.forEach((bound)=>{
            bound.position = {
                x: bound.originalPosition.x,
                y: bound.originalPosition.y
            }
            
        });
    
        battleZones.forEach((battlezone)=>{
            battlezone.position = {
                x: battlezone.originalPosition.x,
                y: battlezone.originalPosition.y
            }
            
        });
        player.image = player.sprite.down;
        player.frames.val = 0;
        transitionDiv.classList.add('animateIn');
        transitionDiv.classList.add('onScreen');
        let endBattle =  new Promise((resolve, reject) => {
            setTimeout(function(){
              transitionDiv.classList.remove('animateIn');
              animate();             
              resolve("¡Éxito!"); // ¡Todo salió bien!
            }, 1000);
          });
        endBattle.then((a)=>{
            battle.initiated = false;
            setTimeout(function(){
                transitionDiv.classList.add('animateOut');
                transitionDiv.classList.remove('onScreen');
                setTimeout(function(){
                    transitionDiv.classList.remove('animateOut');
                }, 1000);
            }, 50);
        });
    };

    if(randomEnemy===1){
        enemyBlob.image = enemyBlob.sprite.walkPink;
    }else if(randomEnemy===2){
        enemyBlob.image = enemyBlob.sprite.walkNega;
    }

    if (keys.w.pressed){
        if(randomEnemy===1){
            enemyBlob.image = enemyBlob.sprite.walkPink;
        }else if(randomEnemy===2){
            enemyBlob.image = enemyBlob.sprite.walkNega;
        }
        enemyBlob.frames.max = 5;
        enemyBlob.moving = true;
        enemyBlob.position.x +=jumpX;
        enemyBlob.position.y -=jumpY;
        rangeY++;
        rangeX++;
        if(rangeX>=50){
            jumpX = -jumpX;
            rangeX = 0;
        }
        if(rangeY>=25){
            jumpY = -jumpY;
            rangeY = 0;
        }

    }else if(keys.s.pressed){
        enemyBlob.frames.max = 3;
        if(randomEnemy===1){
            enemyBlob.image = enemyBlob.sprite.deathPink;
        }else if(randomEnemy===2){
            enemyBlob.image = enemyBlob.sprite.deathNega;
        }
        enemyBlob.moving = true;

    }else if(keys.d.pressed && randomEnemy<2){
        randomEnemy++;
    }else if(keys.a.pressed && randomEnemy>1){
        randomEnemy--;
    }else {
        enemyBlob.frames.val = 0;
        enemyBlob.moving = false;
        enemyBlob.position.y = (canvas.height/2)-((72/4)/2);
        enemyBlob.position.x = (canvas.width/2)-((72/4)/2)-25;
        rangeX = 0;
        rangeY = 0;
        jumpX = 1;
        jumpY = 1;
    }
    enemyBlob.draw();

}
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
