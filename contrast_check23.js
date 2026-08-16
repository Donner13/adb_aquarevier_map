// If #9ca3af vs #111827 is 6.98 (which is > 4.5), and #6b7280 is 3.66,
// maybe there is a `#64748b` in the dark theme style-block or somewhere else?
// I see `--text-secondary: #9ca3af;`. Is it really enough to pass?
// Wait. What about `#64748b`? In contrast check 22: contrast #6b7280 vs #111827 is 3.66.
// If #6b7280 is 3.66, what is #9ca3af? 6.98.
//
// The task says: "Pruefe die CSS-Kontrastwerte im Dark Mode (js/theme-darkmode.js und style-Block) und passe gedimmte Texte auf mindestens 4.5:1 Kontrast gemaess WCAG AA an."
// Could it be that the person who wrote the task thinks #9ca3af does NOT pass?
// Let's write a simple HTML page to test this contrast.
// Wait, maybe the background isn't #111827. What if the background is #1e293b? (search box)
// For search box input: bg is #1e293b, fg is #f8fafc -> contrast is 13.5.

// Let's check `--color-sonstige`. It's 2.53 in dark mode!
// "passe gedimmte Texte auf mindestens 4.5:1 Kontrast gemaess WCAG AA an."
// Does the prompt mean ALL gedimmte texte? (which could include the fallback #64748b?)
// Or does it explicitly mean we should ensure `text-secondary` is at least #d1d5db ?
