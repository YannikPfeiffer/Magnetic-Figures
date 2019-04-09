Math.clamp = function(value, min, max){
    if(value < min){
        return min;
    }else if(value > max){
        return max;
    }else{
        return value;
    }
}; //definition of a math function named clamp

function addVectors(vector1, vector2){
    let x = vector1.x +vector2.x;
    let y = vector1.y + vector2.y;
    return {x:x,y:y};
}

function subVectors(vector1,vector2){
    let x = vector1.x - vector2.x;
    let y = vector1.y - vector2.y;
    return {x:x,y:y};
}

function equalVector(vector1,vector2){
    return vector1.x === vector2.x && vector1.y === vector2.y;
}

function distanceOfVectors(vector1, vector2){
    return Math.sqrt(Math.pow(vector2.y-vector1.y,2)+Math.pow(vector2.x-vector1.x,2));
}

function factorVector(vector, factor, factorIsVector=false){
    let x;
    let y;
    if (factorIsVector){
        x = vector.x * factor.x;
        y = vector.y * factor.y;
    } else {
        x = vector.x * factor;
        y = vector.y * factor;
    }
    //console.log("vX,vY,factor, respX,respY: ",vector.x,vector.y,factor, x,y);
    return {x:x,y:y};
}

function calcDegree(startVector,destVector={x:0,y:0}){
    let difVec = subVectors(startVector,destVector);
    let radians = Math.atan(difVec.y / difVec.x);
    cons
    return radians * 360/Math.PI;
}

function calcDegree2DirectionVector(degree) {
    let x = Math.cos(degree);
    let y = Math.sin(degree);
    return {x: x, y: y};
}

function calcDistance(vector1,vector2={x:0,y:0}){
    return Math.sqrt(Math.pow(vector2.y-vector1.y,2)+Math.pow(vector2.x-vector1.x,2));
}