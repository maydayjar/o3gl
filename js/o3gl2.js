// https://developer.mozilla.org/en-US/docs/Web/WebGL/WebGL_best_practices

function O3GL (context) {
gl = context;
	
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
	glSizeOfType : function (glType) {
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




// AUXILLARY METHODS
o3gl.VertexAttrib = function(attributeLocation, v1, v2, v3, v4) {
	gl.disableVertexAttribArray(attributeLocation);
	switch(arguments.length) {
		case 2 : gl.vertexAttrib1f(attributeLocation, v1); break;
		case 3 : gl.vertexAttrib2f(attributeLocation, v1, v2); break;
		case 4 : gl.vertexAttrib3f(attributeLocation, v1, v2, v3); break;
		case 5 : gl.vertexAttrib4f(attributeLocation, v1, v2, v3, v4); break;
	}
}
o3gl.VertexAttribPointer = function (attributeLocation, arrayBufferPointer) {		
	//@See https://stackoverflow.com/questions/27316605/is-vertex-attrubute-pointer-persistent-in-opengl-es

	var arrayBuffer 	= arrayBufferPointer._buffer;
	var type        	= arrayBuffer._type; 			// !!!
	var normalized  	= arrayBuffer._normalized;		//
	
	var sizeOfTypeBytes = Utils.glSizeOfType(type);
	var size 			= arrayBufferPointer._size;
	var strideBytes     = arrayBufferPointer._stride * sizeOfTypeBytes;
	var offsetBytes     = arrayBufferPointer._offset * sizeOfTypeBytes;
		
	arrayBuffer.targetArrayBuffer(); // Assert or deffered initialization for Buffer
	arrayBuffer.Bind();
	gl.enableVertexAttribArray(attributeLocation);
	gl.vertexAttribPointer(attributeLocation,
		size,   // Specifies the number of components per generic vertex attribute. Must be 1, 2, 3, 4. Additionally, the symbolic constant GL_BGRA is accepted by glVertexAttribPointer. The initial value is 4.
		type,   // Specifies the data type of each component in the array
		normalized,  // Specifies whether fixed-point data values should be normalized (GL_TRUE) or converted directly as fixed-point values (GL_FALSE) when they are accessed.
		strideBytes, // Specifies the byte offset between consecutive generic vertex attributes. If stride is 0, the generic vertex attributes are understood to be tightly packed in the array. The initial value is 0.
		offsetBytes  // Specifies a offset of the first component of the first generic vertex attribute in the array in the data store of the buffer currently bound to the GL_ARRAY_BUFFER target. The initial value is 0.
	);
}




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

o3gl.Texture = function() {
//	this.magFilter 		= gl.LINEAR;
//	this.minFilter 		= gl.LINEAR_MIPMAP_NEAREST
//	this.wraps 			= gl.CLAMP_TO_EDGE;
//	this.wrapt 			= gl.CLAMP_TO_EDGE;
	// Specifies the target texture. Must be GL_TEXTURE_2D, GL_PROXY_TEXTURE_2D, GL_TEXTURE_1D_ARRAY, GL_PROXY_TEXTURE_1D_ARRAY, GL_TEXTURE_RECTANGLE, GL_PROXY_TEXTURE_RECTANGLE, GL_TEXTURE_CUBE_MAP_POSITIVE_X, GL_TEXTURE_CUBE_MAP_NEGATIVE_X, GL_TEXTURE_CUBE_MAP_POSITIVE_Y, GL_TEXTURE_CUBE_MAP_NEGATIVE_Y, GL_TEXTURE_CUBE_MAP_POSITIVE_Z, GL_TEXTURE_CUBE_MAP_NEGATIVE_Z, or GL_PROXY_TEXTURE_CUBE_MAP.
	this._target 		= undefined; 	// gl.TEXTURE_2D;

	// Specifies the level-of-detail number. Level 0 is the base image level. Level n is the nth mipmap reduction image. If target is GL_TEXTURE_RECTANGLE or GL_PROXY_TEXTURE_RECTANGLE, level must be 0.
	this._level 			= 0; // Mipmap level
	// Specifies the number of color components in the texture.
	this._internalFormat = gl.RGBA; // gl.ALPHA, gl.LUMINANCE, gl.LUMINANCE_ALPHA, gl.RGB, gl.RGBA
	// This value must be 0.
	this._border 		= 0;
	// Specifies the format of the pixel data. The following symbolic values are accepted: GL_RED, GL_RG, GL_RGB, GL_BGR, GL_RGBA, and GL_BGRA.
	this._format 		= gl.RGBA; // Contains the format for the source pixel data. Must match internalformat
	// Specifies the data type of the pixel data. The following symbolic values are accepted: GL_UNSIGNED_BYTE, GL_BYTE, GL_UNSIGNED_SHORT, GL_SHORT, GL_UNSIGNED_INT, GL_INT, GL_FLOAT, GL_UNSIGNED_BYTE_3_3_2, GL_UNSIGNED_BYTE_2_3_3_REV, GL_UNSIGNED_SHORT_5_6_5, GL_UNSIGNED_SHORT_5_6_5_REV, GL_UNSIGNED_SHORT_4_4_4_4, GL_UNSIGNED_SHORT_4_4_4_4_REV, GL_UNSIGNED_SHORT_5_5_5_1, GL_UNSIGNED_SHORT_1_5_5_5_REV, GL_UNSIGNED_INT_8_8_8_8, GL_UNSIGNED_INT_8_8_8_8_REV, GL_UNSIGNED_INT_10_10_10_2, and GL_UNSIGNED_INT_2_10_10_10_REV.
	this._type 			= gl.UNSIGNED_BYTE;

	// Specifies the target texture. Must be GL_TEXTURE_2D, GL_PROXY_TEXTURE_2D, GL_TEXTURE_1D_ARRAY, GL_PROXY_TEXTURE_1D_ARRAY, GL_TEXTURE_RECTANGLE, GL_PROXY_TEXTURE_RECTANGLE, GL_TEXTURE_CUBE_MAP_POSITIVE_X, GL_TEXTURE_CUBE_MAP_NEGATIVE_X, GL_TEXTURE_CUBE_MAP_POSITIVE_Y, GL_TEXTURE_CUBE_MAP_NEGATIVE_Y, GL_TEXTURE_CUBE_MAP_POSITIVE_Z, GL_TEXTURE_CUBE_MAP_NEGATIVE_Z, or GL_PROXY_TEXTURE_CUBE_MAP.
	this._target 		= gl.TEXTURE_2D;
	this._targetTexture = gl.TEXTURE_2D;
	this._mipmap 		= false;

	this._textureId = gl.createTexture();	
	
	// auxillary texture size data
	this._size = [];
		
	// Size must be specified first!
	this.isPowerOfTwo = function() {
		for (var i = 0; i < this._size.length; ++i) {
			var dimension = this._size[i];
			if(dimension % 2 !== 0) return false;
		}
		return true;
	}
}


/*
	Auxillary class that refers to the texture level and target ()
*/
o3gl.Texture.Pointer = function(texture) {
	this.texture 			= texture;
	this._level 			= 0;
	this._targetTexture		= 0;
	
	this._xOffset			= undefined;
	this._yOffset			= undefined;
	this._width				= undefined;
	this._height			= undefined;
}

o3gl.Texture.prototype = {
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
		
		// TODO: we must consider following texture methods:
		// texImage2D						//
		// texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixels)					// Replaces a portion of an existing 2D texture image with all of another image.
		// compressedTexImage2D				//
		// compressedTexSubImage2D			//
		
		// copyTexImage2D(target, level, format, x, y, width, height, border);									// Copies a rectangle of pixels from the current WebGLFramebuffer into a texture image.
		// copyTexSubImage2D(target, level, xoffset, yoffset, x, y, width, height);								// Replaces a portion of an existing 2D texture image with data from the current framebuffer.
		
		if (data) {
			if (xOffset && yOffset && width && height) {
				// Replaces a portion of an existing 2D texture image with all of another image.
				gl.texSubImage2D(
					this._targetTexture,
					this._level,
					xOffset,
					yOffset,
					width,
					height,
					// this._internalFormat,  // Internal format is already specified
					this._format, 
					this._type, 
					data
				);
			} else {
				gl.texImage2D(this._targetTexture,
					this._level, 
					this._internalFormat, 
					this._format, 
					this._type, 
					data);		
				this._size[0] = data.width;
				this._size[1] = data.height;
				
				if (this.isFilterRequiresMipmap()) {
					if (this.isPowerOfTwo()) {
						gl.generateMipmap(this._target);
					} else {
						// Filter settings are incorrect
					}
				}
			}
		} else if (width && height) {
		
			gl.texImage2D(this._targetTexture,
				this._level, 
				this._internalFormat, 
				width, height, 
				this._border, 
				this._format, 
				this._type, null);
				
			this._size[0] = width;
			this._size[1] = height;
				
			if (this.isFilterRequiresMipmap()) {
				if (this.isPowerOfTwo()) {
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
	_Filter : function (glFilterMin, glFilterMag) {
		if (glFilterMin != null) {
			gl.texParameteri(this._target, gl.TEXTURE_MIN_FILTER, glFilterMin);		
		}
		if (glFilterMag != null) {
			gl.texParameteri(this._target, gl.TEXTURE_MAG_FILTER, glFilterMag);		
		}
		return this;
	}
    ,
	FilterMagLinear : function () {
		return this._Filter(null,gl.LINEAR);
	}
	,
	FilterMagNearest : function () {
		return this._Filter(null,gl.NEAREST);
	}
	,
	FilterMagLinearMipmapNearest : function () {
		return this._Filter(null,gl.LINEAR_MIPMAP_NEAREST);
	}
	,
	FilterMagLinearMipmapLinear : function () {
		return this._Filter(null,gl.LINEAR_MIPMAP_LINEAR);
	}
	,
	FilterMinLinear : function () {
		return this._Filter(gl.LINEAR,null);
	}
	,
	FilterMinNearest : function () {
		return this._Filter(gl.NEAREST,null);
	}
	,
	/** Use the nearest neighbor in the nearest mipmap level */
	FilterMinNearestMipmapNearest : function () {
		return this._Filter(gl.NEAREST_MIPMAP_NEAREST,null);
	}
	,
	/** Linearly interpolate in the nearest mipmap level */
	FilterMinNearestMipmapLinear : function () {
		return this._Filter(gl.NEAREST_MIPMAP_LINEAR,null);
	}
	,
	/** Use the nearest neighbor after linearly interpolating between mipmap levels */
	FilterMinLinearMipmapNearest : function () {
		return this._Filter(gl.LINEAR_MIPMAP_NEAREST,null);
	}
	,
	/** Linearly interpolate both the mipmap levels and at between texels */
	FilterMinLinearMipmapLinear : function () {
		return this._Filter(gl.LINEAR_MIPMAP_LINEAR,null);
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
        return this;
    }
    ,
	
    _Wrap : function (wraps, wrapt) {
		if(wraps != null) {
			gl.texParameteri(this._target, gl.TEXTURE_WRAP_S, wraps);
		}
		if (wrapt != null) {
			gl.texParameteri(this._target, gl.TEXTURE_WRAP_T, wrapt);
		}
		return this;		
	}
	,
	WrapClampToEdge : function () {
		return this._Wrap(gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE);
	}
	,
	WrapRepeat : function () {
		return this._Wrap(gl.REPEAT, gl.REPEAT);
	}
	,
	WrapMirroredRepeat : function () {
		return this._Wrap(gl.MIRRORED_REPEAT, gl.MIRRORED_REPEAT);
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
	,
	target1D : function() {
		this._target = gl.TEXTURE_1D;
		this._targetTexture = gl.TEXTURE_1D;
		return this;
	}	
	,
	target2D : function() {
		this._target = gl.TEXTURE_2D;
		this._targetTexture = gl.TEXTURE_2D;
		return this;
	}
	,
	target3D : function() {
		this._target = gl.TEXTURE_3D;
		this._targetTexture = gl.TEXTURE_3D;
		return this;
	}
	,
	targetCubeMap : function() {
		this._target = gl.TEXTURE_CUBE_MAP;
		return this;
	}
	,

	// TODO: must be implemented as an Buffer.pointer
	positiveX : function() {
		this._target = gl.TEXTURE_CUBE_MAP;
		this._targetTexture = gl.TEXTURE_CUBE_MAP_POSITIVE_X;
		return this;
	}
	,
	positiveY : function() {
		this._target = gl.TEXTURE_CUBE_MAP;
		this._targetTexture = gl.TEXTURE_CUBE_MAP_POSITIVE_Y;
		return this;
	}
	,
	positiveZ : function() {
		this._target = gl.TEXTURE_CUBE_MAP;
		this._targetTexture = gl.TEXTURE_CUBE_MAP_POSITIVE_Z;
		return this;
	}
	,
	negativeX : function() {
		this._target = gl.TEXTURE_CUBE_MAP;
		this._targetTexture = gl.TEXTURE_CUBE_MAP_NEGATIVE_X;
		return this;
	}
	,
	negativeY : function() {
		this._target = gl.TEXTURE_CUBE_MAP;
		this._targetTexture = gl.TEXTURE_CUBE_MAP_NEGATIVE_Y;
		return this;
	}
	,
	negativeZ : function() {
		this._target = gl.TEXTURE_CUBE_MAP;
		this._targetTexture = gl.TEXTURE_CUBE_MAP_NEGATIVE_Z;
		return this;
	}


}

/**
* This class implements deffered target and type resolve,
* relying on the buffer's usage context
*/
o3gl.Buffer = function() {
	// Basically usage parameter is a hint to OpenGL/WebGL how you intent to use the buffer. The OpenGL/WebGL can then optimize the buffer depending of your hint.
	this._usage 		= gl.STATIC_DRAW;			// gl.STATIC_DRAW gl.DYNAMIC_DRAW
	this._target 		= undefined;				// gl.ARRAY_BUFFER gl.ELEMENT_ARRAY_BUFFER
	this._type 			= undefined;				// Component type HINT. Used by pointers as default value

	this._bufferId 		= gl.createBuffer();	
}

o3gl.Buffer.prototype =
{
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
    pointer : function() {
        return new o3gl.Buffer.Pointer(this);
    }
    ,
	targetArrayBuffer : function() {
		this._target = gl.ARRAY_BUFFER;
		if (!this._type) {
			this._type = gl.FLOAT;
		}
		return this;
	}
	,
	targetElementArrayBuffer : function() {
		this._target = gl.ELEMENT_ARRAY_BUFFER;
		// Set the default value
		if (!this._type) {
			this._type = gl.UNSIGNED_SHORT;
		}
		return this;
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

o3gl.Buffer.Pointer = function(buffer) {
	// Assert buffer target is Array
	buffer.targetArrayBuffer();
    this._buffer = buffer;

    this._type = buffer._type;	// It is possible that buffer contains data of various types. So type must be set per pointer
    this._stride = 0;			// Stride in bytes
    this._offset = 0;			// Offset in bytes
	this._size = 4; 			// Specifies the number of components per generic vertex attribute. Must be 1, 2, 3, 4. Additionally, the symbolic constant GL_BGRA is accepted by glVertexAttribPointer. The initial value is 4.
	this._normalized = false;	// as
	
	this._divisor = 0;	// Extensions ANGLE_instanced_arrays, 
	
}

o3gl.Buffer.Pointer.prototype = {
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
}

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
		var bound = this;
		return bound;
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
		var bound = this;
		return bound;
	}
	,
	ClearDepthBuffer : function(depth) {
		if (depth === undefined) depth = 1.0; // Specification default values
		gl.clearDepth(depth);
		gl.clear(gl.DEPTH_BUFFER_BIT);
		var bound = this;
		return bound;
	}	
	,
	Clear : function() {
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);		
		return this;
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
	,
	ColorMask : function(r,g,b,a) {
		gl.colorMask(r,g,b,a);
		var bound = this;
		return bound;
	}
	,
	SetClearColor : function(r,g,b,a) {
		gl.clearColor(r,g,b,a);
		var bound = this;
		return bound;
	}
	,
	SetClearDepth : function(value) {
		// depth: floating-point number between 0.0 and 1.0, the default value is 1.0	
		gl.clearColor(depth);
		var bound = this;
		return bound;
	}
}


o3gl.FrameBuffer = function() {
	this.frameBufferId = gl.createFramebuffer();
	
	// Client state tracking
	// It seems there is no way to access texture size in OpenGL ES specification
	this._colorAttachment = [];
	this._depthAttachment = undefined;
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
		var bound = this;
		return bound;
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
			var texture 	= arguments[i];
			
			// Default texture attachement is 2d texture
			if (!texture._targetTexture) texture.targetTexture2D();

			texture.Bind();
			// texture.FilterLinear().WrapClampToEdge(); // What requirements should be here???
			var textureTarget = texture._targetTexture;
			var textureId = texture.Id();
			
			if (!texture.isFrameBufferCompatible()) {
				throw "Texture is not framebuffer compatible";
			}
			
			gl.framebufferTexture2D(gl.FRAMEBUFFER, COLOR_ATTACHEMENT[i], textureTarget, textureId, level);	

			this._colorAttachment[i] = texture;
		}
		var bound = this;
		return bound;
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
		var bound = this;
		return bound;
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
	this._target = gl.RENDERBUFFER; // must be GL_RENDERBUFFER.
	this._internalFormat = undefined; // Specifies the color-renderable, depth-renderable, or stencil-renderable format of the renderbuffer. Must be one of the following symbolic constants: GL_RGBA4, GL_RGB565, GL_RGB5_A1, GL_DEPTH_COMPONENT16, or GL_STENCIL_INDEX8
	this.formatDepthComponent16();
	this._renderBufferId = gl.createRenderbuffer();
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
	,
	formatDepthComponent16 : function() {
		this._internalFormat = gl.DEPTH_COMPONENT16;
		return this;
	}
	,
	formatStencilIndex8 : function() {
		this._internalFormat = gl.STENCIL_INDEX8;
		return this;
	}

}


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
	this.extension = gl.getExtension("OES_vertex_array_object"); // Vendor prefixes may apply!  
	this.vertexArrayObjectId = extension.createVertexArrayOES();
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
	Attribute1f : function(attributeLocation, pointer) {} // arraybuffers must be fully initialized here
	,
	Attribute2f : function(attributeLocation, pointer) {}
	,
	Attribute3f : function(attributeLocation, pointer) {}
	,
	Attribute4f : function(attributeLocation, pointer) {}
	,
	Elements :function(elementArrayBuffer) {}
}

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
	Attribute1f : function(name, v1) {
		var attributeLocation = this.getAttribLocation(name);
		if (v1 instanceof o3gl.Buffer.Pointer) {
			var arrayBufferPointer = v1;
			arrayBufferPointer.size(1);
			arrayBufferPointer.typeFloat();
			o3gl.VertexAttribPointer(attributeLocation, arrayBufferPointer);
			// remember for default draw methods invocation
			this._defaultElementsCount = arrayBufferPointer.getMaxElementsCount();
		} else {
			gl.disableVertexAttribArray(attributeLocation);
			gl.vertexAttrib1f(attributeLocation, v1); 
		}
		return this;
	}
	,
	Attribute2f : function(name, v1, v2) {
		var attributeLocation = this.getAttribLocation(name);
		if (v1 instanceof o3gl.Buffer.Pointer) {
			var arrayBufferPointer = v1;
			arrayBufferPointer.size(2);
			arrayBufferPointer.typeFloat();
			o3gl.VertexAttribPointer(attributeLocation, arrayBufferPointer);
			// remember for default draw methods invocation
			this._defaultElementsCount = arrayBufferPointer.getMaxElementsCount();
		} else {
			gl.disableVertexAttribArray(attributeLocation);
			gl.vertexAttrib2f(attributeLocation, v1, v2); 
		}
		return this;
	}
	,
	Attribute3f : function(name, v1, v2, v3) {
		var attributeLocation = this.getAttribLocation(name);
		if (v1 instanceof o3gl.Buffer.Pointer) {
			var arrayBufferPointer = v1;
			arrayBufferPointer.size(3);
			arrayBufferPointer.typeFloat();
			o3gl.VertexAttribPointer(attributeLocation, arrayBufferPointer);
			// remember for default draw methods invocation
			this._defaultElementsCount = arrayBufferPointer.getMaxElementsCount();
		} else {
			gl.disableVertexAttribArray(attributeLocation);
			gl.vertexAttrib2f(attributeLocation, v1, v2, v3); 
		}
		return this;
	}
	,
	Attribute4f : function(name, v1, v2, v3, v4) {
		var attributeLocation = this.getAttribLocation(name);
		if (v1 instanceof o3gl.Buffer.Pointer) {
			var arrayBufferPointer = v1;
			arrayBufferPointer.size(4);
			arrayBufferPointer.typeFloat();
			o3gl.VertexAttribPointer(attributeLocation, arrayBufferPointer);
			// remember for default draw methods invocation
			this._defaultElementsCount = arrayBufferPointer.getMaxElementsCount();
		} else {
			gl.disableVertexAttribArray(attributeLocation);
			gl.vertexAttrib2f(attributeLocation, v1, v2, v3, v4); 
		}
		return this;
	}
	,
	_drawPrimitives : function(glMode, elementArrayBuffer, first, count) {
		if (elementArrayBuffer) {
			elementArrayBuffer.targetElementArrayBuffer().Bind();
			var elementType 	= elementArrayBuffer._type; // The type of elements in the element array buffer. Must be a gl.UNSIGNED_SHORT.
			var elementsCount 	= undefined; // The number of elements to render.
			var offsetBytes		= 0; // Offset into the element array buffer. Must be a valid multiple of the size of type.
			
			if (first) {
				offsetBytes = Utils.glSizeOfType(elementType) * first; // elementType must be gl.UNSIGNED_SHORT here
			}
			
			if (count) {
				elementsCount = count;
			} else {
				elementsCount = elementArrayBuffer._length;
			}
			
			gl.drawElements(glMode, elementsCount, elementType, offsetBytes);
		} else {
			if (!first) {
				first = 0;
			}
			if (!count) {
				// Restore the last array buffer pointer elements count
				count = this._defaultElementsCount;
			}
			gl.drawArrays(glMode, first, count);
		}
		return this;		
	}
	,
	_invokeDrawPrimitives : function(mode, args) {
		this.elementArrayBuffer = undefined;
		var elementArrayBuffer;
		var first;
		var count;
		if (args.length === 1) {
			elementArrayBuffer = args[0];
		} else if (args.length === 2) {
			first = args[0];
			count = args[1];
		} else if (args.length === 3) {
			elementArrayBuffer = args[0];
			first = args[1];
			count = args[2];
		}
		this._drawPrimitives(mode, elementArrayBuffer, first, count);
	}
	,
	/** connects each group of three consecutive vertices to make a triangle - so 24 vertices produces 8 separate triangles. */
	DrawTriangles : function(first, count) {
		this.Use(); // assert current program
		this._invokeDrawPrimitives(gl.TRIANGLES, arguments);
		return this;
	}
	,
	/** is a little harder to get your head around...let's letter our 24 vertices 'A' through 'X'. 
	* This produces N-2 triangles where N is the number of vertices...the first triangle connects vertices A,B,C, 
	* the remaining triangles are each formed from the previous two vertices of the last triangle...(swapped over to keep the triangle facing the same way) plus one new vertex, so the second triangle is C,B,D, the third is C,D,E, the fourth is E,D,F...all the way through to the 22nd triangle which is made from W,V,X. 
	* This sounds messy but imagine that you are drawing something like a long, winding ribbon - with vertices A,C,E,G down one side of the ribbon and B,D,F,H down the otherside. 
	* You'll need to sketch this one on some paper to get the hang of it. */
	DrawTriangleStrip : function(first, count) {
		this.Use(); // assert current program
		this._invokeDrawPrimitives(gl.TRIANGLE_STRIP, arguments);
		return this;
	}
	,
	/**  similar in concept to the STRIP but now we start with triangle A,B,C, then A,C,D, then A,D,E...and so on until A,W,X. The result looks like a ladies' fan. */
	DrawTriangleFan : function(first, count) {
		this.Use(); // assert current program
		this._invokeDrawPrimitives(gl.TRIANGLE_FAN, arguments);
		return this;
	}
	,
	/** Draws each vertex as a single pixel dot...so if there are 24 vertices, you get 24 dots.*/
	DrawPoints : function(first, count) {
		this.Use(); // assert current program
		this._invokeDrawPrimitives(gl.POINTS, arguments);
		return this;
	}
	,
	/** connects each pair of vertices by a straight line, so 24 vertices produces 12 separate lines. */
	DrawLines : function(first, count) {
		this.Use(); // assert current program
		this._invokeDrawPrimitives(gl.LINES, arguments);
		return this;
	}
	,
	/** connects each vertex to the next by a straight line, so 24 vertices produces 23 lines that are all connected end-to-end. */
	DrawLineStrip : function(first, count) {
		this.Use(); // assert current program
		this._drawPrimitives(gl.LINE_STRIP, arguments);
		return this;
	}
	,
	/**  is like LINESTRIP except that the last vertex is connected back to the first, so 24 vertices produces 24 straight lines - looping back to the start*/
	DrawLineLoop : function(first, count) {
		this.Use(); // assert current program
		this._invokeDrawPrimitives(gl.LINE_LOOP, arguments);
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

/*
o3gl.Buffer.prototype.Data = _deffered(o3gl.Buffer.prototype.Data);
o3gl.Buffer.prototype.Bind = _defferedCall(o3gl.Buffer.prototype.Bind);
*/
wrap(o3gl.Buffer.prototype, "Data");
wrap(o3gl.Texture.prototype, "GenerateMipmap", "Image2D", "_Wrap", "_Filter");

wrap(o3gl.FrameBufferDefault, 
"Viewport",
"ClearColorBuffer",
"ClearDepthBuffer",
"Clear",
"DepthMask",
"DepthTest",
"ColorMask",
"SetClearColor",
"SetClearDepth"
);
wrap(o3gl.FrameBuffer.prototype, 
"Viewport",
"ClearColorBuffer",
"ClearDepthBuffer",
"Clear",
"DepthMask",
"DepthTest",
"ColorMask",
"SetClearColor",
"SetClearDepth",
"Color",
"Depth",
"Stencil"
);
wrap(o3gl.RenderBuffer.prototype, "Storage" );
wrap(o3gl.Program.prototype, "Set" );



// Resource methods
o3gl.createTexture = function() {
	return new o3gl.Texture();
}
/*
o3gl.createTexture2D = function() {
	return new o3gl.Texture().target2D();
}
o3gl.createTextureCubeMap = function() {
	return new o3gl.Texture().targetCubeMap();
}
*/
o3gl.createBuffer = function(data) {
	return new o3gl.Buffer(data);
}
o3gl.createFrameBuffer = function() {
	return new o3gl.FrameBuffer();
}
o3gl.defaultFrameBuffer = function() {
	return o3gl.FrameBufferDefault;
}
o3gl.createRenderBuffer = function() {
	return new o3gl.RenderBuffer();
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

/*
// Experimental interface

var dc = DrawCall {
	Delete : function() {}
	
	
	
	in : function(name, value) {
	}
	,
	out : function(texture) {}
	,
	out : function(depthBuffer) {}
	,
	in : function (depthBuffer) {}
}


o3gl.program().binding().color(texture).depthMask().depthTest()

var ns = o3gl.instance(); // Utilize shaders, programs, framebuffers, vertex array objects

var p1 = ns.Sources(vs, fs).Set("", vb.pointer()).Set

var resources = o3gl.resources();

resources.Begin();
resources.End();

o3gl.resources().Delete();

ns.Delete();

program.Set("a1", ab.pointer())		// creates new program instance, implicitly creates VAO or it's program implementation
program.VertexArrayObject() 		// create VAO explicitly, create program instance
program.VertexArrayObject(vao)		// use existing vao (program attribs relocation)

program.VertexArrayObject().Elements(elements.pointer()).

program.FrameBuffer().Color()

program.FrameBuffer(fbo)

var texture = o3gl.createTexture();
var rbDepth;

program.FrameBufferDefault().DepthTest().DepthMask()


var instance1 = 
	program.
	Set("u1",1,0,0).
	Set(o3gl.createVertexArrayObject())
	
	VertexArrayObject(). 			// Create inner VAO explicitly
		Set("a1",vab.pointer()).
		Set("a1",vab.pointer()).
		Elements(eab).
		
	FrameBufferObject().			// Create inner FBO explicitly
		Color(texture).				// Create inner render buffer from texture
		DepthMask().				// 
		DepthTest();
	


	program.
		attribute("a1").Set()
		


	
	
	Color(texture).
	Color(rbColor).
	DepthTest(rbDepth).
	DepthMask(rbDepth)
	
	
	


var binding = ns.binding(program1,program2,program3).Set("a1",ptr1).Set("a2",prt2).

//...

program.

*/

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
// OBJECT concept
- Has assotiated VAO 's  UAO' s  that are applied to any program within 
- Can have one or more 'methods' that are programs

o3gl.createObject().


*/

