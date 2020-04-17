// import vert from "./shaders/vertex/first.vert";
// import frag from "./shaders/fragment/first.frag";

const vert  = require('./shaders/vertex/first.vert').default;
const frag = require("./shaders/fragment/first.frag").default;

const m3 = require('./m3');
const {createProgram , createShader}  = require('./webglUtil')

//Lsys类: L系统核心类
class Lsys{
    //构造函数，
    //starter是L系统的初始状态串，字符串
    //rules 是L系统的产生式规则对象
    //ctx是绘制L系统图像的上下文
    constructor(starter , rules , ctx){
        //基准点
        this.base = {
            x:500,
            y:500
        }

        this.starter = starter;
        this.rules = rules;

        this.ctx = ctx;

        this.level = 15;

        //角度，步进的一级和二级设置
        this.options = {
            angle:1,
            angleGrowth:0.01,

            size:2,
            sizeGrowth:0.01
        };

        this.initOptions= Object.assign({} , this.options)

        //当前点
        this.currentPoint = {
            x:0,
            y:0
        }
        //当前角度，点的面向方向
        this.currentAngle = 0;

        //二维数组，绘制路径们
        this.paths = [];

        //for [ and ] ， 栈
        this.stack = [];

        //本系统提供的常量指令
        //F		    向前走size步
        //+/-		旋转angle度
        //>/<		对size增加/减少 size-growth 
        //)/(		对angle增加/减少 angle-growth
        //[/]		入/出栈
        this.directives = {
            '+': ()=>{
                // console.log(this);
                this.currentAngle += this.options.angle;
             },
             '-':()=>{
                 this.currentAngle -= this.options.angle;
             },
             '(':()=>{
                 this.options.angle -= this.options.angleGrowth;
             },
             ')':()=>{
                 this.options.angle += this.options.angleGrowth;
             },
             '<':()=>{
                 this.options.size -= this.options.sizeGrowth;
             },
             '>':()=>{
                 this.options.size += this.options.sizeGrowth;
             },
             '[':()=>{
                 this.stack.push({
                     x:this.currentPoint.x,
                     y:this.currentPoint.y,
                     angle: this.currentAngle
                 });
             },
             ']':()=>{
                 //新路径
                 this.paths.push([]);

                 

                 let p= this.stack.pop();
                 this.currentAngle = p.angle;
                 this.currentPoint = {
                     x:p.x,
                     y:p.y
                 }

                 let currentPathIdx = this.paths.length-1;
                 this.paths[currentPathIdx].push({
                     x: this.currentPoint.x,
                     y:this.currentPoint.y
                 });

                 return p;
             },
             'F':()=>{
                 let dis = [this.options.size ,0,0];

                 //旋转变化，相对位置和变化矩阵相乘得到视图空间的相对位置
                 dis = m3.mMulVec( m3.rotate(this.currentAngle) , dis);

                 this.currentPoint.x += dis[0];
                 this.currentPoint.y += dis[1];

                 if(! this.paths.length)this.paths.push([]);
                 let currentPathIdx = this.paths.length-1;
                 this.paths[currentPathIdx].push({
                     x: this.currentPoint.x,
                     y:this.currentPoint.y
                 });

                 return dis;
             }
        }


    }

    //初始化，清空变化
    init(){
        // this.options = Object.assign(this.options , this.initOptions);
        this.currentPoint.x = 0;
        this.currentPoint.y = 0;
        this.currentAngle = 0;

    }

    //迭代的使用规则更新，得到图像生成命令序列
    //levels是迭代的次数
    complieRule(levels){
        let level = levels || this.level;

        if(this.starter instanceof String || typeof this.starter == 'string'){
            this.sequence = this.starter.split("");
        }
        else if(this.starter instanceof Array){
            this.sequence = this.starter.slice();
        }
        else {
            console.warn("starter must be string or array");
            return null;
        }

        for(let i = 0 ;i<level ;i++){
            for(let idx = 0;idx< this.sequence.length ; idx++){
                let ruleName = this.sequence[idx];
                if(this.rules[ruleName]){
                    //truly have this rule
                    this.sequence.splice(idx , 1 , ...this.rules[ruleName]);
                    idx += this.rules[ruleName].length;
                }
            }
        }
        return this.sequence;
    }

    //从图像生成命令序列生成路径点
    generatePaths(){
        this.paths = [];
        for(let i = 0 ; i< this.sequence.length ;i++){
            let char = this.sequence[i];
            if(this.directives[char]){
                //have this directive
                this.directives[char]();
            }
        }
    }

    //渲染路径，根据上下文的不同，会使用webgl2或canvas 2d进行渲染
    render(_ctx){
        let ctx = _ctx || this.ctx;
        if(ctx instanceof WebGL2RenderingContext){
            this.renderWebGl(ctx);
        } 
        if(ctx instanceof CanvasRenderingContext2D){
            this.render2d(ctx);
        }
    }

    //webgl2 渲染方法
    renderWebGl(gl){
        if(!(gl instanceof WebGL2RenderingContext))return;

        let vertShader = createShader(gl , gl.VERTEX_SHADER , vert);
        let fragShader = createShader(gl , gl.FRAGMENT_SHADER , frag);

        let program = createProgram(gl ,vertShader , fragShader);

        // resize(gl.canvas);
        //tell webgl -1~+1 clip space maps to 0~gl.canvas.width for x and 0~gl.canvas.height for y
        gl.viewport(0, 0, gl.canvas.width , gl.canvas.height);

        //clear the canvas

        //set clear color value for clear func when clear color buffer
        gl.clearColor(0,0,0,0);
        //clear 's arg can only be one of gl.COLOR_BUFFER_BIT颜色缓冲区 gl.DEPTH_BUFFER_BIT深度缓冲区 gl.STENCIL_BUFFER_BIT模板缓冲区
        gl.clear(gl.COLOR_BUFFER_BIT);


        //find local of the attribute for the program we just created
        //looking up attribute locations(and uniform locations is something should do during initialization, not in render loop)
        let positionAttributeLocation = gl.getAttribLocation(program , "a_position");

        let resolutionUniformLocation = gl.getUniformLocation(program , "u_resolution");
        //attributes get their data from buffers so we need to create a buffer
        let positionBuffer = gl.createBuffer();

        //bind buffer to a bind point ,then all other functions can refer to the resource througth the bind point
        gl.bindBuffer(gl.ARRAY_BUFFER , positionBuffer);

       

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

        

        //tell webgll which shader program to execute
        gl.useProgram(program);

        gl.uniform2f(resolutionUniformLocation , gl.canvas.width , gl.canvas.height)
        //bind the attribute/buffer set we want
        gl.bindVertexArray(vao);



        for(let i=0 ;i<this.paths.length;i++){
            let path = this.paths[i];
            positions = [];
            path.forEach(e=>{
                positions.push(e.x + this.base.x);
                positions.push(e.y + this.base.y);
            })
            

            

            //put data in position buffer by referencing it through the bind point: gl.ARRAY_BUFFER
            //gl.STATIC_DRAW is a hint to webgl about how we'll use the data, it means the we are not likely to change this data much.
            gl.bufferData(gl.ARRAY_BUFFER , new Float32Array(positions) , gl.STATIC_DRAW);

            //tell webgl to execute the program
            primitiveType = gl.LINE_STRIP;   //vertex shader every run 3 times draw a triangle
            doffset = 0;
            count = path.length;      //execute vertex shader 3 times,depends on positions before
            gl.drawArrays(primitiveType , doffset , count);
        }

    }

    //canvas 2d 渲染方法
    render2d(_ctx){
        let ctx = _ctx || this.ctx;
        if(!ctx) {
            console.warn("fail to render ,did not get canvas context");
            return ;
        }

        //清空画布
        ctx.clearRect(0 ,0, ctx.canvas.width , ctx.canvas.height)
        ctx.beginPath();

        for(let pathIdx = 0 ; pathIdx < this.paths.length ; pathIdx ++){
            let path = this.paths[pathIdx];
            for(let idx = 0; idx < path.length ;idx++){
                if(idx ==0){
                    ctx.moveTo(path[idx].x + this.base.x, path[idx].y + this.base.y);
                }else{
                    ctx.lineTo(path[idx].x + this.base.x, path[idx].y + this.base.y);
                }
            }
        }

        ctx.stroke();
    }

}

//导出lsys类
module.exports = Lsys;

// export default Lsys;