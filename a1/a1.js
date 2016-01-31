// Author(Modifier): Cameron Brownfield
// Date: 09.02.2015
// File: a1.js
// CalledFrom: a1/index.html
// Code adapted from ColoredPoint.js (c) 2012 matsude
// from WebGL Programming Guide

// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute float a_PointSize;\n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '  gl_PointSize = a_PointSize;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +  // uniformå¤‰æ•°
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('a1_c1');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // //Get the storage location of a_Size
  gl.aPointSize= gl.getAttribLocation(gl.program, 'a_PointSize');
  if (gl.aPointSize < 0) {
    console.log('Failed to get the storage location of a_PointSize');
    return;
  }

  // Get the storage location of u_FragColor
  var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }


  // Register function (event handler) to be called on a mouse press
  canvas.onmousemove = function(ev){ update(ev, gl, canvas, a_Position, u_FragColor) };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_points = [];  // The array for the position of a mouse press
var g_colors = [];  // The array to store the color of a point
var clicked = 0;
//Calculate color based on position.
function getColor(x, y) {
  var c = [Math.abs(x)+.25, Math.abs(y)+0.25,Math.abs(x)+Math.abs(y)+.75, 1.0];
  /*
  if (x < 0.0 && y >= 0.0) {      // First quadrant
    c = [Math.abs(x)*2, Math.abs(y)*1, 0.0, 1.0];
  } else if (x >= 0.0 && y >= 0.0){
    c = [0.0, Math.abs(y), Math.abs(x)*2, 1.0];
  } else if (x < 0.0 && y < 0.0) { // Third quadrant
    c = [0.0, Math.abs(x)*2, Math.abs(y), 1.0];
  } else {                         // Others
    c = [Math.abs(y), Math.abs(x)*2, 0.0, 1.0];
  }
  */
  return c;
}

function getRandomSize(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function update(ev, gl, canvas, a_Position, u_FragColor) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  // Store the coordinates to g_points array
  g_points.push([x, y]);
  // Store the coordinates to g_points array

  g_colors.push(getColor(x, y));

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_points.length;
  for(var i = 0; i < len; i++) {
    var xy = g_points[i];
    var rgba = g_colors[i];
    // Pass the position of a point to a_Position variable
    gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
    // Pass the size of a point to a_Size variable

    var ps = getRandomSize(3, 15);
    gl.vertexAttrib1f(gl.aPointSize, ps);
    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    // Draw
    gl.drawArrays(gl.POINTS, 0, 1);
  }
  clicked = clicked + 1;
}