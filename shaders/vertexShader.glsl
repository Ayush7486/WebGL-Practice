uniform float uTime;
uniform float uHover;
uniform vec2 uMouseHover;
varying vec2 vUv;

void main() {
    vec3 newPosition = position;
    // newPosition.z = 0.1 * sin(newPosition.x * 4.0 * uTime + 1.6);

    // vec2 newUv = uv;

    float dist = distance(uv, uMouseHover);
    newPosition.z = 10.0 * sin(dist * 40.0 - uTime * 0.5) * uHover;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

    vUv = uv;
}