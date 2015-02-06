function O3GL (context) {
gl = context;
	
/*********************************************
* ASPECT
**********************************************/
function Aspect(object) {
	var _object = object;
	var _deffered = [];
	
	return {
		advice : function(methodName, adviceBefore, adviceAfter) {
			var method = _object[methodName];
			// Wrapped
			_object[methodName] = function() {
				var args = arguments;
				if (adviceBefore) {
					adviceBefore.apply(this, args);					
				}
				var result = method.apply(this, args);
				if (adviceAfter) {
					adviceAfter.apply(this, args);					
				}
				return result;
			}	
			return this;
		}
		,
		
		before : function(methodNameRegExp, advice) {			
			if (methodNameRegExp instanceof String) {
				methodNameRegExp = new RegExp(methodNameRegExp);
			}
			for (var propertyName in _object) {
				if (!propertyName.match(methodNameRegExp)) continue;
				var property = object[propertyName];				
				this.advice(propertyName, advice, null);				
			}			
			return this;
		}
		,
		after : function(methodName, advice) {
			
			if (methodName instanceof String) {
				methodName = new RegExp(methodName);
			}
			
			for (var propertyName in _object) {
				if (!propertyName.match(methodName)) continue;
				var property = object[propertyName];
				this.advice(propertyName, null, advice);				
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

	
	
/*********************************************
* 			UTILS
**********************************************/	
var Utils = {
	getGLTextureId : function(index) {
		var glTextureIds = [
		gl.TEXTURE0,
		gl.TEXTURE1,
		gl.TEXTURE2,
		gl.TEXTURE3,
		gl.TEXTURE4,
		gl.TEXTURE5,
		gl.TEXTURE6,
		gl.TEXTURE7,
		gl.TEXTURE8,
		gl.TEXTURE9,
		gl.TEXTURE10,
		gl.TEXTURE11,
		gl.TEXTURE12,
		gl.TEXTURE13,
		gl.TEXTURE14,
		gl.TEXTURE15,
		gl.TEXTURE16,
		gl.TEXTURE17,
		gl.TEXTURE18,
		gl.TEXTURE19,
		gl.TEXTURE20,
		gl.TEXTURE21,
		gl.TEXTURE22,
		gl.TEXTURE23,
		gl.TEXTURE24,
		gl.TEXTURE25,
		gl.TEXTURE26,
		gl.TEXTURE27,
		gl.TEXTURE28,
		gl.TEXTURE29,
		gl.TEXTURE30,
		gl.TEXTURE31
		];
		return glTextureIds[index];
	}
	,
	createTypedArray : function (glType, array) {
		switch (glType) {
			case gl.BYTE : return new Int8Array(array);
			case gl.UNSIGNED_BYTE : return new Uint8Array(array);
			case gl.SHORT : return new Int16Array(array);
			case gl.UNSIGNED_SHORT : return new Uint16Array(array);
			case gl.INT : return new Int32Array(array);
			case gl.UNSIGNED_INT : return new Uint32Array(array);
			case gl.FLOAT : return new Float32Array(array);
			case gl.DOUBLE : return new Float64Array(array);
		}
		return undefined;
	}
	,
	glArrayType : function (typedArray) {
		if (typedArray instanceof Int8Array) 	return gl.BYTE;
		if (typedArray instanceof Uint8Array) 	return gl.UNSIGNED_BYTE;
		if (typedArray instanceof Int16Array) 	return gl.SHORT;
		if (typedArray instanceof Uint16Array) 	return gl.UNSIGNED_SHORT;
		if (typedArray instanceof Int32Array) 	return gl.INT;
		if (typedArray instanceof Uint32Array) 	return gl.UNSIGNED_INT;
		if (typedArray instanceof Float32Array) return gl.FLOAT;
		if (typedArray instanceof Float64Array) return gl.DOUBLE;
		return undefined;
	}
	,
	glTypeSizeBytes : function (glType) {
		switch (glType) {
			case gl.BYTE : 
				return 1;
			case gl.UNSIGNED_BYTE : 
				return 1;
			case gl.SHORT : 
				return 2;
			case gl.UNSIGNED_SHORT : 
				return 2;
			case gl.INT : 
				return 4;
			case gl.UNSIGNED_INT : 
				return 4;
			case gl.FLOAT : 
				return 4;
			case gl.DOUBLE : 
				return 8;
		}
		return undefined;
	}
	,
	glTypeSizeComponents : function (glType) {
		switch (glType) {
			case gl.FLOAT:			return 1;
			case gl.FLOAT_VEC2:		return 2;
			case gl.FLOAT_VEC3:		return 3;
			case gl.FLOAT_VEC4: 	return 4;
			case gl.INT:			return 1;
			case gl.INT_VEC2:		return 2;
			case gl.INT_VEC3:		return 3;
			case gl.INT_VEC4:		return 4;
			case gl.BOOL:			return 1;
			case gl.BOOL_VEC2:		return 2;
			case gl.BOOL_VEC3:		return 3;
			case gl.BOOL_VEC4:		return 4;
			case gl.FLOAT_MAT2:		return 2;
			case gl.FLOAT_MAT3:		return 3;
			case gl.FLOAT_MAT4:		return 4;
			case gl.SAMPLER_2D:		return 1;
			case gl.SAMPLER_CUBE:	return 1;
		}
		return undefined;
	}
	,
	glShaderType : function (sources) {
        if (!(sources instanceof Array)) sources = [sources];
		if (Preprocessor.isVertexShader(sources)) return gl.VERTEX_SHADER;
		if (Preprocessor.isFragmentShader(sources)) return gl.FRAGMENT_SHADER;
		return undefined;
	}
	,
	counter : function (object, name) {
		var result = 0;		
		for (var prop in object) {
			if (object.hasOwnProperty(prop)) {
				var index = object[prop];
				if (prop === name) return index;
				if (result <= index) result = index + 1; 
			}
		}
		object[name] = result;
		return result;
	}
}

/*********************************************
* 			GLSL SHADER PREPROCESSOR
**********************************************/	
var Preprocessor = {
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
	regexpDeclaration : /(uniform|attribute|varying|const)?\s?(float|int|vec2|vec3|vec4|mat2|mat3|mat4|sampler2D|samplerCube)\s+(\w+)/
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
	regexpShaderFragment : /(gl_FragColor|gl_FragData|texture2D)/
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
}


/*********************************************
* 			GL ENUMS
**********************************************/	

var Parameters = {
	maxVertexTextureImageUnits : function() {
		return gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
	}
	,
	maxTextureImageUnits : function() {
		return gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
	}
	,
	maxCombinedTextureImageUnits : function() {
		return gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
	}
	,
	/**
	* 
	*/
	maxTextureSize : function() {
		return gl.getParameter(gl.MAX_TEXTURE_SIZE);
	}
	,
	maxCubeMapTextureSize : function() {
		return gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);
	}
	,
	maxRenderBufferSize : function() {
		return gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
	}
	,
	maxVertexAttribs : function() {
		return gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
	}
	,
	isFragmentShaderPrecisionHightFloat : function () {
		var highp = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
		var highpSupported = highp.precision != 0;
		return highpSupported;
	}
	,
	isOESTextureFloat : function() {
		return gl.getExtension('OES_texture_float') != null;
	}
	,
	isOESTextureHalfFloat : function() {
		return gl.getExtension('OES_texture_half_float') != null;
	}
}

function BlendFactor() {
	return {
		One 				: gl.ONE,
		Zero 				: gl.ZERO,
		SrcColor 			: gl.SRC_COLOR,
		SrcAlpha 			: gl.SRC_ALPHA,
		DstColor 			: gl.DST_COLOR,
		DstAlpha 			: gl.DST_ALPHA,
		OneMinusSrcColor 	: gl.ONE_MINUS_SRC_COLOR,
		OneMinusSrcAlpha 	: gl.ONE_MINUS_SRC_ALPHA,
		OneMinusDstColor 	: gl.ONE_MINUS_DST_COLOR,
		OneMinusDstAlpha 	: gl.ONE_MINUS_DST_ALPHA
	}
}
		
var o3gl = {		
};

// client state tracking variables
// querying the GL for such information (like currently bound texture id) should be avoided because it has an important performance cost

o3gl.programs 		= [];
o3gl.textures 		= [];
o3gl.buffers 		= [];
o3gl.framebuffers 	= [];
o3gl.renderbuffers 	= [];


o3gl.parameters = [];
o3gl.parameters[gl.ARRAY_BUFFER_BINDING] 			= undefined;
o3gl.parameters[gl.ELEMENT_ARRAY_BUFFER_BINDING] 	= undefined;
o3gl.parameters[gl.FRAMEBUFFER_BINDING] 			= undefined;
o3gl.parameters[gl.RENDERBUFFER_BINDING] 			= undefined;
o3gl.parameters[gl.TEXTURE_BINDING_2D] 				= undefined;
o3gl.parameters[gl.TEXTURE_BINDING_CUBE_MAP] 		= undefined;
o3gl.parameters[gl.CURRENT_PROGRAM] 				= undefined;



/*
Deffered setting cases:
1) array buffer / element array buffer
2) texture 2d/cube
3) render buffer internal format (depth/stencil/color)
4) 


1) Setting hints (target, internal format, data format). 
2) Bind
3) Create/set resource data
4) Adjust/modify resource data

States:
hints
*/

/*
	o3gl.Resource
		o3gl.Texture
			o3gl Texture2D
			o3gl TextureCubeMap

			
		
*/

function Extend(functionDerived, functionBase, properties) {
	functionDerived.prototype = Object.create(functionBase.prototype);	
	if (properties) {
		for (var p in properties) {
			functionDerived.prototype[p] = properties[p];
		}
	}
}

o3gl.Resource = function() {
}

o3gl.Resource.prototype = {
}

o3gl.Texture = function() {
	this._textureId 	= gl.createTexture();	
	// Specifies the target texture. Must be GL_TEXTURE_2D, GL_PROXY_TEXTURE_2D, GL_TEXTURE_1D_ARRAY, GL_PROXY_TEXTURE_1D_ARRAY, GL_TEXTURE_RECTANGLE, GL_PROXY_TEXTURE_RECTANGLE, GL_TEXTURE_CUBE_MAP_POSITIVE_X, GL_TEXTURE_CUBE_MAP_NEGATIVE_X, GL_TEXTURE_CUBE_MAP_POSITIVE_Y, GL_TEXTURE_CUBE_MAP_NEGATIVE_Y, GL_TEXTURE_CUBE_MAP_POSITIVE_Z, GL_TEXTURE_CUBE_MAP_NEGATIVE_Z, or GL_PROXY_TEXTURE_CUBE_MAP.
	this._target 		= undefined;	// gl.TEXTURE_2D;
	// this._targetTexture = undefined;	// gl.TEXTURE_2D;

	// Specifies the level-of-detail number. Level 0 is the base image level. Level n is the nth mipmap reduction image. If target is GL_TEXTURE_RECTANGLE or GL_PROXY_TEXTURE_RECTANGLE, level must be 0.
	//this._level 			= 0; // Mipmap level
	// Specifies the number of color components in the texture.
	this._internalFormat = gl.RGBA; // gl.ALPHA, gl.LUMINANCE, gl.LUMINANCE_ALPHA, gl.RGB, gl.RGBA
	// This value must be 0.
	this._border 		= 0;
	// Specifies the format of the pixel data. The following symbolic values are accepted: GL_RED, GL_RG, GL_RGB, GL_BGR, GL_RGBA, and GL_BGRA.
	this._format 		= gl.RGBA; // Contains the format for the source pixel data. Must match internalformat
	
	// Specifies the data type of the pixel data. 
	// gl.UNSIGNED_BYTE				Provides 8 bits per channel for gl.RGBA.
	// gl.FLOAT						Call getExtension("gl.OES_texture_float") first to enable. This creates 128 bit-per-pixel textures instead of 32 bit-per-pixel for the image.
	// gl.UNSIGNED_SHORT_5_6_5		Represents colors in a Uint16Array where red = 5 bits, green=6 bits, and blue=5 bits.
	// gl.UNSIGNED_SHORT_4_4_4_4	Represents colors in a Uint16Array where red = 4 bits, green=4 bits, blue=4 bits, and alpha=4 bits.
	// gl.UNSIGNED_SHORT_5_5_5_1	Represents colors in a Uint16Array where red = 5 bits, green=5 bits, blue=5 bits and alpha=1 bit.
	this._type 			= gl.UNSIGNED_BYTE;
	
	// auxillary texture size data
	// TODO: Is it impossible to get texture size using gl methods ?
	this._size = [];
		
	// Size must be specified first!	
	this.isPowerOfTwo = function() {
		for (var textureTarget in this._size) {
			for (var i = 0; i < this._size[textureTarget].length; ++i) {
				var dimension = this._size[textureTarget][i];
				if(dimension % 2 !== 0) return false;
			}
		}
		return true;
	}
}

Extend(o3gl.Texture, o3gl.Resource, {
	isBound : function() {
		if (this._target === gl.TEXTURE_2D) {
			return this._textureId === gl.getParameter(gl.TEXTURE_BINDING_2D);
		} 
		if (this._target === gl.TEXTURE_CUBE_MAP) {
			return this._textureId === gl.getParameter(gl.TEXTURE_BINDING_CUBE_MAP);
		} 
		
		return false;		
	}
	,
	Id : function() {
		return this._textureId;
	}
	,
	Delete : function() {
		gl.deleteTexture(this._textureId);
	}
	,
	Bind : function() {
		gl.bindTexture(this._target, this._textureId);
		// Texture itself has no methods except bind.
		return this; // Return intrface with all the texture manipulation API
	}
	,
	typeUnsignedByte : function() { 
		this._type = gl.UNSIGNED_BYTE;
		return this;
	}
	,
	typeFloat : function() { 
		var isExtension = gl.getExtension("OES_texture_float");
		if (isExtension) {
			this._type = gl.FLOAT;
		} else {
			throw new TypeError("Float textures are not supported");
		}
		return this;
	}
});

o3gl.Texture2D = function() {
	// Super constructor
	o3gl.Texture.call(this);
	
	// Target
	this._target = gl.TEXTURE_2D;
}
// Extend Texture
Extend(o3gl.Texture2D, o3gl.Texture,
{
	GenerateMipmap : function() {
		gl.generateMipmap(this._target);
		return this;
	}
	,
	isFilterRequiresMipmap : function() {
		var glMagFilter = gl.getTexParameter(this._target, gl.TEXTURE_MAG_FILTER);
		var glMinFilter = gl.getTexParameter(this._target, gl.TEXTURE_MIN_FILTER);
		var mipmap = {}
		mipmap[gl.LINEAR_MIPMAP_NEAREST] = true;
		mipmap[gl.NEAREST_MIPMAP_NEAREST] = true;
		mipmap[gl.NEAREST_MIPMAP_LINEAR] = true;
		mipmap[gl.LINEAR_MIPMAP_LINEAR] = true;
		if (glMagFilter in mipmap) return true;
		if (glMinFilter in mipmap) return true;
		return false;
//		return true;
	}
	,
	isFrameBufferCompatible : function() {
		if (this.isFilterRequiresMipmap()) return false;
		
		var glWrapS = gl.getTexParameter(this._target, gl.TEXTURE_WRAP_S);
		var glWrapT = gl.getTexParameter(this._target, gl.TEXTURE_WRAP_T);
		
		if (glWrapS !== gl.CLAMP_TO_EDGE) return false;
		if (glWrapT !== gl.CLAMP_TO_EDGE) return false;
		
		return true;
//		return true;
	}
	,
	FilterMagLinear : function () {
		gl.texParameteri(this._target, gl.TEXTURE_MAG_FILTER, gl.LINEAR);		
		return this;
	}
	,
	FilterMagNearest : function () {
		gl.texParameteri(this._target, gl.TEXTURE_MAG_FILTER, gl.NEAREST);		
		return this;
	}
	,
	FilterMagLinearMipmapNearest : function () {
		gl.texParameteri(this._target, gl.TEXTURE_MAG_FILTER, gl.LINEAR_MIPMAP_NEAREST);		
		return this;
	}
	,
	FilterMagLinearMipmapLinear : function () {
		gl.texParameteri(this._target, gl.TEXTURE_MAG_FILTER, gl.LINEAR_MIPMAP_LINEAR);		
		return this;
	}
	,
	FilterMinLinear : function () {
		gl.texParameteri(this._target, gl.TEXTURE_MIN_FILTER, gl.LINEAR);		
		return this;
	}
	,
	FilterMinNearest : function () {
		gl.texParameteri(this._target, gl.TEXTURE_MIN_FILTER, gl.NEAREST);		
		return this;
	}
	,
	/** Use the nearest neighbor in the nearest mipmap level */
	FilterMinNearestMipmapNearest : function () {
		gl.texParameteri(this._target, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);		
		return this;
	}
	,
	/** Linearly interpolate in the nearest mipmap level */
	FilterMinNearestMipmapLinear : function () {
		gl.texParameteri(this._target, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);		
		return this;
	}
	,
	/** Use the nearest neighbor after linearly interpolating between mipmap levels */
	FilterMinLinearMipmapNearest : function () {
		gl.texParameteri(this._target, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);		
		return this;
	}
	,
	/** Linearly interpolate both the mipmap levels and at between texels */
	FilterMinLinearMipmapLinear : function () {
		gl.texParameteri(this._target, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);		
		return this;
	}
    ,
    FilterNearest : function() {
        return this.FilterMinNearest().FilterMagNearest();
    }
    ,
    FilterLinear : function() {
        return this.FilterMinLinear().FilterMagLinear();
    }
    ,
	FilterLinearMipmapLinear : function() {
        return this.FilterMinLinearMipmapLinear().FilterMagLinearMipmapLinear();
    }
    ,
	FilterNearestMipmapNearest : function() {
        return this.FilterMinNearestMipmapNearest().FilterMagNearestMipmapNearest();
    }
    ,
	FilterNearestMipmapLinear : function() {
        return this.FilterMinNearestMipmapLinear().FilterMagNearestMipmapLinear();
    }
    ,
	FilterLinearMipmapNearest : function() {
        return this.FilterMinLinearMipmapNearest().FilterMagLinearMipmapNearest();
    }
    ,
	WrapClampToEdge : function () {
		gl.texParameteri(this._target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(this._target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		return this;
	}
	,
	WrapRepeat : function () {
		gl.texParameteri(this._target, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(this._target, gl.TEXTURE_WRAP_T, gl.REPEAT);
		return this;
	}
	,
	WrapMirroredRepeat : function () {
		gl.texParameteri(this._target, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
		gl.texParameteri(this._target, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
		return this;
	}
	,
	target : function() {
		return new o3gl.Texture2D.Target(this);
	}
	,
	mipmapLevel : function(level) {
		return this.target().mipmapLevel(level);
	}
	,
	Image : function() {
		if (arguments.length === 1) {
			var data = arguments[0];
			this.target().Image(data);
		}
		if (arguments.length === 2) {
			var width = arguments[0];
			var height = arguments[1];
			this.target().Image(width, height);
		}
		return this;
	}
});




/*
	Auxillary class that refers to the texture level and target ()
*/
o3gl.Texture2D.Target = function(texture) {
	this._texture 			= texture;
	this._level 			= 0;
	this._targetTexture		= gl.TEXTURE_2D;
	
	// Texture region:
	this._xOffset			= undefined;
	this._yOffset			= undefined;
	this._width				= undefined;
	this._height			= undefined;
}

o3gl.Texture2D.Target.prototype = {
	mipmapLevel : function (level) {
		this._level = level;
		return this;
	}
	,
	offset : function(xOffset, yOffset) {
		this._xOffset = xOffset;
		this._yOffset = yOffset;		
		return this;
	}
	,
	size : function(width, height) {
		this._width 	= width;
		this._height 	= heigth;		
		return this;
	}
	,
	
	Image : function() {
		this._texture.Bind();
		
		var data;
		var width;
		var height;
		// Collect vararg parameters
		if (arguments.length == 1) {
			data 	= arguments[0];
		}
		if (arguments.length == 2) {
			width 	= arguments[0];
			height 	= arguments[1];
		}
		
		// TODO: we must consider following texture methods:
		// texImage2D						//
		// texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixels)					// Replaces a portion of an existing 2D texture image with all of another image.
		// compressedTexImage2D				//
		// compressedTexSubImage2D			//
		
		// copyTexImage2D(target, level, format, x, y, width, height, border);									// Copies a rectangle of pixels from the current WebGLFramebuffer into a texture image.
		// copyTexSubImage2D(target, level, xoffset, yoffset, x, y, width, height);								// Replaces a portion of an existing 2D texture image with data from the current framebuffer.
		
		if (data) {
			
			if (this._xOffset && this._yOffset) {
				width = data.width;
				height = data.height;
				
				// Subimage
				gl.texSubImage2D(
					this._targetTexture,
					this._level,
					this._xOffset,
					this._yOffset,
					width,
					height,
					// this._texture._internalFormat,  // Internal format is already specified
					this._texture._format, 
					this._texture._type, 
					data
				);
			} else {
				gl.texImage2D(this._targetTexture,
					this._level, 
					this._texture._internalFormat, 
					this._texture._format, 
					this._texture._type, 
					data);		
					
				this._texture._size[this._targetTexture] = [data.width, data.height];
			}
			
		} else if (width && height) {		
			gl.texImage2D(this._targetTexture,
				this._level, 
				this._texture._internalFormat, 
				width, height, 
				this._texture._border, 
				this._texture._format, 
				this._texture._type, null);
				
			this._texture._size[this._targetTexture] = [width, height];				
		}
						
		if (this._texture.isFilterRequiresMipmap()) {
			if (this._texture.isPowerOfTwo()) {
				this._texture.GenerateMipmap();
			} else {
				// Filter settings are incorrect
			}
		}
		
		return this;
	}
}



o3gl.TextureCubeMap = function() {
	// Super constructor
	o3gl.Texture2D.call(this);
	
	// Target cube map
	this._target = gl.TEXTURE_CUBE_MAP;
}
// Extend Texture
Extend(o3gl.TextureCubeMap, o3gl.Texture2D, {
	target : function() {
		return new o3gl.TextureCubeMap.Target(this);
	}
	,
	positiveX : function() {
		return this.target().positiveX();
	}
	,
	positiveY : function() {
		return this.target().positiveY();
	}
	,
	positiveZ : function() {
		return this.target().positiveZ();
	}
	,
	negativeX : function() {
		return this.target().negativeX();
	}
	,
	negativeY : function() {
		return this.target().negativeX();
	}
	,
	negativeZ : function() {
		return this.target().negativeZ();
	}
});

o3gl.TextureCubeMap.Target = function() {
	this._targetTexture = undefined;
}

Extend(o3gl.TextureCubeMap.Target, o3gl.Texture2D.Target,
{
	positiveX : function() {
		this._targetTexture = gl.TEXTURE_CUBE_MAP_POSITIVE_X;
		return this;
	}
	,
	positiveY : function() {
		this._targetTexture = gl.TEXTURE_CUBE_MAP_POSITIVE_Y;
		return this;
	}
	,
	positiveZ : function() {
		this._targetTexture = gl.TEXTURE_CUBE_MAP_POSITIVE_Z;
		return this;
	}
	,
	negativeX : function() {
		this._targetTexture = gl.TEXTURE_CUBE_MAP_NEGATIVE_X;
		return this;
	}
	,
	negativeY : function() {
		this._targetTexture = gl.TEXTURE_CUBE_MAP_NEGATIVE_Y;
		return this;
	}
	,
	negativeZ : function() {
		this._targetTexture = gl.TEXTURE_CUBE_MAP_NEGATIVE_Z;
		return this;
	}
});

/**
* This class implements deffered target and type resolve,
* relying on the buffer's usage context
*/
o3gl.Buffer = function() {
	this._bufferId 		= gl.createBuffer();	
	// Basically usage parameter is a hint to OpenGL/WebGL how you intent to use the buffer. The OpenGL/WebGL can then optimize the buffer depending of your hint.
	this._target 		= undefined;				// gl.ARRAY_BUFFER gl.ELEMENT_ARRAY_BUFFER
	this._usage 		= gl.STATIC_DRAW;			// gl.STATIC_DRAW gl.DYNAMIC_DRAW
	this._type 			= undefined;				// Component type HINT. Used by pointers as default value
}

Extend(o3gl.Buffer, o3gl.Resource, {
	isBound : function() {
		if (this._target === gl.ARRAY_BUFFER) {
			return this._bufferId === gl.getParameter(gl.ARRAY_BUFFER_BINDING);
		}
		if (this._target === gl.ELEMENT_ARRAY_BUFFER) {
			return this._bufferId === gl.getParameter(gl.ELEMENT_ARRAY_BUFFER_BINDING);			
		}	
		return false;
	}
	,
	Id : function() {
		return this._bufferId;
	}
	,
	Delete : function() {
		gl.deleteBuffer(this._bufferId);
	}
	,
	Bind : function() {		
		gl.bindBuffer(this._target, this._bufferId);
		var builder = this; 
		return builder;
	}
    ,
	/**
	 * The data store contents are modified once, and used many times as the source for WebGL drawing commands.
	 */
    usageStaticDraw : function() {
		this._usage = gl.STATIC_DRAW;
		var builder = this; 
		return builder;
	}
	,
	/**
	 * The data store contents are repeatedly respecified, and used many times as the source for WebGL drawing commands
	 */
	usageDynamicDraw : function() {
		this._usage = gl.DYNAMIC_DRAW;
		var builder = this; 
		return builder;
	}
	,
	/**
	 * The data store contents are specified once, and used occasionally as the source of a WebGL drawing command
	 */
	usageStreamDraw : function() {
		this._usage = gl.STREAM_DRAW;
		var builder = this; 
		return builder;
	}
	,
	/**
	* Accepts javascript arrays and WebGL typed arrays
	*/
	Data : function(array, offset) {
		var typedArray;
		// Convert array to typed array
		if (array instanceof Array) {
			// Assign default value
			if (!this._type) {
				if (this._target === gl.ELEMENT_ARRAY_BUFFER)
					this._type = gl.UNSIGNED_SHORT;
				if (this._target === gl.ARRAY_BUFFER)
					this._type = gl.FLOAT;
			}
			typedArray = Utils.createTypedArray(this._type, array);
		} else {
			// Does it make sense of passing typed arrays here?
			typedArray = array;
			var glType = Utils.glArrayType(typedArray);
			this._type = glType; // Overwrite current type.
		}
		// Set the default offset value
		if (offset === undefined) {
			// Rewrite entire buffer data
			gl.bufferData(this._target, typedArray, this._usage);
			this._length = array.length;			
		} else {
			// Rewrite partial buffer data			
			gl.bufferSubData(this._target, offset, typedArray);			
		}
		return this;
	}
}
);


o3gl.ArrayBuffer = function() {
	o3gl.Buffer.call(this);
	// Basically usage parameter is a hint to OpenGL/WebGL how you intent to use the buffer. The OpenGL/WebGL can then optimize the buffer depending of your hint.
	this._target 		= gl.ARRAY_BUFFER;			// gl.ARRAY_BUFFER gl.ELEMENT_ARRAY_BUFFER
	this._usage 		= gl.STATIC_DRAW;			// gl.STATIC_DRAW gl.DYNAMIC_DRAW
	this._type 			= gl.FLOAT;				// Component type HINT. Used by pointers as default value
}

Extend(o3gl.ArrayBuffer, o3gl.Buffer, 
{
	typeUnsignedByte : function() {
		this._type = gl.UNSIGNED_BYTE;
		return this;
	}
	,
	typeShort : function() {
		this._type = gl.SHORT;
		return this;
	}
	,
	typeUnsignedShort : function() {
		this._type = gl.UNSIGNED_SHORT;
		return this;
	}
	,
	typeInt : function() {
		this._type = gl.INT;
		return this;
	}
	,
	typeUnsignedInt : function() {
		this._type = gl.UNSIGNED_INT;
		return this;
	}
	,
	typeHalfFloat : function() {
		this._type = gl.HALF_FLOAT;
		return this;
	}
	,
	typeFloat : function(size) {
		this._type = gl.FLOAT;
		return this;
	}
	,
	typeDouble : function(size) {
		this._type = gl.DOUBLE;
		return this;
	}
	,
	pointer : function() {
        return new o3gl.ArrayBuffer.Pointer(this);
    }
}
);

o3gl.ArrayBuffer.Pointer = function(buffer) {
    this._buffer = buffer;
    this._type = buffer._type;	// It is possible that buffer contains data of various types. So type must be set per pointer
    this._stride = 0;			// Stride in bytes
    this._offset = 0;			// Offset in bytes
	this._size = 4; 			// Specifies the number of components per generic vertex attribute. Must be 1, 2, 3, 4. Additionally, the symbolic constant GL_BGRA is accepted by glVertexAttribPointer. The initial value is 4.
	this._normalized = false;	// as
	
	this._divisor = 0;	// Extensions ANGLE_instanced_arrays, 
	
}

o3gl.ArrayBuffer.Pointer.prototype = {
	typeByte : function() {
		this._type = gl.BYTE;
		return this;
	}
	,
	typeUnsignedByte : function() {
		this._type = gl.UNSIGNED_BYTE;
		return this;
	}
	,
	typeShort : function() {
		this._type = gl.SHORT;
		return this;
	}
	,
	typeUnsignedShort : function() {
		this._type = gl.UNSIGNED_SHORT;
		return this;
	}
	,
	typeInt : function() {
		this._type = gl.INT;
		return this;
	}
	,
	typeUnsignedInt : function() {
		this._type = gl.UNSIGNED_INT;
		return this;
	}
	,
	typeHalfFloat : function() {
		this._type = gl.HALF_FLOAT;
		return this;
	}
	,
	typeFloat : function(size) {
		this._type = gl.FLOAT;
		return this;
	}
	,
	typeDouble : function(size) {
		this._type = gl.DOUBLE;
		return this;
	}
	,
	stride : function(bytes) {
		this._stride = bytes;
		return this;
	}
	,
	offset : function(bytes) {
		this._offset = bytes;
		return this;
	}
	,
	size : function(value) {
		this._size = value;
		return this;
	}
	,
	divisor : function(value) {
		// specifies for the given attribute location how often a value should be repeated when drawing instanced arrays
		// A divisor of 0 means the attribute isn't instanced
		// A divisor of one means that each value in the attribute stream is used for a single instance
		this._divisor = value;
		return this;
	}
	,
    /**
     * The “normalized” indicates whether integer types are accepted directly or normalized to [0;1] (for unsigned types)
     * or [-1;1] (for signed types)
     * @param enable
     */
    normalized : function(value) {
        // Assert one of the integer types.
        // i.e. typeByte().normalized()
        this._normalized = value;
        return this;
    }
	,
	getMaxElementsCount : function() {
		// TODO: consider offset, stride and data type
		return this._buffer._length / this._size;
	}
};

o3gl.ElementArrayBuffer = function() {
	// Super constructor
	o3gl.Buffer.call(this);
	// Basically usage parameter is a hint to OpenGL/WebGL how you intent to use the buffer. The OpenGL/WebGL can then optimize the buffer depending of your hint.
	this._target 		= gl.ELEMENT_ARRAY_BUFFER;			// gl.ARRAY_BUFFER gl.ELEMENT_ARRAY_BUFFER
	this._usage 		= gl.STATIC_DRAW;			// gl.STATIC_DRAW gl.DYNAMIC_DRAW
	this._type 			= gl.UNSIGNED_SHORT;				// Component type HINT. Used by pointers as default value
}

Extend(o3gl.ElementArrayBuffer, o3gl.Buffer, 
{
	typeUnsignedByte : function() {
		this._type = gl.UNSIGNED_BYTE;
		return this;
	}
	,
	typeUnsignedShort : function() {
		this._type = gl.UNSIGNED_SHORT;
		return this;
	}
	,
	typeUnsignedInt : function() {
		this._type = gl.UNSIGNED_INT;
		return this;
	}
});










o3gl.FrameBufferDefault = {
	getWidth : function() {
		// The actual width of the drawing buffer, which may differ from the
		// width attribute of the HTMLCanvasElement if the implementation is
		// unable to satisfy the requested width or height.
		return gl.drawingBufferWidth;
	}
	,
	getHeight : function() {
		// The actual height of the drawing buffer, which may differ from the
		// width attribute of the HTMLCanvasElement if the implementation is
		// unable to satisfy the requested width or height.
		return gl.drawingBufferHeight;
	}
	,
	isBound : function() {
		return gl.getParameter(gl.FRAMEBUFFER_BINDING) == null;
	}
	,
	Bind : function() {
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		return this;
	}
	,
	Viewport : function(x,y,width,height) {
		if (arguments.length === 0) {
			gl.viewport(0, 0, this.getWidth(), this.getHeight());
		} else {
			gl.viewport(x,y,width,height);
		}
		return this;
	}
	,
	ClearColorBuffer : function(r,g,b,a) {
		if (arguments.length === 0) {
			r = 0.0; g = 0.0; b = 0.0; a = 0.0; // Specification default values
		}
		gl.clearColor(r, g, b, a);
		gl.clear(gl.COLOR_BUFFER_BIT);
		return this;
	}
	,
	ClearDepthBuffer : function(depth) {
		if (depth === undefined) depth = 1.0; // Specification default values
		gl.clearDepth(depth);
		gl.clear(gl.DEPTH_BUFFER_BIT);
		return this;
	}	
	,
	Clear : function() {
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);		
		return this;
	}
	,
	DepthMask : function(enable) {
		gl.depthMask(enable);
		return this;
	}
	,
	DepthTest : function(enable) {
		if (enable) 
			gl.enable(gl.DEPTH_TEST);
		else
			gl.disable(gl.DEPTH_TEST);
		return this;
	}
	,
	ColorMask : function(r,g,b,a) {
		gl.colorMask(r,g,b,a);
		return this;
	}
	,
	SetClearColor : function(r,g,b,a) {
		gl.clearColor(r,g,b,a);
		return this;
	}
	,
	SetClearDepth : function(value) {
		// depth: floating-point number between 0.0 and 1.0, the default value is 1.0	
		gl.clearDepth(value);
		return this;
	}
}


o3gl.FrameBuffer = function() {
	this.frameBufferId = gl.createFramebuffer();
	
	// Client state tracking
	// It seems there is no way to access texture size in OpenGL ES specification
	this._colorAttachment = [];
	this._depthAttachment = undefined;
	this._stencilAttachment = undefined;
}


o3gl.FrameBuffer.getWidth = function() {
	// The actual width of the drawing buffer, which may differ from the
	// width attribute of the HTMLCanvasElement if the implementation is
	// unable to satisfy the requested width or height.
	return gl.drawingBufferWidth;
}

o3gl.FrameBuffer.getHeight = function() {
	// The actual height of the drawing buffer, which may differ from the
	// width attribute of the HTMLCanvasElement if the implementation is
	// unable to satisfy the requested width or height.
	return gl.drawingBufferHeight;
}
o3gl.FrameBuffer.Viewport = function(x,y,width,height) {
	if (arguments.length === 0) {
		gl.viewport(0, 0, this.getWidth(), this.getHeight());
	} else {
		gl.viewport(x,y,width,height);
	}
	return this;
}
o3gl.FrameBuffer.ClearColorBuffer = function(r,g,b,a) {
	if (arguments.length === 0) {
		r = 0.0; g = 0.0; b = 0.0; a = 0.0; // Specification default values
	}
	gl.clearColor(r, g, b, a);
	gl.clear(gl.COLOR_BUFFER_BIT);
	return this;
}
o3gl.FrameBuffer.ClearDepthBuffer = function(depth) {
	if (depth === undefined) depth = 1.0; // Specification default values
	gl.clearDepth(depth);
	gl.clear(gl.DEPTH_BUFFER_BIT);
	return this;
}	
o3gl.FrameBuffer.Clear = function() {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);		
	return this;
}
o3gl.FrameBuffer.DepthMask = function(enable) {
	gl.depthMask(enable);
	return this;
}
o3gl.FrameBuffer.DepthTest = function(enable) {
	if (enable) 
		gl.enable(gl.DEPTH_TEST);
	else
		gl.disable(gl.DEPTH_TEST);
	return this;
}
o3gl.FrameBuffer.ColorMask = function(r,g,b,a) {
	gl.colorMask(r,g,b,a);
	return this;
}
o3gl.FrameBuffer.SetClearColor = function(r,g,b,a) {
	gl.clearColor(r,g,b,a);
	return this;
}
o3gl.FrameBuffer.SetClearDepth = function(value) {
	// depth: floating-point number between 0.0 and 1.0, the default value is 1.0	
	gl.clearDepth(value);
	return this;
}



o3gl.FrameBuffer.prototype = {
	getWidth : function() {
		return this._colorAttachment[0]._size[0];
	}
	,
	getHeight : function() {
		return this._colorAttachment[0]._size[1];
	}
	,
	isBound : function() {
		return this.frameBufferId === gl.getParameter(gl.FRAMEBUFFER_BINDING);
	}
	,
	Id : function() {
		return this.frameBufferId;
	}
	,
	Delete : function() {
		gl.deleteFramebuffer(this.frameBufferId);
	}
	,
	Bind : function() {
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBufferId);
		return this;
	}
	,
	CheckStatus : function() {
		//
	
		  // assumes the framebuffer is bound
		var valid = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
		switch(valid){
			case gl.FRAMEBUFFER_UNSUPPORTED:
				throw 'Framebuffer is unsupported';
			case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
				throw 'Framebuffer incomplete attachment';
			case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
				throw 'Framebuffer incomplete dimensions';
			case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
				throw 'Framebuffer incomplete missing attachment';
		}		
		return this; // !!! need to check status after buffer constructed
	}
	,
	isComplete : function() {
		// assumes the framebuffer is bound
		var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
		return status === gl.FRAMEBUFFER_COMPLETE; 
	}
	,
	Color : function(attachment0, attachment1, attachment2, attachment3) {
		var COLOR_ATTACHEMENT = [
			gl.COLOR_ATTACHMENT0,
			gl.COLOR_ATTACHMENT1,
			gl.COLOR_ATTACHMENT2,
			gl.COLOR_ATTACHMENT3				
		];
	
		for (var i=0; i<arguments.length; ++i) {
			var level = 0; // Must be 0;
			var attachment 	= arguments[i];

			var texture = undefined;
			var textureTarget = undefined;
			var textureId = undefined;
			
			if (attachment instanceof o3gl.Texture) {
				texture = attachment;
				textureTarget = texture.target()._targetTexture;
				textureId = texture.Id();

			} else {
				texture = attachment._texture;
				textureTarget = attachment._targetTexture;
				textureId = texture.Id();		
			}
			
			texture.Bind();
			// texture.FilterLinear().WrapClampToEdge(); // What requirements should be here???
			
			if (!texture.isFrameBufferCompatible()) {
				throw "Texture is not framebuffer compatible";
			}
			
			gl.framebufferTexture2D(gl.FRAMEBUFFER, COLOR_ATTACHEMENT[i], textureTarget, textureId, level);	

			this._colorAttachment[i] = texture;
		}
		return this;
	}
	,
	Depth : function(attachment) {
		if (attachment instanceof o3gl.RenderBuffer) {
			attachment.formatDepthComponent16();
			attachment.Bind(); // Bind and invoke deffered initialization
			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, attachment.Id());
			
			this._depthAttachment = attachment;
		}
		if (attachment instanceof o3gl.Texture) {
			attachment.Bind(); // Bind and invoke deffered initialization
			// it should theoretically be possible to create a framebuffer that has nothing but a depth buffer, no color component. 
			// I've heard reports that that's a buggy case in many drivers, however, so need to create an unused color texture anyway for compatibility
			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, attachment.Id());

			this._depthAttachment = attachment;
		}
		return this;
	}
	,
	Stencil : function(attachment) {
		if (attachment instanceof o3gl.RenderBufferStencil) {
			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.RENDERBUFFER, attachment.Id());
		}
	}
	,
	
	Viewport : o3gl.FrameBufferDefault.Viewport
	,
	ClearColorBuffer : o3gl.FrameBufferDefault.ClearColorBuffer
	,
	ClearDepthBuffer : o3gl.FrameBufferDefault.ClearDepthBuffer
	,
	Clear : o3gl.FrameBufferDefault.Clear
	,
	SetClearColor : o3gl.FrameBufferDefault.SetClearColor
	,
	SetClearDepth : o3gl.FrameBufferDefault.SetClearDepth
	,
	DepthTest : o3gl.FrameBufferDefault.DepthTest
	,
	DepthMask : o3gl.FrameBufferDefault.DepthMask
	,
	ColorMask : o3gl.FrameBufferDefault.ColorMask	
};

o3gl.RenderBuffer = function() {
	this._renderBufferId = gl.createRenderbuffer();
	this._target = gl.RENDERBUFFER; // must be GL_RENDERBUFFER.
	this._internalFormat = undefined; // Specifies the color-renderable, depth-renderable, or stencil-renderable format of the renderbuffer. Must be one of the following symbolic constants: GL_RGBA4, GL_RGB565, GL_RGB5_A1, GL_DEPTH_COMPONENT16, or GL_STENCIL_INDEX8
	this.formatDepthComponent16();
}

o3gl.RenderBuffer.prototype = {
	isBound : function() {
		return this._renderBufferId === gl.getParameter(gl.RENDERBUFFER_BINDING);
	}
	,
	Id : function() {
		return this._renderBufferId;
	}
	,
	Bind : function() {
		gl.bindRenderbuffer(this._target, this._renderBufferId);
		return this;
		// WHY???
	}
	,
	Storage : function(width, height) {
		gl.renderbufferStorage(this._target, this._internalFormat, width, height);
		return this;
	}
	,
	Delete : function() {
		gl.deleteRenderbuffer(this._renderBufferId)
	}
}

o3gl.RenderBufferDepth = function() {
	o3gl.RenderBuffer.call(this);
	this._renderBufferId = gl.createRenderbuffer();
	this._internalFormat = gl.DEPTH_COMPONENT16; // Specifies the color-renderable, depth-renderable, or stencil-renderable format of the renderbuffer. Must be one of the following symbolic constants: GL_RGBA4, GL_RGB565, GL_RGB5_A1, GL_DEPTH_COMPONENT16, or GL_STENCIL_INDEX8
}

Extend(o3gl.RenderBufferDepth, o3gl.RenderBuffer, {
	formatDepthComponent16 : function() {
		this._internalFormat = gl.DEPTH_COMPONENT16;
		return this;
	}
});

o3gl.RenderBufferStencil = function() {
	o3gl.RenderBuffer.call(this);
	this._renderBufferId = gl.createRenderbuffer();
	this._internalFormat = gl.STENCIL_INDEX8; // Specifies the color-renderable, depth-renderable, or stencil-renderable format of the renderbuffer. Must be one of the following symbolic constants: GL_RGBA4, GL_RGB565, GL_RGB5_A1, GL_DEPTH_COMPONENT16, or GL_STENCIL_INDEX8
}

Extend(o3gl.RenderBufferStencil, o3gl.RenderBuffer, {
	formatStencilIndex8 : function() {
		this._internalFormat = gl.STENCIL_INDEX8;
		return this;
	}
});



/**
 *
 * @param {String|Array} sources
 * @constructor
 */
o3gl.Shader = function(sources) {
    this.shaderType = Utils.glShaderType(sources);
    if (sources instanceof Array) {
        sources = Preprocessor.getLines(sources);   // Convert to one-dimension String array
        sources = sources.join("\n");               // Merge to the string
    }
	this.shaderId = gl.createShader(this.shaderType);
	this.Source(sources).Compile();
}

o3gl.Shader.prototype = {
	Id : function() {
		return this.shaderId;
	}
	,
	Delete : function() {
		this.deleteShader(this.shaderId);
	}
	,
	Source : function(source) {
		gl.shaderSource(this.shaderId, source);
		var compileable = this;
		return compileable;
	}
	,
	Compile : function() {
		gl.compileShader(this.shaderId);
		if (!gl.getShaderParameter(this.shaderId, gl.COMPILE_STATUS)) {
			alert(gl.getShaderInfoLog(this.shaderId));
			return null;
		}
		return this;
	}
}

// http://blog.tojicode.com/2012/10/oesvertexarrayobject-extension.html
o3gl.VertexArrayObject = function () {
	this.extension = gl.getExtension("OES_vertex_array_object"); 	// Vendor prefixes may apply!  
	this.vertexArrayObjectId = extension.createVertexArrayOES();;
	
	// Used to calculate default buffer size
	this.elementArrayBuffer = null;											// Assotiated element array buffer
	this.attributes = [];													// Per location vertex attribute values
}

o3gl.VertexArrayObject.prototype = {
	Id : function() {
		return this.vertexArrayObjectId;
	}
	,
	Delete : function() {
		this.extension.deleteVertexArrayOES(this.vertexArrayObjectId);
	}
	,
	Bind : function() {
		this.extension.bindVertexArrayOES(this.vertexArrayObjectId);			
		return this;
	}
	,
	getMaxElementsCount : function() {
		var maxElementsCount = undefined;
		if (this.elementArrayBuffer) {
			maxElementsCount = this.elementArrayBuffer._length
		} else {
			for (var attributeLocation in this.attributes) {				
				var value = this.attributes[attributeLocation];
				
				if (!(value instanceof o3gl.ArrayBuffer.Pointer)) continue;
				
				var pointer = value;
				
				var pointerMaxElementsCount = pointer.getMaxElementsCount();

				if (!maxElementsCount) {
					maxElementsCount = pointerMaxElementsCount;					
				}
				if (maxElementsCount > pointerMaxElementsCount) {
					maxElementsCount = pointerMaxElementsCount;
				}
			}		
		}			
		return maxElementsCount;
	}
	,
	Elements :function(elementArrayBuffer) {
		this.elementArrayBuffer = elementArrayBuffer;
		this.elementArrayBuffer.Bind();
		return this;
	}
	,
	VertexAttributePointer : function(attributeLocation, arrayBufferPointer) {		
		//TODO: mat4 attribute takes up 4 attribute locations. The one you bind and the 3 following	
		//TODO: What is size of gl.FLOAT_MAT4 returned with getActiveAttrib ??? The size is 1
		if (!arrayBufferPointer._size) {
			var glType = this.getType(name);
			arrayBufferPointer.size(Utils.glTypeSizeComponents(glType));
		}
		
		if (!arrayBufferPointer._type) {
			//TODO: illegal state ???
			//Probably array buffer's been initialized by non typed array
			//The it's assumed to be the same like shader attribute variable type
		}
		
		var type        	= arrayBufferPointer._type; 			// !!!
		var normalized  	= arrayBufferPointer._normalized;		//
		
		var sizeOfTypeBytes = Utils.glTypeSizeBytes(type);
		var size 			= arrayBufferPointer._size;
		var strideBytes     = arrayBufferPointer._stride * sizeOfTypeBytes;
		var offsetBytes     = arrayBufferPointer._offset * sizeOfTypeBytes;
			
		// Configure and bind array buffer
		var arrayBuffer 	= arrayBufferPointer._buffer;
		arrayBuffer.Bind();
		
		gl.enableVertexAttribArray(attributeLocation);
		gl.vertexAttribPointer(attributeLocation,
			size,   // Specifies the number of components per generic vertex attribute. Must be 1, 2, 3, 4. Additionally, the symbolic constant GL_BGRA is accepted by glVertexAttribPointer. The initial value is 4.
			type,   // Specifies the data type of each component in the array
			normalized,  // Specifies whether fixed-point data values should be normalized (GL_TRUE) or converted directly as fixed-point values (GL_FALSE) when they are accessed.
			strideBytes, // Specifies the byte offset between consecutive generic vertex attributes. If stride is 0, the generic vertex attributes are understood to be tightly packed in the array. The initial value is 0.
			offsetBytes  // Specifies a offset of the first component of the first generic vertex attribute in the array in the data store of the buffer currently bound to the GL_ARRAY_BUFFER target. The initial value is 0.
		);
		
		// remember for default draw methods invocation
		this.attributes[attributeLocation] = arrayBufferPointer;
		return this;
	}
	,
	VertexAttribute1f : function(attributeLocation, v1) {
		gl.disableVertexAttribArray(attributeLocation);
		gl.vertexAttrib1f(attributeLocation, v1); 
		this.attributes[attributeLocation] = [v1];
		return this;
	}
	,
	VertexAttribute2f : function(attributeLocation, v1, v2) {
		gl.disableVertexAttribArray(attributeLocation);
		gl.vertexAttrib2f(attributeLocation, v1, v2); 
		this.attributes[attributeLocation] = [v1, v2];
		return this;
	}
	,
	VertexAttribute3f : function(attributeLocation, v1, v2, v3) {
		gl.disableVertexAttribArray(attributeLocation);
		gl.vertexAttrib2f(attributeLocation, v1, v2, v3); 
		this.attributes[attributeLocation] = [v1, v2, v3];
		return this;
	}
	,
	VertexAttribute4f : function(attributeLocation, v1, v2, v3, v4) {
		gl.disableVertexAttribArray(attributeLocation);
		gl.vertexAttrib2f(attributeLocation, v1, v2, v3, v4); 
		this.attributes[attributeLocation] = [v1, v2, v3, v4];
		return this;
	}
}

o3gl.VertexArrayObjectDefault = function () {	
	// Used to calculate default buffer size
	this.elementArrayBuffer = null;											// Assotiated element array buffer
	this.attributes = [];										// Per location vertex attribute pointers
	this.maxElementsCount = null;											// Precomputed max elements count
	
	this.Id = function() {}
	this.Delete = function() {}
	this.Bind = function() {
		if (this.elementsArrayBuffer) {
			this.elementsArrayBuffer.Bind();
		}
		for (var attributeLocation in this.attributes) {				
			var value = this.attributes[attributeLocation];
			if (value instanceof o3gl.ArrayBuffer.Pointer) {
				this.VertexAttributePointer(attributeLocation, value)
			} else {
				if (value.length === 1) this.VertexAttribute1f(attributeLocation, value[0]);
				if (value.length === 2) this.VertexAttribute2f(attributeLocation, value[0], value[1]);
				if (value.length === 3) this.VertexAttribute3f(attributeLocation, value[0], value[1], value[2]);
				if (value.length === 4) this.VertexAttribute4f(attributeLocation, value[0], value[1], value[3], value[4]);
			}
		}
		return this;
	}	
}
o3gl.VertexArrayObjectDefault.prototype = o3gl.VertexArrayObject.prototype;


o3gl.UniformBufferObject = function () {
}

o3gl.UniformBufferObject.prototype = {
	Id : function() {
	}
	,
	Delete : function() {
	}
	,
	Bind : function() {
	}
}

/**
 *
 * @param {Shader} shader1
 * @param {Shader} shader2
 * @constructor
 */
o3gl.Program = function(shader1,shader2) {
	// Create the program gl resuource
	this.programId = gl.createProgram();
	// Build the program with given shaders
	this._attachShader(shader1, shader2)._link();

	// Auto assigned sampler indicies
	this.textureIndex = {};
	// Uniform and attribute cache
	this.attributes = undefined; // {name:...; location:...; type:...; size:...;}	
	this.uniforms = undefined; // {name:...; location:...; type:...; size:...;}	
	
	/*
	Specification:
	Uniforms are program object-specific state. 
	They retain their values once loaded, and their values are restored whenever a program object is used, 
	as long as the program object has not been re-linked.
	*/
	// TODO Shit!!!
	this.getTextureIndex = function (uniformName) {
		return Utils.counter(this.textureIndex, uniformName);
	}
	
	// Build uniforms and attributes dictionaries
	this._initializeVariables();
	
	// Assotiate new VAO with program
	this._vertexArrayObject = undefined;
	
	// Assotiate new FBO with program;
	this._frameBufferObject = undefined;

}




o3gl.Program.prototype = {
	isUsed : function() {
		return this.programId === gl.getParameter(gl.CURRENT_PROGRAM);
	}
	,
	Id : function() {
		return this.programId;
	}
	,
	Delete : function () {
		gl.deleteProgram(this.programId);
	}
	,
	_attachShader : function(shader1,shader2,shader3) {
		if (shader1)
			gl.attachShader(this.programId, shader1.Id());
		if (shader2)
			gl.attachShader(this.programId, shader2.Id());
		if (shader3)
			gl.attachShader(this.programId, shader3.Id());
		
		var linkable = this;
		return linkable;
	}
	,
	_link : function() {
		gl.linkProgram(this.programId);
		if (!gl.getProgramParameter(this.programId, gl.LINK_STATUS)) {
			alert("Could not initialise shaders");
			return null;
		}
		var usable = this;
		return usable;
	}
	,
	
		//gl.FLOAT
		//gl.FLOAT_VEC2
		//gl.FLOAT_VEC3
		//gl.FLOAT_VEC4
		//gl.INT
		//gl.INT_VEC2
		//gl.INT_VEC3
		//gl.INT_VEC4
		//gl.BOOL
		//gl.BOOL_VEC2
		//gl.BOOL_VEC3
		//gl.BOOL_VEC4
		//gl.FLOAT_MAT2
		//gl.FLOAT_MAT3
		//gl.FLOAT_MAT4
		//gl.SAMPLER_2D
		//gl.SAMPLER_CUBE
	
	
	_getUniformSetter : function(type, size) {
		if (type === gl.FLOAT) 			return this.Uniform1f;
		if (type === gl.FLOAT_VEC2) 	return this.Uniform2f;
		if (type === gl.FLOAT_VEC3) 	return this.Uniform3f;
		if (type === gl.FLOAT_VEC4) 	return this.Uniform4f;
		if (type === gl.FLOAT_MAT2) 	return this.UniformMatrix2fv;
		if (type === gl.FLOAT_MAT3) 	return this.UniformMatrix3fv;
		if (type === gl.FLOAT_MAT4) 	return this.UniformMatrix4fv;
		if (type === gl.SAMPLER_2D) 	return this.UniformSampler;
		if (type === gl.SAMPLER_CUBE) 	return this.UniformSampler;
		return null;
	}
	,
	_getAttributeSetter : function(type, size) {
		if (type === gl.FLOAT) 			return this.Attribute1f;
		if (type === gl.FLOAT_VEC2) 	return this.Attribute2f;
		if (type === gl.FLOAT_VEC3) 	return this.Attribute3f;
		if (type === gl.FLOAT_VEC4) 	return this.Attribute4f;
		return null;
	}
	,
	_initializeVariables : function() {
		// Initialize attributes and uniforms cache
		if (!this.uniforms) {
			this.uniforms = {};
			for (var idx = 0; idx < gl.getProgramParameter(this.Id(), gl.ACTIVE_UNIFORMS); ++idx) {
				// Get information about an active uniform variable
				var variable = gl.getActiveUniform(this.Id(), idx);
				var location = gl.getUniformLocation(this.Id(), variable.name);
				var setter	 = this._getUniformSetter(variable.type, variable.size);
				this.uniforms[variable.name] = {
					name : variable.name,
					type : variable.type,
					size : variable.size,
					location : location,
					setter : setter
				}
			}
		}
		if (!this.attributes) {
			this.attributes = {};
			for (var idx = 0; idx < gl.getProgramParameter(this.Id(), gl.ACTIVE_ATTRIBUTES); ++idx) {
				// Get information about an active attribute variable
				var variable = gl.getActiveAttrib(this.Id(), idx);
				var location = gl.getAttribLocation(this.Id(), variable.name);
				var setter	 = this._getAttributeSetter(variable.type, variable.size);
				this.attributes[variable.name] = {
					name : variable.name,
					type : variable.type,
					size : variable.size,
					location : location,
					setter : setter
				}
			}
		}
	}
	,
	getActiveUniforms : function() { 
		var result = [];
		var activeUniformsCount = gl.getProgramParameter(this.Id(), gl.ACTIVE_UNIFORMS);
		for (var idx = 0; idx < activeUniformsCount; ++idx) {
			// Get information about an active uniform variable
			var variable = gl.getActiveUniform(this.Id(), idx); // {name:"", type:int, size:3}
			result.push(variable);
		}
		return result;
	}
	,
	getActiveAttributes : function() {
		var result = [];
		var activeAttribsCount = gl.getProgramParameter(this.Id(), gl.ACTIVE_ATTRIBUTES);
		for (var idx = 0; idx < activeAttribsCount; ++idx) {
			// Get information about an active attribute variable
			var variable = gl.getActiveAttrib(this.Id(), idx);
			result.push(variable);
		}
		return result;
	}
	,
	Use : function () {
		gl.useProgram(this.Id());	
		if (this._vertexArrayObject) {
			this._vertexArrayObject.Bind();		
		}
		if (this._frameBufferObject) {
			this._frameBufferObject.Bind();		
		}
		return this;
	}
	,
	getUniformLocation : function (name) {
		return this.uniforms[name].location;
	}
	,
	getAttribLocation : function (name) {
		return this.attributes[name].location;
	}
	,
	BindAttribLocation : function (name, index) {
		/*
			More than one name can be bound to the same vertex index, but multiple indexes cannot be bound to the same name.
			If name is a matrix attribute, then index points to the first column of the matrix. Additional matrix columns are automatically bound to index+1, index+2, and so forth based on matrix variable (mat2,mat3,mat4).
		*/
		gl.bindAttribLocation(this.programId, index, name);
		this.attributes[name].location = index;
		return this;
	}
	,
	getSize : function(name) { 
		/*
			Size is array length.
			Arrays seem to be available only for uniforms.
		*/
		
		if (this.uniforms[name]) 
			return this.uniforms[name].size;
		else
			return this.attributes[name].size;
	}
	,	
	getType : function(name) { 
		if (this.uniforms[name]) 
			return this.uniforms[name].type;
		else
			return this.attributes[name].type;
	}
	,
	isTypeFloat			 : function(name) { return this.getType(name) === gl.FLOAT; 		},
	isTypeFloatVec2 	 : function(name) { return this.getType(name) === gl.FLOAT_VEC2; 	},
	isTypeFloatVec3 	 : function(name) { return this.getType(name) === gl.FLOAT_VEC3; 	},
	isTypeFloatVec4 	 : function(name) { return this.getType(name) === gl.FLOAT_VEC4; 	},
	isTypeInt 			 : function(name) { return this.getType(name) === gl.INT; 			},
	isTypeIntVec2 		 : function(name) { return this.getType(name) === gl.INT_VEC2; 		},
	isTypeIntVec3 		 : function(name) { return this.getType(name) === gl.INT_VEC3; 		},
	isTypeIntVec4 		 : function(name) { return this.getType(name) === gl.INT_VEC4; 		},
	isTypeBool 			 : function(name) { return this.getType(name) === gl.BOOL; 			},
	isTypeBoolVec2 		 : function(name) { return this.getType(name) === gl.BOOL_VEC2; 	},
	isTypeBoolVec3 		 : function(name) { return this.getType(name) === gl.BOOL_VEC3; 	},
	isTypeBoolVec4 		 : function(name) { return this.getType(name) === gl.BOOL_VEC4; 	},
	isTypeFloatMat2 	 : function(name) { return this.getType(name) === gl.FLOAT_MAT2; 	},
	isTypeFloatMat3 	 : function(name) { return this.getType(name) === gl.FLOAT_MAT3; 	},
	isTypeFloatMat4 	 : function(name) { return this.getType(name) === gl.FLOAT_MAT4; 	},
	isTypeSampler2D 	 : function(name) { return this.getType(name) === gl.SAMPLER_2D; 	},
	isTypeSamplerCube 	 : function(name) { return this.getType(name) === gl.SAMPLER_CUBE; 	},	

	VertexArray : function(value) {
		if (value || value === null) {
			this._vertexArrayObject = value;
		} else {
			this._vertexArrayObject = new o3gl.VertexArrayObjectDefault();
		}
		return this._vertexArrayObject;
	}
	,
	FrameBuffer : function(value) {
		if (value || value === null) {
			this._frameBufferObject = value;
		} else {
			this._frameBufferObject = new o3gl.FrameBufferDefault();
		}
		return this._frameBufferObject;
	}
	,
	//	Helper method that allows setting of the uniform or attribute pointer using retrospections capabilities.
	//	Overloaded in strong types languages
	Set : function (name, v1, v2, v3, v4) {	
		var setter = undefined;
		if (this.uniforms[name]) {
			setter = this.uniforms[name].setter;
		}
		if (this.attributes[name]) {
			setter = this.attributes[name].setter;			
		}
		return setter.apply(this, arguments);
	}
	,
	UniformMatrix3fv: function(name, matrix) {
		//TODO
		/*
		In your shader code you need to create the array of elements you want to use
			uniform mat4[4] uMMatrix;
		In reality, webgl just created four seperate uniforms with the names uMMatrix[0], uMMatrix[1], uMMatrix[2],and uMMatrix[3]. You need to bind them seperately.
			program.mMatrixUniform[0] = gl.getUniformLocation(program, 'uMMatrix[0]');
			gl.uniformMatrix4fv(program.mMatrixUniform[0], false, this.modelMatrices[0]);
		*/
		
		gl.uniformMatrix3fv(this.getUniformLocation(name), false, matrix);			
		return this;		
	}
	,
	UniformMatrix4fv: function(name, matrix) {
	
		// location [in]
		// Type: WebGLUniformLocation
		// The location of uniform variable to be updated. Locate set by getUniformLocation.
		
		// transpose [in]
		// Type: boolean
		// Sets whether to transpose the matrix as the values are loaded into the uniform variable. Must be set to gl.FALSE.
		
		// value [in]
		// Type: Float32Array
		// An array of float values representing one or more 4x4 matrices.
	
		gl.uniformMatrix4fv(this.getUniformLocation(name), false, matrix);
		return this;		
	}
	,
	Uniform1f: function(name, v1) {
		var uniformLocation = this.getUniformLocation(name);
		gl.uniform1f(uniformLocation, v1);
		return this;
	}
	,
	Uniform2f: function(name, v1, v2) {
		var uniformLocation = this.getUniformLocation(name);
		gl.uniform2f(uniformLocation, v1, v2);
		return this;
	}
	,
	Uniform3f: function(name, v1, v2, v3) {
		var uniformLocation = this.getUniformLocation(name);
		gl.uniform3f(uniformLocation, v1, v2, v3);
		return this;
	}
	,
	Uniform4f: function(name, v1, v2, v3, v4) {
		var uniformLocation = this.getUniformLocation(name);
		gl.uniform4f(uniformLocation, v1, v2, v3, v4);
		return this;
	}
	,
	Uniform1fv: function(name, value) { // value must be an array
		gl.uniform1fv(this.getUniformLocation(name), value);
		return this;
	}
	,
	Uniform2fv: function(name, value) { // value must be an array
		var uniformLocation = this.getUniformLocation(name);
		gl.uniform2fv(uniformLocation, value);
		return this;
	}
	,
	Uniform3fv: function(name, value) { // value must be an array
		gl.uniform3fv(this.getUniformLocation(name), value);
		return this;
	}
	,
	Uniform4fv: function(name, value) { // value must be an array
		gl.uniform4fv(this.getUniformLocation(name), value);
		return this;
	}
	,
	Uniform1i: function(name, v1) {
		var uniformLocation = this.getUniformLocation(name);
		gl.uniform1i(uniformLocation, v1);
		return this;
	}
	,
	Uniform2i: function(name, v1, v2) {
		var uniformLocation = this.getUniformLocation(name);
		gl.uniform2i(uniformLocation, v1, v2);
		return this;
	}
	,
	Uniform3i: function(name, v1, v2, v3) {
		var uniformLocation = this.getUniformLocation(name);
		gl.uniform3i(uniformLocation, v1, v2, v3);
		return this;
	}
	,
	Uniform4i: function(name, v1, v2, v3, v4) {
		var uniformLocation = this.getUniformLocation(name);
		gl.uniform4i(uniformLocation, v1, v2, v3, v4);
		return this;
	}
	,
	Uniform1iv: function(name, value) { // value must be an array
		gl.uniform1iv(this.getUniformLocation(name), value);
		return this;
	}
	,
	Uniform2iv: function(name, value) { // value must be an array
		gl.uniform2iv(this.getUniformLocation(name), value);
		return this;
	}
	,
	Uniform3iv: function(name, value) { // value must be an array
		gl.uniform3iv(this.getUniformLocation(name), value);
		return this;
	}
	,
	Uniform4iv: function(name, value) { // value must be an array
		gl.uniform4iv(this.getUniformLocation(name), value);
		return this;
	}
	,
	UniformSampler : function(name, texture) {
		var index 			= this.getTextureIndex(name);
		var glTextureId 	= Utils.getGLTextureId(index);
		var uniformLocation = this.getUniformLocation(name);
		gl.activeTexture(glTextureId);
		texture.Bind();
		gl.uniform1i(uniformLocation, index);
		return this;
	}
	,
	Elements : function(elementArrayBuffer) {
		this.VertexArray().Elements(elementArrayBuffer);
		return this;
	}
	,
	VertexAttributePointer : function(name, arrayBufferPointer) {		
		var attributeLocation = this.getAttribLocation(name);
		this.VertexArray().VertexAttributePointer(attributeLocation, arrayBufferPointer);
		return this;
	}
	,
	VertexAttribute1f : function(name, v1) {
		var attributeLocation = this.getAttribLocation(name);
		this.VertexArray().VertexAttribute1f(attributeLocation, v1);
		return this;
	}
	,
	VertexAttribute2f : function(name, v1, v2) {
		var attributeLocation = this.getAttribLocation(name);
		this.VertexArray().VertexAttribute2f(attributeLocation, v1, v2);
		return this;
	}
	,
	VertexAttribute3f : function(name, v1, v2, v3) {
		var attributeLocation = this.getAttribLocation(name);
		this.VertexArray().VertexAttribute3f(attributeLocation, v1, v2, v3);
		return this;
	}
	,
	VertexAttribute4f : function(name, v1, v2, v3, v4) {
		var attributeLocation = this.getAttribLocation(name);
		var attributeLocation = this.getAttribLocation(name);
		this.VertexArray().VertexAttribute4f(attributeLocation, v1, v2, v3, v4);
		return this;
	}
	,
	
	/*
		Convenience methods with overloaded arguments 
		Performs pointer size/type configuration
	*/
	Attribute1f : function(name, v1) {
		if (v1 instanceof o3gl.Buffer) {
			v1.targetArrayBuffer();
			this.VertexAttributePointer(name, v1.pointer().typeFloat().size(1));
		} else if (v1 instanceof o3gl.ArrayBuffer.Pointer) {
			this.VertexAttributePointer(name, v1.typeFloat().size(1));
		} else {
			this.VertexAttribute1f(name, v1);
		}
		return this;
	}
	,
	Attribute2f : function(name, v1, v2) {
		if (v1 instanceof o3gl.Buffer) {
			v1.targetArrayBuffer();
			this.VertexAttributePointer(name, v1.pointer().typeFloat().size(2));
		} else if (v1 instanceof o3gl.ArrayBuffer.Pointer) {
			this.VertexAttributePointer(name, v1.typeFloat().size(2));
		} else {
			this.VertexAttribute2f(name, v1, v2);
		}
		return this;
	}
	,
	Attribute3f : function(name, v1, v2, v3) {
		if (v1 instanceof o3gl.Buffer) {
			v1.targetArrayBuffer();
			this.VertexAttributePointer(name, v1.pointer().typeFloat().size(3));
		} else if (v1 instanceof o3gl.ArrayBuffer.Pointer) {
			this.VertexAttributePointer(name, v1.typeFloat().size(3));
		} else {
			this.VertexAttribute3f(name, v1, v2, v3);
		}
		return this;
	}
	,
	Attribute4f : function(name, v1, v2, v3, v4) {
		if (v1 instanceof o3gl.Buffer) {
			v1.targetArrayBuffer();
			this.VertexAttributePointer(name, v1.pointer().typeFloat().size(4));
		} else if (v1 instanceof o3gl.ArrayBuffer.Pointer) {
			this.VertexAttributePointer(name, v1.typeFloat().size(4));
		} else {
			this.VertexAttribute4f(name, v1, v2, v3, v4);
		}
		return this;
	}
	,
	_drawPrimitives : function(glMode, first, count) {
		this.Use(); // assert current program
		
		
		var elementArrayBuffer = undefined;
		var maxElementsCount = undefined;
		
		if (this._vertexArrayObject) {
			elementArrayBuffer = this._vertexArrayObject.elementArrayBuffer;
			maxElementsCount = this._vertexArrayObject.getMaxElementsCount();
		}
		
		
		if (elementArrayBuffer) {
			elementArrayBuffer.Bind();
			var elementType 	= elementArrayBuffer._type; // The type of elements in the element array buffer. Must be a gl.UNSIGNED_SHORT.
			var elementsCount 	= undefined; 				// The number of elements to render.
			var offsetBytes		= 0; 						// Offset into the element array buffer. Must be a valid multiple of the size of type.
			
			if (first) {
				offsetBytes = Utils.glTypeSizeBytes(elementType) * first; // elementType must be gl.UNSIGNED_SHORT here
			}
			
			if (count) {
				elementsCount = count;
			} else {
				elementsCount = maxElementsCount;
			}
			
			gl.drawElements(glMode, elementsCount, elementType, offsetBytes);
		} else {
			if (!first) {
				first = 0;
			}
			if (!count) {
				count = maxElementsCount;
			}
			gl.drawArrays(glMode, first, count);
		}
		return this;		
	}
	,
	/** connects each group of three consecutive vertices to make a triangle - so 24 vertices produces 8 separate triangles. */
	DrawTriangles : function(first, count) {
		this._drawPrimitives(gl.TRIANGLES, first, count);
		return this;
	}
	,
	/** is a little harder to get your head around...let's letter our 24 vertices 'A' through 'X'. 
	* This produces N-2 triangles where N is the number of vertices...the first triangle connects vertices A,B,C, 
	* the remaining triangles are each formed from the previous two vertices of the last triangle...(swapped over to keep the triangle facing the same way) plus one new vertex, so the second triangle is C,B,D, the third is C,D,E, the fourth is E,D,F...all the way through to the 22nd triangle which is made from W,V,X. 
	* This sounds messy but imagine that you are drawing something like a long, winding ribbon - with vertices A,C,E,G down one side of the ribbon and B,D,F,H down the otherside. 
	* You'll need to sketch this one on some paper to get the hang of it. */
	DrawTriangleStrip : function(first, count) {
		this._drawPrimitives(gl.TRIANGLE_STRIP, first, count);
		return this;
	}
	,
	/**  similar in concept to the STRIP but now we start with triangle A,B,C, then A,C,D, then A,D,E...and so on until A,W,X. The result looks like a ladies' fan. */
	DrawTriangleFan : function(first, count) {
		this._drawPrimitives(gl.TRIANGLE_FAN, first, count);
		return this;
	}
	,
	/** Draws each vertex as a single pixel dot...so if there are 24 vertices, you get 24 dots.*/
	DrawPoints : function(first, count) {
		this._drawPrimitives(gl.POINTS, first, count);
		return this;
	}
	,
	/** connects each pair of vertices by a straight line, so 24 vertices produces 12 separate lines. */
	DrawLines : function(first, count) {
		this._drawPrimitives(gl.LINES, first, count);
		return this;
	}
	,
	/** connects each vertex to the next by a straight line, so 24 vertices produces 23 lines that are all connected end-to-end. */
	DrawLineStrip : function(first, count) {
		this._drawPrimitives(gl.LINE_STRIP, first, count);
		return this;
	}
	,
	/**  is like LINESTRIP except that the last vertex is connected back to the first, so 24 vertices produces 24 straight lines - looping back to the start*/
	DrawLineLoop : function(first, count) {
		this._drawPrimitives(gl.LINE_LOOP, first, count);
		return this;
	}
}


o3gl.ProgramSources = function(shaderSource1, shaderSource2, shaderSource3) {
	this.program = undefined;
	
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
	
	this.variables = {};
	
	this._defined = {};
}

o3gl.ProgramSources.prototype = {
	define : function(identifiers) {
		var defined = [];
		for (var  i = 0; i < arguments.length; ++i)	 {
			var identifier = arguments[i];
			defined[identifier] = true;
		}
		// Exclude lines with undeclared variables;
		this.vertexShaderSource = Preprocessor.excludeUndefined(this.vertexShaderSource, defined);
		this.fragmentShaderSource = Preprocessor.excludeUndefined(this.fragmentShaderSource, defined);
		return this;
	}
	,
	createProgram : function() {
		var program = o3gl.createProgram(
			o3gl.createShader(this.vertexShaderSource.join("\n")) , 
			o3gl.createShader(this.fragmentShaderSource.join("\n"))
		);	
		
		return program;
	}
}






// Initialize proxies
function _deffered(method) {
	return function() {
		var args = arguments;
		if (this.isBound && this.isBound()) return method.apply(this, args)
		if (this.isUsed && this.isUsed()) return method.apply(this, args)

		if (!this._deffered) this._deffered = [];
		this._deffered.push(function() {
			method.apply(this, args);
		});
		
		return this; // Some problemmm....	
	}
}

function _defferedCall(method) {
	return function() {
		var result = method.apply(this);
		// Invoke deffered methods
		if (this._deffered) 
		for (var i = 0; i < this._deffered.length; ++i) {
			var deffered = this._deffered[i];
			deffered.apply(this);
		}
		this._deffered = null;
		return result;
	}
}


function wrap(object, methods) {
	if (object.Bind) {
		object.Bind = _defferedCall(object.Bind);		
	}
	if (object.Use) {
		object.Use = _defferedCall(object.Use);		
	}

	for (var i=1; i<arguments.length; ++i) {
		var methodName = arguments[i];
		object[methodName] = _deffered(object[methodName]);		
	}
}

function enshureBound() {
	if (!this.isBound()) {
		this.Bind();
	}
}

function enshureUsed() {
	if (!this.isUsed()) {
		this.Use();
	}
}

// Apply client state tracking advices

Aspect(o3gl.Texture2D.prototype).before("GenerateMipmap|Filter|Wrap|Image", enshureBound);
//Aspect(o3gl.Texture2D.Target.prototype).before("Image", enshureBound);
Aspect(o3gl.TextureCubeMap.prototype).before("GenerateMipmap|Filter|Wrap|Image", enshureBound);
// Aspect(o3gl.TextureCubeMap.Target.prototype).before("Image", enshureBound);
Aspect(o3gl.ArrayBuffer.prototype).before("Data", enshureBound);
Aspect(o3gl.ElementArrayBuffer.prototype).before("Data", enshureBound);
Aspect(o3gl.FrameBufferDefault).before("Viewport|ClearColorBuffer|ClearDepthBuffer|Clear|DepthMask|DepthTest|ColorMask|SetClearColor|SetClearDepth", enshureBound);
Aspect(o3gl.FrameBuffer.prototype).before("Viewport|ClearColorBuffer|ClearDepthBuffer|Clear|DepthMask|DepthTest|ColorMask|SetClearColor|SetClearDepth|Color|Depth|Stencil",enshureBound);
Aspect(o3gl.RenderBuffer.prototype).before("Storage", enshureBound);
Aspect(o3gl.Program.prototype).before("^Set", enshureUsed);


// Resource methods
o3gl.createTexture2D = function() {
	return new o3gl.Texture2D();
}
o3gl.createTextureCubeMap = function() {
	return new o3gl.TextureCubeMap();
}
o3gl.createArrayBuffer = function(data) {
	return new o3gl.ArrayBuffer(data);
}
o3gl.createElementArrayBuffer = function(data) {
	return new o3gl.ElementArrayBuffer(data);
}
o3gl.createFrameBuffer = function() {
	return new o3gl.FrameBuffer();
}
o3gl.defaultFrameBuffer = function() {
	return o3gl.FrameBufferDefault;
}
o3gl.createRenderBufferDepth = function() {
	return new o3gl.RenderBufferDepth();
}
o3gl.createRenderBufferStencil = function() {
	return new o3gl.RenderBufferDepth();
}
o3gl.createShader = function(sources) {
	return new o3gl.Shader(sources);
}
o3gl.createProgram = function(shader1,shader2) {
	return new o3gl.Program(shader1,shader2);
}

o3gl.sources = function(sources1, sources2) {
	return new o3gl.ProgramSources(sources1, sources2);
}

return o3gl;
}
