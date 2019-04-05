/**
 * The HTML Element of the Canvas
 * @type {HTMLCanvasElement}
 */
const canvasElem = document.getElementById("canvas");
/**
 * The Rendering Context
 * @type {CanvasRenderingContext2D | WebGLRenderingContext}
 */
const ctx = canvasElem.getContext('2d');

const gridElem = document.getElementById("grid");
const gridCtx = gridElem.getContext('2d');

/**
 * All registered Particles
 * @type {Array}
 */
let particles = [];
/**
 * All registered Attractors
 * @type {Array}
 */
let attractors = [];
/**
 * Is the motion activated?
 * @type {boolean}
 */
let motionActive = false;
/**
 * Should there be 10x more particles?
 * @type {boolean}
 */
let tonsOfParticles = false;
/**
 * The color of the particles
 * @type {boolean}
 */
let mirrored = false;
let gridVisible = false;
let hue = 0;

//Drawing properties
const strokeColor = `hsl(100, 100%, 80%, 0.01)`;
const mainLineWidth = 1;
ctx.strokeStyle = strokeColor;

ctx.lineJoin = 'round';
ctx.lineCap = 'round';
ctx.lineWidth = "2px";

let G = 0.5; //Gravitational constant
let field = {x: 100, y: 100};

function randomVelocity(max, randomAmplifier = false) {
    let degree = Math.random() * 360;
    let amplifier = 1;
    if (randomAmplifier) {
        amplifier = Math.random();
    }
    let x = Math.cos(degree) * max * amplifier;
    let y = Math.sin(degree) * max * amplifier;
    return {x: x, y: y};
}

function randomVector(maxNumber, secondMaxNumber = maxNumber, onlyPositiv = false) {
    let x;
    let y;
    if (!onlyPositiv) {
        x = Math.random() * maxNumber * 2 - maxNumber;
        y = Math.random() * secondMaxNumber * 2 - secondMaxNumber;
    } else {
        x = Math.random() * maxNumber;
        y = Math.random() * secondMaxNumber;
    }
    return {x: x, y: y}
}

function updateCanvasSize() { //takes window properties and sets canvas to its size

}

function setup() {

    field.x = window.innerWidth;
    field.y = window.innerHeight;

}

function newParticleGroup(x, y, count = 1000) {
    if (tonsOfParticles) {
        count = count * 10;
        console.log("ye", count);
    }
    for (let i = 0; i < count; i++) {
        newParticle(x, y);
    }
}

function newParticle(x, y) {
    let posVector = {x: x, y: y};
    let velVector = randomVelocity(1);
    let accVector = {x: 0, y: 0};
    let weight = 1;
    let particle = {posVector: posVector, velVector: velVector, accVector: accVector, weight: weight};
    drawPoint(x,y);
    particles.push(particle);
}

function newAttractor(x, y) {
    let posVector = {x: x, y: y};
    let weight = 1;
    let attractor = {posVector: posVector, weight: weight};
    ctx.lineWidth = 5;
    ctx.strokeStyle = `rgba(255,255,255)`;
    drawPoint(x,y);
    ctx.lineWidth = mainLineWidth;
    attractors.push(attractor);
}

function calcAcceleration(element) {

    let accVec = {x: 0, y: 0};
    for (let i = 0; i < attractors.length; i++) {

        let attractor = attractors[i];

        let dist = distanceOfVectors(attractor.posVector, element.posVector);

        let strength = attractionForce(attractor.weight, element.weight, dist, G);

        let difVec = subVectors(attractor.posVector, element.posVector);

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

function attractionForce(m1, m2, d, G) {
    return (G * (m1 + m2)) / (d * d);
}

function drawPoint(x,y){
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y);
    ctx.stroke();
}

function drawParticles() {
    for (let i = 0; i < particles.length; i++) {

        let particle = particles[i];
        let x = particle.posVector.x;
        let y = particle.posVector.y;
        ctx.strokeStyle = `hsl(${hue},100%,80%,0.1)`;

        drawPoint(x,y);

        if (mirrored) {
            drawPoint(field.x - x, y);
            drawPoint(x, field.y - y);
            drawPoint(field.x - x, field.y - y);
        }

    }
}

function reset() {
    particles = [];
    attractors = [];

    G = 0.5;
    let h = canvasElem.height;
    let w = canvasElem.width;
    ctx.clearRect(0, 0, w, h);

    tonsOfParticles = false;
    mirrored = false;
    motionActive = false;
}

function toggleGrid(visible){
    if (visible){
        drawGrid(6);
    } else {
        gridCtx.clearRect(0,0,field.x,field.y);
    }
}

function drawGrid(iterations){

    let hue = 0;
    let additiveHue = 360/iterations;

    gridCtx.lineWidth = iterations/2; //${(iterations*2)}
    let i = 0;
    function drawLineX(x1,x2,hue,i){
        gridCtx.strokeStyle = `hsl(${hue},100%,80%,0.5`;
        let lineWidth = (iterations-i)/2;
        gridCtx.lineWidth = lineWidth;
        if (i===iterations)return;
        let x = (x1+x2)/2;
        gridCtx.beginPath();
        gridCtx.moveTo(x,field.y);
        gridCtx.lineTo(x,0);
        gridCtx.stroke();
        i++;
        hue += additiveHue;
        drawLineX(x1,x,hue,i);
        drawLineX(x,x2,hue,i);
    }
    function drawLineY(y1,y2,hue,i){
        let lineWidth = (iterations-i)/2;
        gridCtx.lineWidth = lineWidth;
        gridCtx.strokeStyle = `hsl(${hue},100%,80%,0.5`;
        if (i===iterations)return;
        let y = (y1+y2)/2;
        let dif = y2-y1;

        gridCtx.beginPath();
        gridCtx.moveTo(field.x,y);
        gridCtx.lineTo(0,y);
        gridCtx.stroke();

        /*
        for (let k = 0; (y-k*dif) > 0;k++){
            let yeet = (y-k*dif);
            gridCtx.beginPath();
            gridCtx.moveTo(field.x,yeet);
            gridCtx.lineTo(0,yeet);
            gridCtx.stroke();
        }

        for (let k = 0; (k*dif+y) < field.y;k++){
            let yeet = (k*dif+y);
            gridCtx.beginPath();
            gridCtx.moveTo(field.x,yeet);
            gridCtx.lineTo(0,yeet);
            gridCtx.stroke();
        }
        */

        i++;
        hue += additiveHue;
        drawLineY(y1,y,hue,i);
        drawLineY(y,y2,hue,i);

    }
    let middleX = field.x/2;
    let middleY = field.y/2;
    let init = Math.max(field.x,field.y)/2;
    drawLineX(middleX-init,middleX+init,hue,i);
    drawLineY(middleY-init,middleY+init,hue,i);
}

function drawGridRelativeToScreen(iterations){  //not recommended

    let hue = 0;
    let additiveHue = 360/iterations;

    gridCtx.lineWidth = "5px";
    let i = 0;
    function drawLineX(x1,x2,hue,i){
        gridCtx.strokeStyle = `hsl(${hue},100%,80%,0.5`;
        if (i===iterations)return;
        let x = (x1+x2)/2;
        gridCtx.beginPath();
        gridCtx.moveTo(x,field.y);
        gridCtx.lineTo(x,0);
        gridCtx.stroke();
        i++;
        hue += additiveHue;
        drawLineX(x1,x,hue,i);
        drawLineX(x,x2,hue,i);
    }
    function drawLineY(y1,y2,hue,i){
        gridCtx.strokeStyle = `hsl(${hue},100%,80%,0.5`;
        if (i===iterations)return;
        let y = (y1+y2)/2;
        gridCtx.beginPath();
        gridCtx.moveTo(field.x,y);
        gridCtx.lineTo(0,y);
        gridCtx.stroke();
        i++;
        hue += additiveHue;
        drawLineY(y1,y,hue,i);
        drawLineY(y,y2,hue,i);

    }
    drawLineX(0,field.x,hue,i);
    drawLineY(0,field.y,hue,i);
}
//window.addEventListener('resize',updateCanvasSize,false);

//Event Listeners
document.addEventListener('keydown', function (e) {

    if (e.code === "ControlLeft") { //toggle for grid
        gridVisible = !gridVisible;
        toggleGrid(gridVisible);
    }
    if (e.code === "BracketRight") {
        G = G + 0.1;
    }

    if (e.code === "Backslash") {
        G = G - 0.1;
        if (G<=0){
            G=0.1;
            console.log("here");
        }
    }

    if (e.code === "KeyM") { //enables mirror divided by 4
        mirrored = !mirrored;
    } //activates mirrors

    if (e.code === "KeyP") {
        tonsOfParticles = !tonsOfParticles;
        console.log(tonsOfParticles);
    } //amplifies or decreases particle count by 10x

    if (e.code === "KeyR") { //R for RESET
        reset();
    }
    if (e.code === "Space") {
        motionActive = !motionActive;
        console.log("Spacebar");
    }
    if (e.code === "KeyJ") {
        newAttractor(field.x / 2, field.y / 2);
        newParticleGroup(field.x / 2 - 50, field.y / 2 - 50);
    }
    if (e.code === "KeyA") {
        newAttractor(field.x / 2, field.y / 2);
        newAttractor(field.x / 3, field.y / 2);
        newAttractor(field.x / 1.5, field.y / 2);
        newParticleGroup(field.x / 2, field.y / 4);
    } //creates a bell
    if (e.code === "KeyS") {
        newAttractor(field.x / 4, field.y / 2);
        newAttractor(field.x - field.x / 4, field.y / 2);
        newParticleGroup(field.x / 2, field.y / 2);
    }
    if (e.code === "KeyD") { //trippy
        newParticleGroup(field.x / 4, field.y / 2);
        newParticleGroup(field.x - field.x / 4, field.y / 2);
        newAttractor(field.x / 2, field.y / 2);
    }
    if (e.code === "KeyF") {
        newParticleGroup(field.x / 2.5, field.y / 1.66);
        newParticleGroup(field.x / 1.66, field.y / 1.66);
        newParticleGroup(field.x / 2, field.y / 3);
        newAttractor(field.x / 2, field.y / 2);
    }
    if (e.code === "KeyG") {
        newAttractor(field.x / 2, field.y / 2);
        newParticleGroup(field.x / 4, field.y / 2);
    }
    if (e.code === "KeyH") {
        newAttractor(field.x / 2, field.y / 3);
        newParticleGroup((field.x / 2) - 100, field.y * 2 / 3);
        newParticleGroup((field.x / 2) + 100, field.y * 2 / 3);
    }
});

canvasElem.addEventListener('mousedown', function (e) {
    let x = e.offsetX;
    let y = e.offsetY;
    if (e.button === 0) {
        newParticleGroup(x, y, 1000);
    }
    if (e.button === 2) {
        newAttractor(x, y);
    }
    console.log(e.button);
});

setInterval(function () {
    if (motionActive) {
        for (let i = 0; i < particles.length; i++) {
            let particle = particles[i];
            calcAcceleration(particle);
            particle.posVector = addVectors(particle.posVector, particle.velVector);
            particle.velVector = addVectors(particle.velVector, particle.accVector);
        }
        drawParticles();
        hue++;
    }
}, 1000 / 200);
