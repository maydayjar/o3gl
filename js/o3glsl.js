(function () {

O3GL_CORE = O3GL;

O3GL = function (gl) {

o3gl = O3GL_CORE(gl);

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
}

o3gl.sources = function(shaderSource1, shaderSource2, shaderSource3) {
	return new o3gl.ProgramSources(shaderSource1, shaderSource2);
}

	return o3gl;
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
