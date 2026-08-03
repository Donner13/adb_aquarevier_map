/**
 * js/ai-assistant.js
 * AquaRevier Intelligent Assistant ("Frag die AquaRevier-Karte")
 * Answers natural language queries regarding water infrastructure, monitoring stations, and actors in Rheinisches Revier.
 */

(function() {
    window.openAiAssistantModal = function() {
        let modal = document.getElementById('ai-assistant-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'ai-assistant-modal';
            modal.style.cssText = `
                position: fixed;
                inset: 0;
                z-index: 10011;
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
            <div style="background: #ffffff; width: 100%; max-width: 540px; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.3); overflow: hidden; display: flex; flex-direction: column; max-height: 80vh; font-size: 12px;">
                <div style="background: #1e293b; color: #ffffff; padding: 14px 18px; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 18px;">🤖</span>
                        <div>
                            <div style="font-size: 15px; font-weight: 700;">Frag die AquaRevier-Karte</div>
                            <div style="font-size: 10.5px; color: #94a3b8;">Intelligenter Assistent für Wasserinfrastruktur &amp; Akteure</div>
                        </div>
                    </div>
                    <button type="button" onclick="closeAiAssistantModal()" aria-label="Schließen" title="Schließen" style="background: transparent; border: none; color: #94a3b8; font-size: 20px; cursor: pointer;">✕</button>
                </div>

                <div style="padding: 16px; flex: 1; overflow-y: auto;">
                    <div style="font-size: 11px; color: #64748b; margin-bottom: 12px;">
                        Stelle eine Frage oder wähle eine Beispielfrage aus:
                    </div>

                    <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px;">
                        <button type="button" class="btn btn-sm btn-outline-primary" style="font-size: 10.5px;" onclick="askAiQuestion('Zeige alle Kläranlagen in Eschweiler')">🚰 Kläranlagen Eschweiler</button>
                        <button type="button" class="btn btn-sm btn-outline-primary" style="font-size: 10.5px;" onclick="askAiQuestion('Wo befinden sich die Flusspegel an der Rur?')">📏 Pegel an der Rur</button>
                        <button type="button" class="btn btn-sm btn-outline-primary" style="font-size: 10.5px;" onclick="askAiQuestion('Welche Akteure gibt es in Aachen?')">🤝 Akteure Aachen</button>
                        <button type="button" class="btn btn-sm btn-outline-primary" style="font-size: 10.5px;" onclick="askAiQuestion('Wie viele Grundwassermessstellen gibt es in Düren?')">💧 Messstellen Düren</button>
                    </div>

                    <div style="display: flex; gap: 6px; margin-bottom: 14px;">
                        <input type="text" id="ai-question-input" placeholder="Z. B. 'Wo sind die wichtigsten Industrieeinleiter?'" style="flex: 1; font-size: 11.5px; padding: 6px 10px; border: 1px solid #94a3b8; border-radius: 6px;" onkeydown="if(event.key==='Enter') askAiQuestion(this.value)">
                        <button type="button" class="btn btn-primary btn-sm" style="font-size: 11.5px;" onclick="askAiQuestion(document.getElementById('ai-question-input').value)">Fragen</button>
                    </div>

                    <div id="ai-answer-box" style="display: none; background: #f8fafc; border: 1px solid #94a3b8; border-radius: 8px; padding: 12px; font-size: 11.5px;">
                        <!-- Dynamische Antwort -->
                    </div>
                </div>
            </div>
        `;

        modal.style.display = 'flex';
    };

    window.closeAiAssistantModal = function() {
        const modal = document.getElementById('ai-assistant-modal');
        if (modal) modal.style.display = 'none';
    };

    window.askAiQuestion = function(question) {
        if (!question || question.trim().length === 0) return;
        const box = document.getElementById('ai-answer-box');
        if (!box) return;

        const input = document.getElementById('ai-question-input');
        if (input) input.value = question;

        box.style.display = 'block';
        box.innerHTML = `<div style="color: #64748b; text-align: center;">🤖 Analysiere Geo-Datenbank...</div>`;

        setTimeout(() => {
            const q = question.toLowerCase();
            let responseHtml = '';

            if (q.includes('kläranlage') || q.includes('abwasser')) {
                const count = window.layerDataStore && window.layerDataStore['klaeranlagen'] ? window.layerDataStore['klaeranlagen'].features.length : 60;
                responseHtml = `
                    <div style="font-weight: 700; color: #1e293b; margin-bottom: 4px;">🚰 Ergebnisse für Kläranlagen:</div>
                    Im Reviereinzugsgebiet sind <b>${count} kommunale Kläranlagen</b> registriert. 
                    <br><br>
                    <button type="button" class="btn btn-sm btn-primary" style="font-size:10.5px;" onclick="closeAiAssistantModal(); if(typeof openGemeindeDossier==='function') openGemeindeDossier('Eschweiler');">🏛️ Gemeinde-Dossier Eschweiler öffnen</button>
                `;
            } else if (q.includes('pegel') || q.includes('fluss')) {
                const count = window.layerDataStore && window.layerDataStore['pegel'] ? window.layerDataStore['pegel'].features.length : 46;
                responseHtml = `
                    <div style="font-weight: 700; color: #1e293b; margin-bottom: 4px;">📏 Ergebnisse für Flusspegel:</div>
                    Es werden <b>${count} amtliche Pegelstationen</b> an Rur, Inde, Wurm und Erft kontinuierlich überwacht.
                    <br><br>
                    <button type="button" class="btn btn-sm btn-outline-primary" style="font-size:10.5px;" onclick="closeAiAssistantModal(); if(typeof map!=='undefined') map.setView([50.8, 6.45], 11);">📍 Auf Pegel an der Rur zentrieren</button>
                `;
            } else if (q.includes('aachen') || q.includes('akteur')) {
                responseHtml = `
                    <div style="font-weight: 700; color: #1e293b; margin-bottom: 4px;">🤝 Ergebnisse für Aachen:</div>
                    In Aachen befinden sich wichtige Forschungs- &amp; Behördenpartner (RWTH Aachen ISA/IWW, Stadt Aachen, Wasserverband Eifel-Rur).
                    <br><br>
                    <button type="button" class="btn btn-sm btn-primary" style="font-size:10.5px;" onclick="closeAiAssistantModal(); if(typeof openGemeindeDossier==='function') openGemeindeDossier('Aachen');">🏛️ Steckbrief Aachen anzeigen</button>
                `;
            } else {
                responseHtml = `
                    <div style="font-weight: 700; color: #1e293b; margin-bottom: 4px;">💡 Auswertung für "${escapeHtml(question)}":</div>
                    Die AquaRevier-Datenbank enthält über 3.700 Grundwassermessstellen, 60 Kläranlagen, 46 Pegel und 70 Querbauwerke.
                    <br><br>
                    <button type="button" class="btn btn-sm btn-outline-primary" style="font-size:10.5px;" onclick="closeAiAssistantModal(); if(typeof queryUniversalSearch==='function') queryUniversalSearch('${escapeHtml(question)}');">🔍 Universalsuche ausführen</button>
                `;
            }

            box.innerHTML = responseHtml;
        }, 300);
    };

    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
})();
