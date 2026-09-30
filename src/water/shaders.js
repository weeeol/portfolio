export const vertexShaderSource = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;
  uniform mat3 u_matrix;
  void main() {
    gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);
    v_texCoord = a_texCoord;
  }
`;

export const fragmentShaderSource = `
  precision mediump float;
  uniform sampler2D u_image;
  uniform float u_alpha;
  uniform bool u_isShadow;
  uniform vec4 u_tint;
  varying vec2 v_texCoord;
  void main() {
    vec4 color = texture2D(u_image, v_texCoord);
    if (u_isShadow) {
       gl_FragColor = vec4(0.0, 0.0, 0.0, color.a * u_alpha);
    } else {
      gl_FragColor = vec4(color.rgb * u_tint.rgb, color.a * u_alpha * u_tint.a);
    }
  }
`;

export const compileShader = (gl, type, source) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
};
