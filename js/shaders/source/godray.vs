uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;

attribute vec4 position;
attribute vec2 textCoord;

varying vec2 texCoordI;

void main() 
{
	texCoordI = (position.xy + 1.0) / 2.0; //gl_MultiTexCoord0;
	gl_Position = position; //ftransform();
}