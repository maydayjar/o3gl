#ifdef GL_ES
    precision highp float;
#endif
uniform sampler2D uSamplerSrc;
uniform sampler2D uSamplerDst;
varying vec2 vTextureCoord;
void main ()
{
    vec4 dst = texture2D(uSamplerDst, vTextureCoord); 
    vec4 src = texture2D(uSamplerSrc, vTextureCoord); 
	gl_FragColor = clamp((src + dst) - (src * dst), 0.0, 1.0);
	gl_FragColor.w = 1.0;
}