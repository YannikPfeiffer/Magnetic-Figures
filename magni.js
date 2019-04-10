/**
 * The HTML Element of the Canvas
 * @type {HTMLCanvasElement}
 */
const particleLayerElem = document.getElementById("particleLayer");
const partCtx = particleLayerElem.getContext('2d');

const gridElem = document.getElementById("grid");
const gridCtx = gridElem.getContext('2d');

const objectElem = document.getElementById("objects");
const objectCtx = objectElem.getContext('2d');


let particles = [];
let particleSettings = {lineWidth:3,deployCount:1000};

let attractors = [];
let attractorSettings = {visible:true};

let cannons = [];
let cannonSettings = {positionSet:{x:0,y:0},visible:true,active:false,shotsPerSecond:1,particlesPerShot:1000,bullets:10000,spread:100,veloctiyDeviation:0}; //spread: 0-200%, velocityDeviation: 0-100%,

let gridSettings = {visible: false, iterations: 5};

let globalSettings = {motionActive:false, cannonMode:false, mirrored: false,tracePath:false};

//Variables that are used more frequently are not put in the globalSettings variable due to performance optimization
let G = 1; //Gravitational constant
let field = {x: 100, y: 100};
let hue = 0;

//Drawing properties
const strokeColor = `hsl(100, 100%, 50%, 0.01)`;
const defaultLineWidth = 1;
partCtx.strokeStyle = strokeColor;

partCtx.lineJoin = 'round';
partCtx.lineCap = 'round';
partCtx.lineWidth = "1px";

objectCtx.lineJoin = 'round';
objectCtx.lineCap = 'round';
objectCtx.lineWidth = "2px";

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

function setup() {

    field.x = window.innerWidth;
    field.y = window.innerHeight;

}

function newCannon(posVector, dirVector){ //dirVector in this sense is the point selected at which the cannon is directed at

    let velVec = subVectors(dirVector,posVector);
    velVec = factorVector(velVec,0.01);
    let fps = cannonSettings.shotsPerSecond; //Fire per second
    let bullets = cannonSettings.bullets; //after how many shots should the cannon stop
    let particlesFired = 0; //counter on how many bullets were already shot

    let deviationDegree = cannonSettings.spread*1.8; //degree on how much particles are able to offset from the cannons fire direction
    let cannonDegree = getAngle(velVec.x,velVec.y);
    cannonDegree = 360 - cannonDegree + 90;
    console.log(cannonDegree);
    let particlesPerShot = cannonSettings.particlesPerShot; //particles per shot
    let speedDeviation = cannonSettings.veloctiyDeviation;


    this.interval = setInterval(function(){
        if (globalSettings.motionActive && cannonSettings.active) {

            for (let i = 0; i<particlesPerShot;i++){
                let speedFactor = (100-Math.random()*speedDeviation)/100;
                let speed = calcDistance(velVec);
                speed = speed * speedFactor;

                let randomAdditiveDegree = deviationDegree/2-Math.random()*deviationDegree;

                let totalDegree = randomAdditiveDegree+cannonDegree; //works correct

                let dirVec = degToPoint(totalDegree,1);
                //console.log(totalDegree,dirVec);
                let velVector = factorVector(dirVec,speed);
                //console.log(velVector);
                newParticle(posVector,velVector);
                particlesFired++;
            }

            if (particlesFired>=bullets){
                console.log("cannon is done firing.");
                clearInterval(this.interval);
            }
        }
    },1000 / fps);
    let cannon = {cannonDegree:cannonDegree,particlesFired:particlesFired,speedDeviation:speedDeviation,deviationDegree:deviationDegree,velVector:velVec,interval:this.interval, posVector:posVector};
    drawCannon(cannon);
    cannons.push(cannon);
}

function drawCannon(cannon) {
    let x = cannon.posVector.x;
    let y = cannon.posVector.y;
    let velVector = cannon.velVector;

    objectCtx.strokeStyle = `rgba(255,255,255)`;
    objectCtx.beginPath();
    objectCtx.ellipse(x, y, 5, 5,0,0,360);
    objectCtx.stroke();
    objectCtx.beginPath();
    objectCtx.moveTo(x,y);
    objectCtx.lineTo(x+(velVector.x*100),y+(velVector.y*100));
    objectCtx.stroke();
    objectCtx.lineWidth = defaultLineWidth;
}

function newParticleGroup(x,y) {

    let posVec = {x:x,y:y};

    for (let i = 0; i < particleSettings.deployCount; i++) {
        let velocity = randomVelocity(1);
        newParticle(posVec,velocity);
    }
}

function newParticle(posVector ,velocityVector) {

    let velVector = velocityVector;
    let accVector = {x: 0, y: 0};
    let weight = 1;
    let size = particleSettings.lineWidth;
    let particle = {posVector: posVector, velVector: velVector, accVector: accVector, weight: weight, size:size};
    drawParticle(posVector.x,posVector.y,size);
    particles.push(particle);
    //console.log("new Particle",velVector);
}

function newAttractor(posVector) {

    let weight = 1;
    let attractor = {posVector: posVector, weight: weight};
    objectCtx.lineWidth = 5;
    objectCtx.strokeStyle = `rgba(255, 255, 255)`;

    console.log("draw attractor");
    objectCtx.lineWidth = defaultLineWidth;
    attractors.push(attractor);
    drawAttractor(attractor);
}

function showObjects() {
    attractors.forEach(function (attractor) {
       drawAttractor(attractor);
    });
    cannons.forEach(function (cannon) {
        drawCannon(cannon);
    });
}

function drawAttractor(attractor) {
    let x = attractor.posVector.x;
    let y = attractor.posVector.y;
    objectCtx.lineWidth = 5;
    objectCtx.strokeStyle = `rgb(255, 255,255)`;
    objectCtx.beginPath();
    objectCtx.moveTo(x, y);
    objectCtx.lineTo(x, y);
    objectCtx.stroke();
    objectCtx.lineWidth = defaultLineWidth;
}

function toggleAttractors() {
    if (attractorSettings.visible) {
        showObjects();
    } else {
        objectCtx.clearRect(0, 0, field.x, field.y);
    }
}

function calcAcceleration(element) {

    let accVec = {x: 0, y: 0};
    for (let i = 0; i < attractors.length; i++) {

        let attractor = attractors[i];

        let dist = distanceOfVectors(attractor.posVector, element.posVector);

        let strength = attractionForce(attractor.weight, element.weight, dist, G);

        let difVec = subVectors(attractor.posVector, element.posVector);

        if (false) { //calculates degree and its x,y coordinates in which one particle must travel to reach the attractor (possible solution to issue with particles
            let degree = calcDegree(difVec);

            let vector = degToPoint(degree,1);
            difVec = vector;
        }

        accVec = addVectors(accVec, factorVector(difVec, strength)); //difVec before
    }

    element.accVector = accVec;
    return element.accVector;
}

function attractionForce(m1, m2, d, G) {
    return (G * (m1 + m2)) / (d * d);
}

function drawParticle(x, y, size){
    partCtx.lineWidth = size || particleSettings.lineWidth;
    partCtx.beginPath();
    partCtx.moveTo(x, y);
    partCtx.lineTo(x, y);
    partCtx.stroke();
}

function drawParticles() {
    for (let i = 0; i < particles.length; i++) {

        let particle = particles[i];
        let x = particle.posVector.x;
        let y = particle.posVector.y;
        let size = particle.size;
        partCtx.strokeStyle = `hsl(${hue},100%,50%,0.1)`;

        drawParticle(x,y,size);

        if (globalSettings.mirrored) {
            drawParticle(field.x - x, y,size);
            drawParticle(x, field.y - y,size);
            drawParticle(field.x - x, field.y - y,size);
        }

    }
}

function reset() {
    particles = [];
    attractors = [];
    for (let i = 0; i<cannons.length; i++){
        clearInterval(cannons[i].interval);
    }
    cannons = [];

    globalSettings.cannonMode = false;
    cannonSettings.active = false;

    G = 0.5;
    let h = particleLayerElem.height;
    let w = particleLayerElem.width;
    partCtx.clearRect(0, 0, w, h);
    objectCtx.clearRect(0, 0, w, h);

    globalSettings.mirrored = false;
    globalSettings.motionActive = false;
}

function toggleGrid(visible){
    if (visible){
        drawGrid(gridSettings.iterations);
    } else {
        gridCtx.clearRect(0,0,field.x,field.y);
    }
}

function drawGrid(){

    let iterations = gridSettings.iterations;
    let hue = 0;
    let additiveHue = 360/iterations;

    gridCtx.lineWidth = iterations/2; //${(iterations*2)}
    let i = 0;
    function drawLineX(x1,x2,hue,i){
        gridCtx.strokeStyle = `hsl(${hue},100%,80%,0.5`;
        gridCtx.lineWidth = (iterations-i)/2;
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
        gridCtx.lineWidth = (iterations-i)/2;
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
    let middleX = field.x/2;
    let middleY = field.y/2;
    let init = Math.max(field.x,field.y)/2;
    drawLineX(middleX-init,middleX+init,hue,i);
    drawLineY(middleY-init,middleY+init,hue,i);
}

function snapToNearestInterception(posVector){

    let interval = Math.max(field.x,field.y);

    for (let i = 0; i<gridSettings.iterations;i++){
        interval = interval/2;
    }

    let x = posVector.x;
    let y = posVector.y;

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
//window.addEventListener('resize',updateCanvasSize,false);

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
        gridSettings.visible = !gridSettings.visible;
        toggleGrid(gridSettings.visible);
    }

    if (e.code === "BracketRight") {
        G = G + 0.1;
    }

    if (e.code === "Slash") {
        G = G - 0.1;
    }

    if (e.code === "KeyM") { //enables mirror divided by 4
        globalSettings.mirrored = !globalSettings.mirrored;
    } //activates mirrors

    if (e.code === "KeyR") { //R for RESET
        reset();
    }

    if (e.code === "Space") {
        globalSettings.motionActive = !globalSettings.motionActive;
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
        globalSettings.cannonMode = !globalSettings.cannonMode;
    }

    if (e.code === "KeyF") {
        cannonSettings.active = !cannonSettings.active;
    }

    if (e.code === "KeyH") {
        attractorSettings.visible = !attractorSettings.visible;
        toggleAttractors();
    }
});

particleLayerElem.addEventListener('mouseup', function(e){

    let posVector = {x:e.offsetX,y:e.offsetY};

    if (gridSettings.visible){
        posVector = snapToNearestInterception(posVector);
    }

    if (e.button === 0){
        if (globalSettings.cannonMode) {
            newCannon(cannonSettings.positionSet, posVector);
        }
    }
});

particleLayerElem.addEventListener('mousedown', function (e) {
    let posVector = {x:e.offsetX,y:e.offsetY};

    if (gridSettings.visible){
        posVector = snapToNearestInterception(posVector);
    }
    if (e.button === 0) {
        if (globalSettings.cannonMode){
            //console.log("New cannon");
            cannonSettings.positionSet = posVector;

        }else {

            newParticleGroup(posVector.x,posVector.y);
        }
    }
    if (e.button === 2) {
        newAttractor(posVector);
    }
    console.log(e.button);
});

setInterval(function () {
    if (globalSettings.motionActive) {
        if (!globalSettings.tracePath){
            partCtx.clearRect(0,0,field.x,field.y);
        }
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
