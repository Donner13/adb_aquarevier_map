/**
 * js/keyboard-shortcuts.js
 * AquaRevier Power-User Keyboard Shortcuts & Quick Hotkeys Palette
 * Enables key bindings (G, R, T, D, Q, ?) for rapid navigation across GIS modules.
 */

(function() {
    window.openShortcutsHelpModal = function() {
        let modal = document.getElementById('shortcuts-help-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'shortcuts-help-modal';
            modal.style.cssText = `
                position: fixed;
                inset: 0;
                z-index: 10013;
                background: rgba(0, 0, 0, 0.65);
                backdrop-filter: blur(5px);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 15px;
            `;
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div style="background: #ffffff; width: 100%; max-width: 440px; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.3); overflow: hidden; font-size: 12px;">
                <div style="background: #1e293b; color: #ffffff; padding: 14px 18px; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 15px; font-weight: 700;">⌨️ Tastatur-Shortcuts &amp; Hotkeys</span>
                    <button type="button" onclick="closeShortcutsHelpModal()" aria-label="Schließen" title="Schließen" style="background: transparent; border: none; color: #94a3b8; font-size: 20px; cursor: pointer;">✕</button>
                </div>

                <div style="padding: 18px;">
                    <div style="display: grid; grid-template-columns: 80px 1fr; gap: 8px; align-items: center; margin-bottom: 8px;">
                        <kbd style="background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px; padding: 3px 6px; text-align: center; font-weight: 700; color: #0f172a;">G</kbd>
                        <span>Gemeinde-Steckbrief öffnen</span>
                    </div>
                    <div style="display: grid; grid-template-columns: 80px 1fr; gap: 8px; align-items: center; margin-bottom: 8px;">
                        <kbd style="background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px; padding: 3px 6px; text-align: center; font-weight: 700; color: #0f172a;">R</kbd>
                        <span>Umkreis- &amp; Radius-Analyse umschalten</span>
                    </div>
                    <div style="display: grid; grid-template-columns: 80px 1fr; gap: 8px; align-items: center; margin-bottom: 8px;">
                        <kbd style="background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px; padding: 3px 6px; text-align: center; font-weight: 700; color: #0f172a;">T</kbd>
                        <span>Grundwasser-Zeitraffer abspielen / stoppen</span>
                    </div>
                    <div style="display: grid; grid-template-columns: 80px 1fr; gap: 8px; align-items: center; margin-bottom: 8px;">
                        <kbd style="background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px; padding: 3px 6px; text-align: center; font-weight: 700; color: #0f172a;">D</kbd>
                        <span>Dark Mode / Light Mode umschalten</span>
                    </div>
                    <div style="display: grid; grid-template-columns: 80px 1fr; gap: 8px; align-items: center; margin-bottom: 8px;">
                        <kbd style="background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px; padding: 3px 6px; text-align: center; font-weight: 700; color: #0f172a;">Q</kbd>
                        <span>QR-Code &amp; Deep-Link Teilen modal</span>
                    </div>
                    <div style="display: grid; grid-template-columns: 80px 1fr; gap: 8px; align-items: center; margin-bottom: 8px;">
                        <kbd style="background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px; padding: 3px 6px; text-align: center; font-weight: 700; color: #0f172a;">?</kbd>
                        <span>Diese Hilfe anzeigen</span>
                    </div>
                </div>
            </div>
        `;

        modal.style.display = 'flex';
    };

    window.closeShortcutsHelpModal = function() {
        const modal = document.getElementById('shortcuts-help-modal');
        if (modal) modal.style.display = 'none';
    };

    document.addEventListener('keydown', (e) => {
        // Ignore keydown if user is typing in an input or textarea
        const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        const isEditable = document.activeElement ? document.activeElement.isContentEditable : false;
        if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select' || isEditable) return;

        const key = e.key.toLowerCase();
        if (key === 'g' && typeof window.openGemeindeDossier === 'function') {
            e.preventDefault();
            window.openGemeindeDossier('Aachen');
        } else if (key === 'r' && typeof window.toggleRadiusAnalysis === 'function') {
            e.preventDefault();
            window.toggleRadiusAnalysis();
        } else if (key === 't' && typeof window.toggleTimeSeriesPlay === 'function') {
            e.preventDefault();
            window.toggleTimeSeriesPlay();
        } else if (key === 'd' && typeof window.toggleDarkMode === 'function') {
            e.preventDefault();
            window.toggleDarkMode();
        } else if (key === 'q' && typeof window.openQrShareModal === 'function') {
            e.preventDefault();
            window.openQrShareModal();
        } else if (key === '?') {
            e.preventDefault();
            window.openShortcutsHelpModal();
        }
    });
})();
