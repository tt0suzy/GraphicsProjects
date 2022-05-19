/**
 * @file MP5.js - A simple WebGL rendering engine
 * @author Ian Rudnick <itr2@illinois.edu>
 * @brief Starter code for CS 418 MP5 at the University of Illinois at
 * Urbana-Champaign.
 * 
 * Updated Spring 2021 for WebGL 2.0/GLSL 3.00 ES.
 */

/** @global The WebGL context */
var gl;

/** @global The HTML5 canvas to draw on */
var canvas;

/** @global The GLSL shader program */
var shaderProgram;

/** @global An object holding the geometry for your 3D model */
var sphere1;

/** @global The currently pressed keys */
var keys = {};

const gravity = glMatrix.vec3.fromValues(0, -0.5, 0);

const drag = 0.7;
var maxX = 2;
var maxY = 2;
var maxZ = 2;
var minX = -2;
var minY = -2;
var minZ = -2;

var wallNormals = [];
/** @global The Model matrix */
var modelViewMatrix = glMatrix.mat4.create();
/** @global The Model matrix */
var viewMatrix = glMatrix.mat4.create();
/** @global The Projection matrix */
var projectionMatrix = glMatrix.mat4.create();
/** @global The Normal matrix */
var normalMatrix = glMatrix.mat3.create();

var lastTime = Date.now();
// Material parameters
/** @global Ambient material color/intensity for Phong reflection */
var kAmbient = [0.25, 0.75, 1.0];
/** @global Diffuse material color/intensity for Phong reflection */
var kDiffuse = [0.25, 0.75, 1.0];
/** @global Specular material color/intensity for Phong reflection */
var kSpecular = [0.95, 0.45, 1.0];
/** @global Shininess exponent for Phong reflection */
var shininess = 2;

/** @global Ambient light color */
const lAmbient = [0.4, 0.4, 0.4];
/** @global Diffuse light color */
const lDiffuse = [1.0, 1.0, 1.0];
/** @global Specular  light color */
const lSpecular = [1.0, 1.0, 1.0];

var particles = [];

class Particle{
    constructor(pos, vel, rad, ambient, diffuse) {
        this.pos = pos;
        this.vel = vel;
        this.rad = rad;
        this.ambient = ambient;
        this.diffuse = diffuse;
        this.stop = false;
        // this.mass = mass;
    }
    setPos(pos){
      this.pos = pos;
    }
    setVel(vel){
      this.vel = vel;
    }
}

/**
 * Translates degrees to radians
 * @param {Number} degrees Degree input to function
 * @return {Number} The radians that correspond to the degree input
 */
function degToRad(degrees) {
  return degrees * Math.PI / 180;
}

//-----------------------------------------------------------------------------
// Setup functions (run once when the webpage loads)
/**
 * Startup function called from the HTML code to start program.
 */
function startup() {
  // Set up the canvas with a WebGL context.
  canvas = document.getElementById("glCanvas");
  gl = createGLContext(canvas);
  document.onkeydown = handleKeyDown;
  document.onkeyup = handleKeyUp;
  generateParticle();
  var wall1 = glMatrix.vec3.fromValues(1, 0, 0);
  var wall2 = glMatrix.vec3.fromValues(-1, 0, 0);
  var wall3 = glMatrix.vec3.fromValues(0, 1, 0);
  var wall4 = glMatrix.vec3.fromValues(0, -1, 0);
  var wall5 = glMatrix.vec3.fromValues(0, 0, 1);
  var wall6 = glMatrix.vec3.fromValues(0, 0, -1);
  wallNormals.push(wall1);
  wallNormals.push(wall2);
  wallNormals.push(wall3);
  wallNormals.push(wall4);
  wallNormals.push(wall5);
  wallNormals.push(wall6);
  // Compile and link a shader program.
  setupShaders();

  // Create a sphere mesh and set up WebGL buffers for it.
  sphere1 = new Sphere(5);
  sphere1.setupBuffers(shaderProgram);
  
  // Create the projection matrix with perspective projection.
  const near = 0.1;
  const far = 200.0;
  glMatrix.mat4.perspective(projectionMatrix, degToRad(45), 
                            gl.viewportWidth / gl.viewportHeight,
                            near, far);
    
  // Set the background color to black (you can change this if you like).    
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  // Start animating.
  requestAnimationFrame(animate);
}


/**
 * Creates a WebGL 2.0 context.
 * @param {element} canvas The HTML5 canvas to attach the context to.
 * @return {Object} The WebGL 2.0 context.
 */
function createGLContext(canvas) {
  var context = null;
  context = canvas.getContext("webgl2");
  if (context) {
    context.viewportWidth = canvas.width;
    context.viewportHeight = canvas.height;
    console.log(canvas.height);
    console.log(canvas.width);
  } else {
    alert("Failed to create WebGL context!");
  }
  return context;
}

function handleKeyDown(event) {
  console.log("Key down ", event.key, " code ", event.code);
  if (event.key == "ArrowDown" || event.key == "ArrowUp")
    event.preventDefault();
  keys[event.key] = true;
}

function handleKeyUp(event) {
  console.log("Key up ", event.key, " code ", event.code);
  keys[event.key] = false;
}

/**
 * Loads a shader from the HTML document and compiles it.
 * @param {string} id ID string of the shader script to load.
 */
function loadShaderFromDOM(id) {
  var shaderScript = document.getElementById(id);
    
  // Return null if we don't find an element with the specified id
  if (!shaderScript) {
    return null;
  }
    
  var shaderSource = shaderScript.text;
  
  var shader;
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }
  
  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);
  
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  } 
  return shader; 
}


/**
 * Sets up the vertex and fragment shaders.
 */
function setupShaders() {
  // Compile the shaders' source code.
  vertexShader = loadShaderFromDOM("shader-vs");
  fragmentShader = loadShaderFromDOM("shader-fs");
  
  // Link the shaders together into a program.
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Failed to setup shaders");
  }

  // If you have multiple different shader programs, you'll need to move this
  // function to draw() and call it whenever you want to switch programs
  gl.useProgram(shaderProgram);

  // Query the index of each attribute and uniform in the shader program.
  shaderProgram.locations = {};
  shaderProgram.locations.vertexPosition =
    gl.getAttribLocation(shaderProgram, "vertexPosition");
  shaderProgram.locations.vertexNormal =
    gl.getAttribLocation(shaderProgram, "vertexNormal");

  shaderProgram.locations.modelViewMatrix =
    gl.getUniformLocation(shaderProgram, "modelViewMatrix");
  shaderProgram.locations.projectionMatrix =
    gl.getUniformLocation(shaderProgram, "projectionMatrix");
  shaderProgram.locations.normalMatrix =
    gl.getUniformLocation(shaderProgram, "normalMatrix");

  shaderProgram.locations.kAmbient =
    gl.getUniformLocation(shaderProgram, "kAmbient");
  shaderProgram.locations.kDiffuse =
    gl.getUniformLocation(shaderProgram, "kDiffuse");
  shaderProgram.locations.kSpecular =
    gl.getUniformLocation(shaderProgram, "kSpecular");
  shaderProgram.locations.shininess =
    gl.getUniformLocation(shaderProgram, "shininess");
  
  shaderProgram.locations.lightPosition =
    gl.getUniformLocation(shaderProgram, "lightPosition");
  shaderProgram.locations.ambientLightColor =
    gl.getUniformLocation(shaderProgram, "ambientLightColor");
  shaderProgram.locations.diffuseLightColor =
  gl.getUniformLocation(shaderProgram, "diffuseLightColor");
  shaderProgram.locations.specularLightColor =
  gl.getUniformLocation(shaderProgram, "specularLightColor");
}

//-----------------------------------------------------------------------------
// Animation functions (run every frame)
/**
 * Draws the current frame and then requests to draw the next frame.
 * @param {number} currentTime The elapsed time in milliseconds since the
 *    webpage loaded. 
 */
function animate(currentTime) {
  if(keys["w"]) {
    for(var i = 0; i < 5; ++i) generateParticle();
  }
  if(keys["s"]) {
    particles = [];
  }
  // Add code here using currentTime if you want to add animations
  // Set up the canvas for this frame
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  var modelMatrix = glMatrix.mat4.create();
  var viewMatrix = glMatrix.mat4.create();
  // Create the view matrix using lookat.
  const lookAtPt = glMatrix.vec3.fromValues(0.0, 0.0, 0.0);
  const eyePt = glMatrix.vec3.fromValues(4.0, -4.0, 10.0);
  const up = glMatrix.vec3.fromValues(0.0, 1.0, 0.0); 
  glMatrix.mat4.lookAt(viewMatrix, eyePt, lookAtPt, up);

  // Concatenate the model and view matrices.
  // Remember matrix multiplication order is important.
  // Transform the light position to view coordinates
  var lightPosition = glMatrix.vec3.fromValues(5, 5, -5);
  glMatrix.vec3.transformMat4(lightPosition, lightPosition, viewMatrix);
  setLightUniforms(lAmbient, lDiffuse, lSpecular, lightPosition);
  for(var i = 0; i < particles.length; ++i){
    var time = Date.now();
    var particle = particles[i];
    setMaterialUniforms(particle.ambient, particle.diffuse, kSpecular, shininess);
    var pos = glMatrix.vec3.create();
    if(!particle.stop) {
      glMatrix.vec3.scale(pos, particle.vel, (time - lastTime)/100);
      glMatrix.vec3.add(pos, pos, particle.pos);
      // compute new velocity from gravity
      // 4 by 4 canvas(wall position)
      var velocity = glMatrix.vec3.create();
      // apply the drag and gravity for next frame velocity
      glMatrix.vec3.scale(velocity, particle.vel, Math.pow(drag, (time - lastTime) / 100));
      var deltaVelocity = glMatrix.vec3.create();
      glMatrix.vec3.scale(deltaVelocity, gravity, (time - lastTime) / 100);
      glMatrix.vec3.add(velocity, velocity, deltaVelocity);
      //find the first collison
      //have the final position to be the collison postion with the wall
      //reflect incoming velocity vector around the normal of the wall
      var collisonTime = Number.MAX_SAFE_INTEGER;
      var wall = 0;
      for(var j = 0; j < 3; ++j) {
        var coordinate = pos[j];
        var vel = particle.vel[j];
        // hits wall, find the smallest collison time
        if(Math.abs(coordinate + particle.rad) >= 4 || Math.abs(coordinate - particle.rad) >= 4) {
          if(vel > 0)
          var t = ((4 - particle.rad - particle.pos[j]) / vel);
          else
          var t = ((-4 - particle.rad - particle.pos[j]) / vel);
          if (t < collisonTime) {
            collisonTime = t;
            if(vel > 0)
              wall = wallNormals[j * 2];
            else
              wall = wallNormals[1 + 2 * j];
          }
        }
      }
      // collison happens
      if(collisonTime != Number.MAX_SAFE_INTEGER) {
        console.log(collisonTime);
        var delta = glMatrix.vec3.create();
        glMatrix.vec3.scale(delta, particle.vel, collisonTime / 100);
        glMatrix.vec3.add(pos, particle.pos, delta);
        var reflectVel = glMatrix.vec3.create();
        glMatrix.vec3.scale(reflectVel, wall, 2 * glMatrix.vec3.dot(wall, particle.vel));
        glMatrix.vec3.subtract(velocity, particle.vel, reflectVel);
        glMatrix.vec3.scale(velocity, velocity, 0.8);
        if(velocity[1] < 0.5 && velocity[0] < 0.5 && velocity[2] < 0.5 && wall == wallNormals[3])
        particle.stop = true;

      }
      particle.setPos(pos);
      particle.setVel(velocity);
    }
    glMatrix.mat4.fromTranslation(modelMatrix, particle.pos)
    glMatrix.mat4.scale(modelMatrix, modelMatrix, glMatrix.vec3.fromValues(particle.rad, particle.rad, particle.rad))
    glMatrix.mat4.multiply(modelViewMatrix, viewMatrix, modelMatrix);
    setMatrixUniforms();
    sphere1.bindVAO();
    gl.drawArrays(gl.TRIANGLES, 0, sphere1.numTriangles*3);
    sphere1.unbindVAO();
  }
  // You can draw multiple spheres by changing the modelViewMatrix, calling
  // setMatrixUniforms() again, and calling gl.drawArrays() again for each
  // sphere. You can use the same sphere object and VAO for all of them,
  // since they have the same triangle mesh.
  // Use this function as the callback to animate the next frame.
  lastTime = time;
  requestAnimationFrame(animate);
}

/**
 * Generate a new random particle
 */
function generateParticle() {
  const MaxVelocity = 1;
  var x = Math.random() * (maxX - minX) + minX;
  var y = Math.random() * (maxY - minY) + minY;
  var z = Math.random() * (maxZ - minZ) + minZ;
  var pos = glMatrix.vec3.fromValues(x, y, z);
  var Vx = Math.random() * MaxVelocity;
  var Vy = Math.random() * MaxVelocity;
  var Vz = Math.random() * MaxVelocity;
  var vel = glMatrix.vec3.fromValues(Vx, Vy, Vz);
  var rad = Math.random() * (0.6 - 0.4) + 0.4
  var ambientX = Math.random() * 1
  var ambientY = Math.random() * 1
  var ambientZ = Math.random() * 1
  var diffuseX = Math.random() * 1
  var diffuseY = Math.random() * 1
  var diffuseZ = Math.random() * 1
  var ambient = glMatrix.vec3.fromValues(ambientX, ambientY, ambientZ);
  var diffuse  = glMatrix.vec3.fromValues(diffuseX, diffuseY, diffuseZ);
  var particle = new Particle(pos, vel, rad, ambient, diffuse);
  particles.push(particle);
}
/**
 * Sends the three matrix uniforms to the shader program.
 */
function setMatrixUniforms() {
  gl.uniformMatrix4fv(shaderProgram.locations.modelViewMatrix, false,
                      modelViewMatrix);
  gl.uniformMatrix4fv(shaderProgram.locations.projectionMatrix, false,
                      projectionMatrix);

  // We want to transform the normals by the inverse-transpose of the
  // Model/View matrix
  glMatrix.mat3.fromMat4(normalMatrix,modelViewMatrix);
  glMatrix.mat3.transpose(normalMatrix,normalMatrix);
  glMatrix.mat3.invert(normalMatrix,normalMatrix);

  gl.uniformMatrix3fv(shaderProgram.locations.normalMatrix, false,
                      normalMatrix);
}


/**
 * Sends material properties to the shader program.
 * @param {Float32Array} a Ambient material color.
 * @param {Float32Array} d Diffuse material color.
 * @param {Float32Array} s Specular material color.
 * @param {Float32} alpha shininess coefficient
 */
function setMaterialUniforms(a, d, s, alpha) {
  gl.uniform3fv(shaderProgram.locations.kAmbient, a);
  gl.uniform3fv(shaderProgram.locations.kDiffuse, d);
  gl.uniform3fv(shaderProgram.locations.kSpecular, s);
  gl.uniform1f(shaderProgram.locations.shininess, alpha);
}


/**
 * Sends light information to the shader program.
 * @param {Float32Array} a Ambient light color/intensity.
 * @param {Float32Array} d Diffuse light color/intensity.
 * @param {Float32Array} s Specular light color/intensity.
 * @param {Float32Array} loc The light position, in view coordinates.
 */
function setLightUniforms(a, d, s, loc) {
  gl.uniform3fv(shaderProgram.locations.ambientLightColor, a);
  gl.uniform3fv(shaderProgram.locations.diffuseLightColor, d);
  gl.uniform3fv(shaderProgram.locations.specularLightColor, s);
  gl.uniform3fv(shaderProgram.locations.lightPosition, loc);
}

