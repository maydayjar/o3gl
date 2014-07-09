#ifdef GL_ES
	precision highp float;
#endif

uniform float exposure;
uniform float decay;
uniform float density;
uniform float weight;
uniform vec2 lightPositionOnScreen;
uniform sampler2D tex;

varying vec2 texCoordI;

// Number of samples. The higher, the better. Caution: Is a real fps-killer!
const int NUM_SAMPLES = 100;

void main()
{	
	vec2 deltaTextCoord = vec2(texCoordI.st - lightPositionOnScreen.xy);
	vec2 textCoo = texCoordI.st;
	deltaTextCoord *= 1.0 /  float(NUM_SAMPLES) * density;
	float illuminationDecay = 1.0;
	
	for(int i=0; i < NUM_SAMPLES ; i++)
	{
		textCoo -= deltaTextCoord;
		vec4 sample = texture2D(tex, textCoo);
		
		sample *= illuminationDecay * weight;
		
		gl_FragColor += sample;
		
		illuminationDecay *= decay;
	}
	
	gl_FragColor *= exposure;
}