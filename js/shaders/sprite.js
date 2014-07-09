// Phong - blinn lighting model uber shader
SpriteShader = {
	variables : [
		"attribute vec4 	aPosition;",
		"attribute float 	aPointSize;",
		"const float 		cPointSize = 16.0; // aPointSize",
		"uniform mat4 		uModelViewMatrix;",
		"uniform mat4 		uProjectionMatrix;",
		"uniform sampler2D 	uSamplerDiffuse;"
	]
	,
	vertexShader : [
		"void main(void) {",
		"	gl_Position 	= uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);",
		"	gl_PointSize 	= cPointSize;",
		"	gl_PointSize 	= aPointSize;",
		"}"
	]
	,
	fragmentShader : [
		"void main(void) {",
		"	gl_FragColor = texture2D(uSamplerDiffuse, gl_PointCoord);",
		"}"
	]
}
