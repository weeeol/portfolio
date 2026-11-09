export const vertexShaderSource = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  attribute float a_alpha;
  attribute float a_isShadow;
  varying vec2 v_texCoord;
  varying float v_alpha;
  varying float v_isShadow;
  uniform mat3 u_matrix;
  void main() {
    gl_Position = vec4((u_matrix * vec3(a_position, 1.0)).xy, 0.0, 1.0);
    v_texCoord = a_texCoord;
    v_alpha = a_alpha;
    v_isShadow = a_isShadow;
  }
`;

export const fragmentShaderSource = `
  precision mediump float;
  uniform sampler2D u_image;
  uniform vec4 u_tint;
  varying vec2 v_texCoord;
  varying float v_alpha;
  varying float v_isShadow;
  void main() {
    vec4 color = texture2D(u_image, v_texCoord);
    if (v_isShadow > 0.5) {
       gl_FragColor = vec4(0.0, 0.0, 0.0, color.a * v_alpha);
    } else {
      gl_FragColor = vec4(color.rgb * u_tint.rgb, color.a * v_alpha * u_tint.a);
    }
  }
`;

export const compileShader = (gl, type, source) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
};
