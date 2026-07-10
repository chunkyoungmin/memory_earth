// Day/Night 블렌딩 + 대기 글로우 셰이더

export const earthVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
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

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    vec3 dayColor = texture2D(dayTexture, vUv).rgb;
    vec3 nightColor = texture2D(nightTexture, vUv).rgb;
    float specularMask = texture2D(specularTexture, vUv).r;

    // 태양 방향과 표면 노멀의 내적 -> 낮/밤 경계
    float sunDot = dot(normalize(vNormal), normalize(sunDirection));
    float dayMix = smoothstep(-0.15, 0.15, sunDot);

    // 밤에는 도시 불빛, 낮에는 실사 텍스처
    vec3 color = mix(nightColor * vec3(1.1, 0.9, 0.6), dayColor, dayMix);

    // 바다 부분 하이라이트 (specular mask 활용)
    float highlight = pow(max(sunDot, 0.0), 8.0) * specularMask * 0.3;
    color += vec3(highlight);

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