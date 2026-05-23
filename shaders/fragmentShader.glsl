uniform sampler2D uTexture;
uniform float uImageRatio;
uniform float uPlaneRatio;
varying vec2 vUv;

void main() {
    vec2 uv = vUv;
    float planeAspect = uPlaneRatio;
    float imageAspect = uImageRatio;


    // if (planeAspect > imageAspect) {

    //     float scale = planeAspect / imageAspect;

    //     uv.x = uv.x * scale - (scale - 1.0) * 0.5;

    // } else {

    //     float scale = imageAspect / planeAspect;

    //     uv.y = uv.y * scale - (scale - 1.0) * 0.5;
    // }



    if (planeAspect > imageAspect) {
        float scale = imageAspect / planeAspect;
        uv.y = uv.y * scale + (1.0 - scale) * 0.5;
    } else {
        float scale = planeAspect / imageAspect;
        uv.x = uv.x * scale + (1.0 - scale) * 0.5;
    }

    vec4 color = texture2D(uTexture, vUv);

    // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    gl_FragColor = color;
}