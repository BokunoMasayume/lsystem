

const m3 = require('./m3');

const Lsys = require('./lsys');

const Vue = require('vue/dist/vue.common');



// F		向前走size步
// +/-		旋转angle度
// </>		对size增加/减少 size-growth 
// (/)		对angle增加/减少 angle-growth
// [/]		入/出栈 // 开始、结束一个路径




let canvas = document.getElementById('canvas');


let cs = window.getComputedStyle(canvas.parentElement);
canvas.width = cs.getPropertyValue('width').slice(0,-2);
canvas.height = cs.getPropertyValue('height').slice(0,-2);
console.log(canvas.width , canvas.height);
let ctx = canvas.getContext('webgl2');

// window.ls = new Lsys('---F',{
//     F:"F[+F]F[-F][F]"
//     // F:"F-F++F-F"
// } , ctx?ctx:canvas.getContext('2d'));

window.ls = new Lsys('S',{
    L:"S",
    S:"F>+[F-Y[S]]F)G",
    G:"FGF[+F]+Y",
    Y:"--[F-F--FY]-"
    // F:"F-F++F-F"
} , ctx?ctx:canvas.getContext('2d'));

ls.complieRule();
ls.generatePaths();
ls.render();

window.app = new Vue({
    el:"#controller",
    data:{
        options : ls.options,
        base: ls.base,

        starter :ls.starter,
        // rules: ls.rules,
        level:ls.level,
        primeRules:Object.entries(ls.rules).reduce((acc , [key,value])=>{
            return acc+key+":"+value+"\n";
        }, "")


    },
    methods:{
        rerender:function(){
            ls.init();
            ls.complieRule();
            ls.generatePaths();
            ls.render();

            this.primeRules = Object.entries(ls.rules).reduce((acc , [key,value])=>{
                return acc+key+":"+value+"\n";
            }, "");
        }
    },
    computed:{
        upperCaseStarter:{
            get:function(){
                return this.starter;
            },
            set:function(val){
                if(val.toUpperCase)this.starter = val.toUpperCase();
            }

        },
        rules:{
            get:function(){
                // return Object.entries(this.primeRules).reduce((acc , [key,value])=>{
                //     return acc+key+":"+value+"\n";
                // }, "");

                return this.primeRules;
            },
            set:function(val){
                // console.log("set" , this)
                let lines = val.split("\n");
                let rules  = {};

                for(let i=0 ; i< lines.length; i++){
                    let per = lines[i].split(":");
                    if(per.length!=2)continue;

                    per[0] = per[0].trim().toUpperCase()[0];
                    per[1] = per[1].trim().toUpperCase();

                    if(per[0] && per[1])rules[per[0]] = per[1];
                }

                // this.rules = rules;
                ls.rules = rules;
                // this.primeRules = Object.assign({} , rules);
                this.primeRules = val;

                // ls.init();
                // ls.complieRule();
                // ls.generatePaths();
                // ls.render();
            }
        }
    },
    watch:{
        "options.size":{
            deep:true,
            handler(val){
                ls.init();
                ls.options.size = val;

                // ls.generatePaths();
                // ls.render();
            }
        },
        "options.sizeGrowth":{
            deep:true,
            handler(val){
                ls.init();
                ls.options.sizeGrowth = val;

                // ls.generatePaths();
                // ls.render();
            }
        },
        "options.angle":{
            deep:true,
            handler(val){
                // ls.init();
                ls.options.angle = val;

                // ls.generatePaths();
                // ls.render();
            }
        },
        "options.angleGrowth":{
            deep:true,
            handler(val){
                // ls.init();
                ls.options.angleGrowth = val;

                // ls.generatePaths();
                // ls.render();
            }
        },



        base:{
            deep:true,
            handler(){
                // ls.render();
            }
        },

        starter:{
            handler(){
                ls.starter = this.starter;
                // ls.init();
                // ls.complieRule();
                // ls.generatePaths();
                // ls.render();
            }
        },
        level:{
            handler(){
                ls.level = this.level;
                // ls.init();

                // ls.complieRule();
                // ls.generatePaths();
                // ls.render();
            }
        }

    }
});

//绑个监听事件，鼠标按下时图像不停更新
let timer ;
function animate(){
    app.rerender();

    timer = requestAnimationFrame(animate);
}
canvas.addEventListener("mousedown" , animate);
canvas.addEventListener("mouseup" ,()=>{
    if(timer)cancelAnimationFrame(timer)
} );