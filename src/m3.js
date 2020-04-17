/**
 * Math.cos/tan/sin ... 是使用弧度制！！！
 */

module.exports.multipy = function(m1 , m2){
    let m = [[],[],[]];
    for(let i=0;i<3;i++){
        for(let j=0;j<3;j++){
            m[i][j] = 0;
            for(let k=0;k<3;k++){
                m[i][j] += m1[i][k]*m2[k][j]
            }
        }
    }
    return m;
}
module.exports.inverse = {};

module.exports.rotate = function(degree){
    let radian = Math.PI *degree/180;
    return [
        [Math.cos(radian) , -Math.sin(radian) , 0],
        [Math.sin(radian) ,  Math.cos(radian) , 0],
        [0                ,  0                , 1]
    ];
}
 
module.exports.inverse.rotate = function(degree){
    let radian = Math.PI *degree/180;
    return [
        [Math.cos(radian) , Math.sin(radian) , 0],
        [-Math.sin(radian) ,  Math.cos(radian) , 0],
        [0                ,  0                , 1]
    ];
}

module.exports.scale = function(sx,sy){
    if(sx instanceof String || typeof sx == 'string')sx = parseFloat(sx);
    if(sy instanceof String || typeof sy == 'string')sy = parseFloat(sy);
    let x = (sx=== undefined)?1:sx;
    let y = (sy=== undefined)?x:sy;
    return [
        [ x , 0 , 0],
        [ 0 , y , 0],
        [ 0 , 0 , 1]
    ];
}

module.exports.inverse.scale = function(sx,sy){
    if(sx instanceof String || typeof sx == 'string')sx = parseFloat(sx);
    if(sy instanceof String || typeof sy == 'string')sy = parseFloat(sy);
    let x = (sx=== undefined)?1:sx;
    let y = (sy=== undefined)?x:sy;
    return [
        [ 1/x , 0 , 0],
        [ 0 , 1/y , 0],
        [ 0 , 0 , 1]
    ];
}

module.exports.translate = function(tx , ty){
    if(tx instanceof String || typeof tx == 'string')tx = parseFloat(tx);
    if(ty instanceof String || typeof ty == 'string')ty = parseFloat(ty);
    let x = (tx === undefined)?0:tx;
    let y = (ty === undefined)?x:ty;

    return [
        [1 , 0 , x],
        [0 , 1 , y],
        [0 , 0 , 1]
    ];
}

module.exports.inverse.translate = function(tx , ty){
    if(tx instanceof String || typeof tx == 'string')tx = parseFloat(tx);
    if(ty instanceof String || typeof ty == 'string')ty = parseFloat(ty);
    let x = (tx === undefined)?0:tx;
    let y = (ty === undefined)?x:ty;

    return [
        [1 , 0 , -x],
        [0 , 1 , -y],
        [0 , 0 , 1]
    ];
}

module.exports.skewX =function(degree){
    let radian = Math.PI *degree/180;

    return [
        [1 , Math.tan(radian) , 0],
        [0 , 1 , 0],
        [0 , 0 , 1]
    ]
}

module.exports.inverse.skewX = function(degree){
    let radian = Math.PI *degree/180;

    return [
        [1 , -Math.tan(radian) , 0],
        [0 , 1 , 0],
        [0 , 0 , 1]
    ]
}

module.exports.skewY = function(degree){
    let radian = Math.PI *degree/180;

    return [
        [1 , 0 , 0],
        [Math.tan(radian) , 1 , 0],
        [0 , 0 , 1]
    ]
}

module.exports.inverse.skewY = function(degree){
    let radian = Math.PI *degree/180;

    return [
        [1 , 0 , 0],
        [-Math.tan(radian) , 1 , 0],
        [0 , 0 , 1]
    ]
}

module.exports.unit = function(){
    return [
        [1,0,0],
        [0,1,0],
        [0,0,1]
    ]
}

module.exports.vMulMat = function(vector , mat){
    let res = [];
    for(let i=0;i<3;i++){
        res[i] = 0;
        for(let j=0;j<3;j++){
            res[i] += vector[j] * mat[j][i]
        }
    }
    return res;
}

module.exports.mMulVec = function(mat , vector){
    let res = [];
    for(let i=0;i<3;i++){
        res[i] = 0;
        for(let j=0 ; j<3; j++){
            res[i] += mat[i][j]* vector[j];
        }
    }
    return res;
}

module.exports.normalize = function(vector){
    if( !(vector instanceof Array) || vector.length!=3)return null;
    let absx , absy;
    absx = Math.abs(vector[0]);
    absy = Math.abs(vector[1]);
    if(absx > absy){
        vector[0] /= absx;
        vector[1] /= absx;
    }else if(absy){
        vector[0] /= absy;
        vector[1] /= absy;
    }
}