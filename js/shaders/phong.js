var Shaders = Shaders || {};
Shaders.Phong = {};

Shaders.Phong.attribute = [
	"attribute vec3 aPosition;",
	"attribute vec2 aTextureCoord;",
	"attribute vec3 aNormal;",
	"attribute vec3 aTangent;",
	"attribute vec4 aDiffuse;",
	"attribute vec4 aAmbient;",
	"attribute vec4 aSpecular;",
];
Shaders.Phong.uniform = [
	"uniform vec3 uLightPosition;",
	"uniform samplerCube uSamplerCube;",
	
	"uniform mat4 uMatrixM;",
	"uniform mat4 uMatrixV;",
	"uniform mat4 uMatrixP;",
	"uniform mat3 uMatrixN;",

	"uniform sampler2D uSamplerDiffuse;",
	"uniform sampler2D uSamplerSpecular;",
	"uniform sampler2D uSamplerAmbient;", 
	"uniform sampler2D uSamplerNormal;", 

	"uniform vec4 uMaterialDiffuse;",
	"uniform vec4 uMaterialAmbient;", 
	"uniform vec4 uMaterialSpecular;", 
	"uniform float uMaterialShininess;",
];
Shaders.Phong.varying = [
	"varying vec4 vPosition;",
	"varying vec2 vTextureCoord;", 
	"varying vec3 vNormal;",
	"varying vec3 vTangent;", 
	"varying vec3 vBitangent;", 
	"varying vec4 vDiffuse;", 
	"varying vec4 vAmbient;",
	"varying vec4 vSpecular;",
];

Shaders.Phong.Vertex = [
	Shaders.Phong.attribute,
	Shaders.Phong.uniform,
	Shaders.Phong.varying,
	"void main(void) {",
	"	vPosition 		= uMatrixV * uMatrixM * vec4(aPosition, 1.0);",
	"	vTextureCoord	= vec2(aTextureCoord.x, aTextureCoord.y);",
	"	vNormal 		= uMatrixN * aNormal;",
	"	vTangent		= uMatrixN * aTangent;",
	"	vBitangent		= cross(vNormal, vTangent);",
	"	vDiffuse		= aDiffuse;",
	"	vAmbient		= aAmbient;",
	"	vSpecular		= aSpecular;",		
	"	gl_Position		= uMatrixP * vPosition;",
	"}"
];
Shaders.Phong.Fragment = [
	"#ifdef GL_ES",
	"precision highp float;",
	"#endif",
	Shaders.Phong.uniform,
	Shaders.Phong.varying,
	"void main(void) {",
	// Unpack tangent-space normal from texture
	"	vec3 normal;",
	"	normal 				= vNormal;",
	"	vec3 texelNormal	= texture2D(uSamplerNormal, vec2(vTextureCoord.s, vTextureCoord.t)).xyz;",
	"	texelNormal			= normalize(2.0 * (texelNormal - 0.5));",
//	"	normal 				= texelNormal.x * vTangent + texelNormal.y * vBitangent + texelNormal.z * vNormal;",
	"	normal 				+= texelNormal;",
	/*
	"		mat3 tbnMatrix = mat3(" +
	"			vTangent.x, vBitangent.x, vNormal.x," +
	"			vTangent.y, vBitangent.y, vNormal.y," +
	"			vTangent.z, vBitangent.z, vNormal.z" +
	"		);" +
	"	normal	= normal * tbnMatrix;",
	*/
	"	normal	= normalize(normal);",
	"	vec3 lightDirection		= normalize(uLightPosition - vPosition.xyz);",
	"	vec3 eyeDirection		= normalize(-vPosition.xyz);",
	"	vec3 lightReflected		= reflect(-lightDirection, normal);",
	// Light properties
	"	vec4 lightDiffuse		= vec4(1,1,1,1);",
	"	vec4 lightAmbient		= vec4(1,1,1,1);",
	"	vec4 lightSpecular		= vec4(0,0,0,0);",
			
	"	float materialShininess	= 1.0;",
	"	float specular			= pow(clamp(dot(lightReflected, eyeDirection), 0.0, 1.0), materialShininess);",
	"	lightSpecular			+= vec4(1,1,1,0) * specular;", 
	"	lightSpecular			+= textureCube(uSamplerCube, reflect(eyeDirection, normal)); //materialSpecular,uSamplerCube", 
	
	// Material properties
	"	vec4 materialDiffuse	= vec4(0.0, 0.0, 0.0, 1.0);",
	"	vec4 materialAmbient	= vec4(0.0, 0.0, 0.0, 1.0);",
	"	vec4 materialSpecular	= vec4(0.0, 0.0, 0.0, 1.0);",
	"	materialDiffuse			+= uMaterialDiffuse;",
	"	materialDiffuse			+= vDiffuse;",
	"	materialDiffuse			+= texture2D(uSamplerDiffuse, vec2(vTextureCoord.s, vTextureCoord.t));",
	"	materialAmbient			+= uMaterialAmbient;",
	"	materialAmbient			+= vAmbient;",
	"	materialAmbient			+= texture2D(uSamplerAmbient, vec2(vTextureCoord.s, vTextureCoord.t));",
	"	materialSpecular		+= uMaterialSpecular;",
	"	materialSpecular		+= vSpecular;",
	"	materialSpecular		+= texture2D(uSamplerSpecular, vec2(vTextureCoord.s, vTextureCoord.t));",
	// Calculate phong lighting components
	"	float lambertTerm 		= max(dot(normal, lightDirection), 0.0);",
	"	vec4 Id = lightDiffuse * materialDiffuse * lambertTerm;",
	"	vec4 Ia = lightAmbient * materialAmbient;",		
	"	vec4 Is = lightSpecular * materialSpecular;",
	"	vec4 color = vec4(0,0,0,0);",
	"	color += Ia;",
	"	color += Id;",
	"	color += Is;",
	"	gl_FragColor = color;",
	"}"
];

/*
Shaders.Phong.PositionNormalDepth.attribute = [
	"attribute vec3 aPosition;",
	"attribute vec2 aTextureCoord;",
	"attribute vec3 aNormal;",
	"attribute vec3 aTangent;",
];
Shaders.Phong.PositionNormalDepth.uniform = [
	"uniform mat4 uMatrixM;",
	"uniform mat4 uMatrixV;",
	"uniform mat4 uMatrixP;",
	"uniform mat3 uMatrixN;",
	"uniform sampler2D uSamplerNormal;", 
];
Shaders.Phong.PositionNormalDepth.varying = [
	"varying vec4 vPosition;",
	"varying vec2 vTextureCoord;", 
	"varying vec3 vNormal;",
	"varying vec3 vTangent;", 
	"varying vec3 vBitangent;", 
	"varying float vDepth;", 
];

Shaders.Phong.PositionNormalDepth = {};
Shaders.Phong.PositionNormalDepth.Vertex = 	[
	Shaders.Phong.attribute,
	Shaders.Phong.uniform,
	Shaders.Phong.varying,
	"void main(void) {",
	"	vPosition 		= uMatrixV * uMatrixM * vec4(aPosition, 1.0);",
	"	vTextureCoord	= vec2(aTextureCoord.x, aTextureCoord.y);",
	"	vNormal 		= uMatrixN * aNormal;",
	"	vTangent		= uMatrixN * aTangent;",
	"	vBitangent		= cross(vNormal, vTangent);",
	"	gl_Position		= uMatrixP * vPosition;",
	"	vDepth = 		(gl_Position.z / gl_Position.w);"
	"}"
];
Shaders.Phong.PositionNormalDepth.Fragment = [
	"#extension GL_EXT_draw_buffers : require",
	"#ifdef GL_ES",
	"precision highp float;",
	"#endif",
	Shaders.PositionNormalDepth.uniform,
	Shaders.PositionNormalDepth.varying,
	"void main(void) {",
	// Unpack tangent-space normal from texture
	"	vec3 normal;",
	"	normal 				= vNormal;",
	"	vec3 texelNormal	= texture2D(uSamplerNormal, vec2(vTextureCoord.s, vTextureCoord.t)).xyz;",
	"	texelNormal			= normalize(2.0 * (texelNormal - 0.5));",
	"	normal 				= texelNormal.x * vTangent + texelNormal.y * vBitangent + texelNormal.z * vNormal;",
	"	gl_FragData[0] = vPosition;"
	"	gl_FragData[1] = normal;"
	"	gl_FragData[2] = vec4(vec3((vDepth)), 1.0);"
	"}"
];

*/
