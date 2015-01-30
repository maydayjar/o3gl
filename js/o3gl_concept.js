
/*
	program.
	Set("uP",1,0,0).
	Set("aV", ab.pointer().stride(0).offset(0)).			
	Set("sampler", t1).

	Color(t1.level(0)).
	Depth(depthBuffer).depthMask(true).depthTest(true).
	Elements(elementArray)
	DrawTriangles(indexes, 0, 6).toFrameBuffer(frameBuffer);
*/

/*
	Program - is executable code
	instance 	- pointer to drawcall data. vao 
				- 
	
*/

/*
// GL object groups concept
- Programs with precompiled shaders
- Vertex Array Object
- Frame Buffer objects

*/

/*
// OBJECT concept
- Has assotiated VAO and UAO that are applied to any program within
- elements array
- first and count
- draw mode 
- Can have one or more 'methods' that are programs
- Can be 'abstract' and extended
- Every method is passed it's output (textures, depthBuffer)

o3gl.createObject().

// Entities
Geometry 
	VAO
	Elements
	first/last

Geometry Assembly
	Triangle
	Line
	Point
	
	
Rasterize
	inputs
		DepthTest
		StencilTest
		Blend 

	outputs
		FrameBuffer
			RenderBuffers 
				Color
				Depth
				Stencil
		
	Viewport
	glDrawMode
	

Program
	DepthTest
	StencilTest
	unitforms
	

// PIPELINE concept

Vertices > Vertex shader > Primitives generation > Rasterization > Fragment shader > Testing/Blending > Framebuffer
o3gl.pipeline().
	vertices(vertexShader).
		elements(buffer).
		set("a1", arrayBuffer.pointer()).
		set("a2", arrayBuffer.pointer()).
	rasterization(fragmentShader).
		first(0).count(6)
		modeTriangleFan()
		modePoints(pointSize)
		modeLines(lineWidth)
		
	
	primitivesGeneration().
	rasterization()
	
// DRAWCALL concept

o3gl.
	drawcall().
	program(program).
	vertexArrayObject(abo).
	frameBufferObject(fbo).
	set("a", vertexes).
	elements(buffer).
	drawTriangles().
	first(0).
	last(100).
	renderBufferColor(texture1, texture2).
	renderBufferDepth().
	depthTest(true).
	depthMask(true).
	viewport()
	

// IMPLICIT INSTANCING concept
Some of the chained methods produce a new program instance 

// EXPLICIT INSTANCING concept
Explicit program instance creation


*/

/**
TODO:
- methods and variables naming convention
- layered concept (based on aspects)
	- client state tracking. Automatic `Use` and `Bind` methods invokation
	- context settings (Buffers types, texture targets, renderbuffer size)
	
	
- hints sucks
	
- aspects
*/

/**
program.VertexArray(); 				// return default
program.VertexArrayt(customVAO); 		// set up new
program.FrameBuffer();				// default frame buffer
program.FrameBuffer(custom FBO);		// default frame buffer

program.Color(texture0, texture1);
program.Depth(texture2);		// Depth texture extension
program.Stencil(rbDepth);		// Depth texture extension DepthMask(true)

program.DepthTest(true);		// Depth texture extension
program.DepthMask(true);		// Depth texture extension


*/



















/*
new Aspect(o3gl.FrameBufferDefault).
deffer(
	function() {
		return isBound
	}
	,
	"Viewport",
	"ClearColorBuffer",
	"ClearDepthBuffer",
	"Clear",
	"DepthMask",
	"DepthTest",
	"ColorMask",
	"SetClearColor",
	"SetClearDepth",
	
)


"Viewport",
"ClearColorBuffer",
"ClearDepthBuffer",
"Clear",
"DepthMask",
"DepthTest",
"ColorMask",
"SetClearColor",
"SetClearDepth"
)
*/

/**
new Aspect(o3gl.Program.prototype).
deffer("Set", "isUsed").
after("Use").triggerDeffered()


deffered(o3gl.Program.prototype).
methods("Set").
condition("isUsed").
triggerAfter("Use")


deffered(
	o3gl.Program.prototype,
	"Set", 
	"isUsed",
)


if (this.isUsed()) {
	method();
} else {
	
}

*/

function Aspect(object) {
	this.object = object;
	this._deffered = [];
}

Aspect.prototype = {
	deffer : function(methodName, condition) {
		var that = this;
		
		// Old method
		var method = this.object[methodName];
		
		// Wrapped
		this.object[methodName] = function() {
			var args = arguments;
			
			if (condition.apply(this, args)) {
				// Invoke directly
				method.apply(this, args);				
			} else {
				// Put to the deffered methods queue
				that._deffered
			}			
		}
		
	}
	,
	invokeDeffereds : function() {
		
	}
	,
	before : function(methodName, beforeAdvice) {
		// Old method
		var method = this.object[methodName];
		
		// Wrapped
		this.object[methodName] = function() {
			var args = arguments;
			beforeAdvice.apply(this, args);
			method.apply(this, args);
		}
	}
	,
	after : function(methodName, afterAdvice) {
		// Old method
		var method = this.object[methodName];
		
		// Wrapped
		this.object[methodName] = function() {
			var args = arguments;
			method.apply(this, args);
			afterAdvice.apply(this, args);
		}		
	}
	,

}