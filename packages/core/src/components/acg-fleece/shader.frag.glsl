uniform float uHover;
uniform float uConcept;


      uniform sampler2D tMap;
      uniform vec2 uMouse;
      varying vec2 vUv;

      float getLuminance(vec3 color) {
        return dot(color, vec3(0.299, 0.587, 0.114));
      }

      void main_effect() {
        vec2 uv = vUv;

        // Fetch base texture
        vec4 tex = texture2D(tMap, uv);

        // 1. Global High-Detail Embossed Bas-Relief Normal Map
        float hL = getLuminance(texture2D(tMap, uv - vec2(0.0022, 0.0)).rgb);
        float hR = getLuminance(texture2D(tMap, uv + vec2(0.0022, 0.0)).rgb);
        float hB = getLuminance(texture2D(tMap, uv - vec2(0.0, 0.0022)).rgb);
        float hT = getLuminance(texture2D(tMap, uv + vec2(0.0, 0.0022)).rgb);

        float dx = (hR - hL) * 2.8;
        float dy = (hT - hB) * 2.8;
        vec3 normal = normalize(vec3(-dx, -dy, 0.32));

        // 2. Global Directional Light Source (Distant Softbox shifting with cursor)
        // No point-light falloff or spotlight mask
        vec3 lightDir = normalize(vec3((uMouse.x - 0.5) * 2.0, (uMouse.y - 0.5) * 2.0, 0.6));

        // Diffuse lighting on the embossed ridges
        float diff = max(dot(normal, lightDir), 0.0);

        // Specular glint on paper ridges
        vec3 viewDir = vec3(0.0, 0.0, 1.0);
        vec3 halfDir = normalize(lightDir + viewDir);
        float spec = pow(max(dot(normal, halfDir), 0.0), 18.0) * 0.12 * uHover;

        // 3. Microscopic Organic Paper Pulp/Fiber structure (Global)
        float paperPattern = sin(uv.x * 750.0) * sin(uv.y * 750.0) * 0.5 + 0.5;
        float paperFibers = smoothstep(0.2, 0.8, paperPattern) * 0.038 * uHover;

        // Assemble global letterpress shaded output
        vec3 embossedColor = tex.rgb * (0.85 + diff * 0.28) + vec3(spec);
        embossedColor *= (1.0 - paperFibers);

        // Smoothly blend flat texture with global bas-relief output based on hover
        vec3 mixedColor = mix(tex.rgb, embossedColor, uHover);

        gl_FragColor = vec4(mixedColor, tex.a);
      }
    

void main() {
  main_effect();
  gl_FragColor = mix(texture2D(tMap, vUv), gl_FragColor, uHover);
}