//替换   \node_modules\@deck.gl\layers\dist\esm\icon-layer\icon-layer-fragment.glsl.js
export default `\
#define SHADER_NAME icon-layer-fragment-shader

precision highp float;

uniform float opacity;
uniform sampler2D iconsTexture;
uniform float alphaCutoff;
uniform vec2 resolution;

varying float vColorMode;
varying vec4 vColor;
varying vec2 vTextureCoords;
varying vec2 uv;
varying vec2 bias;

varying vec3 vInstancePositions;

void main(void) {
  geometry.uv = uv;

  vec4 texColor = texture2D(iconsTexture, vTextureCoords);
  // if colorMode == 0, use pixel color from the texture
  // if colorMode == 1 or rendering picking buffer, use texture as transparency mask
  vec3 color = mix(texColor.rgb, vColor.rgb, vColorMode);
  // Take the global opacity and the alpha from vColor into account for the alpha component
  float a = texColor.a * opacity * vColor.a;

  if (a < alphaCutoff) {
    discard;
  }
  
 float distance = bias.x*bias.x+bias.y*bias.y;
 if(distance<=1.0)
 {
    gl_FragColor = vec4(color, a);
 }
 
  DECKGL_FILTER_COLOR(gl_FragColor, geometry);
}
`;

//替换   \node_modules\@deck.gl\layers\dist\esm\icon-layer\icon-layer-fragment.glsl.js
