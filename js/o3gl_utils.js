(function () {

O3GL_CORE = O3GL;

O3GL = function (gl) {

o3gl = O3GL_CORE(gl);

/**
 *
 * @param {Shader} shader1
 * @param {Shader} shader2
 * @constructor
 */
o3gl.ProgramInstance = function(program) {
	if (program instanceof o3gl.Program) {
		this._program = program;
	}

	if (program instanceof o3gl.ProgramSources) {
		this._programSources = program;
	}
	
	// Map of uniforms values (excludes samplers)
	this._uniforms = {}; // name / arguments pairs

	// Key is program sample name, value is texture or sampler. Samplers are treated in different way than uniforms
	this._samplers = {};

	// Map of sampler uniforms values
	this._attributes = {}; // name / arguments pairs	
	
	// Assotiate new FBO with program;
	this._frameBuffer = null;
	
	// Assotiated element array buffer. It makes 
	this._elementArrayBuffer = null;
		
	// Assotiate new VAO with program
	this._vertexArray = null;
	
	// Uniform block name and uniform buffer pointer relation
	this._uniformBuffers = null;
	
	// Viewport binding
	this._viewport = null;
	
	// Depth test binding
	this._depthTest = null;

	// Blend function
	this._glBlendFactorSrc = null;

	// Blend function
	this._glBlendFactorDst = null;
	
	// TODO: Draw call arguments (used in the run method)
	this._elementFirst = null;
	this._elementsCount = null;
	this._instancesCount = null;
	this._drawMode = gl.TRIANGLES;
}

o3gl.ProgramInstance.prototype = {}
o3gl.ProgramInstance.prototype.run = function() {
	this._DrawPrimitives(this._drawMode, this._elementFirst, this._elementsCount, this._instancesCount);
}
o3gl.ProgramInstance.prototype.Delete = function () {
	// TODO: delete assotiated resources ???
	// Generated inner framebuffers / uniform buffers / vertex 
}
o3gl.ProgramInstance.prototype._isUniform = function(name) {
	if (this._program) return this._program._isUniform(name);
	if (this._programSources) return this._programSources._isUniform(name);
}
o3gl.ProgramInstance.prototype._isAttribute = function(name) {
	if (this._program) return this._program._isAttribute(name);
	if (this._programSources) return this._programSources._isAttribute(name);
}
o3gl.ProgramInstance.prototype.program = function() {
	if (!this._program) {
		var variables = [];
		for (var name in this._uniforms) {
			variables.push(name);
		}
		for (var name in this._samplers) {
			variables.push(name);
		}
		for (var name in this._attributes) {
			variables.push(name);
		}
		this._program = this._programSources.CreateProgram(variables);
	}
	return this._program;		
}
o3gl.ProgramInstance.prototype.VertexArray = function(value) {
	if (value || value === null) {
		this._vertexArrayObject = value;
	} else {
		if (!this._vertexArrayObject) {
			this._vertexArrayObject = new o3gl.VertexArrayDefault();
		}
	}
	
	if (value) {
		return this;
	} else {
		return this._vertexArrayObject;			
	}		
}
o3gl.ProgramInstance.prototype.FrameBuffer = function(value) {
	if (arguments.length === 1) {
		this._frameBuffer = value;
		return this;
	} else {
		if (!this._frameBuffer) {
			// Create default framebuffer
			this._frameBuffer = new o3gl.FrameBuffer();
		}
		return this._frameBuffer;
	}
}
o3gl.ProgramInstance.prototype.UniformBuffer = function(names) {
	throw new TypeError("Unimplemented method");
}
o3gl.ProgramInstance.prototype.Set = function (name, v1, v2, v3, v4) {	
	if (this._isUniform(name)) {
		if (v1 instanceof o3gl.Texture2D || v1 instanceof o3gl.TextureCubeMap) { // Or sampler :)
			this._samplers[name] = v1;
		} else if (v1.length) {
			this._uniforms[name] = v1;
		} else {
			if (arguments.length === 2) this._uniforms[name] = [v1];
			if (arguments.length === 3) this._uniforms[name] = [v1, v2];
			if (arguments.length === 4) this._uniforms[name] = [v1, v2, v3];
			if (arguments.length === 5) this._uniforms[name] = [v1, v2, v3, v4];
		}
	} else if (this._isAttribute(name)) {
		if (v1 instanceof o3gl.ArrayBuffer) this._attributes[name] = v1.pointer();
		else if (v1 instanceof o3gl.ArrayBuffer.Pointer) this._attributes[name] = v1;
		else {
			if (arguments.length === 2) this._attributes[name] = [v1];
			if (arguments.length === 3) this._attributes[name] = [v1, v2];
			if (arguments.length === 4) this._attributes[name] = [v1, v2, v3];
			if (arguments.length === 5) this._attributes[name] = [v1, v2, v3, v4];
		}
	}
	return this;
}
o3gl.ProgramInstance.prototype.Elements = function(elementArrayBuffer) {
	if (this._vertexArray) {
		this._elementArrayBuffer = null;
		this._vertexArray.Bind().Elements(elementArrayBuffer);
	} else {
		this._elementArrayBuffer = elementArrayBuffer;
	}
	return this;
}
o3gl.ProgramInstance.prototype.DepthMask = function(value) {
	this._depthMask = value ? true : false;
	return this;
}
o3gl.ProgramInstance.prototype.DepthTest = function(value) {
	this._depthTest = value ? true : false;
	return this;
}
o3gl.ProgramInstance.prototype.Stencil = function(attachment) {
	this.FrameBuffer().Bind().Stencil(attachment);
	return this;
}
o3gl.ProgramInstance.prototype.Viewport = function(x,y,width,height) {
	if (arguments.length == 0) {
		this._viewport = null;
	} 
	if (arguments.length == 1) {
		var frameBuffer = arguments[0];
		this._viewport = {
			x:0, y:0, width:frameBuffer.getWidth(), height:frameBuffer.getHeight()
		}
	}
	if (arguments.length == 4) {
		this._viewport = {
			x:x, y:y, width:width, height:height
		}
	}
	return this;
}
o3gl.ProgramInstance.prototype.BlendFunc = function(glBlendFactorSrc, glBlendFactorDst) {
	this._glBlendFactorSrc = glBlendFactorSrc;
	this._glBlendFactorDst = glBlendFactorDst;
	return this;
}
o3gl.ProgramInstance.prototype.BlendFuncSrcAlphaOne = function() {
	return this.BlendFunc(gl.SRC_ALPHA, gl.ONE);
}
o3gl.ProgramInstance.prototype._DrawPrimitives = function(glMode, first, count, primcount) {
	// Get program or create from sources
	var program = this.program();
	
	// Apply uniform values
	if (this._uniformBuffer) {
		this._uniformBuffer.Bind();
	} else {
		for (var name in this._uniforms) {
			var value = this._uniforms[name];
			if (!value) continue;
			program.Uniform(name, value);
		}
	}

	// Bind textures/samplers
	for (var name in this._samplers) {
		var value = this._samplers[name];
		if (!value) continue;
		program.Sampler(name, value);
	}

	// Apply vertex array values
	if (this._vertexArray) {
		this._vertexArray.Bind();
	} else {
		for (var name in this._attributes) {
			var value = this._attributes[name];
			if (!value) continue;
			if (value instanceof o3gl.ArrayBuffer.Pointer) {
				program.AttributePointer(name, value);
			} else {
				program.Attribute(name, value);
			}
		}
		
		if (this._elementArrayBuffer) {
			this._elementArrayBuffer.Bind();
		} else {
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
		}
	}

	
	
	// Apply frame buffer configuration
	if (this._frameBuffer) {
		this._frameBuffer.Bind();
	}
	// Viewport
	if (this._viewport) {
		gl.viewport(this._viewport.x, this._viewport.y, this._viewport.width, this._viewport.height);
	} else if (this._frameBuffer) {
		gl.viewport(0, 0, this._frameBuffer.getWidth(), this._frameBuffer.getHeight());			
	}
	// Depth test		
	if (this._depthTest === true) {
		gl.enable(gl.DEPTH_TEST);
	}
	if (this._depthTest === false) {
		gl.disable(gl.DEPTH_TEST);
	}
	
	if (this._glBlendFactorSrc && this._glBlendFactorDst) {
		if(this._glBlendFactorSrc === gl.ONE && this._glBlendFactorDst === gl.ZERO) {
			gl.disable(gl.BLEND);
		} else {
			gl.enable(gl.BLEND);
			gl.blendFunc(glBlendFactorSrc, glBlendFactorDst);				
		}
	}		
	
	program._DrawPrimitives(glMode, first, count, primcount);
	
	return this;		
}
o3gl.ProgramInstance.prototype.DrawTriangles = function(first, count, primcount) {
	this._DrawPrimitives(gl.TRIANGLES, first, count, primcount);
	return this;
}
o3gl.ProgramInstance.prototype.DrawTriangleStrip = function(first, count, primcount) {
	this._DrawPrimitives(gl.TRIANGLE_STRIP, first, count, primcount);
	return this;
}
o3gl.ProgramInstance.prototype.DrawTriangleFan = function(first, count, primcount) {
	this._DrawPrimitives(gl.TRIANGLE_FAN, first, count, primcount);
	return this;
}
o3gl.ProgramInstance.prototype.DrawPoints = function(first, count, primcount) {
	this._DrawPrimitives(gl.POINTS, first, count, primcount);
	return this;
}
o3gl.ProgramInstance.prototype.DrawLines = function(first, count, primcount) {
	this._DrawPrimitives(gl.LINES, first, count, primcount);
	return this;
}
o3gl.ProgramInstance.prototype.DrawLineStrip = function(first, count, primcount) {
	this._DrawPrimitives(gl.LINE_STRIP, first, count, primcount);
	return this;
}
o3gl.ProgramInstance.prototype.DrawLineLoop = function(first, count, primcount) {
	this._DrawPrimitives(gl.LINE_LOOP, first, count, primcount);
	return this;
}

o3gl.ProgramSources = function(shaderSource1, shaderSource2, shaderSource3) {
	this.programs = {};

	this.shaders = {};

	
	// Collect and prepare shader sources
	this.vertexShaderSource = undefined;
	this.fragmentShaderSource = undefined;
	
	function isO3ShaderFormat(source) {
		if (!source.hasOwnProperty("Vertex")) return false;
		if (!source.hasOwnProperty("Fragment")) return false;
		return true;
	}
	
	if (isO3ShaderFormat(shaderSource1)) {
		this.vertexShaderSource = Preprocessor.getLines(shaderSource1.Vertex);
		this.fragmentShaderSource = Preprocessor.getLines(shaderSource1.Fragment);		
	} else {	
		for (var i = 0; i < arguments.length; ++i) {
			var source = arguments[i];
			if (Preprocessor.isVertexShader(source)) {
				this.vertexShaderSource = Preprocessor.getLines(source);
			}
			if (Preprocessor.isFragmentShader(source)) {
				this.fragmentShaderSource = Preprocessor.getLines(source);
			}
		}
	}
}

o3gl.ProgramSources.prototype = {
	Delete : function() {
		// TODO: Delete all the programs and shaders
	}
	,
	CreateProgram : function() {
		// Accept both varargs and string array
		var identifiers = []
		for (var i = 0; i < arguments.length; ++i) {
			identifiers.push(arguments[i]);
		}
		identifiers = Preprocessor.flatten(identifiers);

		var program = null; this.programs[identifiers];
		if (program == null) {
			var vertexShaderSource 		= this.vertexShaderSource;
			var fragmentShaderSource 	= this.fragmentShaderSource;
			var defined = [];
			if (identifiers && identifiers.length > 0) {
				var defined = [];
				for (var  i = 0; i < identifiers.length; ++i)	 {
					var identifier = identifiers[i];
					defined[identifier] = true;
				}
				// Exclude lines with undeclared variables;
				vertexShaderSource = Preprocessor.excludeUndefined(vertexShaderSource, defined);
				fragmentShaderSource = Preprocessor.excludeUndefined(fragmentShaderSource, defined);				
			}		
			// TODO: shaders cache
			program = o3gl.CreateProgram(
				o3gl.CreateShader(vertexShaderSource.join("\n")) , 
				o3gl.CreateShader(fragmentShaderSource.join("\n"))
			);	
			
			this.programs[identifiers] = program;
		}
		
		return program;
	}
	,
	newInstance : function() {
		return new o3gl.ProgramInstance(this);
	}
	,
	_isUniform : function(name) {
		if (Preprocessor.isUniform(this.vertexShaderSource, name)) return true;
		if (Preprocessor.isUniform(this.fragmentShaderSource, name)) return true;
		return false;
	}
	,
	_isAttribute : function(name) {
		if (Preprocessor.isAttribute(this.vertexShaderSource, name)) return true;
		return false;		
	}
}

o3gl.sources = function(shaderSource1, shaderSource2, shaderSource3) {
	return new o3gl.ProgramSources(shaderSource1, shaderSource2);
}

/* 
	Lazy initializaed image post processing programs preconfigured with plane array buffers
*/
var _programs = [];

var _arrayBufferPlane2DPositions = null;
var _arrayBufferPlane2DTextureCoordinates = null;

o3gl.Postprocess = function(sources, settings) {
	if (!_programs[sources]) {
		_programs[sources] = o3gl.sources(sources).CreateProgram();
	}
	var program = _programs[sources];
	if (!_arrayBufferPlane2DPositions) {
		_arrayBufferPlane2DPositions = o3gl.CreateArrayBuffer().typeFloat(2).Data([
			-1.0,-1.0,
			1.0,-1.0,
			-1.0, 1.0,
			-1.0, 1.0,
			1.0,-1.0,
			1.0, 1.0
		]);
	}
	if (!_arrayBufferPlane2DTextureCoordinates) {
		_arrayBufferPlane2DTextureCoordinates = o3gl.CreateArrayBuffer().typeFloat(2).Data([
			0.0, 0.0,
			1.0, 0.0,
			0.0, 1.0,
			0.0, 1.0,
			1.0, 0.0,
			1.0, 1.0
		]);
	}
	if (settings) {
		for (var key in settings) {
			var value = settings[key];
			program.Set(key, value);
		}
		program.Elements(null).AttributePointer("aPosition", _arrayBufferPlane2DPositions).AttributePointer("aTextureCoordinate", _arrayBufferPlane2DTextureCoordinates).DrawTriangles(0, 6);
	} else {
		return program.Elements(null).AttributePointer("aPosition", _arrayBufferPlane2DPositions).AttributePointer("aTextureCoordinate", _arrayBufferPlane2DTextureCoordinates);
	}
}



	
	return o3gl;
}


/*********************************************
* ASPECT
**********************************************/
function Aspect(object) {
	var _object = object;
	var _deffered = [];

	function Before (object, methodName, advice) {
		var method = object[methodName];
		// Wrapped
		object[methodName] = function() {
			var args = arguments;
			advice.apply(this, args);					
			var result = method.apply(this, args);
			return result;
		}	
	}

	function After (object, methodName, advice) {
		var method = object[methodName];
		// Wrapped
		object[methodName] = function() {
			var args = arguments;
			var result = method.apply(this, args);
			advice.apply(this, args);					
			return result;
		}
	}

	function Around (object, methodName, advice) {
		var method = object[methodName];
		// Wrapped
		object[methodName] = function() {
			var args = arguments;
			var that = this;
			function pointcut() {
				return method.apply(that, args);
			}
			var pointcutName = methodName;
			var pointcutArguments = args;
			return advice.call(this, pointcut, pointcutName, pointcutArguments);
		}
	}

	return {
		before : function(methodName, advice) {			
			if (methodName instanceof Array) {
				for (var i = 0; i < methodName.length; ++i) {
					Before(_object, methodName[i], advice);
				}
			}
			else if (methodName instanceof RegExp) {
				for (var propertyName in _object) {
					if (!propertyName.match(methodName)) continue;
					Before(_object, propertyName, advice);				
				}			
			} else {
				Before(_object, methodName, advice);
			}			
			return this;
		}
		,
		after : function(methodName, advice) {			
			if (methodName instanceof Array) {
				for (var i = 0; i < methodName.length; ++i) {
					After(_object, methodName[i], advice)
				}
			} else if (methodName instanceof RegExp) {
				for (var propertyName in _object) {
					if (!propertyName.match(methodName)) continue;
					After(_object, propertyName, advice);				
				}			
			} else {
				After(_object, methodName, advice);
			}		
			return this;
		}
		,
		around : function(methodName, advice) {			
			if (methodName instanceof Array) {
				for (var i = 0; i < methodName.length; ++i) {
					Around(_object, methodName[i], advice);
				}
			}
			else if (methodName instanceof RegExp) {
				for (var propertyName in _object) {
					if (!propertyName.match(methodName)) continue;
					Around(_object, propertyName, advice);				
				}			
			} else {
				Around(_object, methodName, advice);
			}		
			return this;
		}
		,
		deffer : function(methodName, condition) {
			// Old method
			var method = _object[methodName];

			// Wrapped
			_object[methodName] = function() {
				var methodArgs = arguments;
			
				if (condition.apply(_object, methodArgs)) {
					// Invoke directly
					method.apply(_object, methodArgs);				
				} else {
					// Postpone method invocation
					_deffered.push(function() {
						if (condition.apply(_object, methodArgs)) {
							method.apply(_object, methodArgs);
							// Signal 
							return true;
						} else {
							
							return false;
						}
					});
				}			
			}
			
			return this;
		}
		,
		invokeDeffered : function() {
			var count = _deffered.length;
			for (var i = 0; i < count; ++i) {
				var defferedMethod = _deffered.shift();
				if (defferedMethod()) {
					// invoked. remove from the queue
				} else {
					// not invoked. enqueue again
					_deffered.push(defferedMethod);
				}
			}
		}
		,
		invokeDefferedAfter : function (methodName) {
			var that = this;
			this.after(methodName, function() {
				that.invokeDeffered();
			});
			return this;
		}
	}	
}

// Client state tracking
/*
isCurrentProgram : function() {
	return this.programId === gl.getParameter(gl.CURRENT_PROGRAM);
}	
isRenderBufferBinding : function() {
	return this._renderBufferId === gl.getParameter(gl.RENDERBUFFER_BINDING);
}
isFrameBufferBinding : function() {
	return this.frameBufferId === gl.getParameter(gl.FRAMEBUFFER_BINDING);
}
isTextureBinding2D : function() {
	return this._textureId === gl.getParameter(gl.TEXTURE_BINDING_2D);
}
isTextureBindingCubeMap : function() {
	return this._textureId === gl.getParameter(gl.TEXTURE_BINDING_CUBE_MAP);
}
isArrayBufferBinding : function() {
	return this._bufferId === gl.getParameter(gl.ARRAY_BUFFER_BINDING);
}
isElementArrayBufferBinding : function() {
	return this._bufferId === gl.getParameter(gl.ELEMENT_ARRAY_BUFFER_BINDING);			
}
*/

/*
// Enable Client state tracking
Aspect(o3gl.Texture2D.prototype).after("Bind", 			function() { o3gl.TEXTURE_BINDING_2D = this; });
Aspect(o3gl.TextureCubeMap.prototype).after("Bind", 	function() { o3gl.TEXTURE_BINDING_CUBE_MAP = this;});
Aspect(o3gl.ArrayBuffer.prototype).after("Bind", 		function() { o3gl.ARRAY_BUFFER_BINDING = this;});
Aspect(o3gl.ElementArrayBuffer.prototype).after("Bind", function() { o3gl.ELEMENT_ARRAY_BUFFER_BINDING = this;});
Aspect(o3gl.FrameBuffer.prototype).after("Bind", 		function() { o3gl.FRAMEBUFFER_BINDING = this;});
Aspect(o3gl.RenderBuffer.prototype).after("Bind", 		function() { o3gl.RENDERBUFFER_BINDING = this;});
Aspect(o3gl.Program.prototype).after("Use", 			function() { o3gl.CURRENT_PROGRAM = this;});

Aspect(o3gl.Texture2D.prototype).before(/^GenerateMipmap$|^Filter|^Wrap|^Image$/, 		function() { if (o3gl.TEXTURE_BINDING_2D !== this) this.Bind(); } );
Aspect(o3gl.TextureCubeMap.prototype).before(/^GenerateMipmap$|^Filter|^Wrap|^Image$/, 	function() { if (o3gl.TEXTURE_BINDING_CUBE_MAP !== this) this.Bind(); } );
Aspect(o3gl.ArrayBuffer.prototype).before(/^Data$/, 									function() { if (o3gl.ARRAY_BUFFER_BINDING !== this) this.Bind(); } );
Aspect(o3gl.ElementArrayBuffer.prototype).before(/^Data$/, 								function() { if (o3gl.ELEMENT_ARRAY_BUFFER_BINDING !== this) this.Bind(); } );
Aspect(o3gl.FrameBuffer.prototype).before(/^ClearColorBuffer$|^ClearDepthBuffer$|^Clear$|^Color$|^Depth$|^Stencil$/, function() { if (o3gl.FRAMEBUFFER_BINDING !== this) this.Bind(); } );
Aspect(o3gl.RenderBuffer.prototype).before(/^Storage$/, 								function() { if (o3gl.RENDERBUFFER_BINDING !== this) this.Bind(); } );
Aspect(o3gl.Program.prototype).before(/^Uniform|^Draw/, 		function() { if (o3gl.CURRENT_PROGRAM !== this) this.Use(); } );	// Attributes values do not require program to be current but uniforms do.

//Aspect(o3gl.Program.prototype).before(/^Set$|^Uniform|^Attribute|^Clear|^Draw/, 		function() { if (o3gl.CURRENT_PROGRAM !== this) this.Use(); } );

Aspect(o3gl.Program.prototype).around(/^DepthMask$|^DepthTest$|^ColorMask$|^ClearColor$|^ClearDepth$|^Blend$|^BlendFunc$|^Viewport$/, function (pointcut, name, arguments) {
	if (!this._deffered) {
		this._deffered = {};
	}
	this._deffered[name] = pointcut;
	return pointcut();
});
Aspect(o3gl.Program.prototype).after(/^Use$/, function() {
	if (this._deffered) {
		for (var name in this._deffered) {
			this._deffered[name] ();
		}
	}
});
*/

/*********************************************
* 			GLSL SHADER PREPROCESSOR
**********************************************/	
var Preprocessor = {
	flatten : function () {
		var result = [];
		for (var i = 0; i < arguments.length; ++i) {
			var argument = arguments[i];
			if (argument instanceof Array) {
				for (var j = 0; j < argument.length; ++j) {
					result = result.concat(Preprocessor.flatten(argument[j]));
				}
			} else {
				result.push(argument);
			}
		}
		return result;		
	}
	,
	getLines : function() {
		var lines = [];
		for (var i = 0; i < arguments.length; ++i) {
			var line = arguments[i];
			if (line instanceof Array) {
				for (var j = 0; j < line.length; ++j) {
					lines = lines.concat(this.getLines(line[j]));
				}
			} else {
				var match = line.match(this.regexpLine);
				for(var j = 0; j < match.length; ++j) {
					lines.push(match[j]);
				}
			}
		}
		return lines;
	}
	,
	regexpDeclaration : /(uniform|attribute|varying|const)?\s+(float|int|vec2|vec3|vec4|mat2|mat3|mat4|sampler2D|samplerCube)\s+(\w+)/
	,
	regexpUniformDeclaration : /uniform\s+(float|int|vec2|vec3|vec4|mat2|mat3|mat4|sampler2D|samplerCube)\s+(\w+)/
	,
	regexpAttributeDeclaration : /attribute\s+(float|int|vec2|vec3|vec4|mat2|mat3|mat4|sampler2D|samplerCube)\s+(\w+)/
	,
	regexpAssignment : /(\w+)\s*=([^=;\n]+)/
	,
	regexpLine : /(\#|\{|\}|[^\n\{\};]+[;\n\{]{1})/g
	,
	regexpIdentifier : /([_a-zA-Z]\w*)/g
	,
    regexpMain : /(void)\s*(main)\s*\(\s*\)/
    ,
	regexpShaderVertex : /(attribute|gl_Position)/
	,
	regexpShaderFragment : /(gl_FragColor|gl_FragData|texture2D|textureCube)/
	,
	getDeclarationQualifier : function (line) {
		var match = line.match(this.regexpDeclaration);
		return match && match[1];		
	}
	,
	getDeclarationType : function (line) {
		var match = line.match(this.regexpDeclaration);
		return match && match[2];
	}
	,
	getDeclarationName : function (line) {
		var match = line.match(this.regexpDeclaration);
		return match && match[3];		
	}
	,
	getAssignmentLeft : function (line) {
		var match = line.match(this.regexpAssignment);
		return match && match[1];		
	}
	,
	getAssignmentRight : function (line) {
		var match = line.match(this.regexpAssignment);
		return match && match[2];		
	}
	,
	getDeclarationNames : function (lines) {
		var result = {};
		for (var i = 0; i < lines.length; ++i) {
			var line = lines[i];
			var name = Preprocessor.getDeclarationName(line);
			if (name) {
				result[name] = false;
			}
		}
		return result;
	}
	,
	updateDefinitions : function (line, defined) {
		var left = this.getAssignmentLeft(line);
		if (left) {
			// Handle assignment statement
			var right = this.getAssignmentRight(line);
			for (var name in defined) {
				if (!defined[name] && right.match(name)) return;
			}
			defined[left] = true;
		}
	}
	,
	isDefinitions : function (line, defined) {
		var match = line.match(this.regexpIdentifier);
		if (!match) return true; // Line has no valid identifiers
		for (var name in defined) {
			if (defined[name]) continue;
			for (var i = 0; i < match.length; ++i) {
				if (match[i] === name) return false;
			}
		}
		return true;		
	}
	,
	excludeUndefined : function(lines, defined) {
		var declared = this.getDeclarationNames(lines);
		
		for (var name in declared) {
			defined[name] = defined[name] ? true : false;
		}
		
		for (var i = 0; i < lines.length; ++i) {
			var line = lines[i];
			this.updateDefinitions(line, defined);
		}
		// Now defined contains all the assigned and unassigned variables
		function isLineExcluded(line) {
			return Preprocessor.isDefinitions(line, defined);
		}
		return lines.filter(isLineExcluded);
	}
	,
	isVertexShader : function(lines) {
		if (lines instanceof Array) {
			for (var i = 0; i < lines.length; ++i) {
				var line = lines[i];
				if (this.isVertexShader(line)) return true;
			}
		}
		else {
			var line = lines;
			if(line.match(this.regexpShaderVertex)) return true;
		}
		return false;
	}
	,
	isFragmentShader : function(lines) {
		if (lines instanceof Array) {
			for (var i = 0; i < lines.length; ++i) {
				var line = lines[i];
				if (this.isFragmentShader(line)) return true;
			}
		}
		else {
			var line = lines;
			if(line.match(this.regexpShaderFragment)) return true;
		}
		return false;
	}
	,
	isAttribute : function(lines, name) {
		if (lines instanceof Array) {
			for (var i = 0; i < lines.length; ++i) {
				var line = lines[i];
				if (this.isAttribute(line, name)) return true;
			}
		} else {
			var line = lines;
			if(!line.match(this.regexpAttributeDeclaration)) return false;
			if(!line.match(name)) return false;
			return true;
		}
		return false;
	}
	,
	isUniform : function(lines, name) {
		if (lines instanceof Array) {
			for (var i = 0; i < lines.length; ++i) {
				var line = lines[i];
				if (this.isUniform(line, name)) return true;
			}
		} else {
			var line = lines;
			if(!line.match(this.regexpUniformDeclaration)) return false;
			if(!line.match(name)) return false;
			return true;
		}
	}
}


}
)();
