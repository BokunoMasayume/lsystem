module.exports.createShader = function createShader(gl , type , source){
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


module.exports.createProgram = function createProgram(gl , vertexShader , fragmentShader){
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

