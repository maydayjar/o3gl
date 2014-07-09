#ifdef GL_ES
precision highp float;
#endif
uniform vec3 		uLightPosition;

uniform sampler2D 	uSamplerDiffuse; 
uniform sampler2D 	uSamplerNormal;
uniform sampler2D 	uSamplerSpecular;
uniform sampler2D 	uSamplerAmbient;
uniform samplerCube uSamplerCube;

uniform vec4 		uMaterialDiffuse;
uniform vec4 		uMaterialAmbient;
uniform vec4 		uMaterialSpecular;
uniform float 		uMaterialShininess;

varying vec4 		vPosition;
varying vec2 		vTextureCoord; 
varying vec3 		vNormal;
varying vec3 		vTangent;
varying vec3 		vBitangent;

vec3 getTexelNormal() {
	vec3 texelNormal;
	texelNormal 			= texture2D(uSamplerNormal, vec2(vTextureCoord.s, vTextureCoord.t)).xyz;
	texelNormal				= normalize(2.0 * (texelNormal - 0.5));
	texelNormal 			= texelNormal.x * vTangent + texelNormal.y * vBitangent + texelNormal.z * vNormal;
	//	mat3 tbnMatrix = mat3(
	//		vTangent.x, vBitangent.x, vNormal.x,
	//		vTangent.y, vBitangent.y, vNormal.y,
	//		vTangent.z, vBitangent.z, vNormal.z
	//	);
	//	texelNormal	= texelNormal * tbnMatrix;
	return texelNormal;
}

vec4 getTexelDiffuse() {
	return texture2D(uSamplerDiffuse, vec2(vTextureCoord.s, vTextureCoord.t));
}

vec4 getTexelAmbient() {
	return texture2D(uSamplerAmbient, vec2(vTextureCoord.s, vTextureCoord.t));
}

vec4 getTexelSpecular() {
	return texture2D(uSamplerSpecular, vec2(vTextureCoord.s, vTextureCoord.t));
}

void main(void) {
	// Unpack tangent-space normal from texture
	vec3 texelNormal 		= getTexelNormal();
	vec3 lightDirection		= normalize(uLightPosition - vPosition.xyz);
	vec3 eyeDirection		= normalize(-vPosition.xyz);
	vec3 lightReflected 	= reflect(-lightDirection, texelNormal);

	// Light properties
	vec4 lightDiffuse		= vec4(1,1,1,1);
	vec4 lightAmbient		= vec4(1,1,1,1);		
	vec4 lightSpecular		= vec4(1,1,1,1);
	// Material properties
	//lightSpecular		= textureCube(uSamplerCube, reflect(eyeDirection, texelNormal));
	
	
	vec4 materialDiffuse 	= getTexelDiffuse();
	vec4 materialAmbient	= getTexelAmbient();
	vec4 materialSpecular	= getTexelSpecular();
	float materialShininess = 1.0;

	// Calculate phong lighting
	float lambertTerm = max(dot(texelNormal, lightDirection), 0.0);
	vec4 Ia = lightAmbient * materialAmbient;
	vec4 Id = lightDiffuse * materialDiffuse * lambertTerm;		
	float specular = pow(clamp(dot(lightReflected, eyeDirection), 0.0, 1.0), materialShininess);
	vec4 Is = lightSpecular * materialSpecular * specular;
	
	gl_FragColor = Ia + Id + Is;
}