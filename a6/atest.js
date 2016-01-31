
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'attribute vec4 a_Normal;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_ModelMatrix;\n' +    // Model matrix
  'uniform mat4 u_NormalMatrix;\n' +   // Transformation matrix of the normal
  'varying vec4 v_Color;\n' +
  'varying vec3 v_Normal;\n' +
  'varying vec3 v_Position;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
  '  v_Position = vec3(u_ModelMatrix * a_Position);\n' +
  '  v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
  '  v_Color = a_Color;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'uniform vec3 u_LightColor;\n' +     // Light color
  'uniform vec3 u_LightPosition;\n' +  // Position of the light source
  'uniform vec3 u_AmbientLight;\n' +   // Ambient light color
  'varying vec3 v_Normal;\n' +
  'varying vec3 v_Position;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
 // Normalize the normal because it is interpolated and not 1.0 in length any more
  '  vec3 normal = normalize(v_Normal);\n' +
     // Calculate the light direction and make its length 1.
  '  vec3 lightDirection = normalize(u_LightPosition - v_Position);\n' +
     // The dot product of the light direction and the orientation of a surface (the normal)
  '  float nDotL = max(dot(lightDirection, normal), 0.0);\n' +
     // Calculate the final color from diffuse reflection and ambient reflection
  '  vec3 diffuse = u_LightColor * v_Color.rgb * nDotL;\n' +
  '  vec3 ambient = u_AmbientLight * v_Color.rgb;\n' +
  '  gl_FragColor = vec4(diffuse + ambient, v_Color.a);\n' +
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
  
  	//Shut off page scrolling with arrow keys.
	document.addEventListener("keydown", function (e) {
  		if([37,38,39,40].indexOf(e.keyCode) > -1){
    		e.preventDefault();
  		}
	}, false);

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
  normalProgram.a_Normal = gl.getAttribLocation(normalProgram, 'a_Normal');
  normalProgram.u_MvpMatrix = gl.getUniformLocation(normalProgram, 'u_MvpMatrix');
  normalProgram.u_ModelMatrix = gl.getUniformLocation(normalProgram, 'u_ModelMatrix');
  normalProgram.u_NormalMatrix = gl.getUniformLocation(normalProgram, 'u_NormalMatrix');
  normalProgram.u_LightColor = gl.getUniformLocation(normalProgram, 'u_LightColor');
  normalProgram.u_LightPosition = gl.getUniformLocation(normalProgram, 'u_LightPosition');
  normalProgram.u_AmbientLight = gl.getUniformLocation(normalProgram, 'u_AmbientLight');

  textureProgram.a_Position = gl.getAttribLocation(textureProgram, 'a_Position');
  textureProgram.a_TexCoord = gl.getAttribLocation(textureProgram, 'a_TexCoord');
  textureProgram.u_MvpMatrix = gl.getUniformLocation(textureProgram, 'u_MvpMatrix');
  textureProgram.u_Sampler = gl.getUniformLocation(textureProgram, 'u_Sampler');

  if(normalProgram.a_Position < 0 || normalProgram.a_Color < 0 || 
     !normalProgram.u_MvpMatrix || textureProgram.a_Position <0 ||
     textureProgram.a_TexCoord < 0 || !textureProgram.u_MvpMatrix ||
     !textureProgram.u_Sampler || !normalProgram.u_ModelMatrix || 
	 !normalProgram.u_NormalMatrix || !normalProgram.u_LightColor ||
	 !normalProgram.u_LightPosition || !normalProgram.u_AmbientLight){
    console.log('Failed to get the storage location of an attribute.');
    return;
  }

  // Set the vertex coordinates and color
  var cube = initVertexBuffers(gl, normalProgram, textureProgram);
  if (!cube) {
    console.log('Failed to set the vertex information');
    return;
  }
  var sphere = initSphereVertexBuffers(gl, normalProgram);
  if (!sphere) {
    console.log('Failed to set the vertex information');
    return;
  }


  var n = cube.numIndices;
  var n2 = sphere.n;

  var textures = initTextures(gl, textureProgram);
  if(!textures){
    console.log('Failed to initialize the texture.');
    return;
  }


  // Set clear color and enable hidden surface removal
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);


  // Set the eye point and the viewing volume
  var mvpMatrix = new Matrix4();
  var modelMatrix = new Matrix4();
  var normalMatrix = new Matrix4();
  
  document.onkeydown = function(ev){ handleKeyDown(ev); };
  document.onkeyup = function(ev){ handleKeyUp(ev); };

  var objs = objectList;
  

 
  console.log(objs);
  
  var tick = function() {
	gl.useProgram(normalProgram);
	gl.uniform3f(normalProgram.u_LightColor, lighting.ltoggle, lighting.ltoggle, lighting.ltoggle);
  	gl.uniform3f(normalProgram.u_LightPosition,  lighting.lposx, lighting.lposy, lighting.lposz);
  	gl.uniform3f(normalProgram.u_AmbientLight, 0.3, 0.3, 0.3);
	objs=objectList;
    requestAnimationFrame(tick);
    handleKeys();
	if(objs.length > 0){
    	drawScene(gl, normalProgram, textureProgram, n, n2, mvpMatrix, modelMatrix, normalMatrix, objs, textures, cube, sphere, canvas);
		updateObject();
	}
	updateLighting();
    animate();
  };
  tick();

} // END OF MAIN

var yaw = 0.0;
var yawRate = 0.0;
var speed = 0.0;
var g_eyeX = 0.0, g_eyeY = 1.0, g_eyeZ = 10.0; // Eye position
var g_laX = 0.0, g_laY = 0.0, g_laZ = 0.0; // LookAt Position (Starting -1.0y)
var lastTime = 0.0;
var currentlyPressedKeys = {};


/**
 * Animate function handles object movements based on elapsed time, to create
 * a smooth movements. Eye movements are calculated here if movement yaw or 
 * speed is toggled through handleKeys functions.
 *
 */
function animate() {
  var timeNow = new Date().getTime();
  if(lastTime!=0){
    var elapsed = timeNow - lastTime;
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
function drawScene(gl, nProgram, tProgram, n, n2,  mvpMatrix,  modelMatrix, normalMatrix, objs, textures, o, s, canvas){
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  for(var i = 0; i<objs.length; i++){
	  if (objs[i].name == "Sky"){ //Special Case (Render with sky texture.)
		objs[i].texU= gl.TEXTURE1;
		objs[i].sampU= 1;
		objs[i].tex = textures.sky;
	  } else if (objs[i].name == "Ground") { //Special Case (Render with grass texture.)
	  	objs[i].texU= gl.TEXTURE0;
		objs[i].sampU= 0;
		objs[i].tex = textures.grass;
	  } 
      if(objs[i].texU){
        gl.useProgram(tProgram);
        initAttributeVariable(gl, tProgram.a_Position, o.vertexBuffer, 3, gl.FLOAT);
        initAttributeVariable(gl, tProgram.a_TexCoord, o.texCoordBuffer, 2, gl.FLOAT);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.indexBuffer); // Bind indices
        gl.uniform1i(tProgram.u_Sampler, objs[i].sampU);     
        gl.activeTexture(objs[i].texU);
        gl.bindTexture(gl.TEXTURE_2D, objs[i].tex);
        drawObj(gl, n, tProgram, mvpMatrix,  modelMatrix, normalMatrix,  objs[i], canvas);
      } else {
		if(objs[i].type == 0){
		  gl.useProgram(nProgram);
		  initAttributeVariable(gl, nProgram.a_Position, o.vertexBuffer, 3, gl.FLOAT);
		  changeColor(gl, nProgram, o, objs[i].r, objs[i].g, objs[i].b);
		  initAttributeVariable(gl, nProgram.a_Color, o.colorBuffer, 3, gl.FLOAT);
		  initAttributeVariable(gl, nProgram.a_Normal, o.normalBuffer, 3, gl.FLOAT);
		  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.indexBuffer);
		  drawObj(gl, n, nProgram, mvpMatrix,  modelMatrix, normalMatrix, objs[i], canvas);
		} else{
		  gl.useProgram(nProgram);
		  initAttributeVariable(gl, nProgram.a_Position, s.spherePositions, 3, gl.FLOAT);
		  changeSphereColor(gl, nProgram, s, objs[i].r, objs[i].g, objs[i].b);
		  initAttributeVariable(gl, nProgram.a_Color, s.sphereColors, 3, gl.FLOAT);
		  initAttributeVariable(gl, nProgram.a_Normal, s.sphereNormals, 3, gl.FLOAT);
		  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, s.sphereIndices);
		  drawObj(gl, n2, nProgram, mvpMatrix, modelMatrix, normalMatrix, objs[i], canvas);
		}
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
function drawObj(gl, n, prog, mvpMatrix,  modelMatrix, normalMatrix, obj, canvas){ 
  mvpMatrix.setPerspective(30, canvas.width/canvas.height, 1, 400);
  mvpMatrix.lookAt(g_eyeX, g_eyeY, g_eyeZ, g_laX, g_laY, g_laZ, 0, 1, 0);
  modelMatrix.setTranslate(obj.posx, obj.posy, obj.posz);
  modelMatrix.translate(obj.rotox, obj.rotoy, obj.rotoz);
  modelMatrix.rotate(obj.rotx, 1,0,0);
  modelMatrix.rotate(obj.roty, 0,1,0);
  modelMatrix.rotate(obj.rotz, 0,0,1);
  modelMatrix.translate(-obj.rotox, -obj.rotoy, -obj.rotoz);
  modelMatrix.scale(obj.scalex, obj.scaley, obj.scalez);
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  mvpMatrix.multiply(modelMatrix);
  gl.uniformMatrix4fv(prog.u_ModelMatrix, false, modelMatrix.elements);
  gl.uniformMatrix4fv(prog.u_MvpMatrix, false, mvpMatrix.elements);
  gl.uniformMatrix4fv(prog.u_NormalMatrix, false, normalMatrix.elements);
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);
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
	
   var vertices = new Float32Array([
     1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0, // v0-v1-v2-v3 front
     1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0, // v0-v3-v4-v5 right
     1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0, // v0-v5-v6-v1 up
    -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0, // v1-v6-v7-v2 left
    -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0, // v7-v4-v3-v2 down
     1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0  // v4-v7-v6-v5 back
  ]);

  // Colors
  var colors = new Float32Array([
   1.0, 1.0, 1.0,   1.0, 1.0, 1.0,   1.0, 1.0, 1.0,  1.0, 1.0, 1.0,     // v0-v1.0-v2-v3 front
    1.0, 1.0, 1.0,   1.0, 1.0, 1.0,   1.0, 1.0, 1.0,  1.0, 1.0, 1.0,     // v0-v3-v4-v5 right
    1.0, 1.0, 1.0,   1.0, 1.0, 1.0,   1.0, 1.0, 1.0,  1.0, 1.0, 1.0,     // v0-v5-v6-v1.0 up
    1.0, 1.0, 1.0,   1.0, 1.0, 1.0,   1.0, 1.0, 1.0,  1.0, 1.0, 1.0,     // v1.0-v6-v7-v2 left
    1.0, 1.0, 1.0,   1.0, 1.0, 1.0,   1.0, 1.0, 1.0,  1.0, 1.0, 1.0,     // v7-v4-v3-v2 down
    1.0, 1.0, 1.0,   1.0, 1.0, 1.0,   1.0, 1.0, 1.0,  1.0, 1.0, 1.0    // v4-v7-v6-v5 back
 ]);
  var texCoords = new Float32Array([   // Texture coordinates
     16.0, 16.0,   0.0, 16.0,   0.0, 0.0,   16.0, 0.0,    // v0-v1-v2-v3 front
     0.0, 16.0,   0.0, 0.0,   16.0, 0.0,   16.0, 16.0,    // v0-v3-v4-v5 right
     16.0, 0.0,   16.0, 16.0,   0.0, 16.0,   0.0, 0.0,    // v0-v5-v6-v1 up
     16.0, 16.0,   0.0, 16.0,   0.0, 0.0,   16.0, 0.0,    // v1-v6-v7-v2 left
     0.0, 0.0,   16.0, 0.0,   16.0, 16.0,   0.0, 16.0,    // v7-v4-v3-v2 down
     0.0, 0.0,   16.0, 0.0,   16.0, 16.0,   0.0, 16.0     // v4-v7-v6-v5 back
  ]);

  // Normal
  var normals = new Float32Array([
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
   -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
    0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
    0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
  ]);

  // Indices of the vertices
  var indices = new Uint16Array([
     0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
 ]);


  // Create a buffer object
  var o = new Object();
  o.vertexBuffer = gl.createBuffer();
  o.colorBuffer = gl.createBuffer();
  o.indexBuffer = gl.createBuffer();
  o.texCoordBuffer = gl.createBuffer();
  o.normalBuffer = gl.createBuffer();
  if (!o.vertexBuffer || !o.indexBuffer || !o.colorBuffer || !o.texCoordBuffer || !o.normalBuffer) {
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

  gl.vertexAttribPointer(normalProgram.a_Color, 3, gl.FLOAT, false, FSIZE*3, 0);
  gl.enableVertexAttribArray(normalProgram.a_Color);

  gl.bindBuffer(gl.ARRAY_BUFFER, o.texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  
  FSIZE = normals.BYTES_PER_ELEMENT;
  
  gl.bindBuffer(gl.ARRAY_BUFFER, o.normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

  o.numIndices = indices.length;

  return o;
}

/**
 * Creates the sphere object.
 * @param gl the gl context
 * @param normalProgram a shader program used to render sphere.
 */
function initSphereVertexBuffers(gl, normalProgram){ 
  gl.useProgram(normalProgram);
  var SPHERE_DIV = 40;

  var i, ai, si, ci;
  var j, aj, sj, cj;
  var p1, p2;

  var positions = [];
  var indices = [];
  var colors = [];

  // Generate coordinates
  for (j = 0; j <= SPHERE_DIV; j++) {
    aj = j * Math.PI / SPHERE_DIV;
    sj = Math.sin(aj);
    cj = Math.cos(aj);
    for (i = 0; i <= SPHERE_DIV; i++) {
      ai = i * 2 * Math.PI / SPHERE_DIV;
      si = Math.sin(ai);
      ci = Math.cos(ai);

      positions.push(si * sj);  // X
      positions.push(cj);       // Y
      positions.push(ci * sj);  // Z
	  colors.push(1.0);
	  colors.push(1.0);
	  colors.push(1.0);
    }
  }

  // Generate indices
  for (j = 0; j < SPHERE_DIV; j++) {
    for (i = 0; i < SPHERE_DIV; i++) {
      p1 = j * (SPHERE_DIV+1) + i;
      p2 = p1 + (SPHERE_DIV+1);

      indices.push(p1);
      indices.push(p2);
      indices.push(p1 + 1);

      indices.push(p1 + 1);
      indices.push(p2);
      indices.push(p2 + 1);
    }
  }
  var s = new Object();
  s.spherePositions = new gl.createBuffer();
  s.sphereNormals = new gl.createBuffer();
  s.sphereColors = new gl.createBuffer();
  s.sphereIndices = new gl.createBuffer();
  if(!s.spherePositions || !s.sphereNormals || !s.sphereColors || !s.sphereIndices){
	  return -1;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, s.spherePositions);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, s.sphereNormals);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, s.sphereColors);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, s.sphereIndices);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)
  s.n = indices.length;
  return s;
}

/**
 * Changes the color of the object.
 * @param gl			the gl context
 * @param program  		the shader program to use. 
 * @param baseObj 		the object (cube or sphere) to change color on
 * @param r				the red amount (multiplier x 100%)
 * @param g				the green amount (multiplier x 100%)
 * @param b				the blue amount (multiplier x 100%)
 */
function changeColor(gl, program, baseObj, r, g, b){
	gl.useProgram(program);
	var colors = new Float32Array([
	  1.0*r, 1.0*g, 1.0*b,   1.0*r, 1.0*g, 1.0*b,   1.0*r, 1.0*g, 1.0*b,  1.0*r, 1.0*g, 1.0*b,     // v0-v1.0-v2-v3 front
	  1.0*r, 1.0*g, 1.0*b,   1.0*r, 1.0*g, 1.0*b,   1.0*r, 1.0*g, 1.0*b,  1.0*r, 1.0*g, 1.0*b,     // v0-v1.0-v2-v3 front
	  1.0*r, 1.0*g, 1.0*b,   1.0*r, 1.0*g, 1.0*b,   1.0*r, 1.0*g, 1.0*b,  1.0*r, 1.0*g, 1.0*b,     // v0-v1.0-v2-v3 front
	  1.0*r, 1.0*g, 1.0*b,   1.0*r, 1.0*g, 1.0*b,   1.0*r, 1.0*g, 1.0*b,  1.0*r, 1.0*g, 1.0*b,     // v0-v1.0-v2-v3 front
	  1.0*r, 1.0*g, 1.0*b,   1.0*r, 1.0*g, 1.0*b,   1.0*r, 1.0*g, 1.0*b,  1.0*r, 1.0*g, 1.0*b,     // v0-v1.0-v2-v3 front
	  1.0*r, 1.0*g, 1.0*b,   1.0*r, 1.0*g, 1.0*b,   1.0*r, 1.0*g, 1.0*b,  1.0*r, 1.0*g, 1.0*b     // v0-v1.0-v2-v3 front
    ]);
	var FSIZE = colors.BYTES_PER_ELEMENT;
	gl.bindBuffer(gl.ARRAY_BUFFER, baseObj.colorBuffer);
  	gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
}

/**
 * Changes the color of the object.
 * @param gl			the gl context
 * @param program  		the shader program to use. 
 * @param baseObj 		the object (cube or sphere) to change color on
 * @param r				the red amount (multiplier x 100%)
 * @param g				the green amount (multiplier x 100%)
 * @param b				the blue amount (multiplier x 100%)
 */
function changeSphereColor(gl, program, baseObj, r, g, b){
	gl.useProgram(program);
	var SPHERE_DIV = 40;

  	var i, j;
  	var colors = [];

  // Generate coordinates
  for (j = 0; j <= SPHERE_DIV; j++) {
    for (i = 0; i <= SPHERE_DIV; i++) {
	  colors.push(1.0*r);
	  colors.push(1.0*g);
	  colors.push(1.0*b);
    }
  }
	gl.bindBuffer(gl.ARRAY_BUFFER, baseObj.sphereColors);
  	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
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

