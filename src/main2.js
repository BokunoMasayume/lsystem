import vert from "./shaders/vertex/first.vert";
import frag from "./shaders/fragment/first.frag";
// console.log(`'${vert}'`)
/**
 * create webgl shader
 * @param {} gl -webgl canvas context
 * @param {*} type -vertex shader or fragment shader
 * @param {string} source 
 */
function createShader(gl , type , source){
    let shader = gl.createShader(type);

    gl.shaderSource(shader , source);
    gl.compileShader(shader);

    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if(success){
        return shader;
    }
    console.log(type==gl.FRAGMENT_SHADER?"frag":"vert",gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
} 

/**
 * link fragment and vertex compiled shader
 * @param {*} gl -webgl canvas context
 * @param {*} vertexShader 
 * @param {*} fragmentShader 
 */
function createProgram(gl , vertexShader , fragmentShader){
    let program = gl.createProgram();

    gl.attachShader(program , vertexShader);
    gl.attachShader(program , fragmentShader);

    gl.linkProgram(program);

    let success = gl.getProgramParameter(program , gl.LINK_STATUS);
    if(success){
        return program;
    }
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

/**
 * canvas drawing buffer is canvas.width * canvas.height, css width and height just scale not change drawing buffer
 * @param {canvas dom} canvas 
 */
function resize(canvas){
    let ratio = window.devicePixelRatio ||1;

    let displaywidth = Math.floor(canvas.clientWidth * ratio);
    let displayheight = Math.floor(canvas.clientHeight * ratio);

    if(displayheight != canvas.height || displaywidth != canvas.width){
        canvas.height = displayheight;
        canvas.width = displaywidth;
    }
}

let canvas = document.getElementsByTagName('canvas')[0];
let gl = canvas.getContext('webgl2');
if(!gl){
    alert('no webgl 2 !')
}

let vertShader = createShader(gl , gl.VERTEX_SHADER , vert);
let fragShader = createShader(gl , gl.FRAGMENT_SHADER , frag);

let program = createProgram(gl ,vertShader , fragShader);

//find local of the attribute for the program we just created
//looking up attribute locations(and uniform locations is something should do during initialization, not in render loop)
let positionAttributeLocation = gl.getAttribLocation(program , "a_position");

let resolutionUniformLocation = gl.getUniformLocation(program , "u_resolution");
//attributes get their data from buffers so we need to create a buffer
let positionBuffer = gl.createBuffer();

//bind buffer to a bind point ,then all other functions can refer to the resource througth the bind point
gl.bindBuffer(gl.ARRAY_BUFFER , positionBuffer);

//three 2d points
let positions = [
    0,  0,
    100,  5,
    0, 200
];

//put data in position buffer by referencing it through the bind point: gl.ARRAY_BUFFER
//gl.STATIC_DRAW is a hint to webgl about how we'll use the data, it means the we are not likely to change this data much.
gl.bufferData(gl.ARRAY_BUFFER , new Float32Array(positions) , gl.STATIC_DRAW);

//now we've put data in the buffer ,we need to tell the attribute how to get data out of it.
//first we need to create a collection of attribute state called a Vertex Array Object
let vao = gl.createVertexArray();

//make the vao the current vertex array
gl.bindVertexArray(vao);

//turn on the attribute, let the attribute get data out of the  current buffer
gl.enableVertexAttribArray(positionAttributeLocation);

//specify how to pull data out , the message below will store in current vao setted before
let size = 2;           //2 components per iteration
let type = gl.FLOAT;    // the data is 32bit floats
let normalize = false;  //don't normalize the data
let stride = 0;         //0 = move forward size*sizeof(type) each iteration
let offset = 0;         //start at the begining of the buffer

gl.vertexAttribPointer(
    positionAttributeLocation, size , type, normalize , stride, offset
);

resize(gl.canvas);
//tell webgl -1~+1 clip space maps to 0~gl.canvas.width for x and 0~gl.canvas.height for y
gl.viewport(0, 0, gl.canvas.width , gl.canvas.height);

//clear the canvas

//set clear color value for clear func when clear color buffer
gl.clearColor(0,0,0,0);
//clear 's arg can only be one of gl.COLOR_BUFFER_BIT颜色缓冲区 gl.DEPTH_BUFFER_BIT深度缓冲区 gl.STENCIL_BUFFER_BIT模板缓冲区
gl.clear(gl.COLOR_BUFFER_BIT);

//tell webgll which shader program to execute
gl.useProgram(program);

gl.uniform2f(resolutionUniformLocation , gl.canvas.width , gl.canvas.height)
//bind the attribute/buffer set we want
gl.bindVertexArray(vao);

//tell webgl to execute the program
let primitiveType = gl.TRIANGLES;   //vertex shader every run 3 times draw a triangle
let doffset = 0;
let count = 3;      //execute vertex shader 3 times,depends on positions before
gl.drawArrays(primitiveType , doffset , count);

/**
 * clip space
 *       双y/\
 *          |    
 *          |
 * —————————|———————————>x
 *          0
 */

