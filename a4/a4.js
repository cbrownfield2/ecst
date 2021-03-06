/* 
 * File: a4.js
 * @author: Cameron Brownfield
 * @lastModified: 10.20.2015
 */ 
function main() {
   // Vertex shader program
   var VSHADER_SOURCE =
   'attribute vec4 a_Position;\n' +
   'uniform mat4 u_xformMatrix;\n' +
   'uniform float u_PointSize;\n' +
   'attribute vec2 a_TexCoord;\n' +
   'varying vec2 v_TexCoord;\n' +
   'void main() {\n' +
   '  gl_Position = u_xformMatrix * a_Position;\n' +
   '  gl_PointSize= u_PointSize;\n' +
   '  v_TexCoord = a_TexCoord;\n' +
   '}\n';

   // Fragment shader program
   var FSHADER_SOURCE =
   'precision mediump float;\n' +
   'uniform vec4 u_Color;\n' +
   'uniform sampler2D u_Sampler;\n' +
   'varying vec2 v_TexCoord;\n' +
   'void main() {\n' +
  '  gl_FragColor  = texture2D(u_Sampler, v_TexCoord);\n' +
   '}\n';

   // ShaderVariables
   var shaderVars = {
      u_xformMatrix:0,     // location of uniform for matrix in shader
      a_Position:0,        // location of attribute for position in shader
      u_Color:0,            // location of uniform for color in shader,
      u_PointSize:0            // location of uniform for color in shader
   };

   //Sets function handler's for the key presses.
   document.onkeydown = handleKeyDown;
   document.onkeyup = handleKeyUp;


   //Generates 360 vertices around a circumference to create ball object.
   var verts = 361;
   var i = 1;
   var radius = .05;
   var ballVerts = new Array;
   var stepSize = ((2*Math.PI/360));
   for(var d = 0; d <= (2*Math.PI)-stepSize; d+=stepSize){
      ballVerts.push(Math.sin(d)*radius);
      ballVerts.push(Math.cos(d)*radius);
   }
   
   //Defines shape object used for the player's object.
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

   //Defines the ball game piece.
   var ball = {
      vertices: new Float32Array([
         -0.025, 0.025,
         0.025, 0.025,
         -0.025, -0.025,
         0.025, -0.025]),
      n:4,
      modelMatrix: new Matrix4,
      buffer: 1,
      x: 0,
      y: 0,
      radhalf: .05,
      bix: 0,
      biy: 0
   }

      var bg = {
        vertices: new Float32Array([
         -1,1,
         1,1,
         -1,-1,
         1, -1 ]),
        n: 4,
        modelMatrix: new Matrix4,
        buffer: 2
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
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Set texture
  if (!initTextures(gl, n)) {
    console.log('Failed to intialize the texture.');
    return;
  }

   n = initModels(gl, shaderVars, shape, ball, bg);
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
      render(gl, shaderVars, shape, ball, bg);
      requestAnimationFrame(tick, canvas);
      checkCollision(ball, shape);
      document.getElementById("Score").innerHTML = ("%f", shape.score);
   };
   tick();
}

/**
 * getBallX - gets ball objects next x position based on trajectory ballIncX
 * @param ball - the ball object
 * @param ballX - the balls current x position
 * @param ballIncX - the balls x trajectory 
 * @return newx - the balls new x position.
 */
function getBallX(ball, ballX, ballIncX){
   var newx = ballX + ball.bix;
   return newx;
}


/**
 * getBallY - gets ball objects next y position based on trajectory ballIncX
 * @param ball - the ball object
 * @param ballY - the balls current y position
 * @param ballIncY - the balls y trajectory 
 * @return newy - the balls new y position.
 */
function getBallY(ball, ballY, ballIncY){
   var newy = ballY + ball.biy;
   return newy;
}


/**
 * checkCollision - rudimentary collision detection for the ball and the user game piece
 * @param ball - the ball object
 * @param shape - the shape object (user game piece)
 */
function checkCollision(ball, shape){
   var minx = (shape.rad * Math.sin((shape.cur * Math.PI)/180)) - shape.widthhalf;
   var miny = (-(shape.rad) * Math.cos((shape.cur * Math.PI)/180)) - shape.widthhalf;
   var maxx = (shape.rad * Math.sin((shape.cur * Math.PI)/180)) + shape.widthhalf;
   var maxy = (-(shape.rad) * Math.cos((shape.cur * Math.PI)/180)) + shape.widthhalf;
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
 function render(gl, shaderVars, shape, ball, bg) {

   // clear the canvas
   gl.clear(gl.COLOR_BUFFER_BIT);

   // draw shape
   var color = [0,0,1,1];
   gl.uniform4f(shaderVars.u_Color, color[0], color[1], color[2], color[3]);
   gl.uniformMatrix4fv(
      shaderVars.u_xformMatrix, false, bg.modelMatrix.elements);
   gl.bindBuffer(gl.ARRAY_BUFFER, bg.buffer);
   var FSIZE = bg.vertices.BYTES_PER_ELEMENT;
   gl.vertexAttribPointer(
      shaderVars.a_Position, 2, gl.FLOAT, false, FSIZE*2, 0);
   gl.enableVertexAttribArray(shaderVars.a_Position);
   gl.uniform1i(u_Sampler, 0);
   gl.drawArrays(gl.TRIANGLE_STRIP, 0, bg.n);
   gl.uniform4f(shaderVars.u_Color, .2,.2,.2,1);


   // draw shape
   var color = [0,0,1,1];
   gl.uniform4f(shaderVars.u_Color, color[0], color[1], color[2], color[3]);
   gl.uniformMatrix4fv(
      shaderVars.u_xformMatrix, false, shape.modelMatrix.elements);
   gl.bindBuffer(gl.ARRAY_BUFFER, shape.buffer);
   FSIZE = shape.vertices.BYTES_PER_ELEMENT;
   gl.vertexAttribPointer(
      shaderVars.a_Position, 2, gl.FLOAT, false, FSIZE*2, 0);
   gl.enableVertexAttribArray(shaderVars.a_Position);
   gl.uniform1i(u_Sampler, 1);
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
   gl.uniform1i(u_Sampler, 1);
   gl.drawArrays(gl.TRIANGLE_STRIP, 0, ball.n);
   gl.uniform4f(shaderVars.u_Color, .2,.2,.2,1);

}
/**
 * initModels - initializes WebGL buffers for the the shape & quad
 * @param {Object} gl - the WebGL rendering context
 * @param {Object} shaderVars - the locations of shader variables
 * @param {Object} shape - the shape to be rendered
 * @returns {Boolean}
 */
 function initModels(gl, shaderVars, shape, ball, bg) {

   // set up the shape
   bg.buffer = gl.createBuffer();
   if (!bg.buffer) {
      console.log('Failed to create buffer object for shape');
      return false;
   }
   gl.bindBuffer(gl.ARRAY_BUFFER, bg.buffer);
   gl.bufferData(gl.ARRAY_BUFFER, bg.vertices, gl.STATIC_DRAW);
   gl.uniform1f(shaderVars.u_PointSize, 5.0);

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

/**
 * Code below this point was adapted from 
 * Judy Challinger CSCI 566 - Graphical Programming 
 * AnotherMultiTexture.js
 */

function initVertexBuffers(gl) {
  var verticesTexCoords = new Float32Array([
    // Vertex coordinate, Texture coordinate
    -0.5,  0.5,   0.0, 1.0,
    -0.5, -0.5,   0.0, 0.0,
     0.5,  0.5,   1.0, 1.0,
     0.5, -0.5,   1.0, 0.0,
  ]);
  var n = 4; // The number of vertices

  // Create a buffer object
  var vertexTexCoordBuffer = gl.createBuffer();
  if (!vertexTexCoordBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Write the positions of vertices to a vertex shader
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);

  var FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;
  //Get the storage location of a_Position, assign and enable buffer
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
  gl.enableVertexAttribArray(a_Position);  // Enable the assignment of the buffer object

  // Get the storage location of a_TexCoord
  var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
  if (a_TexCoord < 0) {
    console.log('Failed to get the storage location of a_TexCoord');
    return -1;
  }
  gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
  gl.enableVertexAttribArray(a_TexCoord);  // Enable the buffer assignment

  return n;
}

function initTextures(gl, n) {
  // Create a texture object
  texture0 = gl.createTexture(); 
  texture1 = gl.createTexture();
  if (!texture0 || !texture1) {
    console.log('Failed to create the texture object');
    return false;
  }

  // Get the storage location of u_Sampler0 and u_Sampler1
  u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
  if (!u_Sampler) {
    console.log('Failed to get the storage location of u_Sampler');
    return false;
  }

  // Create the image object
  var image0 = new Image();
  var image1 = new Image();
  if (!image0 || !image1) {
    console.log('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called when image loading is completed
  image0.onload = function(){ loadTexture(gl, n, texture0, image0, 0); };
  image1.onload = function(){ loadTexture(gl, n, texture1, image1, 1); };
  // Tell the browser to load an Image
  image0.src = 'resources/bob2.jpg';
  image1.src = 'resources/red2.jpg';

  return true;
}


var g_texUnit0 = false, g_texUnit1 = false; 
function loadTexture(gl, n, texture, image, texUnit) {
   
   // flip y when unpacking
   gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
   
  // make texture unit active
  if (texUnit == 0) {
    gl.activeTexture(gl.TEXTURE0);
    g_texUnit0 = true;
  } else {
    gl.activeTexture(gl.TEXTURE1);
    g_texUnit1 = true;
  } 
  
  // bind to target
  gl.bindTexture(gl.TEXTURE_2D, texture);
  
  // set texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  
  // upload image to GPU
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  if (g_texUnit0 && g_texUnit1)
     drawIt(gl);
}

function drawIt(gl) {
   gl.clear(gl.COLOR_BUFFER_BIT);
   
   // draw first triangle with first texture map
   gl.uniform1i(u_Sampler, 0);     
   gl.drawArrays(gl.TRIANGLES, 0, 3);
   
   // draw second triangle with second texture map
   gl.uniform1i(u_Sampler, 1);   
   gl.drawArrays(gl.TRIANGLES, 1, 3);
}
