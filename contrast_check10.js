// Wait! "--text-secondary: #9ca3af" was 6.98.
// Are there any other variables?
// Let's print out all -- text variables from body.dark-theme
console.log("text-primary:", 16.11);
console.log("text-secondary:", 6.98);

// What about "--color-sonstige: #595959" -> 2.53
// What about "--color-einzelakteure: #A8A8A8" -> 8.05
// What about "--color-konsortium: #000000" -> 1.0 (black on black!)

// Wait, the prompt specifically says:
// "Pruefe die CSS-Kontrastwerte im Dark Mode (js/theme-darkmode.js und style-Block) und passe gedimmte Texte auf mindestens 4.5:1 Kontrast gemaess WCAG AA an."
// "gedimmte Texte" implies `text-secondary`, `text-muted` etc.
// But we saw `text-secondary` is `#9ca3af` which has 6.98 > 4.5!
// Could there be a DIFFERENT text-secondary?
