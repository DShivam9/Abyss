uniform float uHover;
uniform float uConcept;
uniform float uHoverTime;


      uniform vec2 uMouse;
      uniform float uTime;
      varying vec2 vUv;

      void main_effect() {
        vUv = uv;
        vec3 pos = position;

        // Melting progress starts at 7.0 seconds of hover, fully melted at 12.0 seconds
        float meltProgress = smoothstep(7.0, 12.0, uHoverTime);

        // Global card tilt parallax based on cursor offset
        float tiltX = (uMouse.x - 0.5) * 0.035 * uHover;
        float tiltY = (uMouse.y - 0.5) * 0.035 * uHover;
        pos.z += (position.x * tiltX + position.y * tiltY);

        // Physically sag/drop the bottom part of the mesh downward in 3D as it liquefies
        pos.y -= meltProgress * 0.08 * (0.5 - position.y);
        pos.z -= meltProgress * 0.02 * (0.5 - position.y);

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    

void main() {
  main_effect();
  gl_Position = mix(projectionMatrix * modelViewMatrix * vec4(position, 1.0), gl_Position, uHover);
}