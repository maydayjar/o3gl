#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D uSampler;
void main(void) {
	gl_FragColor = texture2D(uSampler, gl_PointCoord);
}