var Shaders = Shaders || {};
Shaders.Deffered = {};

Shaders.Deffered.PackFunction = [
	"vec4 pack (float depth) {",
	"	const vec4 bias = vec4(1.0 / 255.0,1.0 / 255.0,1.0 / 255.0,0.0);",
	"	float r = depth;",
	"	float g = fract(r * 255.0);",
	"	float b = fract(g * 255.0);",
	"	float a = fract(b * 255.0);",
	"	vec4 color = vec4(r, g, b, a);",
	"	return color - (color.yzww * bias);",
	"}"
];
Shaders.Deffered.UnpackFunction = [
	"float unpack (vec4 colour) {",
		"const vec4 bitShifts = vec4(",
		"	1.0,",
		"	1.0 / 255.0,",
		"	1.0 / (255.0 * 255.0),",
		"	1.0 / (255.0 * 255.0 * 255.0)",
		");",
		"return dot(colour, bitShifts);",
	"}"
];

Shaders.Deffered.Depth = {};
Shaders.Deffered.Depth.Vertex = 	[
	"attribute vec3 aPosition;",
	"uniform mat4 uMatrixModelView;",
	"uniform mat4 uMatrixProjection;",
	"varying float vDepth;", 
	"void main(void) {",
	"	vec4 position 	= uMatrixModelView * vec4(aPosition, 1.0);",
	"	gl_Position		= uMatrixProjection * position;",
	"	vDepth = (gl_Position.z / gl_Position.w + 1.0) / 2.0;",
	"}"
];
Shaders.Deffered.Depth.Fragment = [
	"#ifdef GL_ES",
	"precision highp float;",
	"#endif",
	"varying float vDepth;", 
/*	
	"vec4 pack (float depth) {",
	"	const vec4 bias = vec4(1.0 / 255.0,1.0 / 255.0,1.0 / 255.0,0.0);",
	"	float r = depth;",
	"	float g = fract(r * 255.0);",
	"	float b = fract(g * 255.0);",
	"	float a = fract(b * 255.0);",
	"	vec4 color = vec4(r, g, b, a);",
	"	return color - (color.yzww * bias);",
	"}",
	"vec4 encodeFloatRGBA(float v) {",
	"	vec4 color = vec4(1.0, 255.0, 65025.0, 160581375.0) * v;",
	"	color = fract(color);",
	"	color -= color.yzww * vec4(1.0/255.0, 1.0/255.0, 1.0/255.0, 0.0);",
	"	return color;",
	"}",
*/
	"void main(void) {",
//	"	gl_FragColor = encodeFloatRGBA(vDepth);",
	"	floatBitsToInt(vDepth);",
	"	gl_FragColor = vec4(vDepth,vDepth,vDepth,1);",
	"}"
];

Shaders.Deffered.Normal = {};
Shaders.Deffered.Normal.Vertex = 	[
	"attribute vec3 aPosition;",
	"attribute vec2 aTextureCoordinate;",
	"attribute vec3 aNormal;",
	"attribute vec3 aTangent;",

	"uniform mat4 uMatrixModelView;",
	"uniform mat4 uMatrixProjection;",
	"uniform mat3 uMatrixNormal;",

	"varying vec2 vTextureCoordinate;", 
	"varying vec3 vNormal;",
	"varying vec3 vTangent;", 
	"varying vec3 vBitangent;", 

	"void main(void) {",
	"	vTextureCoordinate	= vec2(aTextureCoordinate.x, aTextureCoordinate.y);",
	"	vNormal 		= uMatrixNormal * aNormal;",
	"	vTangent		= uMatrixNormal * aTangent;",
	"	vBitangent		= cross(vNormal, vTangent);",
	"	gl_Position		= uMatrixProjection * uMatrixModelView * vec4(aPosition, 1.0);",
	"}"
];
Shaders.Deffered.Normal.Fragment = [
	"#ifdef GL_ES",
	"precision highp float;",
	"#endif",
	"uniform sampler2D uSamplerNormal;", 
	"varying vec2 vTextureCoordinate;", 
	"varying vec3 vNormal;",
	"varying vec3 vTangent;", 
	"varying vec3 vBitangent;", 

	"void main(void) {",
	"	vec3 normal;",
	"	normal 				= vNormal;",
	"	vec3 texelNormal	= texture2D(uSamplerNormal, vec2(vTextureCoordinate.s, vTextureCoordinate.t)).xyz;",
	"	texelNormal			= normalize(2.0 * (texelNormal - 0.5));",
	"	normal 				= texelNormal.x * vTangent + texelNormal.y * vBitangent + texelNormal.z * vNormal;",
	"	gl_FragColor = vec4(normal, 1);",
	"}"
];

Shaders.Deffered.Material = {};
Shaders.Deffered.Material.Vertex = [
	"attribute vec3 aPosition;",
	"attribute vec4 aDiffuse;",
	"attribute vec4 aAmbient;",
	"attribute vec4 aSpecular;",
	"attribute vec2 aTextureCoordinate;",
	
	"uniform mat4 uMatrixModelView;",
	"uniform mat4 uMatrixProjection;",
	"varying vec2 vTextureCoordinate;", 

	"varying vec4 vDiffuse;", 
	"varying vec4 vAmbient;",
	"varying vec4 vSpecular;",

	
	"void main(void) {",
	"	vDiffuse		= aDiffuse;",
	"	vAmbient		= aAmbient;",
	"	vSpecular		= aSpecular;",		
	"	vTextureCoordinate	= vec2(aTextureCoordinate.x, aTextureCoordinate.y);",
	"	gl_Position		= uMatrixProjection * uMatrixModelView * vec4(aPosition, 1.0);",
	"}"

];
Shaders.Deffered.Material.Fragment = [
	"#extension GL_EXT_draw_buffers : require",
	"#ifdef GL_ES",
	"precision highp float;",
	"#endif",
	
	"uniform vec4 uMaterialDiffuse;",
	"uniform vec4 uMaterialAmbient;", 
	"uniform vec4 uMaterialSpecular;", 
	"uniform float uMaterialShininess;",

	"uniform sampler2D uSamplerDiffuse;",
	"uniform sampler2D uSamplerSpecular;",
	"uniform sampler2D uSamplerAmbient;", 

	"varying vec4 vDiffuse;", 
	"varying vec4 vAmbient;",
	"varying vec4 vSpecular;",

	"varying vec2 vTextureCoordinate;", 
	
	"void main(void) {",
	"	vec4 materialDiffuse	= vec4(0.0, 0.0, 0.0, 1.0);",
	"	vec4 materialAmbient	= vec4(0.0, 0.0, 0.0, 1.0);",
	"	vec4 materialSpecular	= vec4(0.0, 0.0, 0.0, 1.0);",
	"	materialDiffuse			+= uMaterialDiffuse;",
	"	materialDiffuse			+= vDiffuse;",
	"	materialDiffuse			+= texture2D(uSamplerDiffuse, vec2(vTextureCoordinate.s, vTextureCoordinate.t));",
	"	materialAmbient			+= uMaterialAmbient;",
	"	materialAmbient			+= vAmbient;",
	"	materialAmbient			+= texture2D(uSamplerAmbient, vec2(vTextureCoordinate.s, vTextureCoordinate.t));",
	"	materialSpecular		+= uMaterialSpecular;",
	"	materialSpecular		+= vSpecular;",
	"	materialSpecular		+= texture2D(uSamplerSpecular, vec2(vTextureCoordinate.s, vTextureCoordinate.t));",
	
	"	gl_FragData[0]			= materialDiffuse;",
	"	gl_FragData[1]			= materialAmbient;",
	"	gl_FragData[2]			= materialSpecular;",	
	"}"
];
