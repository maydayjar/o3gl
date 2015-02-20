var Shaders = Shaders || {};

Shaders.Default = {}
Shaders.Default.Vertex = [
	"attribute vec2 		aPosition;",
	"attribute vec2 		aTextureCoord;",
	"uniform sampler2D 		uSampler0;",		
	"uniform sampler2D 		uSampler1;",		
	"varying vec2 			vTextureCoord;",
	"void main() {",
	"	vTextureCoord = aTextureCoord;",
	"	gl_Position = vec4(aPosition, 0.0, 1.0);",
	"}"
];
Shaders.Default.Fragment = [
	"precision mediump float;",
	"uniform sampler2D 		uSampler0;",		
	"uniform sampler2D 		uSampler1;",		
	"varying vec2 			vTextureCoord;",	
	"void main() {",
	"	gl_FragColor = texture2D(uSampler0, vTextureCoord);",
	"}"
];

Shaders.Fade = {};
Shaders.Fade.Vertex = Shaders.Default.Vertex;
Shaders.Fade.Fragment = [
	"precision mediump float;",
	"uniform sampler2D 	uSampler0;",		
	"uniform sampler2D 	uSampler1;",		
	"varying vec2 		vTextureCoord;",
	"void main() {",
	"	vec4 frameColor = texture2D(uSampler0, vTextureCoord);",
	"	//float luminance = frameColor.r * 0.3 + frameColor.g * 0.59 + frameColor.b * 0.11;",
	"	float luminance = (frameColor.r + frameColor.g + frameColor.b) / 3.0;",
	"	gl_FragColor = vec4(luminance, luminance, luminance, frameColor.a);",
	"}"
];

Shaders.Convolution = {};
Shaders.Convolution.Vertex = Shaders.Default.Vertex;
Shaders.Convolution.Fragment = [
	"precision mediump float;",
	"uniform sampler2D 	uSampler0;",		
	"uniform sampler2D 	uSampler1;",		
	"varying vec2 		vTextureCoord;",

	"uniform vec2 		uStep;",
	"const int 			blurKernelSize = 16;",
	"const float 		blurStrength = 1.0;	",
	
	"float gaussian (float x, float deviation) {",
	"	return (1.0 / sqrt(2.0 * 3.141592 * deviation)) * exp(-((x * x) / (2.0 * deviation)));  ",
	"}",
	"void main() {",
		// Gaussian deviation
	"	float deviation = float(blurKernelSize / 2) * 0.35;",
	"	deviation *= deviation;",
	"	vec4 color = vec4(0.0);",
	"	for (int i = 0; i < blurKernelSize; ++i) {",
	"		float offset 		= float(i - blurKernelSize / 2);",
	"		vec2 textureCoord 	= vTextureCoord + uStep * offset;",
	"		color 				+= texture2D(uSampler0, textureCoord) * gaussian(offset * blurStrength, deviation);",
	"	}",
	"	gl_FragColor = clamp(color, 0.0, 1.0);",
	"	gl_FragColor.w = 1.0;",
	"}"
]

Shaders.BlurRadial = {};
Shaders.BlurRadial.Vertex = Shaders.Default.Vertex;
Shaders.BlurRadial.Fragment = [
	"precision mediump float;",
	"uniform sampler2D 	uSampler0;",		
	"uniform sampler2D 	uSampler1;",		
	"varying vec2 		vTextureCoord;",

	"const int MAX_SAMPLES = 20;",
	"uniform vec4 		uOrigin;",
	"uniform vec2 		uStep;",
	"uniform vec2 		uFactor;",

	"void main() {",
		"vec2 center 	= vec2(0.0);",
		"center.x 		= uOrigin[0] + (uOrigin[2] - uOrigin[0]) * vTextureCoord.x;",
		"center.y 		= uOrigin[1] + (uOrigin[3] - uOrigin[1]) * vTextureCoord.y;",
		"vec2 tc 		= vTextureCoord.st;",
		"vec2 tcDelta 	= vec2(center.xy - vTextureCoord.st);",
		"float distance = length(tcDelta);",
		"float numSamples = float(MAX_SAMPLES);",	
		//"numSamples 	= length(tcDelta) / length(uStep);",
		"tcDelta 		/= numSamples;",
		"vec4 color 	= vec4(0.0);",
		"gl_FragColor 	= texture2D(uSampler0, tc);",	
		"for(int i=0; i < MAX_SAMPLES ; i++) {",
			"if (i > int(numSamples)) break;",
			"tc += tcDelta ;",
			"color 	+= texture2D(uSampler0, tc);",		
		"}",
		"color /= numSamples;",
		"gl_FragColor = gl_FragColor * 0.5 + color * 0.5;",	
		"gl_FragColor.a = 1.0;",
	"}"
];

Shaders.BlurStroke = {};
Shaders.BlurStroke.Vertex = Shaders.Default.Vertex;
Shaders.BlurStroke.Fragment = [
"	precision mediump float;                                                                                                   						",
"	uniform sampler2D uSampler0;                                                                                         							",
"	uniform int uViewportWidth;                                                                                               						",
"	uniform int uViewportHeight;                                                                                              						",
"	varying vec2 vTextureCoord;                                                                                                  					",
"	void main(void)                                                                                                            						",
"	{                                                                                                                          						",
"		float width = (float(uViewportWidth) - 1.0);                                                                  								",
"		float height = (float(uViewportHeight) - 1.0);                                                                  							",
"		vec4 color = vec4(0.0,0.0,0.0,1.0);                                                                  										",
"		for(int i = -3; i<=3 ;++i)                                                                                             						",
"		{                                                                                                                      						",
"			for(int j = -3; j<=3; ++j)                                                                                         						",
"			{                                                                                                                  						",
"				// if(i == 0 && j == 0)                                                                                        						",
"				//  continue;       																												",
"				vec2 offset = vec2(float(i) / width, float(j) / height);                                                                     		",
"				color += texture2D(uSampler0, vTextureCoord + offset);                                  											",
"			}                                                                                                                  						",
"		}                                                                                                                      						",
"		gl_FragColor = color / 49.0;                                                                                                  				",
"		return;                                                                                                                						",
"	}                                                                                                                          						"
];


Shaders.BlendAdditive = {};
Shaders.BlendAdditive.Vertex = Shaders.Default.Vertex;
Shaders.BlendAdditive.Fragment = [
	"precision mediump float;",
	"uniform sampler2D 	uSampler0;",		
	"uniform sampler2D 	uSampler1;",		
	"varying vec2 		vTextureCoord;",
	"void main() {",
	"	vec4 dst = texture2D(uSampler0, vTextureCoord);",
	"	vec4 src = texture2D(uSampler1, vTextureCoord);",
	"	gl_FragColor = min(src + dst, 1.0);",
	"}"
];
Shaders.BlendScreen = {};
Shaders.BlendScreen.Vertex = Shaders.Default.Vertex;
Shaders.BlendScreen.Fragment = [
	"precision mediump float;",
	"uniform sampler2D 	uSampler0;",		
	"uniform sampler2D 	uSampler1;",		
	"varying vec2 		vTextureCoord;",
	"void main() {",
	"	vec4 dst = texture2D(uSampler0, vTextureCoord);",
	"	vec4 src = texture2D(uSampler1, vTextureCoord);",
	"	gl_FragColor = clamp((src + dst) - (src * dst), 0.0, 1.0);",
	"	gl_FragColor.w = 1.0;",
	"}"
];
Shaders.BlendSoftlight = {};
Shaders.BlendSoftlight.Vertex = Shaders.Default.Vertex;
Shaders.BlendSoftlight.Fragment = [
	"precision mediump float;",
	"uniform sampler2D 	uSampler0;",		
	"uniform sampler2D 	uSampler1;",		
	"varying vec2 		vTextureCoord;",
	"void main () {",
	"	vec4 dst = texture2D(uSampler0, vTextureCoord);",
	"	vec4 src = texture2D(uSampler1, vTextureCoord);",
		// Softlight blending (light result, no overexposure)
		// Due to the nature of soft lighting, we need to bump the black region of the source to 0.5, 
		// otherwise the blended result will be dark (black soft lighting will darken the image).
	"	src = (src * 0.5) + 0.5;",
	"	gl_FragColor.xyz = vec3(" +
	"		(src.x <= 0.5) ? (dst.x - (1.0 - 2.0 * src.x) * dst.x * (1.0 - dst.x)) : (((src.x > 0.5) && (dst.x <= 0.25)) ? (dst.x + (2.0 * src.x - 1.0) * (4.0 * dst.x * (4.0 * dst.x + 1.0) * (dst.x - 1.0) + 7.0 * dst.x)) : (dst.x + (2.0 * src.x - 1.0) * (sqrt(dst.x) - dst.x)))," +
	"		(src.y <= 0.5) ? (dst.y - (1.0 - 2.0 * src.y) * dst.y * (1.0 - dst.y)) : (((src.y > 0.5) && (dst.y <= 0.25)) ? (dst.y + (2.0 * src.y - 1.0) * (4.0 * dst.y * (4.0 * dst.y + 1.0) * (dst.y - 1.0) + 7.0 * dst.y)) : (dst.y + (2.0 * src.y - 1.0) * (sqrt(dst.y) - dst.y)))," +
	"		(src.z <= 0.5) ? (dst.z - (1.0 - 2.0 * src.z) * dst.z * (1.0 - dst.z)) : (((src.z > 0.5) && (dst.z <= 0.25)) ? (dst.z + (2.0 * src.z - 1.0) * (4.0 * dst.z * (4.0 * dst.z + 1.0) * (dst.z - 1.0) + 7.0 * dst.z)) : (dst.z + (2.0 * src.z - 1.0) * (sqrt(dst.z) - dst.z)))" +
	"	);",
	"	gl_FragColor.w = 1.0;",
	"}"
];
Shaders.BlendMultiply = {};
Shaders.BlendMultiply.Vertex = Shaders.Default.Vertex;
Shaders.BlendMultiply.Fragment = [
	"precision mediump float;",
	"uniform sampler2D 	uSampler0;",		
	"uniform sampler2D 	uSampler1;",		
	"varying vec2 		vTextureCoord;",
	"void main() {",
	"	vec4 dst = texture2D(uSampler0, vTextureCoord);",
	"	vec4 src = texture2D(uSampler1, vTextureCoord);",
	"	gl_FragColor = min(src * dst, 1.0);",
	"}"
];


Shaders.RadialBlur = {};
Shaders.RadialBlur.Vertex = Shaders.Default.Vertex;
Shaders.RadialBlur.Fragment = [
	"precision mediump float;",
	"uniform sampler2D 	uSampler0;",		
	"uniform sampler2D 	uSampler1;",		
	"varying vec2 		vTextureCoord;",

	"const int NUM_SAMPLES = 20;",
	
	"uniform vec2 		uCenter;",
	"uniform float 		uExposure;",
	"uniform float 		uDecay;",
	"uniform float 		uDensity;",
	"uniform float 		uWeight;",
	"uniform float 		uClamp;",

	// Default values
	"const vec2  		cCenter 	= vec2(0.5);",
	"const float 		cExposure 	= 0.9;",
	"const float 		cDecay 	= 0.93;",
	"const float 		cDensity 	= 0.3;",
	"const float 		cWeight 	= 1.0;",
	"const float 		cClamp 	= 1.0;",

	"void main() {",
		"float fExposure, fDecay, fDensity, fWeight, fClamp;",
		"vec2 center;",
		// Assign values from constants or uniforms
		"fExposure 	= cExposure;",
		"fDecay 	= cDecay;",
		"fDensity 	= cDensity;",
		"fWeight 	= cWeight;",
		"fClamp 	= cClamp;",
		"center 	= cCenter;",

		"fExposure 	= uExposure;",
		"fDecay 	= uDecay;",
		"fDensity 	= uDensity;",
		"fWeight 	= uWeight;",
		"fClamp 	= uClamp;",
		"center 	= uCenter;",
		
		"vec2 tc 		= vTextureCoord.st;",
		"vec2 tcDelta 	= vec2(center.xy - vTextureCoord.st);",
		"tcDelta 		*= 1.0 /  float(NUM_SAMPLES) * fDensity;",
		"float decay 	= 1.0;",

		"vec4 color = texture2D(uSampler0, tc);",
		"for(int i=0; i < NUM_SAMPLES ; i++) {",
		/*
			"tc -= tcDelta;",
			"vec4 sample 	= texture2D(uSampler0, tc);",
			"sample 		*= decay * fWeight;",
			"gl_FragColor 	+= sample * fExposure;",
			"decay 			*= fDecay;",
		*/
			"tc 			+= tcDelta;",
			"float factor 	= (1.0 - decay * fWeight);",
	//    	"float factor 	= 1.0 / float(NUM_SAMPLES);",
			"color 	*= (1.0 - factor);",
			"color 	+= (factor) * texture2D(uSampler0, tc);",
			
			"decay 			*= fDecay;",
		"}",
		"gl_FragColor.rgb = color.rgb;",	
		"gl_FragColor.a = 1.0;",
	"}"
]

Shaders.DepthRGB = {};
Shaders.DepthRGB.Vertex = [
	"attribute vec3 		aPosition;",
	"uniform mat4 			uMatrixM;",
	"uniform mat4 			uMatrixV;",
	"uniform mat4 			uMatrixP;",
	"varying vec4 			vPosition;",
	"void main(void) {",
		"vPosition 		= uMatrixP * uMatrixV * uMatrixM * vec4(aPosition, 1.0);",
		"gl_Position 	= vPosition;",
		"vPosition 		= (vPosition / vPosition.w + 1.0) / 2.0;",
	"}"
];
Shaders.DepthRGB.Fragment = [
	"precision mediump float;",
	"varying vec4 			vPosition;",
	"void main(void) {",
		"gl_FragColor = vec4(vPosition.z, vPosition.z, vPosition.z, 1.0);",
	"}"
];

Shaders.DepthEncodeRGB = {};
Shaders.DepthEncodeRGB.Vertex = [
	"attribute vec3 		aPosition;",
	"uniform mat4 			uMatrixM;",
	"uniform mat4 			uMatrixV;",
	"uniform mat4 			uMatrixP;",
	"varying vec4 			vPosition;",
	"void main(void) {",
		"vPosition 		= uMatrixP * uMatrixV * uMatrixM * vec4(aPosition, 1.0);",
		"gl_Position 	= vPosition;",
		"vPosition = (vPosition / vPosition.w + 1.0) / 2.0;",
	"}"
];
Shaders.DepthEncodeRGB.Fragment = [
	"precision mediump float;",
	"varying vec4 			vPosition;",
	"void main(void) {",
		"float depth = vPosition.z;",
		"float scalar = 256.0;",
		"gl_FragColor.x = fract( depth / scalar ) * scalar;",
		"gl_FragColor.y = fract( depth / (scalar * scalar) ) * scalar;",
		"gl_FragColor.z = fract( depth / (scalar * scalar * scalar) ) * scalar;",
		"gl_FragColor.a = 1.0;",		
	"}"
];

Shaders.PositionRGB = {};
Shaders.PositionRGB.Vertex = [
	"attribute vec3 		aPosition;",
	"uniform mat4 			uMatrixM;",
	"uniform mat4 			uMatrixV;",
	"uniform mat4 			uMatrixP;",
	"varying vec4 			vPosition;",	
	"void main(void) {",
	"	vPosition 		= uMatrixV * uMatrixM * vec4(aPosition, 1.0);",
	"	gl_Position 	= uMatrixP * vPosition;",
	"}"
];
Shaders.PositionRGB.Fragment = [
	"precision mediump float;",
	"varying vec4 			vPosition;",	
	"void main(void) {",
		"gl_FragColor.x = vPosition.x;",
		"gl_FragColor.y = vPosition.y;",
		"gl_FragColor.z = vPosition.z;",
		"gl_FragColor.a = 1.0;",		
	"}"
];

Shaders.GodRay2 = {};
Shaders.GodRay2.Fragment = [
	"precision mediump float;",
	"#define TAPS_PER_PASS 6.0",
	"varying vec2 vUv;",
	"uniform sampler2D tInput;",
	"uniform vec2 uLightPositionScreenSpace;",
	"uniform float uStepSize;", // filter step size
	"void main() {",

		// delta from current pixel to "sun" position

		"vec2 delta = vSunPositionScreenSpace - vUv;",
		"float dist = length( delta );",

		// Step vector (uv space)

		"vec2 stepv = fStepSize * delta / dist;",

		// Number of iterations between pixel and sun

		"float iters = dist/fStepSize;",

		"vec2 uv = vUv.xy;",
		"float col = 0.0;",

		// This breaks ANGLE in Chrome 22
		//	- see http://code.google.com/p/chromium/issues/detail?id=153105

		/*
		// Unrolling didnt do much on my hardware (ATI Mobility Radeon 3450),
		// so i've just left the loop

		"for ( float i = 0.0; i < TAPS_PER_PASS; i += 1.0 ) {",

			// Accumulate samples, making sure we dont walk past the light source.

			// The check for uv.y < 1 would not be necessary with "border" UV wrap
			// mode, with a black border colour. I don't think this is currently
			// exposed by three.js. As a result there might be artifacts when the
			// sun is to the left, right or bottom of screen as these cases are
			// not specifically handled.

			"col += ( i <= iters && uv.y < 1.0 ? texture2D( tInput, uv ).r : 0.0 );",
			"uv += stepv;",

		"}",
		*/

		// Unrolling loop manually makes it work in ANGLE

		"if ( 0.0 <= iters && uv.y < 1.0 ) col += texture2D( tInput, uv ).r;",
		"uv += stepv;",

		"if ( 1.0 <= iters && uv.y < 1.0 ) col += texture2D( tInput, uv ).r;",
		"uv += stepv;",

		"if ( 2.0 <= iters && uv.y < 1.0 ) col += texture2D( tInput, uv ).r;",
		"uv += stepv;",

		"if ( 3.0 <= iters && uv.y < 1.0 ) col += texture2D( tInput, uv ).r;",
		"uv += stepv;",

		"if ( 4.0 <= iters && uv.y < 1.0 ) col += texture2D( tInput, uv ).r;",
		"uv += stepv;",

		"if ( 5.0 <= iters && uv.y < 1.0 ) col += texture2D( tInput, uv ).r;",
		"uv += stepv;",

		// Should technically be dividing by 'iters', but 'TAPS_PER_PASS' smooths out
		// objectionable artifacts, in particular near the sun position. The side
		// effect is that the result is darker than it should be around the sun, as
		// TAPS_PER_PASS is greater than the number of samples actually accumulated.
		// When the result is inverted (in the shader 'godrays_combine', this produces
		// a slight bright spot at the position of the sun, even when it is occluded.

		"gl_FragColor = vec4( col/TAPS_PER_PASS );",
		"gl_FragColor.a = 1.0;",
	"}"
];

