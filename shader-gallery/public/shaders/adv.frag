precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;

void main() {
    // Normalize pixel coordinates (from 0 to 1)
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    // Center the coordinates around (0,0)
    vec2 pos = uv - 0.5;
    pos.x *= u_resolution.x / u_resolution.y; // Correct aspect ratio

    // Convert to polar coordinates
    float r = length(pos);
    float a = atan(pos.y, pos.x);

    // Kaleidoscope effect: repeat the angle
    float k = 6.0; // Number of segments
    a = mod(a, 2.0 * 3.141592 / k);
    a = abs(a - 3.141592 / k);

    // Convert back to Cartesian coordinates
    pos = r * vec2(cos(a), sin(a));

    // Create a dynamic pattern
    float color = 0.5 + 0.5 * cos(10.0 * r - u_time);
    vec3 col = vec3(sin(u_time + pos.x * 10.0), sin(u_time + pos.y * 10.0), color);

    gl_FragColor = vec4(col, 1.0);
}

