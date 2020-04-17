#version 300 es
precision mediump float;

out vec4 outColor;

in vec4 v_color;

void main(){
    outColor = (v_color + vec4(1,1,0,0))*0.5;
}