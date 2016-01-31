//Cameron Brownfield
//11.17.2015
  
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
  '  v_Color = a_Color;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';

var TEXTURE_VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec2 a_TexCoord;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'varying vec2 v_TexCoord;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
  '  v_TexCoord = a_TexCoord;\n' +
  '}\n';

// Fragment shader for texture drawing
var TEXTURE_FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'uniform sampler2D u_Sampler;\n' +
  'varying vec2 v_TexCoord;\n' +
  'void main() {\n' +
  '  gl_FragColor = texture2D(u_Sampler, v_TexCoord);\n' +
  '}\n';

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  var normalProgram = createProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE);
  var textureProgram = createProgram(gl, TEXTURE_VSHADER_SOURCE, TEXTURE_FSHADER_SOURCE);
  gl.useProgram(normalProgram);

  // Initialize shaders
  if(!normalProgram || !textureProgram){
    console.log('Failed to intialize shaders.');
    return;
  }

  normalProgram.a_Position = gl.getAttribLocation(normalProgram, 'a_Position');
  normalProgram.a_Color = gl.getAttribLocation(normalProgram, 'a_Color');
  normalProgram.u_MvpMatrix = gl.getUniformLocation(normalProgram, 'u_MvpMatrix');

  textureProgram.a_Position = gl.getAttribLocation(textureProgram, 'a_Position');
  textureProgram.a_TexCoord = gl.getAttribLocation(textureProgram, 'a_TexCoord');
  textureProgram.u_MvpMatrix = gl.getUniformLocation(textureProgram, 'u_MvpMatrix');
  textureProgram.u_Sampler = gl.getUniformLocation(textureProgram, 'u_Sampler');

  if(normalProgram.a_Position < 0 || normalProgram.a_Color < 0 || 
     !normalProgram.u_MvpMatrix || textureProgram.a_Position <0 ||
     textureProgram.a_TexCoord < 0 || !textureProgram.u_MvpMatrix ||
     !textureProgram.u_Sampler){
    console.log('Failed to get the storage location of an attribute.');
    return;
  }

  // Set the vertex coordinates and color
  var cube = initVertexBuffers(gl, normalProgram, textureProgram);
  if (!cube) {
    console.log('Failed to set the vertex information');
    return;
  }

  var n = cube.numIndices;

  var textures = initTextures(gl, textureProgram);
  if(!textures){
    console.log('Failed to initialize the texture.');
    return;
  }


  // Set clear color and enable hidden surface removal
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);


  var buildings = {
    one:{ 
      posx: 13.0, posy: 1, posz: -13.0,
      scalex: 2, scaley: 2, scalez: 2,
      rotx: 0, roty: 0, rotz: 0,
      rotox: 0, rotoy: 0, rotoz: 0
    },
    two:{ 
      posx: -10.0, posy: 1, posz: -10.0,
      scalex: 2, scaley: 2, scalez: 2,
      rotx: 0, roty: 0, rotz: 0,
      rotox: 0, rotoy: 0, rotoz: 0
    },
    three:{ 
      posx: 19.0, posy: 1, posz: 19.0,
      scalex: 2, scaley: 4, scalez: 2,
      rotx: 0, roty: 45, rotz: 0,
      rotox: 14.0, rotoy: 2.0, rotoz: 13.0
    },
    four:{ 
      posx: 25.0, posy: 1, posz: 10.0,
      scalex: 3, scaley: 8, scalez: 3,
      rotx: 0, roty: 0, rotz: 0,
      rotox: 0, rotoy: 0, rotoz: 0
    },
    five:{ 
      posx: 5.0, posy: 1, posz: 30,
      scalex: 3, scaley: 10, scalez: 2,
      rotx: 0, roty: 0, rotz: 0,
      rotox: 0, rotoy: 0, rotoz: 0
    },
  };

  var ground = {
    posx: 0.0, posy: -1.0, posz: 0.0,
    scalex: 100, scaley: .1, scalez: 100,
    rotx: 0, roty: 0, rotz: 0,
    rotox: 0, rotoy: 0, rotoz: 0,
    texU: gl.TEXTURE0, sampU: 0, tex: textures.grass
  };

  var sky = {
    posx: 0.0, posy: 0, posz: 0.0,
    scalex: 200, scaley: 200, scalez: 200,
    rotx: 0, roty: 0, rotz: 0,
    rotox: 0, rotoy: 0, rotoz: 0,
    texU: gl.TEXTURE1, sampU: 1, tex: textures.sky
  };

  var windmill = {
    base: {
      posx: 0.0, posy: 1.0, posz: 0.0,
      scalex: .5, scaley: 5, scalez: .5,
      rotx: 0, roty: 0, rotz: 0,
      rotox: 0, rotoy: 0, rotoz: 0
    },
    fanOne: {
      posx: 0, posy: 2.5, posz: -1,
      scalex: .3, scaley: 1.5, scalez: .1,
      rotx: 0, roty: 0, rotz: 10,
      rotox: 0, rotoy: 2, rotoz: 1
    },
    fanTwo: {
      posx: 0, posy: 2.5, posz: -1,
      scalex: .3, scaley: 1.5, scalez: .1,
      rotx: 0, roty: 0, rotz: 100,
      rotox: 0, rotoy: 2, rotoz: 1
    },
    fanThree: {
      posx: 0, posy: 2.5, posz: -1,
      scalex: .3, scaley: 1.5, scalez: .1,
      rotx: 0, roty: 0, rotz: 190,
      rotox: 0, rotoy: 2, rotoz: 1
    },
    fanFour: {
      posx: 0, posy: 2.5, posz: -1,
      scalex: .3, scaley: 1.5, scalez: .1,
      rotx: 0, roty: 0, rotz: 280,
      rotox: 0, rotoy: 2, rotoz: 1
    }
  }
  // Set the eye point and the viewing volume
  var mvpMatrix = new Matrix4();
  document.onkeydown = function(ev){ handleKeyDown(ev); };
  document.onkeyup = function(ev){ handleKeyUp(ev); };

  var objs = new Array(
              ground, 
              sky,
              buildings.one,
              buildings.two, 
              buildings.three, 
              buildings.four, 
              buildings.five, 
              windmill.base, 
              windmill.fanOne,
              windmill.fanTwo,
              windmill.fanThree, 
              windmill.fanFour);

  var tick = function() {
    requestAnimationFrame(tick);
    handleKeys();
    drawScene(gl, normalProgram, textureProgram, n, mvpMatrix, objs, textures, cube);
    animate(windmill);
  };
  tick();

} // END OF MAIN

var yaw = 0.0;
var yawRate = 0.0;
var speed = 0.0;
var g_eyeX = 0.0, g_eyeY = 1.0, g_eyeZ = 0.0; // Eye position
var g_laX = 0.0, g_laY = 0.0, g_laZ = 0.0; // LookAt Position (Starting -1.0y)
var lastTime = 0.0;
var currentlyPressedKeys = {};
var windmillToggle = true;
var windmillBToggle = false;

/**
 * Animate function handles object movements based on elapsed time, to create
 * a smooth movements. Eye movements are calculated here if movement yaw or 
 * speed is toggled through handleKeys functions.
 * @param windmill      the windmill object
 *
 */
function animate(windmill) {
  var timeNow = new Date().getTime();
  if(lastTime!=0){
    var elapsed = timeNow - lastTime;
    if(windmillToggle){
      windmill.fanOne.rotz = (windmill.fanOne.rotz + 1) % 360;
      windmill.fanTwo.rotz = (windmill.fanTwo.rotz + 1) % 360;
      windmill.fanThree.rotz = (windmill.fanThree.rotz + 1) % 360;
      windmill.fanFour.rotz = (windmill.fanFour.rotz + 1) % 360;
    }
    if(windmillBToggle){
      windmill.fanOne.roty = (windmill.fanOne.roty + 1) % 360;
      windmill.fanTwo.roty = (windmill.fanTwo.roty + 1) % 360;
      windmill.fanThree.roty = (windmill.fanThree.roty + 1) % 360;
      windmill.fanFour.roty = (windmill.fanFour.roty + 1) % 360;
      windmill.base.roty = (windmill.base.roty + 1) % 360;
    }
    /* if moving forward or backward */
    g_laX = Math.sin(degToRad(yaw))*1000;
    g_laZ = Math.cos(degToRad(yaw))*1000;
    if(speed != 0) {
      g_eyeX -= Math.sin(degToRad(yaw)) * speed * elapsed;
      g_eyeZ -= Math.cos(degToRad(yaw)) * speed * elapsed;
    }
    yaw += yawRate*elapsed;
  }
  lastTime = timeNow;
}

/**
 * Draws the seen, using the object list.
 * @param gl            the gl context
 * @param nProgram      the non-texture shader program
 * @param tProgram      the texture shader program
 * @param n             the number of indices
 * @param mvpMatrix     the model view projection matrix
 * @param objs          the array of objects to be rendered
 * @param textures      the array of textures to be used. (experimental, currently not used)
 * @param o             the object containing references to the buffer objects.
 * @see                 the rendered world on the canvas
 */
function drawScene(gl, nProgram, tProgram, n, mvpMatrix, objs, textures, o){
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  mvpMatrix.setPerspective(30, 1, 1, 400);
  mvpMatrix.lookAt(g_eyeX, g_eyeY, g_eyeZ, g_laX, g_laY, g_laZ, 0, 1, 0);
  for(var i = 0; i<objs.length; i++){
      if(i==0 || i==1){
        gl.useProgram(tProgram);
        initAttributeVariable(gl, tProgram.a_Position, o.vertexBuffer, 3, gl.FLOAT);
        initAttributeVariable(gl, tProgram.a_TexCoord, o.texCoordBuffer, 2, gl.FLOAT);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.indexBuffer); // Bind indices
        gl.uniform1i(tProgram.u_Sampler, objs[i].sampU);     
        gl.activeTexture(objs[i].texU);
        gl.bindTexture(gl.TEXTURE_2D, objs[i].tex);
        drawObj(gl, n, tProgram, mvpMatrix, objs[i]);
      } else {
        gl.useProgram(nProgram);
        initAttributeVariable(gl, nProgram.a_Position, o.vertexBuffer, 3, gl.FLOAT);
        initAttributeVariable(gl, nProgram.a_Color, o.colorBuffer, 3, gl.FLOAT);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.indexBuffer);
        //console.log("Drawing: "+i);
        drawObj(gl, n, nProgram, mvpMatrix, objs[i]);
      }
  }
}

/**
 * Binds and sets up an attribute, must be redone before each obj render if 
 * using different programs.
 * @param gl              the gl context
 * @param a_attribute     the attribute to set and enable
 * @param buffer          the buffer to set data from
 * @param num             the number of values for each attrib
 * @param type            the gl type of the data (ie gl.FLOAT)
 */
function initAttributeVariable(gl, a_attribute, buffer, num, type) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  gl.enableVertexAttribArray(a_attribute);
}

/**
 * Draws object (obj) to the screen.
 * @param gl          the gl context  
 * @param n           the number of indices
 * @param prog        the shader program to use 
 * @param mvpMatrix   the model view projection matrix
 * @param obj         the object to be rendered
 */
function drawObj(gl, n, prog, mvpMatrix, obj){
  //Transforms
  mvpMatrix.translate(obj.posx, obj.posy, obj.posz);
  mvpMatrix.translate(obj.rotox, obj.rotoy, obj.rotoz);
  mvpMatrix.rotate(obj.rotx, 1, 0, 0);
  mvpMatrix.rotate(obj.roty, 0, 1, 0);
  mvpMatrix.rotate(obj.rotz, 0, 0, 1);
  mvpMatrix.translate(-obj.rotox, -obj.rotoy, -obj.rotoz);
  mvpMatrix.scale(obj.scalex, obj.scaley, obj.scalez);

  //Draw to the Scene
  gl.uniformMatrix4fv(prog.u_MvpMatrix, false, mvpMatrix.elements);
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

  //Anti-Transforms
  mvpMatrix.scale(1/obj.scalex, 1/obj.scaley, 1/obj.scalez);
  mvpMatrix.translate(obj.rotox, obj.rotoy, obj.rotoz);
  mvpMatrix.rotate(-obj.rotz, 0, 0, 1);
  mvpMatrix.rotate(-obj.roty, 0, 1, 0);
  mvpMatrix.rotate(-obj.rotx, 1, 0, 0);
  mvpMatrix.translate(-obj.rotox, -obj.rotoy, -obj.rotoz);
  mvpMatrix.translate(-obj.posx, -obj.posy, -obj.posz);
}


/**
 * Helper function converts degrees to radians
 * @param degrees   the value (angle) in degree format
 */ 
function degToRad(degrees) {
        return degrees * Math.PI / 180;
}



/**
 * Handler for key press (key down)
 * @param event   the key event
 */
function handleKeyDown(event) {
  console.log("HandlingKeyDown %d", event.keyCode);
  currentlyPressedKeys[event.keyCode] = true;
  if(event.keyCode == 87){
    if(!windmillToggle){
      console.log("Windmill ON");
      windmillToggle = true;
    } else {
      console.log("Windmill OFF");
      windmillToggle = false;
    }
  }
}

/**
 * Handler for key release (key up)
 * @param event   the key event 
 */
function handleKeyUp(event) {
  console.log("HandlingKeyUp");
  currentlyPressedKeys[event.keyCode] = false;
}

/**
 * The function for handling actions based on the keys that are 
 * currently pressed. 
 * @params windmill   windmill object, which holds parameters
 *
 */
function handleKeys() {
  if (currentlyPressedKeys[37] || currentlyPressedKeys[65]) {
    // Left cursor key or A
    yawRate = 0.1;
  } else if (currentlyPressedKeys[39] || currentlyPressedKeys[68]) {
    // Right cursor key or D
    yawRate = -0.1;
  } else {
    yawRate = 0;
  }

  if (currentlyPressedKeys[38]) {
    // Up cursor key or W
    speed = -0.04;
  } else if (currentlyPressedKeys[40] || currentlyPressedKeys[83]) {
    // Down cursor key
    speed = 0.04;
  } else {
    speed = 0;
  }

  if(currentlyPressedKeys[89]){
    windmillBToggle = true;
  } else {
    windmillBToggle = false;
  }
}



 /**
  * Sets up the cube and all buffers.
  * @param gl   the gl context
  * @param normalProgram the program for rendering non-textured objects
  * @param textureProgram the program for rendering textured objects.
  * @return the object containing all the buffers and number of indices 
  * as object{  vertexBuffer:, 
                texCoordBuffer:, 
                colorBuffer:, 
                indexBuffer:, 
                numIndices: }
  */
function initVertexBuffers(gl, normalProgram, textureProgram) {
  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3
  var vertices = new Float32Array([
    // Vertex coordinates and color
     1.0,  1.0,  1.0,
    -1.0,  1.0,  1.0,
    -1.0, -1.0,  1.0,
     1.0, -1.0,  1.0,
     1.0, -1.0, -1.0,
     1.0,  1.0, -1.0,
    -1.0,  1.0, -1.0,
    -1.0, -1.0, -1.0
  ]);

  var colors = new Float32Array([
    1.0, 1.0, 1.0,
    1.0, 0.0, 1.0,
    1.0, 0.0, 0.0,
    1.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 1.0, 1.0,
    0.0, 0.0, 1.0,
    0.5, 0.5, 0.5
    ]);

  var texCoords = new Float32Array([   // Texture coordinates
     16.0, 16.0,   0.0, 16.0,   0.0, 0.0,   16.0, 0.0,    // v0-v1-v2-v3 front
     0.0, 16.0,   0.0, 0.0,   16.0, 0.0,   16.0, 16.0,    // v0-v3-v4-v5 right
     16.0, 0.0,   16.0, 16.0,   0.0, 16.0,   0.0, 0.0,    // v0-v5-v6-v1 up
     16.0, 16.0,   0.0, 16.0,   0.0, 0.0,   16.0, 0.0,    // v1-v6-v7-v2 left
     0.0, 0.0,   16.0, 0.0,   16.0, 16.0,   0.0, 16.0,    // v7-v4-v3-v2 down
     0.0, 0.0,   16.0, 0.0,   16.0, 16.0,   0.0, 16.0     // v4-v7-v6-v5 back
  ]);

  // Indices of the vertices
  var indices = new Uint8Array([
    0, 1, 2,   0, 2, 3,    // front
    0, 3, 4,   0, 4, 5,    // right
    0, 5, 6,   0, 6, 1,    // up
    1, 6, 7,   1, 7, 2,    // left
    7, 4, 3,   7, 3, 2,    // down
    4, 7, 6,   4, 6, 5     // back
 ]);

  // Create a buffer object
  var o = new Object();
  o.vertexBuffer = gl.createBuffer();
  o.colorBuffer = gl.createBuffer();
  o.indexBuffer = gl.createBuffer();
  o.texCoordBuffer = gl.createBuffer();
  if (!o.vertexBuffer || !o.indexBuffer || !o.colorBuffer || !o.texCoordBuffer) {
    return -1;
  }


  // Write the vertex coordinates and color to the buffer object
  gl.useProgram(normalProgram);

  gl.bindBuffer(gl.ARRAY_BUFFER, o.vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  var FSIZE = vertices.BYTES_PER_ELEMENT;
  // Assign the buffer object to a_Position and enable the assignment
  gl.vertexAttribPointer(normalProgram.a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(normalProgram.a_Position);

  // Assign the buffer object to a_Color and enable the assignment
  gl.bindBuffer(gl.ARRAY_BUFFER, o.colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

  FSIZE = colors.BYTES_PER_ELEMENT;

  gl.vertexAttribPointer(normalProgram.a_Color, 3, gl.FLOAT, false, FSIZE * 3, 0);
  gl.enableVertexAttribArray(normalProgram.a_Color);

  gl.bindBuffer(gl.ARRAY_BUFFER, o.texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  o.numIndices = indices.length;

  return o;
}


/**
 * Initializes the textures 
 * @param gl        the gl context
 * @param program   the shader program to use 
 */
function initTextures(gl, program) {
  var textures = new Object();
  textures.grass = gl.createTexture();   // Create a texture object
  textures.sky = gl.createTexture();
  if (!textures.grass || !textures.sky) {
    console.log('Failed to create the texture object');
    return null;
  }

  var image = new Image();  // Create a image object
  if (!image) {
    console.log('Failed to create the image object');
    return null;
  }

  var image2 = new Image();
  if (!image2) {
    console.log('Failed to create the second image object.');
    return null;
  }
  // Register the event handler to be called when image loading is completed
  image.onload = function() {
    // Write the image data to texture object
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);  // Flip the image Y coordinate
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures.grass);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    g_texUnit0 = true;
    // Pass the texure unit 0 to u_Sampler
    gl.useProgram(program);
    gl.uniform1i(program.u_Sampler, 0);

    gl.bindTexture(gl.TEXTURE_2D, null); // Unbind texture
    //try drawing???
    //gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0);
  };

  image2.onload = function(){
    // Write the image data to texture object
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);  // Flip the image Y coordinate
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, textures.sky);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image2);
    g_texUnit1 = true;
    // Pass the texure unit 0 to u_Sampler
    gl.useProgram(program);
    gl.uniform1i(program.u_Sampler, 1);

    gl.bindTexture(gl.TEXTURE_2D, null); // Unbind texture
    //try drawing???
    //gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0);
  }
  // Tell the browser to load an Image
  image.src = 'resources/grass.bmp';
  image2.src = 'resources/stars-texture-3.jpg';

  return textures;
}
