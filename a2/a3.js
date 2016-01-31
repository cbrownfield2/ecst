/* Adapted from TwoBuffers.js example provided in CSCI 566 CSU Chico - J. Challenger
 * 
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

   //A shape object (starts as a shape in the animation).
   var shape = {
      vertices:   new Float32Array([
         -0.75,  0.5,
         -0.75, -0.5,
         -0.25, 0.5, 
         -0.25, -0.5,
         0.25, 0.5,
         0.25, -0.5,
         0.75, 0.5,
         0.75, -0.5,
         ]),
      n: 3,
      modelMatrix: new Matrix4,
      buffer: 0
   };

   var square = {
      vertices: new Float32Array([
         .80, .80,
         .90, .80,
         .90, .90,
         .80, .90,
      ]),
      n: 4,
      modelMatrix: new Matrix4,
      buffer: 0
   };

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


   var n = initModels(gl, shaderVars, shape, square);
   if (n < 0) {
      console.log('Failed to initialize models');
      return;
   }
// start animation loop
   var last = Date.now();
   var angle = 0;
   /**
    * tick - callback function to animate and redraw
    */
   var tick = function() {
      animate(shape, last, angle);
      render(gl, shaderVars, shape, square);
      requestAnimationFrame(tick, canvas);
   };
   tick();
}

/**
 * animate - animates the shape object
 * @param {Object} shape - the shape object to be animated
 * @param {Number} last - the last time this function executed
 * @param {Number} angle - the angle of rotation
 */
function animate(shape, last, angle) {
   var now = Date.now();
   var elapsed = now - last;
   last = now;
   if(document.getElementById("s_rotate").value === "true"){
        angle = angle + (30 * elapsed) / 1000.0;
        shape.modelMatrix.setRotate(angle, 0, 0, 1);
   }
}

/**
 * render - renders the scene using WebGL
 * @param {Object} gl - the WebGL rendering context
 * @param {Object} shaderVars - the locations of shader variables
 * @param {Object} shape - the shape to be rendered
 */
 function render(gl, shaderVars, shape, square) {

   // clear the canvas
   gl.clear(gl.COLOR_BUFFER_BIT);

   // draw shape
   var sel = document.getElementById("s_color").value;
   var color = [0,0,0,1];
   if(sel === "gray"){
      color = [.5,.5,.5,1];
   } else if(sel === "blue"){
      color = [0,0,1,1];
   } else if(sel === "red"){
      color = [1,0,0,1];
   } else if(sel === "green"){
      color = [0,1,0,1];
   } else{
      color = [.5,.5,.5,1];
   }
   console.log(sel);
   gl.uniform4f(shaderVars.u_Color, color[0], color[1], color[2], color[3]);
   
   gl.uniformMatrix4fv(
      shaderVars.u_xformMatrix, false, shape.modelMatrix.elements);
   gl.bindBuffer(gl.ARRAY_BUFFER, shape.buffer);

   var s_format = document.getElementById("s_format").value;
   var verts = +document.getElementById("s_vertices").value;

   if(s_format === "Points"){
      gl.drawArrays(gl.POINTS, 0, verts);
   } else if(s_format === "TriangleStrip"){
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, verts);
   } else if(s_format === "Triangles"){
      gl.drawArrays(gl.TRIANGLES, 0, verts);
   } else if(s_format === "TriangleFan"){
      gl.drawArrays(gl.TRIANGLE_FAN, 0, verts);
   } else if(s_format === "Lines"){
      gl.drawArrays(gl.LINES, 0, verts);
   } else if(s_format === "LineStrip"){
      gl.drawArrays(gl.LINE_STRIP, 0, verts);
   } else if(s_format === "LineLoop"){
      gl.drawArrays(gl.LINE_LOOP, 0, verts);
   }
   gl.uniform4f(shaderVars.u_Color, .2,.2,.2,1);
   gl.uniformMatrix4fv(
      shaderVars.u_xformMatrix, false, square.modelMatrix.elements);
   gl.bindBuffer(gl.ARRAY_BUFFER, square.buffer);
   gl.drawArrays(gl.TRIANGLE_STRIP, 0, square.n);
}
/**
 * initModels - initializes WebGL buffers for the the shape & quad
 * @param {Object} gl - the WebGL rendering context
 * @param {Object} shaderVars - the locations of shader variables
 * @param {Object} shape - the shape to be rendered
 * @returns {Boolean}
 */
 function initModels(gl, shaderVars, shape, square) {
   // set up the square
   square.buffer = gl.createBuffer();
   if (!square.buffer) {
      console.log('Failed to create buffer object for square');
      return false;
   }
   gl.bindBuffer(gl.ARRAY_BUFFER, square.buffer);
   gl.bufferData(gl.ARRAY_BUFFER, square.vertices, gl.STATIC_DRAW);
   gl.vertexAttribPointer(
      shaderVars.a_Position, 2, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(shaderVars.a_Position);


   // set up the shape
   shape.buffer = gl.createBuffer();
   if (!shape.buffer) {
      console.log('Failed to create buffer object for shape');
      return false;
   }
   gl.bindBuffer(gl.ARRAY_BUFFER, shape.buffer);
   gl.bufferData(gl.ARRAY_BUFFER, shape.vertices, gl.STATIC_DRAW);
   gl.uniform1f(shaderVars.u_PointSize, 5.0);
   var FSIZE = shape.vertices.BYTES_PER_ELEMENT;
   gl.vertexAttribPointer(
      shaderVars.a_Position, 2, gl.FLOAT, false, FSIZE*2, 0);
   gl.enableVertexAttribArray(shaderVars.a_Position);

   return true;
}
