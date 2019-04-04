const canvasElem = document.getElementsByTagName("canvas")[0];
const ctx = canvasElem.getContext('2d');

var particles = [];
var attractors = [];
var motionActive = false;
var tonsOfParticles = false;
var hue = 0;

//Drawing properties
const strokeColor = `hsl(100,100%,80%,0.01)`;
const mainLineWidth = 1;
ctx.strokeStyle = strokeColor;

ctx.lineJoin = 'round';
ctx.lineCap = 'round';
ctx.lineWidth = "2px";

const G = 0.5;
const field = {x:100,y:100};

function randomVelocity(max,randomAmplifier=false){
    let degree = Math.random()*360;
    let amplifier = 1;
    if (randomAmplifier){
        amplifier = Math.random();
    }
    let x = Math.cos(degree)*max*amplifier;
    let y = Math.sin(degree)*max*amplifier;
    return {x:x,y:y};
}

function randomVector(maxNumber,secondMaxNumber=maxNumber,onlyPositiv=false){
    let x;
    let y;
    if (!onlyPositiv) {
        x = Math.random() * maxNumber * 2 - maxNumber;
        y = Math.random() * secondMaxNumber * 2 - secondMaxNumber;
    } else {
        x = Math.random()*maxNumber;
        y = Math.random()*secondMaxNumber;
    }
    return {x:x,y:y}
}

function updateCanvasSize(){ //takes window properties and sets canvas to its size

}

function setup(){

    field.x = window.innerWidth;
    field.y = window.innerHeight;

}

function newParticleGroup(x,y,count=1000){
    if (tonsOfParticles){
        count = count*10;
        console.log("ye",count);
    }
    for (let i = 0; i<count;i++){
        newParticle(x,y);
    }
}

function newParticle(x,y){
    let posVector = {x:x,y:y};
    let velVector = randomVelocity(1);
    let accVector = {x:0,y:0};
    let weight = 1;
    let particle = {posVector:posVector,velVector:velVector,accVector:accVector,weight:weight};
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y);
    ctx.stroke();
    particles[particles.length] = particle;
}

function newAttractor(x,y){
    let posVector = {x:x,y:y};
    let weight = 1;
    let attractor = {posVector:posVector,weight:weight};
    ctx.lineWidth = 5;
    ctx.strokeStyle = `rgba(255,255,255)`;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.lineWidth = mainLineWidth;
    attractors[attractors.length] = attractor;
}



function calcAcceleration(element) {

    let accVec = {x:0,y:0};
    for (let i = 0; i<attractors.length;i++){

        let attractor = attractors[i];

        let dist = distanceOfVectors(attractor.posVector,element.posVector);

        let strength = attractionForce(attractor.weight,element.weight,dist,G);

        let difVec = subVectors(attractor.posVector,element.posVector);

        /*
        let degree = Math.atan(difVec.y/difVec.x);
        //degree

        let x = Math.cos(degree);
        let y = Math.sin(degree);
        let vector = {x:x,y:y};

        vector = difVec;
        */


        accVec = addVectors(accVec, factorVector(difVec, strength)); //difVec before
    }

    element.accVector = accVec;
    return element.accVector;
}

function attractionForce(m1,m2,d,G){
    return (G*(m1+m2))/(d*d);
}

function drawParticles(){
    for (let i = 0;i<particles.length;i++){

        let particle = particles[i];
        let x = particle.posVector.x;
        let y = particle.posVector.y;
        ctx.strokeStyle = `hsl(${hue},100%,80%,0.1)`;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y);
        ctx.stroke();
    }
}

//window.addEventListener('resize',updateCanvasSize,false);

document.addEventListener('keydown',function(e){

    if (e.code === "KeyP"){
        tonsOfParticles = !tonsOfParticles;
        console.log(tonsOfParticles);
    }
    if (e.code === "KeyR"){ //R for RESET
        particles = [];
        attractors = [];

        let h = canvasElem.height;
        let w = canvasElem.width;
        ctx.clearRect(0,0,w,h);
        motionActive = false;
    }
    if (e.code === "Space"){
        motionActive = !motionActive;
        console.log("Spacebar");
    }
    if (e.code === "KeyA"){
        newAttractor(field.x/2,field.y/2);
        newAttractor(field.x/3,field.y/2);
        newAttractor(field.x/1.5,field.y/2);
        newParticleGroup(field.x/2,field.y/4);
    } //creates a bell
    if (e.code === "KeyS"){
        newAttractor(field.x/4,field.y/2);
        newAttractor(field.x-field.x/4,field.y/2);
        newParticleGroup(field.x/2,field.y/2);
    }
    if (e.code === "KeyD"){ //trippy
        newParticleGroup(field.x/4,field.y/2);
        newParticleGroup(field.x-field.x/4,field.y/2);
        newAttractor(field.x/2,field.y/2);
    }
    if (e.code === "KeyF"){ //not recommended
        newParticleGroup(field.x/2.5,field.y/1.66);
        newParticleGroup(field.x/1.66,field.y/1.66);
        newParticleGroup(field.x/2,field.y/3);
        newAttractor(field.x/2,field.y/2);
    }
    if (e.code === "KeyG"){
        newAttractor(field.x/2,field.y/2);
        newParticleGroup(field.x/4,field.y/2);
    }
});

canvasElem.addEventListener('mousedown', function(e){
    let x = e.offsetX;
    let y = e.offsetY;
    if (e.button === 0){
        newParticleGroup(x,y,1000);
    }
    if (e.button === 2){
        newAttractor(x,y);
    }
    console.log(e.button);
});

setInterval(function(){
    if (motionActive){
        for (let i = 0;i<particles.length;i++) {
            let particle = particles[i];
            calcAcceleration(particle);
            particle.posVector = addVectors(particle.posVector,particle.velVector);
            particle.velVector = addVectors(particle.velVector,particle.accVector);
        }
        drawParticles();
        hue++;
    }
},1000/200);