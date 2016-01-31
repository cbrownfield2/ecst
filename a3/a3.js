/* 
 * File: a3.js
 * @author: Cameron Brownfield
 * @lastModified: 9.21.2015
 */ 
function main() {
   // Vertex shader program
   var VSHADER_SOURCE =
   'attribute vec4 a_Position;\n' +
   'uniform mat4 u_xformMatrix;\n' +
   'uniform float u_PointSize;\n' +
   'void main() {\n' +
   '  gl_Position = u_xformMatrix * a_Position;\n' +
   '  gl_PointSize= u_PointSize;\n' +
   '}\n';

   // Fragment shader program
   var FSHADER_SOURCE =
   'precision mediump float;\n' +
   'uniform vec4 u_Color;\n' +
   'void main() {\n' +
   '  gl_FragColor = u_Color;\n' +
   '}\n';

   // ShaderVariables
   var shaderVars = {
      u_xformMatrix:0,     // location of uniform for matrix in shader
      a_Position:0,        // location of attribute for position in shader
      u_Color:0,            // location of uniform for color in shader,
      u_PointSize:0            // location of uniform for color in shader
   };

   document.onkeydown = handleKeyDown;
   document.onkeyup = handleKeyUp;
   //A shape object (starts as a shape in the animation).


   var verts = 361;
   var i = 1;
   var radius = .05;
   var ballVerts = new Array;
   var stepSize = ((2*Math.PI/360));
   for(var d = 0; d <= (2*Math.PI)-stepSize; d+=stepSize){
      ballVerts.push(Math.sin(d)*radius);
      ballVerts.push(Math.cos(d)*radius);
   }
   var shape = {
      vertices:   new Float32Array([
         -0.05,  -0.85,
         0.05, -0.85,
         -0.05, -0.90, 
         0.05, -0.90,
         ]),
      n: 4,
      modelMatrix: new Matrix4,
      buffer: 0,
      rad: 0.85,
      x: 0,
      y: -0.85,
      widthhalf: .05,
      cur: 3600,
      score: 0
   };

   var ball = {
      vertices: new Float32Array(ballVerts),
      n:360,
      modelMatrix: new Matrix4,
      buffer: 1,
      x: 0,
      y: 0,
      radhalf: .05,
      bix: 0,
      biy: 0
   }

   // get WebGL rendering context
   var canvas = document.getElementById('webgl');
   var gl = getWebGLContext(canvas);

   if (!gl) {
      console.log('Failed to get the rendering context for WebGL');
      return;
   }

   if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
      console.log('Failed to intialize shaders.');
      return;
   }
   shaderVars.u_xformMatrix = gl.getUniformLocation(gl.program, 'u_xformMatrix');
   if (!shaderVars.u_xformMatrix) {
      console.log('Failed to get the storage location of u_xformMatrix');
      return;
   }
   shaderVars.a_Position = gl.getAttribLocation(gl.program, 'a_Position');
   if (shaderVars.a_Position < 0) {
      console.log('Failed to get the storage location of a_Position');
      return -1;
   }
   shaderVars.u_Color = gl.getUniformLocation(gl.program, 'u_Color');
   if (shaderVars.u_Color < 0) {
      console.log('Failed to get the storage location of u_Color');
      return -1;
   }
   shaderVars.u_PointSize = gl.getUniformLocation(gl.program, 'u_PointSize');
   if (shaderVars.u_PointSize < 0) {
      console.log('Failed to get the storage location of u_PointSize');
      return -1;
   }
   // Color to clear background with
   gl.clearColor(1, 1, 1, 1);


   var n = initModels(gl, shaderVars, shape, ball);
   if (n < 0) {
      console.log('Failed to initialize models');
      return;
   }
// start animation loop
   var angle = 0;
   var speed = 0.0;
   var ballX = 0;
   var ballY = 0;
   var ballXInc = (0.5 - Math.random()) * .016;
   ball.bix = ballXInc;
   console.log(ballXInc);
   var ballYInc = (0.5 - Math.random()) * .016;
   ball.biy = ballYInc;
   console.log(ballYInc);
   var ballAng = 0;




   /**
    * tick - callback function to animate and redraw
    */
   var tick = function() {
      speed = handleKeys(speed, shape);
      animate(shape, angle, speed);
      ballX = getBallX(ball, ballX, ballXInc);
      ballY = getBallY(ball, ballY, ballYInc);
      animateBall(ball, ballX, ballY);
      render(gl, shaderVars, shape, ball);
      requestAnimationFrame(tick, canvas);
      checkCollision(ball, shape);
      document.getElementById("Score").innerHTML = ("%f", shape.score);
 //     console.log(shape.cur);
//      console.log("X %f",shape.x);
  //    console.log("Y %f",shape.y);
   };
   tick();
}

function getBallX(ball, ballX, ballIncX){
   var newx = ballX + ball.bix;
//   console.log("NewBallX: %f", newx);
   return newx;
}


function getBallY(ball, ballY, ballIncY){
   var newx = ballY + ball.biy;
//   console.log("NewBallY: %f", newx);
   return newx;
}

function checkCollision(ball, shape){
   var minx = (shape.rad * Math.sin((shape.cur * Math.PI)/180)) - shape.widthhalf;
   var miny = (-(shape.rad) * Math.cos((shape.cur * Math.PI)/180)) - shape.widthhalf;
   var maxx = (shape.rad * Math.sin((shape.cur * Math.PI)/180)) + shape.widthhalf;
   var maxy = (-(shape.rad) * Math.cos((shape.cur * Math.PI)/180)) + shape.widthhalf;
   //console.log("MinX: %f", minx);
   //console.log("MinY: %f", miny);
   //console.log("MaxX: %f", maxx);
   //console.log("MaxY: %f", maxy);
   if((ball.x*ball.x + ball.y*ball.y) > .75){ //ball is on circumference
      if((ball.x > minx && ball.x < maxx) && (ball.y > miny && ball.y < maxy)){ //and intersecting
         shape.score+=1;
         ball.bix = (-(ball.bix)*1.02) - ((0.5 - Math.random())*.008);
         ball.biy = (-(ball.biy)*1.02) - ((0.5 - Math.random())*.008);

      }
   }
}

var currentlyPressedKeys = {};

/**
 * handleKeyDown - adds key press to currently pressed keys
 * @param {Object} event - the key press event object
 */
function handleKeyDown(event) {
   currentlyPressedKeys[event.keyCode] = true;
}

/**
 * handleKeyUp - removes key press from currently pressed keys
 * @param {Object} event - the key release event object
 */
function handleKeyUp(event) {
   currentlyPressedKeys[event.keyCode] = false; }

/**
 * handleKeys - handles keys that are being pressed
 * @param {Number} speed - the translation to the users game unit
 */
function handleKeys(speed, shape) {
   if(currentlyPressedKeys[37]) {
      //console.log('LeftArrowPressed');
      shape.cur = (shape.cur - 2.0)%360;
      shape.x = shape.rad * Math.sin((shape.cur * Math.PI)/180);
      shape.y = -(shape.rad) * Math.cos((shape.cur * Math.PI)/180);
      return speed = speed - 2.0;
   } 
   if(currentlyPressedKeys[39]) {
      //console.log('RightArrowPressed');
      shape.cur = (shape.cur + 2.0)%360;
      shape.x = shape.rad * Math.sin((shape.cur * Math.PI)/180);
      shape.y = -(shape.rad) * Math.cos((shape.cur * Math.PI)/180);
      return speed = speed + 2.0;
   }
   return speed;
}
/**
 * animate - animates the shape object
 * @param {Object} shape - the shape object to be animated
 * @param {Number} angle - the angle of rotation
 * @param {Number} speed - the angle change 
 */
function animate(shape, angle, speed) {
   angle = angle + speed;
   shape.modelMatrix.setRotate(angle, 0, 0, 1);
}

/**
 * animateBall - animates the ball object
 * @param {Object} ball - the ball object to be animated
 * @param {Number} ballX - the ball's new x coordinate as float 
 * @param {Number} ballY - the ball's new y coordinate as float
 */
function animateBall(ball, ballX, ballY){
   ball.x = ballX;
   ball.y = ballY;
   //console.log("Ballx: %f",ball.x);
   //console.log("Bally: %f",ball.y);
   ball.modelMatrix.setTranslate(ballX,ballY, 0, 1);
}

/**
 * render - renders the scene using WebGL
 * @param {Object} gl - the WebGL rendering context
 * @param {Object} shaderVars - the locations of shader variables
 * @param {Object} shape - the shape to be rendered
 * @param {Object} ball - the ball to be rendered
 */
 function render(gl, shaderVars, shape, ball) {

   // clear the canvas
   gl.clear(gl.COLOR_BUFFER_BIT);

   // draw shape
   var color = [0,0,1,1];
   gl.uniform4f(shaderVars.u_Color, color[0], color[1], color[2], color[3]);
   gl.uniformMatrix4fv(
      shaderVars.u_xformMatrix, false, shape.modelMatrix.elements);
   gl.bindBuffer(gl.ARRAY_BUFFER, shape.buffer);
   var FSIZE = shape.vertices.BYTES_PER_ELEMENT;
   gl.vertexAttribPointer(
      shaderVars.a_Position, 2, gl.FLOAT, false, FSIZE*2, 0);
   gl.enableVertexAttribArray(shaderVars.a_Position);
   gl.drawArrays(gl.TRIANGLE_STRIP, 0, shape.n);
   gl.uniform4f(shaderVars.u_Color, .2,.2,.2,1);

   //draw ball
   color = [1,0,0,1];
   gl.uniform4f(shaderVars.u_Color, color[0], color[1], color[2], color[3]);
   gl.uniformMatrix4fv(
      shaderVars.u_xformMatrix, false, ball.modelMatrix.elements);
   gl.bindBuffer(gl.ARRAY_BUFFER, ball.buffer);
   FSIZE = ball.vertices.BYTES_PER_ELEMENT;
   gl.vertexAttribPointer(
      shaderVars.a_Position, 2, gl.FLOAT, false, FSIZE*2, 0);
   gl.enableVertexAttribArray(shaderVars.a_Position, .5, .5);
   gl.drawArrays(gl.TRIANGLE_FAN, 0, ball.n);
   gl.uniform4f(shaderVars.u_Color, .2,.2,.2,1);

}
/**
 * initModels - initializes WebGL buffers for the the shape & quad
 * @param {Object} gl - the WebGL rendering context
 * @param {Object} shaderVars - the locations of shader variables
 * @param {Object} shape - the shape to be rendered
 * @returns {Boolean}
 */
 function initModels(gl, shaderVars, shape, ball) {

   // set up the shape
   shape.buffer = gl.createBuffer();
   if (!shape.buffer) {
      console.log('Failed to create buffer object for shape');
      return false;
   }
   gl.bindBuffer(gl.ARRAY_BUFFER, shape.buffer);
   gl.bufferData(gl.ARRAY_BUFFER, shape.vertices, gl.STATIC_DRAW);
   gl.uniform1f(shaderVars.u_PointSize, 5.0);
   
// set up the shape
   ball.buffer = gl.createBuffer();
   if (!ball.buffer) {
      console.log('Failed to create buffer object for ball');
      return false;
   }
   gl.bindBuffer(gl.ARRAY_BUFFER, ball.buffer);
   gl.bufferData(gl.ARRAY_BUFFER, ball.vertices, gl.STATIC_DRAW);
   gl.uniform1f(shaderVars.u_PointSize, 5.0);
   
   return true;
}
