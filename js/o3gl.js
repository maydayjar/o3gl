function O3GL (context) {
gl = context;
	
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
	
/*********************************************
* 			UTILS
**********************************************/	
var Utils = {
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
}

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

/*********************************************
* 			GL ENUMS
**********************************************/	
		
// Utility methods
var o3gl = {
	parameter : {
		MaxVertexTextureImageUnits : function() {
			return gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
		}
		,
		MaxTextureImageUnits : function() {
			return gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
		}
		,
		MaxCombinedTextureImageUnits : function() {
			return gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
		}
		,
		MaxTextureSize : function() {
			return gl.getParameter(gl.MAX_TEXTURE_SIZE);
		}
		,
		MaxCubeMapTextureSize : function() {
			return gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);
		}
		,
		MaxRenderBufferSize : function() {
			return gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
		}
		,
		MaxVertexAttribs : function() {
			return gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
		}
		,
		Extensions :  gl.getSupportedExtensions()
	}
	,
	Extension : {
		OES_texture_float : function() { return gl.getExtension('OES_texture_float') }
		,
		OES_texture_half_float : function() { return gl.getExtension('OES_texture_float') }
	}
};


// client state tracking variables
// querying the GL for such information (like currently bound texture id) should be avoided because it has an important performance cost
o3gl.programs 			= [];
o3gl.textures 			= [];
o3gl.buffers 			= [];
o3gl.framebuffers 		= [];
o3gl.renderbuffers 		= [];
o3gl.vertexArrays = [];

o3gl.ACTIVE_TEXTURE 	= 0;

o3gl.ARRAY_BUFFER_BINDING 			= undefined;
o3gl.ELEMENT_ARRAY_BUFFER_BINDING 	= undefined;
o3gl.FRAMEBUFFER_BINDING 			= undefined;
o3gl.RENDERBUFFER_BINDING			= undefined;
o3gl.TEXTURE_BINDING_2D 			= undefined;
o3gl.TEXTURE_BINDING_CUBE_MAP 		= undefined;
o3gl.CURRENT_PROGRAM 				= undefined;


/*
    ANGLE_instanced_arrays (google) (registry)
    EXT_blend_minmax (google) (registry)
    EXT_frag_depth (google) (registry)
    EXT_shader_texture_lod (google) (registry)
    EXT_texture_filter_anisotropic (google) (registry)
    OES_element_index_uint (google) (registry)
    OES_standard_derivatives (google) (registry)
    OES_texture_float (google) (registry)
    OES_texture_float_linear (google) (registry)
    OES_texture_half_float (google) (registry)
    OES_texture_half_float_linear (google) (registry)
    OES_vertex_array_object (google) (registry)
    WEBGL_color_buffer_float (google) (registry)
    WEBGL_compressed_texture_s3tc (google) (registry)
    WEBGL_debug_renderer_info (google) (registry)
    WEBGL_debug_shaders (google) (registry)
    WEBGL_depth_texture (google) (registry)
    WEBGL_draw_buffers (google) (registry)
    WEBGL_lose_context (google) (registry)
    MOZ_WEBGL_lose_context (google) (registry)
    MOZ_WEBGL_compressed_texture_s3tc (google) (registry)
    MOZ_WEBGL_depth_texture (google) (registry)
*/

/**
Utility methods
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
	Id : function() {
		return this._textureId;
	}
	,
	Delete : function() {
		gl.deleteTexture(this._textureId);
	}
	,
	Bind : function(textureUnit) {
		if (textureUnit !== undefined) {
			gl.activeTexture(textureUnit);
		}
		gl.bindTexture(this._target, this._textureId);
		// Texture itself has no methods except bind.
		return this; // Return intrface with all the texture manipulation API
	}
	// TODO: activeTexture semantics is unclear. activeTextur must be set before texture binding. Exposing this method can cause misuse without subsequent Bind() method invocation
	,
	Active : function (textureUnit) {
		gl.activeTexture(gl.TEXTURE0 + textureUnit);
		return this.Bind();
	}
	,
	typeUnsignedByte : function() { 
		this._type = gl.UNSIGNED_BYTE;
		return this;
	}
	,
	format : function(value) {
		this._format = value;
		return this;
	}
	,
	formatAlpha : function(value) {
		this._format = gl.ALPHA;
		return this;
	}
	,
	formatRGB : function(value) {
		this._format = gl.RGB;
		return this;
	}
	,
	formatRGBA : function(value) {
		this._format = gl.RGBA;
		return this;
	}
	,
	formatLuminance : function(value) {
		this._format = gl.LUMINANCE;
		return this;
	}
	,
	typeUnsignedByte : function() {
		this._type = gl.UNSIGNED_BYTE;
		return this;
	}
	,
	typeUnsignedShort_5_6_5 : function() {
		this._type = gl.UNSIGNED_SHORT_5_6_5;
		return this;
	}
	,
	typeUnsignedShort_4_4_4_4 : function() {
		this._type = gl.UNSIGNED_SHORT_4_4_4_4;
		return this;
	}
	,
	typeUnsignedShort_5_5_5_1 : function() {
		this._type = gl.UNSIGNED_SHORT_5_5_5_1;
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
		this.Bind();
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
	Filter : function (glTextureMinFilter, glTextureMagFilter) {
		this.Bind();
		gl.texParameteri(this._target, gl.TEXTURE_MIN_FILTER, glTextureMinFilter);		
		gl.texParameteri(this._target, gl.TEXTURE_MAG_FILTER, glTextureMagFilter);		
		return this;
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
	Wrap : function(glTextureWrapS, glTextureWrapT) {
		this.Bind();
		gl.texParameteri(this._target, gl.TEXTURE_WRAP_S, glTextureWrapS);
		gl.texParameteri(this._target, gl.TEXTURE_WRAP_T, glTextureWrapT);
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
	
	// Texture region / (viewport configuration)
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

o3gl.TextureCubeMap.Target = function(texture) {
	// Super constructor
	o3gl.Texture2D.Target.call(this, texture);

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

o3gl.Buffer = function() {
	this._bufferId 		= gl.createBuffer();	
	// Basically usage parameter is a hint to OpenGL/WebGL how you intent to use the buffer. The OpenGL/WebGL can then optimize the buffer depending of your hint.
	this._target 		= undefined;				// gl.ARRAY_BUFFER gl.ELEMENT_ARRAY_BUFFER
	this._usage 		= gl.STATIC_DRAW;			// gl.STATIC_DRAW gl.DYNAMIC_DRAW
	this._type 			= undefined;				// Component type HINT. Used by pointers as default value. Initialized by Data method if typed array has been passed as an argument
}

Extend(o3gl.Buffer, o3gl.Resource, {
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
	Data : function(data) {
		this.Bind();

		var arrayOrSize;	// Typed array or size in bytes
		// Convert array to typed array
		if (data instanceof Array) {
			// Assign default value
			if (this._target === gl.ELEMENT_ARRAY_BUFFER) {
				this._type = gl.UNSIGNED_SHORT;
				arrayOrSize = new Uint16Array(data);			
			}
			if (this._target === gl.ARRAY_BUFFER) {
				this._type = gl.FLOAT;
				arrayOrSize = new Float32Array(data);
			}
			// This case seems weird
			if (this._target === gl.UNIFROM_BUFFER) {
				// arrayOrSize = new Float32Array(data):				
				// this._type = gl.BYTE; // Array has no pre
			}
		} else {
			if (data instanceof Int8Array) 		this._type = gl.BYTE;
			if (data instanceof Uint8Array) 	this._type = gl.UNSIGNED_BYTE;
			if (data instanceof Int16Array) 	this._type = gl.SHORT;
			if (data instanceof Uint16Array) 	this._type = gl.UNSIGNED_SHORT;
			if (data instanceof Int32Array) 	this._type = gl.INT;
			if (data instanceof Uint32Array) 	this._type = gl.UNSIGNED_INT;
			if (data instanceof Float32Array) 	this._type = gl.FLOAT;
			if (data instanceof Float64Array) 	this._type = gl.DOUBLE;
			arrayOrSize = data;
		}
		gl.bufferData(this._target, arrayOrSize, this._usage);
		return this;
	}
	,
	SubData : function(offset, value) {
		this.Bind();
		
		var typedArray;	// Typed array or size in bytes
		// Convert array to typed array
		if (value instanceof Array) {
			typedArray = Utils.createTypedArray(this._type, value);
		} else {
			typedArray = value;
		}
		gl.bufferSubData(this._target, offset, typedArray);
		return this;
	}
}
);


o3gl.Buffer.Pointer = function(buffer) {
    this._buffer = buffer;
    this._type = buffer._type;	// It is possible that buffer contains data of various types. So type must be set per pointer
    this._stride = 0;			// Stride in bytes
    this._offset = 0;			// Offset in bytes
	this._size = 4; 			// Specifies the number of components per generic vertex attribute. Must be 1, 2, 3, 4. Additionally, the symbolic constant GL_BGRA is accepted by glVertexAttribPointer. The initial value is 4.
}

o3gl.Buffer.Pointer.prototype = {
	typeByte : function(size) {
		this._type = gl.BYTE;
		if (size) this._size = size;
		return this;
	}
	,
	typeUnsignedByte : function(size) {
		this._type = gl.UNSIGNED_BYTE;
		if (size) this._size = size;
		return this;
	}
	,
	typeShort : function(size) {
		this._type = gl.SHORT;
		if (size) this._size = size;
		return this;
	}
	,
	typeUnsignedShort : function(size) {
		this._type = gl.UNSIGNED_SHORT;
		if (size) this._size = size;
		return this;
	}
	,
	typeInt : function(size) {
		this._type = gl.INT;
		if (size) this._size = size;
		return this;
	}
	,
	typeUnsignedInt : function(size) {
		this._type = gl.UNSIGNED_INT;
		if (size) this._size = size;
		return this;
	}
	,
	typeHalfFloat : function(size) {
		this._type = gl.HALF_FLOAT;
		if (size) this._size = size;
		return this;
	}
	,
	typeFloat : function(size) {
		this._type = gl.FLOAT;
		if (size) this._size = size;
		return this;
	}
	,
	typeDouble : function(size) {
		this._type = gl.DOUBLE;
		if (size) this._size = size;
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
	count : function(value) {
		this._count = value;
		return this;
	}
	,
	getMaxElementsCount : function() {
		// TODO: consider offset, stride and data type
		return this._buffer._length / this._size;
	}
};





o3gl.ArrayBuffer = function() {
	o3gl.Buffer.call(this);
	// Basically usage parameter is a hint to OpenGL/WebGL how you intent to use the buffer. The OpenGL/WebGL can then optimize the buffer depending of your hint.
	this._target 		= gl.ARRAY_BUFFER;			// gl.ARRAY_BUFFER gl.ELEMENT_ARRAY_BUFFER
	this._usage 		= gl.STATIC_DRAW;			// gl.STATIC_DRAW gl.DYNAMIC_DRAW
	this._type 			= undefined;				// Component type HINT. Used by pointers as default value
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
	this._type = buffer._type;
	this._normalized = false;	// as	
	this._divisor = 0;	// Extensions ANGLE_instanced_arrays, 
}
Extend(o3gl.ArrayBuffer.Pointer, o3gl.Buffer.Pointer, {
	count : function(value) {
		this._count = value;
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
});

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

o3gl.UniformBuffer = function () {
	// Super constructor
	o3gl.Buffer.call(this);
	// Basically usage parameter is a hint to OpenGL/WebGL how you intent to use the buffer. The OpenGL/WebGL can then optimize the buffer depending of your hint.
	this._target 		= gl.UNIFORM_BUFFER;			// gl.ARRAY_BUFFER gl.ELEMENT_ARRAY_BUFFER
	this._usage 		= gl.DYNAMIC_DRAW;				// gl.STATIC_DRAW gl.DYNAMIC_DRAW
	this._type 			= undefined;					// Uniform buffer is likely composed of various types
}
Extend(o3gl.UniformBuffer, o3gl.Buffer, 
{
	pointer : function(program, uniformName) {
	}
});
o3gl.UniformBuffer.Pointer = function(uniformBuffer) {
}
Extend(o3gl.UniformBuffer.Pointer, o3gl.Buffer.Pointer, {
});
o3gl.UniformBufferDefault = function (uniformBlockName) {
	this._uniformBlockIndex = -1; // Default uniform block index
	this._uniform
}
o3gl.UniformBufferDefault.prototype = {
	Bind : function() {
	}
}

o3gl.FrameBuffer = function() {
	// this.frameBufferId = gl.createFramebuffer();
	this.frameBufferId = null; //default frame buffer
	// Client state tracking
	// It seems there is no way to access texture size in OpenGL ES specification
	this._colorAttachment = [];
	this._depthAttachment = undefined;
	this._stencilAttachment = undefined;

	// State variables
	
	this._clearColor = null;
	this._clearDepth = null;

	this._colorMask = null;
	this._depthMask = null;

	
}

o3gl.FrameBuffer.prototype = {
	getWidth : function() {
		if (this.frameBufferId) {
			var target = this._colorAttachment[0];
			var texture = target._texture;
			return texture._size[target._targetTexture][0];
		} else {
			// The actual width of the drawing buffer, which may differ from the
			// width attribute of the HTMLCanvasElement if the implementation is
			// unable to satisfy the requested width or height.
			return gl.drawingBufferWidth;
		}
	}
	,
	getHeight : function() {
		if (this.frameBufferId) {
			var target = this._colorAttachment[0];
			var texture = target._texture;
			return texture._size[target._targetTexture][1];
		} else {
			// The actual height of the drawing buffer, which may differ from the
			// width attribute of the HTMLCanvasElement if the implementation is
			// unable to satisfy the requested width or height.
			return gl.drawingBufferHeight;
		}
	}
	,
	Id : function() {
		return this.frameBufferId;
	}
	,
	Delete : function() {
		if (this.frameBufferId) {
			gl.deleteFramebuffer(this.frameBufferId);
		}
	}
	,
	Bind : function() {
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBufferId);
		
		if (this._colorMask !== null) {
			var r = this._colorMask.r;
			var g = this._colorMask.g;
			var b = this._colorMask.b;
			var a = this._colorMask.a;
			gl.colorMask(r,g,b,a);
		}
		if (this._depthMask !== null) {
			var value = this._depthMask;
			gl.depthMask(value);			
		}
		
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
		this.Bind();

		if (this.frameBufferId === null) {
			this.frameBufferId = gl.createFramebuffer();
			gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBufferId);
		}

		var ext = gl.getExtension('WEBGL_draw_buffers');
		
		// WebGL 2.0 constants
		var COLOR_ATTACHEMENT = ext ?
		[
			ext.COLOR_ATTACHMENT0_WEBGL | gl.COLOR_ATTACHMENT0,
			ext.COLOR_ATTACHMENT1_WEBGL | gl.COLOR_ATTACHMENT1,
			ext.COLOR_ATTACHMENT2_WEBGL | gl.COLOR_ATTACHMENT2,
			ext.COLOR_ATTACHMENT3_WEBGL | gl.COLOR_ATTACHMENT3
		]
		:
		[		
			gl.COLOR_ATTACHMENT0,
			gl.COLOR_ATTACHMENT1,
			gl.COLOR_ATTACHMENT2,
			gl.COLOR_ATTACHMENT3,
			gl.COLOR_ATTACHMENT4,
			gl.COLOR_ATTACHMENT5,
			gl.COLOR_ATTACHMENT6,
			gl.COLOR_ATTACHMENT7,
			gl.COLOR_ATTACHMENT8,
			gl.COLOR_ATTACHMENT9,
			gl.COLOR_ATTACHMENT10,
			gl.COLOR_ATTACHMENT11,
			gl.COLOR_ATTACHMENT12,
			gl.COLOR_ATTACHMENT13,
			gl.COLOR_ATTACHMENT14,
			gl.COLOR_ATTACHMENT15			
		];

		for (var i=0; i<arguments.length; ++i) {
			var attachment 	= arguments[i];

			var texture = undefined;
			var target = undefined;
			
			if (attachment instanceof o3gl.Texture) {
				texture = attachment;
				target = texture.target();
			} else {
				texture = attachment._texture;
				target = attachment;
			}

			var textureId = texture.Id(); 
			var textureTarget = target._targetTexture; 
			var textureLevel = 0; // Must be 0; target._level 
						
			texture.Bind();
			// texture.FilterLinear().WrapClampToEdge(); // What requirements should be here???
			
			if (!texture.isFrameBufferCompatible()) {
				throw "Texture is not framebuffer compatible";
			}
			
			gl.framebufferTexture2D(gl.FRAMEBUFFER, COLOR_ATTACHEMENT[i], textureTarget, textureId, textureLevel);	

			this._colorAttachment[i] = target;
		}
		return this;
	}
	,
	Depth : function(attachment) {
		this.Bind();
		
		if (this.frameBufferId === null) {
			this.frameBufferId = gl.createFramebuffer();
			gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBufferId);
		}

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
		this.Bind();
		
		if (this.frameBufferId === null) {
			this.frameBufferId = gl.createFramebuffer();
			gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBufferId);
		}
	
		if (attachment instanceof o3gl.RenderBufferStencil) {
			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.RENDERBUFFER, attachment.Id());
		}
	}
	,
	ClearColorBuffer : function(r,g,b,a) {
		this.Bind();
		
		var isR = (r !== null);
		var isG = (g !== null);
		var isB = (b !== null);
		var isA = (a !== null);
		gl.colorMask(isR, isG, isB, isA);
		
		if (arguments.length === 0) {
			gl.clearColor(0, 0, 0, 0);			// Specification default values
		} else {
			gl.clearColor(r, g, b, a);
		}
		gl.clear(gl.COLOR_BUFFER_BIT);
		return this;
	}
	,
	ClearDepthBuffer : function(depth) {
		this.Bind();		
		
		gl.depthMask(true);	// Without this set to true no effect will take place

		if (arguments.length == 0)  {
			gl.clearDepth(1.0); // Specification default value
		} else {
			gl.clearDepth(depth);			
		}
		gl.clear(gl.DEPTH_BUFFER_BIT);
		return this;
	}	
	,
	Clear : function() {
		this.Bind();		
		
		//gl.colorMask(true, true, true, true);
		//gl.depthMask(true);	// Without this set to true no effect will take place
		// TODO check attachements
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);		
		return this;
	}
	,
	ClearColor : function(r,g,b,a) {		
		if (arguments.length === 1) {
			var value = arguments[0];
			this._clearColor = {r : value, g : value, b : value, a : value};
			gl.clearColor(value, value, value, value);			// Specification default values ar 0,0,0,0
		} else {
			this._clearColor = {r : r, g : g, b : b, a : a};
			gl.clearColor(r, g, b, a);
		}
		return this;
	}
	,
	ClearDepth : function(value) {		
		if (arguments.length == 0)  {
			gl.clearDepth(1.0); // Specification default value
		} else {
			gl.clearDepth(value);			
		}
		return this;
	}
	,
	ScissorTest : function (enable) {
		if (enable) {
			gl.enable(gl.SCISSOR_TEST);
		} else {
			gl.disable(gl.SCISSOR_TEST);
		}
		return this;
	}
	,
	Scissor : function (x, y , width, height) {
		// turn on the scissor test.
		gl.enable(gl.SCISSOR_TEST);		
		// set the scissor rectangle.
		gl.scissor(x, y, width, height);
		return this;
	}	
	,
	DepthMask : function(enable) {
		if (enable === null) {
			this._depthMask = null;
		} else {
			this._depthMask = enable;					
			gl.depthMask(enable);
		}
		return this;
	}
	,
	ColorMask : function(r,g,b,a) {
		if (arguments.length === 1) {
			var value = arguments[0];
			if (value === null) {
				this._colorMask = null;
			} else {
				this._colorMask = {r : value, g : value, b : value, a : value};
				gl.colorMask(value, value, value, value);
			}
		} else {
			this._colorMask = {r : r, g : g, b : b, a : a};
			gl.colorMask(r,g,b,a);
		}
		return this;
	}
};

o3gl.RenderBuffer = function() {
	this._renderBufferId = gl.createRenderbuffer();
	this._target = gl.RENDERBUFFER; // must be GL_RENDERBUFFER.
	this._internalFormat = undefined; // Specifies the color-renderable, depth-renderable, or stencil-renderable format of the renderbuffer. Must be one of the following symbolic constants: GL_RGBA4, GL_RGB565, GL_RGB5_A1, GL_DEPTH_COMPONENT16, or GL_STENCIL_INDEX8
	this.formatDepthComponent16();
}

o3gl.RenderBuffer.prototype = {
	Id : function() {
		return this._renderBufferId;
	}
	,
	Bind : function() {
		gl.bindRenderbuffer(this._target, this._renderBufferId);
		return this;
	}
	,
	Storage : function(width, height) {
		this.Bind();
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
o3gl.VertexArray = function (vertexArrayId) {
	this._extension = gl.getExtension("OES_vertex_array_object"); 	// Vendor prefixes may apply!  
	
	if (vertexArrayId !== undefined) {
		// default vertex array constructor
		this.vertexArrayId = vertexArrayId;
	} else {
		this.vertexArrayId = _extension.createVertexArrayOES();
	}
}

/**
* Static helper method. 
*/
o3gl.VertexArray._GetElementArrayBufferCount = function() {
	var bufferSize = gl.getBufferParameter(gl.ELEMENT_ARRAY_BUFFER, gl.BUFFER_SIZE);
	var elementType = gl.UNSIGNED_SHORT;
	return bufferSize / Utils.glTypeSizeBytes(elementType);
}

o3gl.VertexArray._GetVertexAttributeArrayBufferCount = function(index) {	
	var buffer = gl.getVertexAttrib(index, gl.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING);
	if (!buffer) return 0; 		// No buffer is bound
	var enabled = gl.getVertexAttrib(index, gl.VERTEX_ATTRIB_ARRAY_ENABLED);
	if (!enabled) return 0;		// Buffer is disabled
	
	// TODO: GL_BGRA
	var elementSize = gl.getVertexAttrib(index, gl.VERTEX_ATTRIB_ARRAY_SIZE); // 1,2,3,4,GL_BGRA
	var elementType = gl.getVertexAttrib(index, gl.VERTEX_ATTRIB_ARRAY_TYPE);
	var elementStride = gl.getVertexAttrib(index, gl.VERTEX_ATTRIB_ARRAY_STRIDE);

	// Save default value
	var bufferDefault = gl.getParameter(gl.ARRAY_BUFFER_BINDING);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	var bufferSize = gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_SIZE);
	var elementBytes = Utils.glTypeSizeBytes(elementType) * elementSize + elementStride;
	var elementsCount = bufferSize / elementBytes;

	// Restore default value
	gl.bindBuffer(gl.ARRAY_BUFFER, bufferDefault);

	return elementsCount;
}

o3gl.VertexArray._GetVertexAttributeArrayDivisor = function(index) {
	// TODO: extensions
	var ext = gl.getExtension("ANGLE_instanced_arrays");	
	if (!ext) return 0;
	return gl.getVertexAttrib(index, ext.VERTEX_ATTRIB_ARRAY_DIVISOR_ANGLE);
}

o3gl.VertexArray._GetEnabledVertexAttributeArrayIndices = function(indices) {
	if (!indices) {
		indices = [];
		for (var idx = 0; idx < gl.getParameter(gl.MAX_VERTEX_ATTRIBS); ++idx) {
			indices.push(idx);
		}
	}
	var result = [];
	for (var i = 0; i < indices.length; ++i) {
		var index = indices[i];
		var buffer = gl.getVertexAttrib(index, gl.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING);
		if (!buffer) continue;
		var enabled = gl.getVertexAttrib(index, gl.VERTEX_ATTRIB_ARRAY_ENABLED);
		if (!enabled) continue;
		result.push(index);
	}
	
	return result;
}

/**
* Static helper method. 
*/
o3gl.VertexArray._VertexAttributePointer = function(attributeLocation, arrayBufferPointer) {		
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
	var size 			= arrayBufferPointer._size;
	var strideBytes     = arrayBufferPointer._stride;
	var offsetBytes     = arrayBufferPointer._offset;
		
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
	
	// ANGLE instanced arrays
	if (arrayBufferPointer._divisor) {
		var ext = gl.getExtension("ANGLE_instanced_arrays");
		ext.vertexAttribDivisorANGLE(attributeLocation, arrayBufferPointer._divisor)
	}
	return this;
}

/*
// TODO: Dont need this shit now
o3gl.VertexArray._VertexAttribute1f = function(attributeLocation, value) {
	gl.disableVertexAttribArray(attributeLocation);
	if (!value.length) value = arguments.slice(1);
	gl.vertexAttrib1fv(attributeLocation, value); 
	return this;
}
o3gl.VertexArray._VertexAttribute2f = function(attributeLocation, value) {
	gl.disableVertexAttribArray(attributeLocation);
	if (!value.length) value = arguments.slice(1);
	gl.vertexAttrib2fv(attributeLocation, value); 
	return this;
}
o3gl.VertexArray._VertexAttribute3f = function(attributeLocation, value) {
	gl.disableVertexAttribArray(attributeLocation);
	if (!value.length) value = arguments.slice(1);
	gl.vertexAttrib3fv(attributeLocation, value); 
	return this;
}
o3gl.VertexArray._VertexAttribute4f = function(attributeLocation, value) {
	gl.disableVertexAttribArray(attributeLocation);
	if (!value.length) value = arguments.slice(1);
	gl.vertexAttrib4fv(attributeLocation, value); 
	return this;
}
*/
o3gl.VertexArray.prototype = {
	Id : function() {
		return this.vertexArrayId;
	}
	,
	Delete : function() {
		if (this.vertexArrayId) {
			this._extension.deleteVertexArrayOES(this.vertexArrayId);
		}
	}
	,
	Bind : function() {
		if (this._extension) {
			this._extension.bindVertexArrayOES(this.vertexArrayId);
		}
		return this;
	}
	,
	GetElementArrayBufferSize : function () {
		return gl.getBufferParameter(gl.ELEMENT_ARRAY_BUFFER, gl.BUFFER_SIZE);		
	}
	,
	GetElementArrayBufferType : function () {
		return gl.UNSIGNED_SHORT;
	}
	,
	GetVertexAttribArraySize : function (idx) {
		return gl.getVertexAttrib(idx, gl.VERTEX_ATTRIB_ARRAY_SIZE); // 1,2,3,4,GL_BGRA
	}
	,
	GetVertexAttribArrayType : function (idx) {
		return gl.getVertexAttrib(idx, gl.VERTEX_ATTRIB_ARRAY_TYPE); // 1,2,3,4,GL_BGRA
	}
	,
	GetVertexAttribArrayStride : function (idx) {
		return gl.getVertexAttrib(idx, gl.VERTEX_ATTRIB_ARRAY_STRIDE); // 1,2,3,4,GL_BGRA
	}
	,
	GetVertexAttribArrayEnabled : function (idx) {
		return gl.getVertexAttrib(idx, gl.VERTEX_ATTRIB_ARRAY_ENABLED);
	}
	,
	GetVertexAttribArrayNormalized : function (idx) {
		return gl.getVertexAttrib(idx, gl.VERTEX_ATTRIB_ARRAY_NORMALIZED);
	}
	,
	GetVertexAttribCurrent : function (idx) {
		return gl.getVertexAttrib(idx, gl.CURRENT_VERTEX_ATTRIB); 		// Float32Array (with 4 elements). (0,0,0,1) by default
	}
	,
	Elements :function(elementArrayBuffer) {
		this.elementArrayBuffer = elementArrayBuffer;
		if (this.elementArrayBuffer) {
			this.elementArrayBuffer.Bind();				
		}
		return this;
	}
	/*
	,
	VertexAttributePointer : function(attributeLocation, arrayBufferPointer) {		
		o3gl.VertexArray._VertexAttributePointer(attributeLocation, arrayBufferPointer);
		return this;
	}
	,
	VertexAttribute1f : function(attributeLocation, v1) {
		o3gl.VertexArray._VertexAttribute1f(attributeLocation, v1);
		return this;
	}
	,
	VertexAttribute2f : function(attributeLocation, v1, v2) {
		o3gl.VertexArray._VertexAttribute2f(attributeLocation, v1, v2);
		return this;
	}
	,
	VertexAttribute3f : function(attributeLocation, v1, v2, v3) {
		o3gl.VertexArray._VertexAttribute2f(attributeLocation, v1, v2, v3);
		return this;
	}
	,
	VertexAttribute4f : function(attributeLocation, v1, v2, v3, v4) {
		o3gl.VertexArray._VertexAttribute2f(attributeLocation, v1, v2, v3, v4);
		return this;
	}
	*/
}




o3gl.BlendFactor = {
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
	this._AttachShader(shader1, shader2)._Link();
}

o3gl.Program.prototype = {
	Id : function() {
		return this.programId;
	}
	,
	Delete : function () {
		gl.deleteProgram(this.programId);
	}
	,
	Use : function () {
		gl.useProgram(this.Id());	
		return this;
	}
	,
	_AttachShader : function(shader1,shader2,shader3) {
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
	_Link : function() {
		gl.linkProgram(this.programId);
		if (!gl.getProgramParameter(this.programId, gl.LINK_STATUS)) {
			alert("Could not initialise shaders");
			return null;
		}
		var usable = this;
		return usable;
	}
	,
	newInstance : function() {
		return new o3gl.ProgramInstance(this);
	}
	,
	GetAttributeIndex : function(name) {
		var activeAttribsCount = gl.getProgramParameter(this.Id(), gl.ACTIVE_ATTRIBUTES);
		for (var idx = 0; idx < activeAttribsCount; ++idx) {
			var variable = gl.getActiveAttrib(this.Id(), idx);
			if (variable.name === name) return idx;
		}		
		return -1;
	}
	,
	GetAttributeType : function(name) {
		var index = this.GetAttributeIndex(name);
		var variable = gl.getActiveAttrib(this.Id(), index);
		return variable.type;
	}
	,
	GetAttributeSize : function(name) {
		var index = this.GetAttributeIndex(name);
		var variable = gl.getActiveAttrib(this.Id(), index);
		return variable.size;
	}
	,
	GetAttributeLocation : function (name) {
		return gl.getAttribLocation(this.Id(), name);
	}
	,	
	// Auxillary method
	GetAttributeLocations : function() {
		var result = [];
		for (var idx = 0; idx < gl.getProgramParameter(this.Id(), gl.ACTIVE_ATTRIBUTES); ++idx) {
			var variable = gl.getActiveAttrib(this.Id(), idx);
			result.push(this.GetAttributeLocation(variable.name));
		}		
		return result;
	}
	,
	GetUniformLocation : function (name) {
		return gl.getUniformLocation(this.Id(), name);
	}
	,
	GetUniformIndex : function (name) {
		for (var idx = 0; idx < gl.getProgramParameter(this.Id(), gl.ACTIVE_UNIFORMS); ++idx) {
			var variable = gl.getActiveUniform(this.Id(), idx);
			if (variable.name === name) return idx;
		}		
		return -1;
	}
	,
	// Auxillary method
	GetUniformSamplerLocations : function() {
		var result = [];
		for (var idx = 0; idx < gl.getProgramParameter(this.Id(), gl.ACTIVE_UNIFORMS); ++idx) {
			var variable = gl.getActiveUniform(this.Id(), idx);
			switch (variable.type) {
				case gl.SAMPLER_2D :
				case gl.SAMPLER_CUBE :
					result.push(this.GetUniformLocation(variable.name));
			}
		}		
		return result;
	}
	,
	GetUniformType : function (name) {
		var index = this.GetUniformIndex(name);
		var variable = gl.getActiveUniform(this.Id(), index);
		return variable.type;
	}
	,
	GetUniformSize : function (name) {
		var index = this.GetUniformIndex(name);
		var variable = gl.getActiveUniform(this.Id(), index);
		return variable.size;
	}
	/**
	* Webgl 2.0 uniform block introspection API
	*/
	,
	GetUniformBlockIndex : function(uniformBlockName) {
		return gl.getUniformBlockIndex(this.Id(), uniformBlockName);
	}
	,
	GetUniformBlockOffset : function (uniformBlockName) {
		var uniformBlockIndex = this.GetUniformBlockIndex(uniformBlockName);
		return gl.getIndexedParameter(gl.UNIFORM_BUFFER_START, uniformBlockIndex);
	}
	,
	GetUniformBlockBinding : function(uniformBlockName) {
		var uniformBlockIndex = this.GetUniformBlockIndex(uniformBlockName);
		return gl.getActiveUniformBlockParameter(this.Id(), uniformBlockIndex, UNIFORM_BLOCK_BINDING);
	}
	,
	GetUniformBlockDataSize : function(uniformBlockName) {
		var uniformBlockIndex = this.GetUniformBlockIndex(uniformBlockName);
		return gl.getActiveUniformBlockParameter(this.Id(), uniformBlockIndex, UNIFORM_BLOCK_DATA_SIZE);
	}
	,
	GetUniformBlockActiveUniforms : function(uniformBlockName) {
		var uniformBlockIndex = this.GetUniformBlockIndex(uniformBlockName);
		return gl.getActiveUniformBlockParameter(this.Id(), uniformBlockIndex, UNIFORM_BLOCK_ACTIVE_UNIFORMS);

	}
	,
	GetUniformBlockActiveUniformIndices : function(uniformBlockName) {
		var uniformBlockIndex = this.GetUniformBlockIndex(uniformBlockName);
		return gl.getActiveUniformBlockParameter(this.Id(), uniformBlockIndex, UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES);
	}
	,
	GetUniformBlockReferencedByVertexShader : function(uniformBlockName) {
		var uniformBlockIndex = this.GetUniformBlockIndex(uniformBlockName);
		return gl.getActiveUniformBlockParameter(this.Id(), uniformBlockIndex, UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER);
	}
	,
	GetUniformBlockReferencedByFragmentShader : function(uniformBlockName) {
		var uniformBlockIndex = this.GetUniformBlockIndex(uniformBlockName);
		return gl.getActiveUniformBlockParameter(this.Id(), uniformBlockIndex, UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER);
	}
	/*
	,
	// Webgl 2.0 uniform introspection API
	GetUniformIndices : function(uniformNames) {
		return gl.getUniformIndices(this.Id(), uniformNames); // TODO: API ??? sequence<> is an array
	}
	,
	GetActiveUniformTypes : function(uniformIndices) {
		return gl.getActiveUniforms(this.Id(), uniformIndices, gl.UNIFORM_TYPE); // TODO: API ??? sequence<> is an array
	}
	,
	GetActiveUniformSizes : function(uniformIndices) {
		return gl.getActiveUniforms(this.Id(), uniformIndices, gl.UNIFORM_SIZE);
	}
	,
	GetActiveUniformBlockIndices : function(uniformIndices) {
		return gl.getActiveUniforms(this.Id(), uniformIndices, gl.UNIFORM_BLOCK_INDEX);
	}
	,
	GetActiveUniformOffsets : function(uniformIndices) {
		return gl.getActiveUniforms(this.Id(), uniformIndices, gl.UNIFORM_OFFSET);
	}
	,
	GetActiveUniformArrayStrides : function(uniformIndices) {
		return gl.getActiveUniforms(this.Id(), uniformIndices, gl.UNIFORM_ARRAY_STRIDE);
	}
	,
	GetActiveUniformMatrixStrides : function(uniformIndices) {
		return gl.getActiveUniforms(this.Id(), uniformIndices, gl.UNIFORM_MATRIX_STRIDE);
	}
	,
	GetActiveUniformIsRowMajors : function(uniformIndices) {
		return gl.getActiveUniforms(this.Id(), uniformIndices, gl.UNIFORM_IS_ROW_MAJOR);
	}
	*/
	
	,	
	GetActiveUniformIndex : function(uniformName) {	// Duplicated method GetUniformIndex
		return gl.getUniformIndices(this.Id(), [uniformName])[0]; // TODO: API ??? sequence<> is an array
	}
	,
	GetActiveUniformType : function(uniformName) {
		var uniformIndices = gl.getUniformIndices(this.Id(), [uniformName]);
		return gl.getActiveUniforms(this.Id(), uniformIndices, gl.UNIFORM_TYPE)[0]; // TODO: API ??? sequence<> is an array
	}
	,
	GetActiveUniformSize : function(uniformName) {
		var uniformIndices = gl.getUniformIndices(this.Id(), [uniformName]);
		return gl.getActiveUniforms(this.Id(), uniformIndices, gl.UNIFORM_SIZE)[0];
	}
	,
	GetActiveUniformBlockIndex : function(uniformName) {
		var uniformIndices = gl.getUniformIndices(this.Id(), [uniformName]);
		return gl.getActiveUniforms(this.Id(), uniformIndices, gl.UNIFORM_BLOCK_INDEX)[0];
	}
	,
	GetActiveUniformBlockName : function(uniformName) {
		var uniformIndices = gl.getUniformIndices(this.Id(), [uniformName]);
		var uniformBlockIndex = gl.getActiveUniforms(this.Id(), uniformIndices, gl.UNIFORM_BLOCK_INDEX)[0];
		return getActiveUniformBlockName(this.Id(), uniformBlockIndex);
	}
	,
	GetActiveUniformOffset : function(uniformName) {
		var uniformIndices = gl.getUniformIndices(this.Id(), [uniformName]);
		return gl.getActiveUniforms(this.Id(), uniformIndices, gl.UNIFORM_OFFSET)[0];
	}
	,
	GetActiveUniformArrayStride : function(uniformName) {
		var uniformIndices = gl.getUniformIndices(this.Id(), [uniformName]);
		return gl.getActiveUniforms(this.Id(), uniformIndices, gl.UNIFORM_ARRAY_STRIDE)[0];
	}
	,
	GetActiveUniformMatrixStride : function(uniformName) {
		var uniformIndices = gl.getUniformIndices(this.Id(), [uniformName]);
		return gl.getActiveUniforms(this.Id(), uniformIndices, gl.UNIFORM_MATRIX_STRIDE)[0];
	}
	,
	GetActiveUniformIsRowMajor : function(uniformName) {
		var uniformIndices = gl.getUniformIndices(this.Id(), [uniformName]);
		return gl.getActiveUniforms(this.Id(), uniformIndices, gl.UNIFORM_IS_ROW_MAJOR)[0];
	}
	
	
	,
	GetUniform : function(name) {
		var location = this.GetUniformLocation(name);
		return gl.getUniform(this.Id(), location);
	}
	,
	_isUniform : function(name) {
		var uniformLocation = this.GetUniformLocation(name);
		return uniformLocation !== null;
	}
	,
	_isAttribute : function(name) {
		var attributeLocation = this.GetAttributeLocation(name);
		return attributeLocation >=0; // the value is -1 when no attribute found
	}
	,
	_isUniformBlock : function(name) {
		var uniformBlockIndex = this.GetUniformBlockIndex(name);
		return (uniformBlockIndex !== gl.INVALID_INDEX);
	}
	,
	Set : function(name, value) {
		if (this._isUniform(name)) {
			if (value instanceof o3gl.Texture)  					this.Sampler(name, value);
			else if (!value.length)									this.Uniform(name, Array.prototype.slice.call(arguments, 1));
			else 													this.Uniform(name, value);
			return this;
		}
		if (this._isAttribute(name)) {
			if (value instanceof o3gl.ArrayBuffer) 					this.AttributePointer(name, value.pointer());
			else if (value instanceof o3gl.ArrayBuffer.Pointer)		this.AttributePointer(name, value);
			else if (!value.length)									this.Attribute(name, Array.prototype.slice.call(arguments, 1));
			else 													this.Attribute(name, value);
			return this;
		}
		if (this._isUniformBlock(name)) {
			// TODO: Uniform blocks	
		}
		
		throw new TypeError(name+" not found");
	}
	,
	Uniform: function(name, value) {
		// Assure program is currently used
		this.Use();

		var uniformLocation 	= this.GetUniformLocation(name);
		var uniformType 		= this.GetUniformType(name);
		
		// Convert arguments to the vector form
		if (!value.length) value = arguments.slice(1);
	
		/*
		var uniformBlockName = this.GetActiveUniformBlockName(name);
		if (uniformBlockName) {
			var unifromBlockBinding = this.GetUniformBlockBinding(uniformBlockName);
			if (uniformBlockBinding) {
				var uniformBlockOffset = this.GetUniformBlockBinding(uniformBlockName);
				var uniformOffset = this.GetActiveUniformOffset(name);
				
				gl.bindBuffer(gl.UNIFORM_BUFFER, unifromBlockBinding);
				gl.bufferSubData(this._target, offset, typedArray);
				
				gl.bufferSubData(gl.UNIFORM_BUFFER,uniformBlockOffset + uniformOffset, value);
			}
			return this;
		}
		*/
			
		switch (uniformType) {
			case gl.FLOAT			:		gl.uniform1fv		(uniformLocation, value);	break;	
			case gl.FLOAT_VEC2    	:		gl.uniform2fv		(uniformLocation, value);	break;
			case gl.FLOAT_VEC3    	:		gl.uniform3fv		(uniformLocation, value);	break;
			case gl.FLOAT_VEC4    	:		gl.uniform4fv		(uniformLocation, value);	break;
			case gl.INT           	:		gl.uniform1iv		(uniformLocation, value);	break;
			case gl.INT_VEC2      	:		gl.uniform2iv		(uniformLocation, value);	break;
			case gl.INT_VEC3      	:		gl.uniform3iv		(uniformLocation, value);	break;
			case gl.INT_VEC4      	:		gl.uniform4iv		(uniformLocation, value);	break;
	//		case gl.BOOL          	:		gl.uniform1iv		(uniformLocation, value);	break;
	//		case gl.BOOL_VEC2     	:		gl.uniform2iv		(uniformLocation, value);	break;
	//		case gl.BOOL_VEC3     	:		gl.uniform3iv		(uniformLocation, value);	break;
	//		case gl.BOOL_VEC4     	:		gl.uniform4iv		(uniformLocation, value);	break;
			// Second argument sets whether to transpose the matrix as the values are loaded into the uniform variable. Must be set to gl.FALSE.
			case gl.FLOAT_MAT2    	:		gl.uniformMatrix2fv	(uniformLocation, false, value);	break;
			case gl.FLOAT_MAT3    	:		gl.uniformMatrix3fv	(uniformLocation, false, value);	break;
			case gl.FLOAT_MAT4    	:		gl.uniformMatrix4fv	(uniformLocation, false, value);	break;
			case gl.SAMPLER_2D    	:		gl.uniform1iv		(uniformLocation, value);	break;
			case gl.SAMPLER_CUBE  	:		gl.uniform1iv		(uniformLocation, value);	break;
		}
		
		return this;
	}
	,
	// Helper method
	UniformBlock : function(name, value) {			
		var uniformBlockIndex = gl.getUniformBlockIndex(this.Id(), name);
	
		if (value instanceof o3gl.UniformBuffer) {
			var unifromBuffer = value;
			uniformBuffer.Bind(); // bindBufferBase also binds the buffer. We need this method here to maintain o3gl client-state tracking
			gl.bindBufferBase(gl.UNIFORM_BUFFER, uniformBlockIndex, unifromBuffer.Id());
		}
		
		if (value instanceof o3gl.UniformBuffer.Pointer) {
			var unifromBuffer = value._pointer;
			uniformBuffer.Bind(); // bindBufferBase also binds the buffer. We need this method here to maintain o3gl client-state tracking
			var offset = uniformBuffer._offset | 0;
			var size = uniformBuffer._size | 0;
			gl.bindBufferRange(gl.UNIFORM_BUFFER, uniformBlockIndex, unifromBuffer.Id(), offset, size);
		}
		
		return this;
	}
	,
	// Helper method
	Sampler : function(name, texture) {		
		var index = this.GetUniform(name);
		gl.activeTexture(gl.TEXTURE0 + index);
		texture.Bind();
		return this;
	}
	,
	Attribute: function(name, value) {
		// Value must be an array or typed array
		var attributeLocation = this.GetAttributeLocation(name);
		var glType = this.GetAttributeType(name);
		switch (glType) {
			case gl.FLOAT			:		gl.vertexAttrib1fv(attributeLocation, value);	break;	
			case gl.FLOAT_VEC2    	:		gl.vertexAttrib1fv(attributeLocation, value);	break;
			case gl.FLOAT_VEC3    	:		gl.vertexAttrib1fv(attributeLocation, value);	break;
			case gl.FLOAT_VEC4    	:		gl.vertexAttrib1fv(attributeLocation, value);	break;
		}
		return this;
	}
	,
	AttributePointer: function(name, value) {
		var attributeLocation = this.GetAttributeLocation(name);
		var pointer = value;		
		if (!pointer._size) {
			var attributeType = this.GetAttributeType(name);
			
			switch (attributeType) {
				case gl.FLOAT			:		pointer.size(1);		break;	
				case gl.FLOAT_VEC2    	:		pointer.size(2);		break;
				case gl.FLOAT_VEC3    	:		pointer.size(3);		break;
				case gl.FLOAT_VEC4    	:		pointer.size(4);		break;
			}
		}
		o3gl.VertexArray._VertexAttributePointer(attributeLocation, pointer);		
		return this;
	}
	,
	BindAttributeLocation : function (name, index) {		
		// More than one name can be bound to the same vertex index, but multiple indexes cannot be bound to the same name.
		// If name is a matrix attribute, then index points to the first column of the matrix. 
		// Additional matrix columns are automatically bound to index+1, index+2, and so forth based on matrix variable (mat2,mat3,mat4).
		gl.bindAttribLocation(this.programId, index, name);
		gl.linkProgram(this.programId);
		return this;
	}
	,
	Elements : function(elementArrayBuffer) {
		if (elementArrayBuffer) {
			elementArrayBuffer.Bind();
		} else {
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
		}
		return this;
	}
	,
	// Uniform buffer object API
	_DrawArrays : function(glMode, first, count, primcount) {				
		if (!first) {
			first = 0;
		}

		var vertexArrayIndices;
		var enabledVertexArrayIndices;

		var defaultElementsCount;
		var defaultInstancesCount;
		
		if (!count || !primcount) {
			vertexArrayIndices = this.GetAttributeLocations();
			enabledVertexArrayIndices = o3gl.VertexArray._GetEnabledVertexAttributeArrayIndices(vertexArrayIndices);
		}

		if (enabledVertexArrayIndices) {
			for (var i = 0; i < enabledVertexArrayIndices.length; ++i) {
				var index = enabledVertexArrayIndices[i];
				
				var currentDivisor = o3gl.VertexArray._GetVertexAttributeArrayDivisor(index);
				var currentCount = o3gl.VertexArray._GetVertexAttributeArrayBufferCount(index);
				
				if (currentDivisor) {
					// This is per instance data
					if (!defaultInstancesCount) 
						defaultInstancesCount = currentDivisor * currentCount;
					else if (defaultInstancesCount != currentDivisor * currentCount) 
						throw new TypError("Instanced arrays yield different elements count");
				} else {
					if (!defaultElementsCount) 
						defaultElementsCount = currentCount;
					else if (defaultElementsCount != currentCount) {
						throw new TypError("Active vertex arrays have different elements count");
					}
				}
			}
		}
		
		if (!count) count = defaultElementsCount;
		if (!primcount) primcount = defaultInstancesCount;
		
		if (primcount) {
			var ext = gl.getExtension("ANGLE_instanced_arrays");
			ext.drawArraysInstancedANGLE(gl.TRIANGLES, first, count, primcount);
		} else {
			gl.drawArrays(glMode, first, count);			
		}
	}	
	,
	_DrawElements : function(glMode, first, count, primcount) {		
		var elementType 	= gl.UNSIGNED_SHORT; 						// The type of elements in the element array buffer. Must be a gl.UNSIGNED_SHORT.
		var elementsCount 	= undefined; 	// The number of elements to render.
		var offsetBytes		= 0; 										// Offset into the element array buffer. Must be a valid multiple of the size of type.
				
		if (first) 
			offsetBytes = Utils.glTypeSizeBytes(elementType) * first; // elementType must be gl.UNSIGNED_SHORT here
		else 
			offsetBytes = 0;
		
		if (count) 
			elementsCount = count;
		else						
			elementsCount = o3gl.VertexArray._GetElementArrayBufferCount(); 	// Compute 
		
		if (!primcount) {
			var defaultInstancesCount;			
			vertexArrayIndices = this.GetAttributeLocations();
			enabledVertexArrayIndices = o3gl.VertexArray._GetEnabledVertexAttributeArrayIndices(vertexArrayIndices);
			for (var i = 0; i < enabledVertexArrayIndices.length; ++i) {
				var index = enabledVertexArrayIndices[i];
				var currentDivisor = o3gl.VertexArray._GetVertexAttributeArrayDivisor(index);
				var currentCount = o3gl.VertexArray._GetVertexAttributeArrayBufferCount(index);
				if (currentDivisor) {
					// This is per instance data
					if (!defaultInstancesCount) 
						defaultInstancesCount = currentDivisor * currentCount;
					else if (defaultInstancesCount != currentDivisor * currentCount) 
						throw new TypError("Instanced arrays yield different elements count");
				}
			}
			primcount = defaultInstancesCount;
		}

		if (primcount > 0) {
			var ext = gl.getExtension("ANGLE_instanced_arrays");
			ext.drawElementsInstancedANGLE(glMode, elementsCount, elementType, offsetBytes, primcount);
		} else {
			gl.drawElements(glMode, elementsCount, elementType, offsetBytes);			
		}
	}
	,
	_DrawPrimitives : function(glMode, first, count, primcount) {
		this.Use(); // TODO: do we need it here??? assert current program
		
		var elementArrayBuffer = gl.getParameter(gl.ELEMENT_ARRAY_BUFFER_BINDING);
		if (elementArrayBuffer) {
			this._DrawElements(glMode, first, count, primcount);			
		} else {
			this._DrawArrays(glMode, first, count, primcount);			
		}
		return this;		
	}
	,
	DrawTriangles : function(first, count, primcount) {
		this._DrawPrimitives(gl.TRIANGLES, first, count, primcount);
		return this;
	}
	,
	DrawTriangleStrip : function(first, count, primcount) {
		this._DrawPrimitives(gl.TRIANGLE_STRIP, first, count, primcount);
		return this;
	}
	,
	DrawTriangleFan : function(first, count, primcount) {
		this._DrawPrimitives(gl.TRIANGLE_FAN, first, count, primcount);
		return this;
	}
	,
	DrawPoints : function(first, count, primcount) {
		this._DrawPrimitives(gl.POINTS, first, count, primcount);
		return this;
	}
	,
	DrawLines : function(first, count, primcount) {
		this._DrawPrimitives(gl.LINES, first, count, primcount);
		return this;
	}
	,
	DrawLineStrip : function(first, count, primcount) {
		this._DrawPrimitives(gl.LINE_STRIP, first, count, primcount);
		return this;
	}
	,
	DrawLineLoop : function(first, count, primcount) {
		this._DrawPrimitives(gl.LINE_LOOP, first, count, primcount);
		return this;
	}
	,	
	FrameBuffer : function(frameBuffer) {
		if (frameBuffer) {
			frameBuffer.Bind();
			// Default values:
			this.Viewport(0, 0, frameBuffer.getWidth(), frameBuffer.getHeight());

			// Depth and stencil test
			if(frameBuffer._depthAttachment) {
				this.DepthTest(true);
			} else {
				this.DepthTest(false);
			}
			if(frameBuffer._stencilAttachment) {
				this.StencilTest(true);
			} else {
				this.StencilTest(false);
			}
			
			// TODO:
			// gl.depthFunc(gl.LEQUAL); // Default
			// gl.depthRange(0.0, 1.0); // Default
		} else {
			this.DepthTest(false);
			this.StencilTest(false);			
		}
		return this;
	}
	,
	DepthTest : function (enable) {
		if (enable)
			gl.enable(gl.DEPTH_TEST);
		else
			gl.disable(gl.DEPTH_TEST);
		return this;
	}
	,
	StencilTest : function (enable) {
		if (enable)
			gl.enable(gl.STENCIL_TEST);
		else
			gl.disable(gl.STENCIL_TEST);
		return this;
	}
	,
	Viewport : function(x,y,width,height) {
		gl.viewport(x, y, width, height);
		return this;
	}
}
























































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



/*************************************************
WebGL 2 classes
https://www.khronos.org/registry/webgl/specs/latest/2.0/
**************************************************/
function Query() {
}

function Sampler() {
}

function TransformFeedback() {
}

//function VertexArrayObject() {}





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



// Resource methods
o3gl.CreateTexture2D = function() {
	return new o3gl.Texture2D().Bind();
}
o3gl.CreateTextureCubeMap = function() {
	return new o3gl.TextureCubeMap().Bind();
}
o3gl.CreateArrayBuffer = function() {
	return new o3gl.ArrayBuffer().Bind();
}
o3gl.CreateElementArrayBuffer = function() {
	return new o3gl.ElementArrayBuffer().Bind();
}
o3gl.CreateUniformBuffer = function() {
	return new o3gl.UniformBuffer().Bind();
}
o3gl.CreateFrameBuffer = function() {
	return new o3gl.FrameBuffer().Bind();
}
o3gl.CreateRenderBufferDepth = function() {
	return new o3gl.RenderBufferDepth().Bind();
}
o3gl.CreateRenderBufferStencil = function() {
	return new o3gl.RenderBufferStencil().Bind();
}
o3gl.CreateVertexArray = function() {
	return new o3gl.VertexArray().Bind();
}
o3gl.CreateShader = function(sources) {
	return new o3gl.Shader(sources);
}
o3gl.CreateProgram = function(shader1,shader2) {
	var result = new o3gl.Program(shader1,shader2).Use();
	
	// Assign sequential value to the sampler uniforms
	var uniformSamplerLocations = result.GetUniformSamplerLocations();
	for (var i = 0; i < uniformSamplerLocations.length; ++i) {
		var uniformSamplerLocation = uniformSamplerLocations[i];
		gl.uniform1i(uniformSamplerLocation, i);
	}

	return result;
}

o3gl.sources = function(sources1, sources2) {
	return new o3gl.ProgramSources(sources1, sources2);
}

return o3gl;
}
