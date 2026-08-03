// Perf Task 12: WebGL Context Fallback Guard
function createWebGLGuard() {
    let supportsWebGL = false;
    try {
        const canvas = document.createElement('canvas');
        supportsWebGL = !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
        console.warn("WebGL support check failed.", e);
    }
    return supportsWebGL;
}
window.AQUAREVIER_WEBGL_SUPPORTED = createWebGLGuard();
