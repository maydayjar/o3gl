// https://developer.mozilla.org/en-US/docs/Web/WebGL/WebGL_best_practices


function O3GL (context) {
	this.gl = context;
	
	var o3gl = {
		
	};
	
	return result;
}



/*********************************************
* 			UTILS
**********************************************/	
var Utils = {
	Todo : function () {
		var array = [];					
		var add = function(f, name) {
			if (name) 
				array[name] = f;
			else
				array.push(f);
		}
		var run = function() {
			if (array.length) {
				for(var i=0; i<array.length; ++i) {
					array[i]();
				}
				array.length = 0;
			}
			for (var name in array) {
				if (array[name]) array[name]();
				array[name] = null;
			}
		}
		var result = function (f) {
			if (f) 
				add(f);
			else 
				run();
		}
		// Expose
		result.add = add;
		result.run = run;
			return result;			
	}
	,
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
	glShaderType : function (sources) {
        if (!(sources instanceof Array)) sources = [sources];
		if (Preprocessor.isVertexShader(sources)) return gl.VERTEX_SHADER;
		if (Preprocessor.isFragmentShader(sources)) return gl.FRAGMENT_SHADER;
		return undefined;
	}
	,
	toArray : function(args, firstElement, lastElement) {
		var result = [];
		var isFirst = false;
		if (firstElement === undefined) isFirst = true;
		for (var i = 0; i < args.length; ++i) {
			if (!isFirst) {
				if (args[i] === firstElement) isFirst = true;
			}
			if (isFirst) {
				if (args[i] instanceof Array) {
					if (i === args.length - 1 && result.length === 0) {
						return args[i];
					} 
					for (var j=0; j < args[i].length; ++j) {
						result.push(args[i][j]);
					}
				} else {
						result.push(args[i]);					
				}
				if (args[i] === lastElement) break;
			} 
		}
		return result;
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
				if (!defined[name] && right.match(name)) return false;
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

function Texture2D() {
//	this.magFilter 		= gl.LINEAR;
//	this.minFilter 		= gl.LINEAR;	// gl.LINEAR_MIPMAP_NEAREST
//	this.wraps 			= gl.CLAMP_TO_EDGE;
//	this.wrapt 			= gl.CLAMP_TO_EDGE;
	// Specifies the target texture. Must be GL_TEXTURE_2D, GL_PROXY_TEXTURE_2D, GL_TEXTURE_1D_ARRAY, GL_PROXY_TEXTURE_1D_ARRAY, GL_TEXTURE_RECTANGLE, GL_PROXY_TEXTURE_RECTANGLE, GL_TEXTURE_CUBE_MAP_POSITIVE_X, GL_TEXTURE_CUBE_MAP_NEGATIVE_X, GL_TEXTURE_CUBE_MAP_POSITIVE_Y, GL_TEXTURE_CUBE_MAP_NEGATIVE_Y, GL_TEXTURE_CUBE_MAP_POSITIVE_Z, GL_TEXTURE_CUBE_MAP_NEGATIVE_Z, or GL_PROXY_TEXTURE_CUBE_MAP.
	this._target 		= undefined; 	// gl.TEXTURE_2D;

	// Specifies the level-of-detail number. Level 0 is the base image level. Level n is the nth mipmap reduction image. If target is GL_TEXTURE_RECTANGLE or GL_PROXY_TEXTURE_RECTANGLE, level must be 0.
	this.level 			= 0; // Mipmap level
	// Specifies the number of color components in the texture.
	this.internalFormat = gl.RGBA;
	// This value must be 0.
	this.border 		= 0;
	// Specifies the format of the pixel data. The following symbolic values are accepted: GL_RED, GL_RG, GL_RGB, GL_BGR, GL_RGBA, and GL_BGRA.
	this.format 		= gl.RGBA;
	// Specifies the data type of the pixel data. The following symbolic values are accepted: GL_UNSIGNED_BYTE, GL_BYTE, GL_UNSIGNED_SHORT, GL_SHORT, GL_UNSIGNED_INT, GL_INT, GL_FLOAT, GL_UNSIGNED_BYTE_3_3_2, GL_UNSIGNED_BYTE_2_3_3_REV, GL_UNSIGNED_SHORT_5_6_5, GL_UNSIGNED_SHORT_5_6_5_REV, GL_UNSIGNED_SHORT_4_4_4_4, GL_UNSIGNED_SHORT_4_4_4_4_REV, GL_UNSIGNED_SHORT_5_5_5_1, GL_UNSIGNED_SHORT_1_5_5_5_REV, GL_UNSIGNED_INT_8_8_8_8, GL_UNSIGNED_INT_8_8_8_8_REV, GL_UNSIGNED_INT_10_10_10_2, and GL_UNSIGNED_INT_2_10_10_10_REV.
	this.type 			= gl.UNSIGNED_BYTE;
	// Specifies the width of the texture image. All implementations support texture images that are at least 1024 texels wide.
//	this.width 			= undefined;
	// Specifies the height of the texture image, or the number of layers in a texture array, in the case of the GL_TEXTURE_1D_ARRAY and GL_PROXY_TEXTURE_1D_ARRAY targets. All implementations support 2D texture images that are at least 1024 texels high, and texture arrays that are at least 256 layers deep.
//	this.height 		= undefined;
	// Specifies a pointer to the image data in memory.
//	this.data 			= undefined;

	// Specifies the target texture. Must be GL_TEXTURE_2D, GL_PROXY_TEXTURE_2D, GL_TEXTURE_1D_ARRAY, GL_PROXY_TEXTURE_1D_ARRAY, GL_TEXTURE_RECTANGLE, GL_PROXY_TEXTURE_RECTANGLE, GL_TEXTURE_CUBE_MAP_POSITIVE_X, GL_TEXTURE_CUBE_MAP_NEGATIVE_X, GL_TEXTURE_CUBE_MAP_POSITIVE_Y, GL_TEXTURE_CUBE_MAP_NEGATIVE_Y, GL_TEXTURE_CUBE_MAP_POSITIVE_Z, GL_TEXTURE_CUBE_MAP_NEGATIVE_Z, or GL_PROXY_TEXTURE_CUBE_MAP.
	this._target 		= gl.TEXTURE_2D;
	this._targetTexture = gl.TEXTURE_2D;
	this.mipmap 		= false;

	this.textureId = gl.createTexture();	
}
Texture2D.prototype = {
	Id : function() {
		return this.textureId;
	}
	,
	Delete : function() {
		gl.deleteTexture(this.textureId);
	}
	,
	Bind : function() {
		gl.bindTexture(this._target, this.textureId);
		// Texture itself has no methods except bind.
		return this; // Return intrface with all the texture manipulation API
	}
	,
	GenerateMipmap : function() {
		gl.generateMipmap(this._target);
		return this;
	}
	,
	Image2D : function() {
		var data;
		var xOffset;
		var yOffset;
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
		if (arguments.length == 5) {
			data 	= arguments[0];
			xOffset = arguments[1];
			yOffset = arguments[2];
			width 	= arguments[3];
			height 	= arguments[4];
		}
		
		if (data) {
			if (xOffset && yOffset && width && height) {
				
			} else {
				gl.texImage2D(this._targetTexture,
					this.level, 
					this.internalFormat, 
					this.format, 
					this.type, 
					data);		
				
				if (this.isFilterRequiresMipmap()) {
					var isPowerOfTwo = (width % 2 !== 0 || height % 2 !== 0);
					if (isPowerOfTwo) {
						gl.generateMipmap(this._target);
					} else {
						// Filter settings are incorrect
					}
				}
			}
		} else if (width && height) {
			var isPowerOfTwo = (width % 2 === 0 && height % 2 === 0);
		
			gl.texImage2D(this._targetTexture,
				this.level, 
				this.internalFormat, 
				width, height, 
				this.border, 
				this.format, 
				this.type, null);
				
			if (this.isFilterRequiresMipmap()) {
				
				if (isPowerOfTwo) {
					gl.generateMipmap(this._target);
				} else {
					// Filter settings are incorrect
				}
			}
		}

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
		this.mipmap = true;
		return this;
	}
	,
	/** Linearly interpolate in the nearest mipmap level */
	FilterMinNearestMipmapLinear : function () {
		gl.texParameteri(this._target, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
		this.mipmap = true;
		return this;
	}
	,
	/** Use the nearest neighbor after linearly interpolating between mipmap levels */
	FilterMinLinearMipmapNearest : function () {
		gl.texParameteri(this._target, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
		this.mipmap = true;
		return this;
	}
	,
	/** Linearly interpolate both the mipmap levels and at between texels */
	FilterMinLinearMipmapLinear : function () {
		gl.texParameteri(this._target, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
		this.mipmap = true;
		return this;
	}
    ,
    FilterNearest : function() {
        this.FilterMinNearest();
        this.FilterMinNearest();
        return this;
    }
    ,
    FilterLinear : function() {
        this.FilterMinLinear();
        this.FilterMagLinear();
        return this;
    }
    ,
    wrap : function (wraps, wrapt) {
		gl.texParameteri(this._target, gl.TEXTURE_WRAP_S, wraps);
		gl.texParameteri(this._target, gl.TEXTURE_WRAP_T, wrapt);
		return this;		
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
	typeUnsignedByte : function() { 
		this.type = gl.UNSIGNED_BYTE;
		return this;
	}
	,
	typeFloat : function() { 
		var isExtension = gl.getExtension("OES_texture_float");
		if (isExtension) {
			this.type = gl.FLOAT;
		} else {
			throw new TypeError("Float textures are not supported");
		}
		return this;
	}	
}


function TextureCubeMap() {
	this.level 			= 0;
	this.internalFormat = gl.RGBA;
	this.border 		= 0;
	this.format 		= gl.RGBA;
	this.type 			= gl.UNSIGNED_BYTE;

	this._target			= gl.TEXTURE_CUBE_MAP;
	this._targetTexture	= gl.TEXTURE_CUBE_MAP_POSITIVE_X;
	this.mipmap 		= false; // Due to OpenGL ES restriction
	
	this.textureId = gl.createTexture();
}

TextureCubeMap.prototype = Object.create(Texture2D.prototype);

TextureCubeMap.prototype.positiveX = function() {
	this._targetTexture = gl.TEXTURE_CUBE_MAP_POSITIVE_X;
	return this;
}
TextureCubeMap.prototype.negativeX = function() {
	this._targetTexture = gl.TEXTURE_CUBE_MAP_NEGATIVE_X;
	return this;
}
TextureCubeMap.prototype.positiveY = function() {
	this._targetTexture = gl.TEXTURE_CUBE_MAP_POSITIVE_Y;
	return this;
}
TextureCubeMap.prototype.negativeY = function() {
	this._targetTexture = gl.TEXTURE_CUBE_MAP_NEGATIVE_Y;
	return this;
}
TextureCubeMap.prototype.positiveZ = function() {
	this._targetTexture = gl.TEXTURE_CUBE_MAP_POSITIVE_Z;
	return this;
}
TextureCubeMap.prototype.negativeZ = function() {
	this._targetTexture = gl.TEXTURE_CUBE_MAP_NEGATIVE_Z;
	return this;
}

/**
* This class implements deffered target and type resolve,
* relying on the buffer's usage context
*/
function Buffer(data) {
	this._data = data;
	
	this._usage 		= gl.STATIC_DRAW;			// gl.STATIC_DRAW gl.DYNAMIC_DRAW
	this._target 		= undefined;				// gl.ARRAY_BUFFER gl.ELEMENT_ARRAY_BUFFER
	this._type 			= undefined;				// Component type

	this._bufferId 		= gl.createBuffer();
	
	this.Bind = function() {
		gl.bindBuffer(this._target, this._bufferId);
		if (this._data) {
			this.Data(this._data);
			delete this._data;
		}
	}
}

Buffer.Pointer = function(buffer) {
    this._buffer = buffer;
    this._strideBytes = 0;
    this._offsetBytes = 0;
    this._length;     // Length
}

function ArrayBuffer(noarguments) {
	this._usage 		= gl.STATIC_DRAW;			// gl.STATIC_DRAW gl.DYNAMIC_DRAW
	this._target 		= gl.ARRAY_BUFFER;			// gl.ARRAY_BUFFER gl.ELEMENT_ARRAY_BUFFER
	this._type 			= undefined;				// Component type
    // Pointer
    this._normalized    = false;

    this._bufferId 		= gl.createBuffer();
}
function ElementArrayBuffer(noarguments) {
	this._usage 		= gl.STATIC_DRAW;			// gl.STATIC_DRAW gl.DYNAMIC_DRAW
	this._target 		= gl.ELEMENT_ARRAY_BUFFER;	// gl.ARRAY_BUFFER gl.ELEMENT_ARRAY_BUFFER
	this._type 			= undefined;				// Component type
	this._bufferId 		= gl.createBuffer();
}

Buffer.prototype = ArrayBuffer.prototype = ElementArrayBuffer.prototype = 
{
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
    Pointer : function() {
        return new Buffer.Pointer(this);
    }
    ,
	_targetArrayBuffer : function() {
		this._target = gl.ARRAY_BUFFER;
	}
	,
	_targetElementArrayBuffer : function() {
		this._target = gl.ELEMENT_ARRAY_BUFFER;
	}
    ,
    /**
     * The “normalized” indicates whether integer types are accepted directly or normalized to [0;1] (for unsigned types)
     * or [-1;1] (for signed types)
     * @param enable
     */
    normalized : function() {
        // Assert one of the integer types.
        // i.e. typeByte().normalized()
        this._normalized = true;
        return this;
    }
    ,
    stride : function(value) {
        this._stride = value;
        return this;
    }
	,
    offset : function(value) {
        this._offset = value;
        return this;
    }
    ,
    usageStaticDraw : function() {
		this._usage = gl.STATIC_DRAW;
		var builder = this; 
		return builder;
	}
	,
	usageDynamicDraw : function() {
		this._usage = gl.DYNAMIC_DRAW;
		var builder = this; 
		return builder;
	}
	,
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
		if (!offset) offset = 0;
		if (!this.length) this.length = 0;
				
		if (this.length >= array.length) {
			gl.bufferSubData(this._target, offset, typedArray);
		} else {
			gl.bufferData(this._target, typedArray, this._usage);
			this.length = array.length;
		}
		return this;
	}
}

function FrameBuffer() {
	this.frameBufferId = gl.createFramebuffer();
}
FrameBuffer.prototype = {
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
		// ???
		if (this.bufferViewport) {
			var x = this.bufferViewport[0];
			var y = this.bufferViewport[1];
			var w = this.bufferViewport[2];
			var h = this.bufferViewport[3];
			gl.viewport(x, y, w, h);
		}
		var bound = this;
		return bound;
	}
	,
	CheckStatus : function() {
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
	Texture2D : function(rt0, rt1, rt2, rt3, rt4, rt5) {
		var COLOR_ATTACHEMENT = [
			gl.COLOR_ATTACHMENT0,
			gl.COLOR_ATTACHMENT1,
			gl.COLOR_ATTACHMENT2,
			gl.COLOR_ATTACHMENT3				
		];
	
		for (var i=0; i<arguments.length; ++i) {
			var level = 0; // Must be 0;
			var texture 	= arguments[i];
			var textureId = texture.Id();
			var textureTarget = texture._targetTexture;
			
			if (!texture.isFrameBufferCompatible()) {
				throw "Texture is not framebuffer compatible";
			}
			
			gl.framebufferTexture2D(gl.FRAMEBUFFER, COLOR_ATTACHEMENT[i], textureTarget, textureId, level);			
		}
		var bound = this;
		return bound;
	}
	,
	RenderBuffer : function(renderBuffer) {
		if (renderBuffer instanceof RenderBufferDepth) {
			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderBuffer.Id());
		}
		else if (renderBuffer instanceof RenderBufferStencil) {
			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.RENDERBUFFER, renderBuffer.Id());
		}

		// RenderBuffer stencil
		return this;
	}
	,
	Viewport : function(x,y,width,height) {
        gl.viewport(x,y,width,height);
		return this;
	}
	,
	ClearColorBuffer : function(r,g,b,a) {
		gl.clearColor(r, g, b, a);
		gl.clear(gl.COLOR_BUFFER_BIT);
		var bound = this;
		return bound;
	}
	,
	ClearDepthBuffer : function() {
		gl.clear(gl.DEPTH_BUFFER_BIT);
		var bound = this;
		return bound;
	}	
	,
	Clear : function() {
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);		
	}
	,
	DepthMask : function(enable) {
		gl.depthMask(enable);
		var bound = this;
		return bound;
	}
	,
	DepthTest : function(enable) {
		if (enable) 
			gl.enable(gl.DEPTH_TEST);
		else
			gl.disable(gl.DEPTH_TEST);
		var bound = this;
		return bound;
	}
}

function FrameBufferPool() {
	
}

/**
 *
 * @param {Number} width
 * @param {Number} height
 * @constructor
 */
function RenderBufferDepth(width, height) {
//	this.width 	= width;
//	this.height = height;
	this.depthComponent = gl.DEPTH_COMPONENT16;

	this.renderBufferId = gl.createRenderbuffer();
    if (width && height) {
        this.Bind().Storage(width, height);
    }
}

RenderBufferDepth.prototype = {
	Id : function() {
		return this.renderBufferId;
	}
	,
	Bind : function() {
		gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderBufferId);
		return this;
		// WHY???
	}
	,
	Storage : function(width, height) {
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
		return this;
	}
	,
	Delete : function() {
		gl.deleteRenderbuffer(this.renderBufferId)
	}
}

/**
 *
 * @param {String|Array} sources
 * @constructor
 */
function Shader(sources) {
    this.shaderType = Utils.glShaderType(sources);
    if (sources instanceof Array) {
        sources = Preprocessor.getLines(sources);   // Convert to one-dimension String array
        sources = sources.join("\n");               // Merge to the string
    }
	this.shaderId = gl.createShader(this.shaderType);
	this.Source(sources).Compile();
}
function VertexShader(sources) {
    if (sources instanceof Array) {
        sources = Preprocessor.getLines(sources).join("\n");
    }
	this.shaderType = gl.VERTEX_SHADER;
	this.shaderId = gl.createShader(this.shaderType);
	this.Source(sources).Compile();
}
function FragmentShader(sources) {
    if (sources instanceof Array) {
        sources = Preprocessor.getLines(sources).join("\n");
    }
    this.shaderType = gl.FRAGMENT_SHADER;
	this.shaderId = gl.createShader(this.shaderType);
	this.Source(sources).Compile();
}
function GeometryShader(source) {
}
Shader.prototype = VertexShader.prototype = FragmentShader.prototype = {
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

/**
 *
 * @param {Shader} shader1
 * @param {Shader} shader2
 * @constructor
 */
function Program(shader1,shader2) {
	// Create the program gl resuource
	this.programId = gl.createProgram();
	// Build the program with given shaders
	this._attachShader(shader1, shader2)._link();

	// Auto assigned sampler indicies
	this.textureIndex = {};
	// Uniform and attribute cache
	this.attributes = undefined; // {name:...; location:...; type:...; size:...;}	
	this.uniforms = undefined; // {name:...; location:...; type:...; size:...;}	
	
	// Some draw methods has default versions that rely on the used VBO's traits
	this.elementsCount = undefined;
	// Shit!!!
	this.getTextureIndex = function (uniformName) {
		return Utils.counter(this.textureIndex, uniformName);
	}
}

Program.prototype = {
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
	/*
		gl.FLOAT
		gl.FLOAT_VEC2
		gl.FLOAT_VEC3
		gl.FLOAT_VEC4
		gl.INT
		gl.INT_VEC2
		gl.INT_VEC3
		gl.INT_VEC4
		gl.BOOL
		gl.BOOL_VEC2
		gl.BOOL_VEC3
		gl.BOOL_VEC4
		gl.FLOAT_MAT2
		gl.FLOAT_MAT3
		gl.FLOAT_MAT4
		gl.SAMPLER_2D
		gl.SAMPLER_CUBE
	*/
	
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
	}
	,
	_getAttributeSetter : function(type, size) {
		if (type === gl.FLOAT) 			return this.Attribute1f;
		if (type === gl.FLOAT_VEC2) 	return this.Attribute2f;
		if (type === gl.FLOAT_VEC3) 	return this.Attribute3f;
		if (type === gl.FLOAT_VEC4) 	return this.Attribute4f;
	}
	,
    /**
     *
     * @returns {Program}
     * @constructor
     */
	Use : function () {
		gl.useProgram(this.Id());
		
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

		
		return this;
	}
	,
    /**
     *
     * @param {string} name
     * @returns {*}
     */
	getUniformLocation : function (name) {
		return this.uniforms[name].location;

		/*
		var result = this.dictionary[name];
		if(!result) {
			result = gl.getUniformLocation(this.programId, name);
			this.dictionary[name] = result;
		}
		return result;
		*/
	}
	,
	getAttribLocation : function (name) {
		return this.attributes[name].location;

		/*
		var result = this.dictionary[name];
		if(!result) {
			result = gl.getAttribLocation(this.programId, name);
			this.dictionary[name] = result;
		}
		return result;
		*/
	}
	,
	getSize : function(name) { 
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

	/** 
		Helper method that allows setting of the uniform or attribute pointer using retrospections capabilities.
		Overloaded in strong types languages
	*/
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
		gl.uniformMatrix3fv(this.getUniformLocation(name), false, matrix);			
		return this;		
	}
	,
	UniformMatrix4fv: function(name, matrix) {
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
	Attribute1f : function(name, arrayBuffer) {
		arrayBuffer.typeFloat();
		this._vertexAttribPointer(name, 1, arrayBuffer);
		return this;
	}
	,
	Attribute2f : function(name, arrayBuffer) {
		arrayBuffer.typeFloat();
		this._vertexAttribPointer(name, 2, arrayBuffer);
		return this;
	}
	,
	Attribute3f : function(name, arrayBuffer) {
		arrayBuffer.typeFloat();
		this._vertexAttribPointer(name, 3, arrayBuffer);
		return this;
	}
	,
	Attribute4f : function(name, arrayBuffer) {
		arrayBuffer.typeFloat();
		this._vertexAttribPointer(name, 4, arrayBuffer);
		return this;
	}
	,
	_vertexAttribPointer : function (name, size, arrayBuffer) {
        // Every array buffer has assotiated with it pointer data
		var type        = arrayBuffer._type; // !!!
        var normalized  = arrayBuffer._normalized;
        var stride      = arrayBuffer._stride;
        var offset      = arrayBuffer._offset;

        // remember for default draw methods invocation
		this.elementsCount = arrayBuffer.length / size;
		
		var attributeLocation = this.getAttribLocation(name);
		arrayBuffer._targetArrayBuffer(); // Assert or deffered initialization for Buffer
		arrayBuffer.Bind();
		gl.enableVertexAttribArray(attributeLocation);
		gl.vertexAttribPointer(attributeLocation,
            size,   // Specifies the number of components per generic vertex attribute. Must be 1, 2, 3, 4. Additionally, the symbolic constant GL_BGRA is accepted by glVertexAttribPointer. The initial value is 4.
            type,   // Specifies the data type of each component in the array
            normalized,  // Specifies whether fixed-point data values should be normalized (GL_TRUE) or converted directly as fixed-point values (GL_FALSE) when they are accessed.
            stride, // Specifies the byte offset between consecutive generic vertex attributes. If stride is 0, the generic vertex attributes are understood to be tightly packed in the array. The initial value is 0.
            offset  // Specifies a offset of the first component of the first generic vertex attribute in the array in the data store of the buffer currently bound to the GL_ARRAY_BUFFER target. The initial value is 0.
        );
	}
	,
	_drawPrimitives : function(mode, first, count) {
		if (this.elementArrayBuffer) {
//			this.elementArrayBuffer._targetElementArrayBuffer(); // Assert or deffered initialization for Buffer
			this.elementArrayBuffer.Bind();
			var elementsCount 	= this.elementArrayBuffer.length;
			var elementType 	= this.elementArrayBuffer._type;
			var offsetBytes		= 0;
			gl.drawElements(mode, elementsCount, elementType, offsetBytes);
			// Element array buffer has to be set before every render call
			// like attributes
			this.elementArrayBuffer = undefined;
		} else {
			if (first === undefined) first = 0;
			if (count === undefined) count = this.elementsCount;
			gl.drawArrays(mode, first, count);
		}
		return this;		
	}
	,
	Elements : function(elementArrayBuffer) {
		this.elementArrayBuffer = elementArrayBuffer;
		elementArrayBuffer._targetElementArrayBuffer(); // Assert or deffered initialization for Buffer		
		elementArrayBuffer.Bind(); // Build it
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

/*
// Inout paradigm
	Proxy.program(Shaders.Phong).
		in("aPosition",cube.positions).
		in("aPosition",cube.positions).
		in(cube.indexes).
		out(texture1).inout(depthBuffer).
		Bind().DrawTriangles();
*/

/**
* Shaders preprocessor, shaders cache, textures cache, vbo cache???
*/
function Proxy(shaderSource1, shaderSource2, shaderSource3) {
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
		this.vertexShaderSource = shaderSource1.Vertex;
		this.fragmentShaderSource = shaderSource1.Fragment;		
	}
	
	for (var i = 0; i < arguments.length; ++i) {
		var source = arguments[i];
		if (Preprocessor.isVertexShader(source)) {
			this.vertexShaderSource = Preprocessor.getLines(source);
		}
		if (Preprocessor.isFragmentShader(source)) {
			this.fragmentShaderSource = Preprocessor.getLines(source);
		}
	}
	
	this.variables = {};
	
	this._defined = {};
}

Proxy.prototype = {
	Use : function() {
		if (!this.program) {
			// Collect declared variable names
			var defined = {};
			for (var name in this.variables) {
				defined[name] = true;
			}
			// Exclude lines with undeclared variables;
			this.vertexShaderSource = Preprocessor.excludeUndefined(this.vertexShaderSource, defined);
			this.fragmentShaderSource = Preprocessor.excludeUndefined(this.fragmentShaderSource, defined);

			this.program = new Program(
				new Shader(this.vertexShaderSource.join("\n")) , new Shader(this.fragmentShaderSource.join("\n"))
			);			
		}
		
		var result = this.program.Use(); //!!!
		// Assign default values:
		for (var name in this.variables) {
			var f = this.variables[name];
			if (f) f(this.program);
		}
		if (this.elementArrayBuffer) this.program.Elements(this.elementArrayBuffer);

		return result;
	}
	,
	Delete : function() {
		// here we have to delete all the internally created resources
	}
	,
	Set : function(name) {
		if (arguments.length === 1) {
			this.variables[name] = null; // declare or remove from defaults
		} else {
			var parameters = arguments;
			this.variables[name] = function(program) { 
				program.Set.apply(program, parameters);
			}
		}
		// Proxied program can be used only after at least one uniform or attribute has been set.
		// Othervise it's usage is same like Program and makes no sense
		var useable = this;
		return useable;	
	}
	,
	UniformMatrix4fv: function(name, matrix) {
		if (matrix) this.variables[name] = function(program) { program.UniformMatrix4fv(name, matrix); } 
		else this.variables[name] = null; // declare or remove from defaults
		
		// Proxied program can be used only after at least one uniform or attribute has been set.
		// Othervise it's usage is same like Program and makes no sense
		var useable = this;
		return useable;
	}
	,
	UniformMatrix3fv: function(name, matrix) {
		if (matrix) 
			this.variables[name] = function(program) { program.UniformMatrix3fv(name, matrix); }
		else 
			this.variables[name] = null;
		return this;
	}
	,
	Uniform1f: function(name, v1) {
		if (arguments.length === 1) {
			this.variables[name] = null;			
			return this;
		}
		this.variables[name] = function(program) { 
			program.Uniform1f(name, v1);			
		}
		return this;
	}
	,
	Uniform2f: function(name, v1, v2) {
		if (arguments.length === 1) {
			this.variables[name] = null;			
			return this;
		}
		this.variables[name] = function(program) { 
			program.Uniform2f(name, v1, v2);			
		}
		return this;
	}
	,
	Uniform3f: function(name, v1, v2, v3) {
		if (arguments.length === 1) {
			this.variables[name] = null;			
			return this;
		}
		this.variables[name] = function(program) { 
			program.Uniform3f(name, v1, v2, v3);			
		}
		return this;
	}
	,
	Uniform4f: function(name, v1, v2, v3, v4) {
		if (arguments.length === 1) {
			this.variables[name] = null;			
			return this;
		}
		this.variables[name] = function(program) { 
			program.Uniform4f(name, v1, v2, v3, v4);			
		}
		return this;
	}
	,
	Uniform1fv: function(name, value) { // value must be an array
		if (arguments.length === 1) {
			this.variables[name] = null;			
			return this;
		}
		this.variables[name] = function(program) { 
			program.Uniform1fv(name, value);			
		}
		return this;
	}
	,
	Uniform2fv: function(name, value) { // value must be an array
		if (arguments.length === 1) {
			this.variables[name] = null;			
			return this;
		}
		this.variables[name] = function(program) { 
			program.Uniform2fv(name, value);			
		}
		return this;
	}
	,
	Uniform3fv: function(name, value) { // value must be an array
		if (arguments.length === 1) {
			this.variables[name] = null;			
			return this;
		}
		this.variables[name] = function(program) { 
			program.Uniform3fv(name, value);			
		}
		return this;
	}
	,
	Uniform4fv: function(name, value) { // value must be an array
		if (arguments.length === 1) {
			this.variables[name] = null;			
			return this;
		}
		this.variables[name] = function(program) { 
			program.Uniform4fv(name, value);			
		}
		return this;
	}
	,
	Uniform1i: function(name, v1) {
		if (arguments.length === 1) {
			this.variables[name] = null;			
			return this;
		}
		this.variables[name] = function(program) { 
			program.Uniform1i(name, v1);			
		}
		return this;
	}
	,
	Uniform1iv: function(name, value) { // value must be an array
		if (arguments.length === 1) {
			this.variables[name] = null;			
			return this;
		}
		this.variables[name] = function(program) { 
			that.program.Uniform1iv(name, value);			
		}
		return this;
	}
	,
	Uniform2iv: function(name, value) { // value must be an array
		if (arguments.length === 1) {
			this.variables[name] = null;			
			return this;
		}
		this.variables[name] = function(program) { 
			program.Uniform2iv(name, value);			
		}
		return this;
	}
	,
	Uniform3iv: function(name, value) { // value must be an array
		if (arguments.length === 1) {
			this.variables[name] = null;			
			return this;
		}
		this.variables[name] = function(program) { 
			program.Uniform3iv(name, value);			
		}
		return this;
	}
	,
	Uniform4iv: function(name, value) { // value must be an array
		if (arguments.length === 1) {
			this.variables[name] = null;			
			return this;
		}
		this.variables[name] = function(program) { 
			program.Uniform4iv(name, value);			
		}
		return this;
	}
	,
	UniformSampler : function(name, texture) {
		if (arguments.length === 1) {
			this.variables[name] = null;			
			return this;
		}
		this.variables[name] = function(program) { 
			program.UniformSampler(name, texture);			
		}
		return this;
	}
	,
	Attribute1f : function(name, arrayBuffer) {
		if (arguments.length === 1) {
			this.variables[name] = null;			
			return this;
		}
		this.variables[name] = function(program) {
			program.Attribute1f(name, arrayBuffer);
		}
		return this;
	}
	,
	Attribute2f : function(name, arrayBuffer) {
		if (arguments.length === 1) {
			this.variables[name] = null;			
			return this;
		}
		this.variables[name] = function(program) {
			program.Attribute2f(name, arrayBuffer);
		}
		return this;
	}
	,
    /**
     *
     * @param name
     * @param arrayBuffer
     * @returns {Proxy}
     * @constructor
     */
	Attribute3f : function(name, arrayBuffer) {
		if (arguments.length === 1) {
			this.variables[name] = null;			
			return this;
		}
		this.variables[name] = function(program) {
			program.Attribute3f(name, arrayBuffer, 3);
		}
		return this;
	}
	,
	Attribute4f : function(name, arrayBuffer) {
		if (arguments.length === 1) {
			this.variables[name] = null;			
			return this;
		}
		this.variables[name] = function(program) {
			program.Attribute4f(name, arrayBuffer);
		}
		return this;
	}
	,
	Elements : function(elementArrayBuffer) {
		this.elementArrayBuffer = elementArrayBuffer;
		return this;
	}
}

Multimap = function() {
    this._keys = [];
    this._values = [];
}

Multimap.equals = function(array1, array2) {
    if (array1 === array2) return true;
    if (!array1.length || !array2.length) return false;
    if (! array1 || ! array2) return false;
    if (array1.length !== array2.length) return false;

    for (var i = 0; i < array1.length; ++i) {
        if (array1[i] !== array2[i]) return false;
    }

    return true;
}

Multimap.prototype.put = function(keys, value) {
    for (var i = 0; i < this._keys.length; ++i) {
        var key = this._keys[i];
        if (Multimap.equals(keys, key)) {
            this._values[i] = value;
            return;
        }
    }
    this._keys.push(keys);
    this._values.push(value);
}

Multimap.prototype.get = function(keys) {
    for (var i = 0; i < this._keys.length; ++i) {
        var key = this._keys[i];
        if (Multimap.equals(keys, key)) {
            return this._values[i];
        }
    }
}


o3.Proxy = function() {
    this._keys = [];
    this._values = [];
}

o3.Proxy.prototype = {
    Delete : function() {

    }
    ,
    program : function(vertexShaderSources, fragmentShaderSources) {

    }
    ,
    in : function(name, value) {
        return this;
    }
    ,
    out : function(value) {
        return this;
    }
    ,
    inout : function(value) {
        return this;
    }
}

o3.Proxy.Program = function(proxy) {
    this._proxy = proxy;
    this._program = null;
    this._in = {};
    this._out = {};
    this._inout = {};
}

o3.Proxy.Program.prototype = {
    in : function(name, value) {
        this._in[name] = value;
        return this;
    }
    ,
    out : function(value) {
        this._out[name] = value;
        return this;
    }
    ,
    inout : function(value) {
        this._inout[name] = value;
        return this;
    }
}