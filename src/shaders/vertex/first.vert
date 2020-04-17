#version 300 es

in vec4 a_position;
out vec4 v_color;
uniform vec2 u_resolution;

void main(){
    vec2 clipSpacePosition= ( (a_position.xy/ u_resolution)*2.0 -1.0) * vec2(1,-1);

    gl_Position = vec4(clipSpacePosition , 0,1);
    v_color = gl_Position ;

}