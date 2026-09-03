const chroma = require('chroma-js');

// Okabe-Ito is what was used partially
// Original Okabe-Ito palette (colorblind friendly):
// Black: #000000
// Orange: #E69F00
// Sky Blue: #56B4E9
// Bluish Green: #009E73
// Yellow: #F0E442
// Blue: #0072B2
// Vermillion: #D55E00
// Reddish Purple: #CC79A7

// Let's adjust them slightly to hit 4.5 contrast in light mode where needed, or 3.0 for interactive/large text.
// The problem asks for >= 4.5 for text, >= 3.0 for interactive elements.
// In AquaRevier, these group colors are primarily used for map markers (interactive/icons, needs 3:1) and legend text (needs 4.5:1).
// To be safe, let's see if we can get them to 4.5 for text-to-background against white AND 4.5 against dark (#111827).
// That's notoriously difficult. Often they are used as background with white text, or just dots.
// Let's look at how they are used.
