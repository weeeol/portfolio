export const vertexShaderSource = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  attribute lowp float a_alpha;
  attribute lowp float a_isShadow;
  varying mediump vec2 v_texCoord;
  varying lowp float v_alpha;
  varying lowp float v_isShadow;
  uniform mat3 u_matrix;
  void main() {
    gl_Position = vec4((u_matrix * vec3(a_position, 1.0)).xy, 0.0, 1.0);
    v_texCoord = a_texCoord;
    v_alpha = a_alpha;
    v_isShadow = a_isShadow;
  }
`;

export const fragmentShaderSource = `
  precision lowp float;
  varying mediump vec2 v_texCoord;
  varying lowp float v_alpha;
  varying lowp float v_isShadow;
  uniform sampler2D u_image;
  uniform lowp vec4 u_tint;
  void main() {
    lowp vec4 color = texture2D(u_image, v_texCoord);
    lowp float notShadow = 1.0 - v_isShadow;
    lowp vec3 rgb = color.rgb * (u_tint.rgb * notShadow);
    lowp float alpha = color.a * v_alpha * mix(u_tint.a, 1.0, v_isShadow);
    gl_FragColor = vec4(rgb, alpha);
  }
`;

export const compileShader = (gl, type, source) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
};
