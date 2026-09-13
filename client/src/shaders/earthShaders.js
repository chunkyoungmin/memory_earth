// Day/Night 블렌딩 + 대기 글로우 셰이더

export const earthVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vNormal = normalize(mat3(modelMatrix) * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

export const earthFragmentShader = /* glsl */ `
  uniform sampler2D dayTexture;
  uniform sampler2D nightTexture;
  uniform sampler2D specularTexture;
  uniform vec3 sunDirection;
  uniform float mapBlend;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    vec3 dayColor = texture2D(dayTexture, vUv).rgb;
    vec3 nightColor = texture2D(nightTexture, vUv).rgb;
    float specularMask = texture2D(specularTexture, vUv).r;

    float sunDot = dot(normalize(vNormal), normalize(sunDirection));
    float dayMix = smoothstep(-0.15, 0.15, sunDot);

    vec3 color = mix(nightColor * vec3(1.1, 0.9, 0.6), dayColor, dayMix);

    float highlight = pow(max(sunDot, 0.0), 8.0) * specularMask * 0.3;
    color += vec3(highlight);

    vec3 flatLand = vec3(0.55, 0.62, 0.45);
    vec3 flatOcean = vec3(0.16, 0.32, 0.48);
    vec3 flatColor = mix(flatLand, flatOcean, specularMask);
    color = mix(color, flatColor, mapBlend);

    gl_FragColor = vec4(color, 1.0);
  }
`;

export const atmosphereVertexShader = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const atmosphereFragmentShader = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    // Fresnel: 가장자리일수록 밝아지는 림 글로우
    float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
    gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
  }
`;