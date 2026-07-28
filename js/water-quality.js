/**
 * js/water-quality.js
 * AquaRevier WFD Water Framework Directive (WRRL) & Ecological Quality Indicator
 * Displays river water quality ratings (ecological & chemical status) across Rur, Inde, Wurm, and Erft.
 */

(function() {
    window.wrrlQualityData = {
        'Rur': { ecoStatus: 'Mäßig (Klasse 3)', chemStatus: 'Gut', fishPassability: 'Teilweise durchgängig', trend: '📈 ansteigend' },
        'Inde': { ecoStatus: 'Gut (Klasse 2)', chemStatus: 'Gut', fishPassability: 'Durchgängig saniert', trend: '📈 stabil' },
        'Wurm': { ecoStatus: 'Unbefriedigend (Klasse 4)', chemStatus: 'Nicht gut (Nitrat/Zink)', fishPassability: 'Stark verbaut', trend: '🔄 in Sanierung' },
        'Erft': { ecoStatus: 'Mäßig (Klasse 3)', chemStatus: 'Gut', fishPassability: 'Umgestaltung im Gange', trend: '📈 ansteigend' }
    };

    window.openWrrlQualityModal = function(riverName) {
        const name = riverName || 'Rur';
        const data = window.wrrlQualityData[name] || window.wrrlQualityData['Rur'];

        let modal = document.getElementById('wrrl-quality-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'wrrl-quality-modal';
            modal.style.cssText = `
                position: fixed;
                inset: 0;
                z-index: 10012;
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
            <div style="background: #ffffff; width: 100%; max-width: 480px; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.3); overflow: hidden; font-size: 12px;">
                <div style="background: #0284c7; color: #ffffff; padding: 14px 18px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-size: 15px; font-weight: 700;">🐟 WRRL-Gewässergüte: ${escapeHtml(name)}</div>
                        <div style="font-size: 10.5px; opacity: 0.9;">Wasserrahmenrichtlinie (WRRL NRW) Statusbewertung</div>
                    </div>
                    <button type="button" onclick="closeWrrlQualityModal()" aria-label="Schließen" title="Schließen" style="background: transparent; border: none; color: #ffffff; font-size: 20px; cursor: pointer;">✕</button>
                </div>

                <div style="padding: 18px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px;">
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px;">
                            <div style="font-size: 10px; color: #64748b;">Ökologischer Zustand</div>
                            <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 2px;">${escapeHtml(data.ecoStatus)}</div>
                        </div>
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px;">
                            <div style="font-size: 10px; color: #64748b;">Chemischer Zustand</div>
                            <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 2px;">${escapeHtml(data.chemStatus)}</div>
                        </div>
                    </div>

                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; margin-bottom: 14px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                            <span style="font-size: 10.5px; color: #64748b;">Durchgängigkeit für Fische:</span>
                            <span style="font-weight: 600; color: #0284c7;">${escapeHtml(data.fishPassability)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 10.5px; color: #64748b;">Entwicklungstrend:</span>
                            <span style="font-weight: 600; color: #16a34a;">${escapeHtml(data.trend)}</span>
                        </div>
                    </div>

                    <div style="display: flex; gap: 6px;">
                        <button type="button" class="btn btn-sm btn-outline-secondary" style="flex:1; font-size:10.5px;" onclick="openWrrlQualityModal('Rur')">Rur</button>
                        <button type="button" class="btn btn-sm btn-outline-secondary" style="flex:1; font-size:10.5px;" onclick="openWrrlQualityModal('Inde')">Inde</button>
                        <button type="button" class="btn btn-sm btn-outline-secondary" style="flex:1; font-size:10.5px;" onclick="openWrrlQualityModal('Wurm')">Wurm</button>
                        <button type="button" class="btn btn-sm btn-outline-secondary" style="flex:1; font-size:10.5px;" onclick="openWrrlQualityModal('Erft')">Erft</button>
                    </div>
                </div>
            </div>
        `;

        modal.style.display = 'flex';
    };

    window.closeWrrlQualityModal = function() {
        const modal = document.getElementById('wrrl-quality-modal');
        if (modal) modal.style.display = 'none';
    };

    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
})();
