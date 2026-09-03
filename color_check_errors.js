const chroma = require('chroma-js');

// Error, Success, Warning colors found in the codebase
const errorRed = "#ef4444";
const successGreen = "#10b981"; // Typical tailwind green, maybe used
const warningYellow = "#f59e0b"; // Typical tailwind yellow, maybe used
const warningOrange = "#f97316"; // Typical tailwind orange
const dangerRed = "#dc2626"; // From aqua-toast-error

const bgSurfaceLight = "#ffffff";
const bgSurfaceDark = "#111827";

console.log("=== ERROR/WARNING/SUCCESS LIGHT MODE ===");
console.log("Error Red vs Surface:", chroma.contrast(errorRed, bgSurfaceLight));
console.log("Danger Red vs Surface:", chroma.contrast(dangerRed, bgSurfaceLight));

console.log("\n=== ERROR/WARNING/SUCCESS DARK MODE ===");
console.log("Error Red vs Surface:", chroma.contrast(errorRed, bgSurfaceDark));
console.log("Danger Red vs Surface:", chroma.contrast(dangerRed, bgSurfaceDark));
