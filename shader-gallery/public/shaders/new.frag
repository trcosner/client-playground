#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

#define PI 3.14159265359

// Rotate vector by angle
mat2 rotate(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 center = uv - 0.5;
  center.x *= u_resolution.x / u_resolution.y;

  // Time and symmetry
  float time = u_time * 0.2;
  float angle = atan(center.y, center.x);
  float radius = length(center) * 2.0;
  angle = mod(angle, PI / 6.0); // 12-fold symmetry
  vec2 p = vec2(cos(angle), sin(angle)) * radius;

  // Geometric ripple pattern
  float pattern = sin(10.0 * p.x + time * 5.0) + 
                  cos(10.0 * p.y - time * 3.0) +
                  sin(radius * 10.0 - time * 2.0);

  // Color palette: neon pink, blue, and teal
  vec3 col = 0.5 + 0.5 * cos(u_time + pattern + vec3(0.0, 2.0, 4.0));
  col *= smoothstep(1.2, 0.2, radius); // radial fade

  // Extra vaporwave pulse
  col += 0.2 * sin(PI * radius * 4.0 - time * 4.0);

  gl_FragColor = vec4(col, 1.0);
}

