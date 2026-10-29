/**
 * Export style settings as JSON
 */
function exportStyleSettings() {
    if (typeof styleSettings === 'undefined') {
        console.error('styleSettings is not defined');
        alert('Stileinstellungen konnten nicht gefunden werden.');
        return;
    }

    const dataStr = JSON.stringify(styleSettings, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'style_settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Bind to button when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('btn-export-styles');
    if (btn) {
        btn.addEventListener('click', exportStyleSettings);
    }
});
