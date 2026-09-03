/**
 * js/ai-assistant.js
 * Integration of AquaRevier Assistant V3 into the Map UI.
 * Handles Modal creation, chat history, and map interactions.
 * Aligned with ai-assistant-v3.spec.js
 */

(function() {
    let assistant = null;

    window.openAiAssistantModal = function() {
        if (!assistant && typeof AquaRevierAssistantV3 !== 'undefined') {
            assistant = new AquaRevierAssistantV3();
            window.AQUAREVIER_ASSISTANT_INSTANCE = assistant; // Expose for audit/testing
        }

        if (!assistant) {
            console.error("AI Assistant logic not loaded.");
            return;
        }

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
                display: none;
                align-items: center;
                justify-content: center;
                padding: 15px;
            `;
            document.body.appendChild(modal);
        }

        if (modal.style.display === 'flex') {
            window.closeAiAssistantModal();
            return;
        }

        modal.innerHTML = `
            <div style="background: var(--bg-surface, #ffffff); width: 100%; max-width: 500px; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.3); overflow: hidden; display: flex; flex-direction: column; max-height: 85vh; font-size: 0.8125rem; border: 1px solid var(--border-color, #cbd5e1);">
                <div style="background: var(--accent-primary, #2563eb); color: #ffffff; padding: 14px 18px; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1.25rem;">🤖</span>
                        <div>
                            <div style="font-size: 0.9375rem; font-weight: 700;">AquaRevier Fachassistent V3</div>
                            <div id="ai-status-text" style="font-size: 0.625rem; opacity: 0.85;">Hybrid-Modus · sichere lokale Reserve</div>
                        </div>
                    </div>
                    <button type="button" onclick="closeAiAssistantModal()" aria-label="Schließen" style="background: transparent; border: none; color: #ffffff; font-size: 1.375rem; cursor: pointer; opacity: 0.8;">✕</button>
                </div>

                <div id="ai-chat-history" style="padding: 16px; flex: 1; overflow-y: auto; display: flex; flex-direction: column; background: var(--bg-base, #f8fafc);">
                    <div class="ai-msg-bot" style="align-self: flex-start; background: #f1f5f9; color: #1e293b; padding: 10px 14px; border-radius: 12px; border-bottom-left-radius: 2px; max-width: 90%; line-height: 1.4; margin-bottom: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                        Willkommen! Ich bin Ihr intelligenter Begleiter für das Rheinische Revier.
                        Fragen Sie mich nach Kläranlagen, Pegeln, Akteuren oder Fachbegriffen.
                    </div>
                </div>

                <div style="padding: 12px 16px; background: var(--bg-surface, #ffffff); border-top: 1px solid var(--border-color, #e2e8f0);">
                    <div id="ai-suggestions" style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 8px; scrollbar-width: none;">
                        <button class="btn btn-sm btn-outline-primary" style="font-size: 0.625rem; white-space: nowrap; border-radius: 15px; padding: 4px 12px;" onclick="askAiQuestion('Wo sind die kläranlgaen bei eschweilr?')">🏭 Kläranlagen</button>
                        <button class="btn btn-sm btn-outline-primary" style="font-size: 0.625rem; white-space: nowrap; border-radius: 15px; padding: 4px 12px;" onclick="askAiQuestion('Gibt es Abwasseranlagen an der Rur?')">🌊 Abwasser Rur</button>
                        <button class="btn btn-sm btn-outline-primary" style="font-size: 0.625rem; white-space: nowrap; border-radius: 15px; padding: 4px 12px;" onclick="askAiQuestion('Warum ist der Pegel rot?')">🔴 Warum rot?</button>
                        <button class="btn btn-sm btn-outline-primary" style="font-size: 0.625rem; white-space: nowrap; border-radius: 15px; padding: 4px 12px;" onclick="askAiQuestion('Wie blende ich Kläranlagen aus?')">❓ Hilfe</button>
                    </div>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <input type="text" id="ai-v3-input" placeholder="Fachfrage stellen..." autocomplete="off" style="flex: 1; font-size: 0.8125rem; padding: 10px 16px; border: 1px solid var(--border-color, #cbd5e1); border-radius: 24px; outline: none; background: var(--bg-base, #fff); color: var(--text-primary);" onkeydown="if(event.key==='Enter') askAiQuestion(this.value)">
                        <button type="button" class="btn btn-primary" style="width: 40px; height: 40px; border-radius: 50%; padding: 0; display: flex; align-items: center; justify-content: center; font-size: 1.0rem; transition: transform 0.2s;" onclick="askAiQuestion(document.getElementById('ai-v3-input').value)" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">➔</button>
                    </div>
                </div>
            </div>
        `;

        modal.style.display = 'flex';
        document.getElementById('ai-v3-input').focus();
    };

    window.closeAiAssistantModal = function() {
        const modal = document.getElementById('ai-assistant-modal');
        if (modal) modal.style.display = 'none';
    };

    window.askAiQuestion = function(question) {
        if (!question || question.trim().length === 0) return;
        if (!assistant) assistant = new AquaRevierAssistantV3();

        const chatHistory = document.getElementById('ai-chat-history');
        const input = document.getElementById('ai-v3-input');
        if (input) input.value = '';

        // User message
        appendAiMessage(chatHistory, question, 'user');

        // Typing indicator
        const typingId = 'ai-typing-' + Date.now();
        const typingDiv = document.createElement('div');
        typingDiv.id = typingId;
        typingDiv.style.cssText = 'align-self: flex-start; background: #f1f5f9; color: #64748b; padding: 8px 14px; border-radius: 12px; border-bottom-left-radius: 2px; font-style: italic; font-size: 0.75rem; margin-bottom: 12px;';
        typingDiv.innerText = '🤖 Analysiere...';
        chatHistory.appendChild(typingDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;

        setTimeout(async () => {
            const result = await assistant.ask(question, { mapContext: getCurrentMapContext() });
            const typing = document.getElementById(typingId);
            if (typing) typing.remove();

            const status = document.getElementById('ai-status-text');
            if (status) status.textContent = result.mode === 'hybrid'
                ? 'Online-KI · AquaRevier-Wissen aktiv'
                : 'Lokaler Sicherheitsmodus';

            appendAiMessage(chatHistory, result.answer || result.text, 'bot', {
                source: result.source,
                action: result.suggestedAction || (result.proposedActions ? result.proposedActions[0] : null)
            });
        }, 600);
    };

    function getCurrentMapContext() {
        const context = { activeLayers: [] };
        try {
            if (window.map) {
                const center = window.map.getCenter && window.map.getCenter();
                if (center) context.center = [Number(center.lat.toFixed(5)), Number(center.lng.toFixed(5))];
                if (window.map.getZoom) context.zoom = window.map.getZoom();
                if (window.overlayMaps) {
                    context.activeLayers = Object.entries(window.overlayMaps)
                        .filter(([, layer]) => layer && window.map.hasLayer(layer))
                        .map(([name]) => name)
                        .slice(0, 30);
                }
            }
        } catch (_) {
            // Map context is helpful, never required for answering.
        }
        return context;
    }

    function appendAiMessage(container, text, role, meta = null) {
        if (!container) return;
        const div = document.createElement('div');
        const isBot = role === 'bot';
        div.className = isBot ? 'ai-msg-bot' : 'ai-msg-user';
        div.style.cssText = `
            align-self: ${isBot ? 'flex-start' : 'flex-end'};
            background: ${isBot ? '#f1f5f9' : 'var(--accent-primary, #2563eb)'};
            color: ${isBot ? '#1e293b' : '#ffffff'};
            padding: 10px 14px;
            border-radius: 12px;
            ${isBot ? 'border-bottom-left-radius: 2px;' : 'border-bottom-right-radius: 2px;'}
            max-width: 90%;
            line-height: 1.5;
            margin-bottom: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            position: relative;
            animation: aiMsgFade 0.3s ease-out;
        `;

        if (!document.getElementById('ai-msg-styles')) {
            const style = document.createElement('style');
            style.id = 'ai-msg-styles';
            style.innerHTML = '@keyframes aiMsgFade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }';
            document.head.appendChild(style);
        }

        let html = text;
        if (meta) {
            html += `<div style="margin-top: 8px; padding-top: 6px; border-top: 1px dashed rgba(0,0,0,0.1); font-size: 0.625rem; color: #64748b;">`;
            if (meta.source) html += `<div><b>Quelle:</b> ${meta.source}</div>`;

            if (meta.action && meta.action.type !== 'none') {
                const actionId = 'ai-act-' + Math.random().toString(36).substr(2, 9);
                const label = getActionLabel(meta.action);
                html += `<button id="${actionId}" class="btn btn-xs btn-primary" style="margin-top: 6px; font-size: 0.5625rem; padding: 2px 8px; border-radius: 4px; display: block; background: #2563eb; color: #fff; border: none; cursor: pointer;">📍 Aktion: ${label}</button>`;

                setTimeout(() => {
                    const btn = document.getElementById(actionId);
                    if (btn) btn.onclick = () => {
                        executeAiAction(meta.action);
                        if (typeof window.showToast === 'function') window.showToast("Karte aktualisiert: " + label, "🤖");
                    };
                }, 0);
            }
            html += `</div>`;
        }

        div.innerHTML = html;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    }

    function getActionLabel(action) {
        if (action.type === 'activateLayer') return `Layer aktivieren`;
        if (action.type === 'zoomTo') return `Zoom zu Treffer`;
        if (action.type === 'zoom_and_activate') {
            const parts = [];
            if (action.location) parts.push(action.location.charAt(0).toUpperCase() + action.location.slice(1));
            if (action.river) parts.push(action.river.charAt(0).toUpperCase() + action.river.slice(1));
            const locText = parts.length > 0 ? parts.join('/') : 'Treffer';
            return `Zoom zu ${locText}`;
        }
        if (action.type === 'toggle_layer') return `Layer ${action.visible === false ? 'deaktivieren' : 'aktivieren'}`;
        if (action.type === 'search_map') return `Auf Karte suchen: ${action.query || ''}`;
        return "Anzeigen";
    }

    function executeAiAction(action) {
        try {
            if (!action) return;
            if (action.type === 'search_map' && action.query) {
                const searchInput = document.querySelector('#search-input, #searchInput, input[type="search"]');
                if (searchInput) {
                    searchInput.value = action.query;
                    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
            }
            if (action.type === 'activateLayer') {
                const btn = document.getElementById(action.name) || document.querySelector(`.filter-btn[data-layer-name="${action.name}"]`);
                if (btn && !btn.classList.contains('active')) btn.click();
            } else if (action.type === 'zoomTo') {
                if (window.map) window.map.flyTo([action.lat, action.lng], action.zoom || 13);
            } else if (action.type === 'zoom_and_activate') {
                const coords = (action.location && assistant.MUNICIPALITIES[action.location]) ||
                               (action.river && assistant.RIVERS[action.river]);
                if (coords && window.map) {
                    window.map.flyTo(coords, action.location ? 14 : 12);
                }
                if (action.topic && assistant.TOPICS[action.topic]) {
                    const layerName = assistant.TOPICS[action.topic].layer;
                    if (layerName) {
                        const layer = window.overlayMaps && window.overlayMaps[layerName];
                        if (layer && window.map && !window.map.hasLayer(layer)) window.map.addLayer(layer);
                        const btn = document.getElementById(layerName) || document.querySelector(`.filter-btn[data-layer-name="${layerName}"]`);
                        if (btn && !btn.classList.contains('active')) btn.classList.add('active');
                    }
                }
            } else if (action.type === 'toggle_layer' && action.layer && window.map && window.overlayMaps) {
                const exactName = Object.keys(window.overlayMaps).find(name => name === action.layer)
                    || Object.keys(window.overlayMaps).find(name => name.toLowerCase().includes(action.layer.toLowerCase()));
                const layer = exactName ? window.overlayMaps[exactName] : null;
                if (layer && action.visible === false && window.map.hasLayer(layer)) window.map.removeLayer(layer);
                if (layer && action.visible !== false && !window.map.hasLayer(layer)) window.map.addLayer(layer);
            }
        } catch (e) {
            console.error("AI action failed:", e);
        }
    }

    window.toggleAssistant = function() {
        if (typeof window.openAiAssistantModal === 'function') {
            window.openAiAssistantModal();
        }
    };
})();
