1. **Fix Dark Mode Text**: Ensure dark mode text passes 4.5 contrast
2. **Fix Warning/Error/Success**: Ensure they pass 3.0 contrast for large or interactive, ideally 4.5 for text. `#ef4444` needs to be darker on light mode, lighter on dark mode.
3. **Fix Group Colors**: The group colors (Okabe-Ito based) fall short of 3.0 for interactive, and definitely fall short of 4.5 for text. We should provide accessible variants for them (e.g., text vs background variants) or adjust the hex values slightly.
4. **High Contrast Mode**: Add `@media (forced-colors: active)` support to `index.html` and `internal.html` CSS.
5. **Color not the sole indicator**: Check where color might be the only indicator and add text/icons. We probably need to state this in our report and ensure forms/badges have proper indicators.
