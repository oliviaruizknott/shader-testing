in vec2 vTextureCoord;
out vec4 finalColor;

uniform sampler2D uTexture;
uniform float uTime;
uniform vec2 uResolution;

void main(void) {
    vec2 uv = vTextureCoord;
    
    // Create animated gradient
    float time = uTime * 0.5;
    
    // Multiple gradient layers for more interesting effect
    vec3 color1 = vec3(0.5 + 0.5 * sin(time), 0.3 + 0.3 * cos(time * 0.7), 0.8);
    vec3 color2 = vec3(0.8, 0.4 + 0.4 * sin(time * 0.5), 0.5 + 0.5 * cos(time));
    vec3 color3 = vec3(0.3 + 0.3 * cos(time * 0.3), 0.6, 0.7 + 0.3 * sin(time * 0.8));
    
    // Animated gradient position
    float gradient1 = uv.y + 0.3 * sin(uv.x * 3.0 + time);
    float gradient2 = uv.x + 0.2 * cos(uv.y * 2.0 + time * 1.5);
    
    // Mix colors
    vec3 color = mix(color1, color2, gradient1);
    color = mix(color, color3, gradient2 * 0.5);
    
    // Add some subtle noise/variation
    float noise = sin(uv.x * 10.0 + time) * cos(uv.y * 10.0 + time) * 0.05;
    color += noise;
    
    finalColor = vec4(color, 1.0);
}
