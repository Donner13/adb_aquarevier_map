function luminance(r, g, b) {
    let a = [r, g, b].map(function (v) {
        v /= 255;
        return v <= 0.03928
            ? v / 12.92
            : Math.pow( (v + 0.055) / 1.055, 2.4 );
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}
function hexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}
function contrast(hex1, hex2) {
    let rgb1 = hexToRgb(hex1);
    let rgb2 = hexToRgb(hex2);
    let l1 = luminance(rgb1.r, rgb1.g, rgb1.b) + 0.05;
    let l2 = luminance(rgb2.r, rgb2.g, rgb2.b) + 0.05;
    let ratio = l1 > l2 ? l1 / l2 : l2 / l1;
    console.log(hex1, hex2, ratio);
}
// Try to find a good text-secondary replacement or adjustment if we need to change --text-secondary
contrast('#d1d5db', '#0b0f19'); // current --text-secondary
contrast('#9ca3af', '#0b0f19'); // something darker than d1d5db? wait, task says "gedimmte Texte auf mindestens 4.5:1 Kontrast ... anpassen"
