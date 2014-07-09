#ifdef GL_ES
    precision highp float;
#endif

uniform sampler2D 	uSampler;
uniform vec2 		uTexelStep;
const int 			blurKernelSize = 16;
const float 		blurStrength = 1.0;

varying vec2 		vTextureCoord;

float gaussian (float x, float deviation)
{
    return (1.0 / sqrt(2.0 * 3.141592 * deviation)) * exp(-((x * x) / (2.0 * deviation)));  
}

void main()
{
	// Gaussian deviation
    float deviation = float(blurKernelSize / 2) * 0.35;
    deviation *= deviation;
	vec4 color = vec4(0.0);
	for (int i = 0; i < blurKernelSize; ++i) {
		float offset 		= float(i - blurKernelSize / 2);
		vec2 textureCoord 	= vTextureCoord + uTexelStep * offset;
		color 				+= texture2D(uSampler, textureCoord) * gaussian(offset * blurStrength, deviation);
	}	
    gl_FragColor = clamp(color, 0.0, 1.0);
    gl_FragColor.w = 1.0;
}