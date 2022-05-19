/**
 * @file Terrain.js - A simple 3D terrain model for WebGL
 * @author Ian Rudnick <itr2@illinois.edu>
 * @brief Starter code for CS 418 MP2 at the University of Illinois at
 * Urbana-Champaign.
 * 
 * Updated Spring 2021 for WebGL 2.0/GLSL 3.00 ES.
 * 
 * You'll need to implement the following functions:
 * setVertex(v, i) - convenient vertex access for 1-D array
 * getVertex(v, i) - convenient vertex access for 1-D array
 * generateTriangles() - generate a flat grid of triangles
 * shapeTerrain() - shape the grid into more interesting terrain
 * calculateNormals() - calculate normals after warping terrain
 * 
 * Good luck! Come to office hours if you get stuck!
 */

 class Terrain {   
    /**
     * Initializes the members of the Terrain object.
     * @param {number} div Number of triangles along the x-axis and y-axis.
     * @param {number} minX Minimum X coordinate value.
     * @param {number} maxX Maximum X coordinate value.
     * @param {number} minY Minimum Y coordinate value.
     * @param {number} maxY Maximum Y coordinate value.
     */
    constructor(div, minX, maxX, minY, maxY) {
        this.div = div;
        this.minX = minX;
        this.minY = minY;
        this.maxX = maxX;
        this.maxY = maxY;
        
        // Allocate the vertex array
        this.positionData = [];
        // Allocate the normal array.
        this.normalData = [];
        // Allocate the triangle array.
        this.faceData = [];
        // Allocate an array for edges so we can draw a wireframe.
        this.edgeData = [];
        console.log("Terrain: Allocated buffers");
        
        this.generateTriangles();
        console.log("Terrain: Generated triangles");
        
        this.generateLines();
        console.log("Terrain: Generated lines");

        this.shapeTerrain();
        console.log("Terrain: Sculpted terrain");

        this.calculateNormals();
        console.log("Terrain: Generated normals");

        // You can use this function for debugging your buffers:
        this.printBuffers();
    }
    

    //-------------------------------------------------------------------------
    // Vertex access and triangle generation - your code goes here!
    /**
     * Set the x,y,z coords of the ith vertex
     * @param {Object} v An array of length 3 holding the x,y,z coordinates.
     * @param {number} i The index of the vertex to set.
     */
    setVertex(v, i) {
        // MP2: Implement this function!
        this.positionData[i * 3] = v[0];
        this.positionData[i * 3 + 1] = v[1];
        this.positionData[i * 3 + 2] = v[2];
    }
    

    /**
     * Returns the x,y,z coords of the ith vertex.
     * @param {Object} v An array of length 3 to hold the x,y,z coordinates.
     * @param {number} i The index of the vertex to get.
     */
    getVertex(v, i) {
        v[0]=this.positionData[i*3];
        v[1]=this.positionData[i*3 + 1];
        v[2]=this.positionData[i*3 + 2];
    }


    /**
     * Generates the vertex data and face data
     */   
    generateTriangles() {
        // MP2: Implement the rest of this function!
        var deltaX=(this.maxX-this.minX)/this.div;
        var deltaY=(this.maxY-this.minY)/this.div;
        for(var i=0;i<=this.div;i++)
           for(var j=0;j<=this.div;j++)
           { 
               this.positionData.push(this.minX+deltaX*j);
               this.positionData.push(this.minY+deltaY*i);
               this.positionData.push(0);
           }
        // // fill face data
        var T = this.div;
        for(var i=1;i<=T;i++) {
            for(var j = 1; j <= T; j++) {
                this.faceData.push(j - 1 + ((i - 1) * (T + 1)));
                this.faceData.push(j + ((i - 1) * (T + 1)));
                this.faceData.push(T + j + ((i - 1) * (T + 1)));

                this.faceData.push(j + ((i - 1) * (T + 1)));
                this.faceData.push(T + j + 1 + ((i - 1) * (T + 1)));
                this.faceData.push(T + j + ((i - 1) * (T + 1)));
            }

        }
        // We'll need these to set up the WebGL buffers.
        this.numVertices = this.positionData.length/3;
        this.numFaces = this.faceData.length/3;
    }


    /**
     * Does the faulting process
     */
    shapeTerrain() {
    // MP2: Implement this function!
        var deltaZ = 0.005
        for(var pass = 0; pass < 500; ++pass) {
            var randFloat1 = Math.random();
            var randFloat2 = Math.random();
            var planeX = this.minX + randFloat1 * (this.maxX - this.minX);
            var planeY = this.minY + randFloat2 * (this.maxY - this.minY);
            var randPoint = glMatrix.vec3.fromValues(planeX, planeY, 0);
            var randNorm = glMatrix.vec3.create();
            glMatrix.vec3.random(randNorm);
            randNorm[2] = 0;

            for(var i = 0; i < this.numVertices; ++i) {
                var vertex = glMatrix.vec3.create();
                this.getVertex(vertex, i);
                glMatrix.vec3.subtract(vertex, vertex, randPoint);
                var dot = glMatrix.vec3.dot(vertex, randNorm);
                if(dot >= 0) {
                    vertex[2] += deltaZ;
                }
                else{
                    vertex[2] -= deltaZ;
                }
                var oldVertex = glMatrix.vec3.create();
                this.getVertex(oldVertex, i);
                oldVertex[2] = vertex[2];
                this.setVertex(oldVertex, i);
            }
            deltaZ = deltaZ;
        }
    }
    /**
     * Get the min height of the terrain
     */
    getMinElevation() {
        var minElevation = Number.MAX_SAFE_INTEGER
        for(var i = 0; i < this.numVertices; i++) {
            var vertex = glMatrix.vec3.create();
            this.getVertex(vertex, i);
            if(vertex[2] < minElevation)
                minElevation = vertex[2];
        }
        return minElevation;
    }

    /**
     * Get the max height of the terrain
     */
    getMaxElevation() {
        var maxElevation = Number.MIN_SAFE_INTEGER;
        for(var i = 0; i < this.numVertices; i++) {
            var vertex = glMatrix.vec3.create();
            this.getVertex(vertex, i);
            if(vertex[2] >= maxElevation)
                maxElevation = vertex[2];
        }
        return maxElevation;
    }

    /**
     * Calculates the per vertex normal for each vertex
     */
    calculateNormals() {
        // MP2: Implement this function!
        // initialize normalData?
        for(var i = 0; i < this.numVertices; ++i) {
            this.normalData.push(0);
            this.normalData.push(0);
            this.normalData.push(0);
        }
        
        for(var i = 0; i < this.numFaces; ++i) {
            //get the index of each vertex
            var index1 = this.faceData[i * 3];
            var index2 = this.faceData[i * 3 + 1];
            var index3 = this.faceData[i * 3 + 2];
            // get the vertex
            var v1 = glMatrix.vec3.create();
            var v2 = glMatrix.vec3.create();
            var v3 = glMatrix.vec3.create();
            this.getVertex(v1, index1);
            this.getVertex(v2, index2);
            this.getVertex(v3, index3);
            // v2 - v1
            var v2_v1 = glMatrix.vec3.create();
            glMatrix.vec3.subtract(v2_v1, v2, v1);
            // v3 - v1
            var v3_v1 = glMatrix.vec3.create();
            glMatrix.vec3.subtract(v3_v1, v3, v1);
            // compute norm for the triangle
            var norm = glMatrix.vec3.create();
            // norm = (v2 - v1) x (v3 - v1)
            glMatrix.vec3.cross(norm, v2_v1, v3_v1);
            glMatrix.vec3.scale(norm, norm, 0.5);
            // add this norm to all three vertices in norm_data;
            this.normalData[index1 * 3] += norm[0];
            this.normalData[index2 * 3] += norm[0];
            this.normalData[index3 * 3] += norm[0];

            this.normalData[index1 * 3 + 1] += norm[1];
            this.normalData[index2 * 3 + 1] += norm[1];
            this.normalData[index3 * 3 + 1] += norm[1];

            this.normalData[index1 * 3 + 2] += norm[2];
            this.normalData[index2 * 3 + 2] += norm[2];
            this.normalData[index3 * 3 + 2] += norm[2];
        }
            // normalize
            for(var i = 0; i < this.numVertices; i++) {
                var norm = glMatrix.vec3.fromValues(this.normalData[i * 3], this.normalData[i * 3 + 1], this.normalData[i * 3 + 2]);
                glMatrix.vec3.normalize(norm, norm);
                this.normalData[i * 3] = norm[0];
                this.normalData[i * 3 + 1] = norm[1];
                this.normalData[i * 3 + 2] = norm[2];
            }
       
    }


    //-------------------------------------------------------------------------
    // Setup code (run once)
    /**
     * Generates line data from the faces in faceData for wireframe rendering.
     */
    generateLines() {
        for (var f = 0; f < this.faceData.length/3; f++) {
            // Calculate index of the face
            var fid = f*3;
            this.edgeData.push(this.faceData[fid]);
            this.edgeData.push(this.faceData[fid+1]);
            
            this.edgeData.push(this.faceData[fid+1]);
            this.edgeData.push(this.faceData[fid+2]);
            
            this.edgeData.push(this.faceData[fid+2]);
            this.edgeData.push(this.faceData[fid]);
        }
    }


    /**
     * Sets up the WebGL buffers and vertex array object.
     * @param {object} shaderProgram The shader program to link the buffers to.
     */
    setupBuffers(shaderProgram) {
        // Create and bind the vertex array object.
        this.vertexArrayObject = gl.createVertexArray();
        gl.bindVertexArray(this.vertexArrayObject);

        // Create the position buffer and load it with the position data.
        this.vertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);      
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.positionData),
                      gl.STATIC_DRAW);
        this.vertexPositionBuffer.itemSize = 3;
        this.vertexPositionBuffer.numItems = this.numVertices;
        console.log("Loaded ", this.vertexPositionBuffer.numItems, " vertices.");

        // Link the position buffer to the attribute in the shader program.
        gl.vertexAttribPointer(shaderProgram.locations.vertexPosition,
                               this.vertexPositionBuffer.itemSize, gl.FLOAT, 
                               false, 0, 0);
        gl.enableVertexAttribArray(shaderProgram.locations.vertexPosition);
    
        // Specify normals to be able to do lighting calculations
        this.vertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normalData),
                      gl.STATIC_DRAW);
        this.vertexNormalBuffer.itemSize = 3;
        this.vertexNormalBuffer.numItems = this.numVertices;
        console.log("Loaded ", this.vertexNormalBuffer.numItems, " normals.");

        // Link the normal buffer to the attribute in the shader program.
        gl.vertexAttribPointer(shaderProgram.locations.vertexNormal,
                               this.vertexNormalBuffer.itemSize, gl.FLOAT, 
                               false, 0, 0);
        gl.enableVertexAttribArray(shaderProgram.locations.vertexNormal);
    
        // Set up the buffer of indices that tells WebGL which vertices are
        // part of which triangles.
        this.triangleIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.triangleIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.faceData),
                      gl.STATIC_DRAW);
        this.triangleIndexBuffer.itemSize = 1;
        this.triangleIndexBuffer.numItems = this.faceData.length;
        console.log("Loaded ", this.triangleIndexBuffer.numItems, " triangles.");
    
        // Set up the index buffer for drawing edges.
        this.edgeIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.edgeIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.edgeData),
                      gl.STATIC_DRAW);
        this.edgeIndexBuffer.itemSize = 1;
        this.edgeIndexBuffer.numItems = this.edgeData.length;
        
        // Unbind everything; we want to bind the correct element buffer and
        // VAO when we want to draw stuff
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
    }
    

    //-------------------------------------------------------------------------
    // Rendering functions (run every frame in draw())
    /**
     * Renders the terrain to the screen as triangles.
     */
    drawTriangles() {
        gl.bindVertexArray(this.vertexArrayObject);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.triangleIndexBuffer);
        gl.drawElements(gl.TRIANGLES, this.triangleIndexBuffer.numItems,
                        gl.UNSIGNED_INT,0);
    }
    

    /**
     * Renders the terrain to the screen as edges, wireframe style.
     */
    drawEdges() {
        gl.bindVertexArray(this.vertexArrayObject);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.edgeIndexBuffer);
        gl.drawElements(gl.LINES, this.edgeIndexBuffer.numItems,
                        gl.UNSIGNED_INT,0);   
    }


    //-------------------------------------------------------------------------
    // Debugging
    /**
     * Prints the contents of the buffers to the console for debugging.
     */
    printBuffers() {
        for (var i = 0; i < this.numVertices; i++) {
            console.log("v ", this.positionData[i*3], " ", 
                              this.positionData[i*3 + 1], " ",
                              this.positionData[i*3 + 2], " ");
        }
        for (var i = 0; i < this.numVertices; i++) {
            console.log("n ", this.normalData[i*3], " ", 
                              this.normalData[i*3 + 1], " ",
                              this.normalData[i*3 + 2], " ");
        }
        for (var i = 0; i < this.numFaces; i++) {
            console.log("f ", this.faceData[i*3], " ", 
                              this.faceData[i*3 + 1], " ",
                              this.faceData[i*3 + 2], " ");
        }  
    }

} // class Terrain