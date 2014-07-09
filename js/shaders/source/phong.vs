uniform vec3 		uLightPosition;

uniform mat3 		uNormalMatrix;
uniform mat4 		uModelViewMatrix;
uniform mat4 		uProjectionMatrix;

attribute vec3 		aPosition;
attribute vec2 		aTextureCoord; 
attribute vec3 		aNormal;
attribute vec3 		aTangent;

varying vec4 		vPosition;
varying vec2 		vTextureCoord;
varying vec3 		vNormal;
varying vec3 		vTangent;
varying vec3 		vBitangent;

void main(void) {
	vPosition 		= uModelViewMatrix * vec4(aPosition, 1.0);
	vTextureCoord 	= vec2(aTextureCoord.x, aTextureCoord.y);		
	vNormal 		= uNormalMatrix * aNormal;
	vTangent		= uNormalMatrix * aTangent;
	vBitangent		= cross(vNormal, vTangent);
	gl_Position 	= uProjectionMatrix * vPosition;
	return;
}