#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D uSampler;
uniform float uTime;

varying vec2 vTextureCoord;
const float speed = 100.1;
const float magnitude = 0.0015;
void main(void)
{
	vec2 wavyCoord;
	wavyCoord.s = vTextureCoord.s + (sin(uTime+vTextureCoord.t*speed) * magnitude);
	wavyCoord.t = vTextureCoord.t + (cos(uTime+vTextureCoord.s*speed) * magnitude);
	vec4 frameColor = texture2D(uSampler, wavyCoord);
	gl_FragColor = frameColor;
}