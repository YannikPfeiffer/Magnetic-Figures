/**
 * The HTML Element of the Canvas
 * @type {HTMLCanvasElement}
 */
const particleLayerElem = document.getElementById("particleLayer");
/**
 * The Rendering Context
 * @type {CanvasRenderingContext2D | WebGLRenderingContext}
 */
const partCtx = particleLayerElem.getContext('2d');

const gridElem = document.getElementById("grid");

const gridCtx = gridElem.getContext('2d');

const attractorElem = document.getElementById("attractors");
const attractorCtx = attractorElem.getContext('2d');

const cannonElem = document.getElementById("cannons");
const cannonCtx = cannonElem.getContext('2d');
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

let cannons = [];
/**
 * Should there be 10x more particles?
 * @type {boolean}
 */
let tonsOfParticles = false;
/**
 * The color of the particles
 * @type {boolean}
 */
let cannonMode = false;
let cannonsActive = false;
let mirrored = false;
let hue = 0;

//Drawing properties
const defaultLineWidth = 1;
let particleLineWidth = 2;
let attractorLineWidth = 5;
let gridIterations = 6;

partCtx.lineJoin = 'round';
partCtx.lineCap = 'round';
partCtx.lineWidth = "1px";

attractorCtx.lineJoin = 'round';
attractorCtx.lineCap = 'round';
attractorCtx.lineWidth = attractorLineWidth;

const contextList = {
    attractor:{
        name:"attractor",
        visible:true,
        elements:attractors,
        htmlDOM:attractorElem, //trying to put context and domElem as attribute in elements of contextList
        ctx:attractorCtx
    },
    particle:{
        name:"particle",
        visible: true,
        elements:particles,
        htmlDOM:particleLayerElem,
        ctx:partCtx},
    grid:{
        name:"grid",
        visible:false,
        htmlDOM:gridElem,
        ctx:gridCtx,
        iterations: gridIterations},
    cannon:{
        name:"cannon",
        visible:true,
        htmlDOM:cannonElem,
        ctx:cannonCtx,
        elements:cannons}
};

let G = 1; //Gravitational constant
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

function setup() {

    field.x = window.innerWidth;
    field.y = window.innerHeight;

}

function newCannon(x, y, velVector, fireRate, particleCount=10000, deviationDegree=0){
    console.log("Cannon was created!");

    let particlesFired = 0;
    let posVector = {x:x,y:y};
    let velVec = velVector;
    this.interval = setInterval(function(){
        if (motionActive && cannonsActive) {

            let randomAmp = Math.random()*deviationDegree+(1-deviationDegree);

            velVec = factorVector(velVector,randomAmp);

            newParticle(x, y, velVector);
            particlesFired++;

            if (particleCount<particlesFired){
                console.log("cannon is done firing.");
                clearInterval(this.interval);
            }
        }
    },fireRate);
    let cannon = {particlesFired:particlesFired,posVector:posVector,velVector:velVec,interval:this.interval};
    contextList.cannon.elements.push(cannon);
    drawElement(cannon, "cannon");

}

function newParticleGroup(x, y, count = 1000) {
    if (tonsOfParticles) {
        count = count * 10;
        console.log("ye", count);
    }
    for (let i = 0; i < count; i++) {
        let velocity = randomVelocity(1);
        newParticle(x, y,velocity);
    }
}

function newParticle(x, y,velocityVector) {
    let posVector = {x: x, y: y};
    let velVector = velocityVector;
    let accVector = {x: 0, y: 0};
    let weight = 1;
    let size = particleLineWidth;
    let particle = {posVector: posVector, velVector: velVector, accVector: accVector, weight: weight, size:size};
    drawElement(particle,"particle");
    contextList.particle.elements.push(particle);
    //console.log("new Particle",velVector);
}

function newAttractor(x, y) {
    let posVector = {x: x, y: y};
    let weight = 1;
    let attractor = {posVector: posVector, weight: weight};
    contextList.attractor.ctx.lineWidth = attractorLineWidth;
    contextList.attractor.ctx.strokeStyle = `rgba(255, 255, 255)`;
    drawElement(attractor, "attractor");
    console.log("draw attractor");
    contextList.attractor.elements.push(attractor);
}

function showElements(contextElement) {
    contextElement.elements.forEach(function (element) {
       contextElement.ctx.lineWidth = attractorLineWidth;
       contextElement.ctx.strokeStyle = `rgb(255, 255,255)`;
       drawElement(element,contextElement.name);
    })
}

function drawElement(element,elementname) {

    console.log(element);
    console.log(elementname);
    let x = element.posVector.x;
    let y = element.posVector.y;

    if (elementname === "attractor"){
        contextList.attractor.ctx.beginPath();
        contextList.attractor.ctx.moveTo(x, y);
        contextList.attractor.ctx.lineTo(x, y);
        contextList.attractor.ctx.stroke();
        return;
    }
    if (elementname === "cannon"){
        console.log(element);
        console.log(element.velVector);
        let velX = element.velVector.x;
        let velY = element.velVector.y;

        contextList.cannon.ctx.lineWidth = 1;
        contextList.cannon.ctx.strokeStyle = `rgba(255,255,255)`;
        contextList.cannon.ctx.beginPath();
        contextList.cannon.ctx.ellipse(x, y, 5, 5,0,0,360);
        contextList.cannon.ctx.stroke();
        contextList.cannon.ctx.beginPath();
        contextList.cannon.ctx.moveTo(x,y);
        contextList.cannon.ctx.lineTo(x+(velX*5),y+(velY*5));
        contextList.cannon.ctx.stroke();
    }
    if (elementname === "particle"){ //requires x,y and size
        // x and y are given.
        contextList.particle.ctx.strokeStyle = `hsl(${hue},100%,50%,0.1)`;
        contextList.particle.ctx.lineWidth = element.size || particleLineWidth;
        contextList.particle.ctx.beginPath();
        contextList.particle.ctx.moveTo(x, y);
        contextList.particle.ctx.lineTo(x, y);
        contextList.particle.ctx.stroke();

    }
}

function toggleFieldVisibility(contextElement) {
    console.log(contextElement);
    contextElement.visible = !contextElement.visible;

    if (contextElement.visible) {
        if (contextElement.name === "grid") {
            drawGrid(contextElement.iterations);
        } else {
            showElements(contextElement);
        }
    } else {
        contextElement.ctx.clearRect(0, 0, field.x, field.y);
    }
}

function calcAcceleration(element) {

    let accVec = {x: 0, y: 0};
    let attractors = contextList.attractor.elements;
    for (let i = 0; i < attractors.length; i++) {

        let attractor = attractors[i];

        let dist = distanceOfVectors(attractor.posVector, element.posVector);

        let strength = attractionForce(attractor.weight, element.weight, dist, G);

        let difVec = subVectors(attractor.posVector, element.posVector);

        if (false) { //calculates degree and its x,y coordinates in which one particle must travel to reach the attractor (possible solution to issue with particles
            let degree = Math.atan(difVec.y / difVec.x);
            //degree

            let x = Math.cos(degree);
            let y = Math.sin(degree);
            let vector = {x: x, y: y};
            difVec = vector;
            console.log(difVec);
        }
        accVec = addVectors(accVec, factorVector(difVec, strength)); //difVec before
    }

    element.accVector = accVec;
    return element.accVector;
}

function attractionForce(m1, m2, d, G) {
    return (G * (m1 + m2)) / (d * d);
}



function drawPoint(x,y,size){


}

function drawParticles() {
    let particles = contextList.particle.elements;
    for (let i = 0; i < particles.length; i++) {
        let particle = particles[i];

        drawElement(particle,"particle");

        if (mirrored) {

            drawPoint(field.x - x, y,size);
            drawPoint(x, field.y - y,size);
            drawPoint(field.x - x, field.y - y,size);
        }

    }
}

function reset() {
    contextList.attractor.elements = [];
    contextList.particle.elements = [];

    for (let i = 0; i<contextList.cannon.elements.length; i++){
        clearInterval(contextList.cannon.elements[i].interval);
    }
    contextList.cannon.elements = [];

    cannonMode = false;
    cannonsActive = false;

    G = 0.5;
    let h = particleLayerElem.height;
    let w = particleLayerElem.width;

    contextList.particle.ctx.clearRect(0, 0, w, h);
    contextList.attractor.ctx.clearRect(0, 0, w, h);

    tonsOfParticles = false;
    mirrored = false;
    motionActive = false;
}

function drawGrid(iterations){

    let hue = 0;
    let additiveHue = 360/iterations;

    contextList.grid.ctx.lineWidth = iterations/2; //${(iterations*2)}
    let i = 0;
    function drawLineX(x1,x2,hue,i){
        contextList.grid.ctx.strokeStyle = `hsl(${hue},100%,80%,0.5`;

        contextList.grid.ctx.lineWidth = (iterations-i)/2;
        if (i===iterations)return;
        let x = (x1+x2)/2;
        contextList.grid.ctx.beginPath();
        contextList.grid.ctx.moveTo(x,field.y);
        contextList.grid.ctx.lineTo(x,0);
        contextList.grid.ctx.stroke();
        i++;
        hue += additiveHue;
        drawLineX(x1,x,hue,i);
        drawLineX(x,x2,hue,i);
    }
    function drawLineY(y1,y2,hue,i){

        contextList.grid.ctx.lineWidth = (iterations-i)/2;
        contextList.grid.ctx.strokeStyle = `hsl(${hue},100%,80%,0.5`;
        if (i===iterations)return;
        let y = (y1+y2)/2;

        contextList.grid.ctx.beginPath();
        contextList.grid.ctx.moveTo(field.x,y);
        contextList.grid.ctx.lineTo(0,y);
        contextList.grid.ctx.stroke();

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

function snapToNearestInterception(x,y){

    let interval = Math.max(field.x,field.y);

    for (let i = 0; i<contextList.grid.iterations;i++){
        interval = interval/2;
    }


    let yOffset = (field.y/2)%interval;
    let deltaX = x%interval;
    let deltaY = y%(interval); //-yOffset/(field.y/interval)

    console.log("yOffset: "+yOffset);
    console.log("interval: "+interval,"fieldX: "+field.x,"fieldY: "+field.y);
    console.log("deltaX",deltaX,"deltaY",deltaY);

    if (deltaX<interval/2){
        x = x-deltaX;
    } else {
        x = x+(interval-deltaX);
    }
    if (deltaY-yOffset<interval/2){
        y = y-deltaY+yOffset; //-yOffset
    } else {
        y = y+(interval-deltaY)+yOffset; //-yOffset
    }
    return {x:x,y:y}
}

//Event Listeners
document.addEventListener('keydown', function (e) {

    if (e.code === "KeyS"){ //save image

        let x = window.innerWidth;
        let y = window.innerHeight;
        console.log(x,y);
        let printCanvasElem = document.createElement("canvas");
        printCanvasElem.width = x;
        printCanvasElem.height = y;
        let printContext = printCanvasElem.getContext('2d');
        printContext.strokeStyle = particleLayerElem.style.background;
        printContext.fillRect(0,0,x,y);
        printContext.drawImage(particleLayerElem,0,0);

        /*
        Canvas2Image.saveAsPNG(printContext.canvas,x,y);
        console.log("saving image");
        */ //canvas2image alternative, but doesn't fix the image/octet-stream issue

        let quality = 1;
        let image = printCanvasElem.toDataURL("image/png",quality).replace("image/png", "image/octet-stream"); // here is the most important part because if you dont replace you will get a DOM 18 exception.
        let element = document.createElement('a');
        element.download = image.slice(100, 110) + ".png";
        element.href = image;
        document.body.appendChild(element);
        element.click();
        element.remove();
    }

    if (e.code === "ControlLeft") { //toggle for grid
        toggleFieldVisibility(contextList.grid);
    }

    if (e.code === "BracketRight") {
        G = G + 0.1;
    }

    if (e.code === "Slash") {
        G = G - 0.1;
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

    if (e.code === "Digit1") {
        newAttractor(field.x / 2, field.y / 2);
        newAttractor(field.x / 3, field.y / 2);
        newAttractor(field.x / 1.5, field.y / 2);
        newParticleGroup(field.x / 2, field.y / 4);
    } //creates a bell
    if (e.code === "Digit2") {
        newAttractor(field.x / 4, field.y / 2);
        newAttractor(field.x - field.x / 4, field.y / 2);
        newParticleGroup(field.x / 2, field.y / 2);
    }
    if (e.code === "Digit3") { //trippy
        newParticleGroup(field.x / 4, field.y / 2);
        newParticleGroup(field.x - field.x / 4, field.y / 2);
        newAttractor(field.x / 2, field.y / 2);
    }
    if (e.code === "Digit4") {
        newParticleGroup(field.x / 2.5, field.y / 1.66);
        newParticleGroup(field.x / 1.66, field.y / 1.66);
        newParticleGroup(field.x / 2, field.y / 3);
        newAttractor(field.x / 2, field.y / 2);
    }
    if (e.code === "Digit5") {
        newAttractor(field.x / 2, field.y / 2);
        newParticleGroup(field.x / 4, field.y / 2);
    }
    if (e.code === "Digit6") {
        newAttractor(field.x / 2, field.y / 3);
        newParticleGroup((field.x / 2) - 100, field.y * 2 / 3);
        newParticleGroup((field.x / 2) + 100, field.y * 2 / 3);
    }
    if (e.code === "Digit7") {
        newAttractor(field.x / 2, field.y / 2);
        newParticleGroup(field.x / 2 - 50, field.y / 2 - 50);
    }

    if (e.code === "KeyC") { //toggle cannon mode
        cannonMode = !cannonMode;
    }

    if (e.code === "KeyF") {
        cannonsActive = ! cannonsActive;
    }

    if (e.code === "KeyH") {
        toggleFieldVisibility(contextList.attractor);
        toggleFieldVisibility(contextList.cannon);
        console.log(contextList.attractor.htmlDOM);
    }
});

particleLayerElem.addEventListener('mousedown', function (e) {
    let x = e.offsetX;
    let y = e.offsetY;
    if (contextList.grid.visible){
        let vector = snapToNearestInterception(x,y);
        x = vector.x;
        y = vector.y;
    }
    if (e.button === 0) {
        if (cannonMode){
            //console.log("New cannon");
            let velVector = randomVelocity(1);
            newCannon(x,y,velVector,0,10000,0.1);
        }else {
            newParticleGroup(x, y, 1000);
        }
    }
    if (e.button === 2) {
        newAttractor(x, y);
    }
    console.log(e.button);
});

setInterval(function () {
    if (motionActive) {
        let particles = contextList.particle.elements;
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
