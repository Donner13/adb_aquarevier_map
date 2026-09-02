/**
 * js/aquarevier-assistant-v3.js
 * Isolated Intelligent Assistant Module V3
 * Handles natural language processing via API or hardened local fallback.
 * Node-compatible and Browser-safe.
 */

const root = typeof window !== 'undefined' ? window : globalThis;

class AquaRevierAssistantV3 {
    constructor() {
        this.apiUrl = '/api/assistant';
        this.history = [];
        this.maxHistoryItems = 10;
        this.MUNICIPALITIES = {
            'aachen': [50.775, 6.083],
            'eschweiler': [50.817, 6.266],
            'düren': [50.803, 6.483],
            'jülich': [50.922, 6.358],
            'heinsberg': [51.066, 6.098],
            'erkelenz': [51.080, 6.313],
            'hückelhoven': [51.050, 6.216],
            'stolberg': [50.770, 6.230],
            'alsdorf': [50.884, 6.162],
            'herzogenrath': [50.867, 6.100],
            'baesweiler': [50.908, 6.183],
            'langerwehe': [50.816, 6.350],
            'nideggen': [50.683, 6.483],
            'monschau': [50.555, 6.241],
            'simmerath': [50.612, 6.301],
            'roetgen': [50.648, 6.198],
            'rurberg': [50.607, 6.381],
            'euskirchen': [50.660, 6.783]
        };

        this.RIVERS = {
            'rur': [50.8, 6.4],
            'inde': [50.85, 6.3],
            'wurm': [50.9, 6.1],
            'erft': [50.9, 6.6]
        };

        this.TOPICS = {
            'kläranlage': {
                synonyms: ['kläranlagen', 'abwasser', 'reinigungsanlage', 'ka', 'klären'],
                layer: '🌀 Kläranlagen (ELWAS)',
                storeKey: 'klaeranlagen'
            },
            'pegel': {
                synonyms: ['wasserstand', 'pegelstation', 'flusspegel', 'stand'],
                layer: '📏 Pegel (ELWAS)',
                storeKey: 'pegel'
            },
            'grundwasser': {
                synonyms: ['gwm', 'messstelle', 'wiederanstieg', 'sümpfung'],
                layer: '💧 Grundwassermessstellen (ELWAS, 3700+)',
                storeKey: 'grundwassermessstellen'
            },
            'risiko': {
                synonyms: ['gefahr', 'risikoklasse', 'einstufung', 'einleiter', 'relevanzklasse', 'relevanz'],
                layer: 'btn-toggle-einleiter',
                storeKey: 'elwas_einleiter'
            },
            'akteur': {
                synonyms: ['partner', 'institution', 'organisation', 'beteiligte'],
                layer: 'akteure',
                storeKey: 'akteure'
            }
        };

        this.FAQ = [
            {
                keywords: ['rot', 'warnung', 'farbe', 'pegel'],
                text: 'Pegel werden rot markiert, wenn der aktuelle Durchfluss den mittleren Niedrigwasserwert (MNQ) erreicht oder unterschreitet (Niedrigwasser-Status: Kritisch).',
                source: 'Fachlogik basierend auf LANUV-Definitionen'
            },
            {
                keywords: ['rot', 'farbe', 'einleiter', 'industrieeinleiter'],
                text: 'Bei Industrieeinleitern kennzeichnet die Farbe Rot die projektinterne Relevanzklasse "Hoch" (basierend auf Direkteinleitung oder großen Mengen).',
                source: 'AquaRevier Fachmethodik'
            },
            {
                keywords: ['ausblenden', 'verbergen', 'ausschalten', 'weg'],
                text: 'Sie können Layer über die linke Seitenleiste im Bereich "Fachdaten & Layer" deaktivieren, indem Sie den entsprechenden Button erneut anklicken.',
                source: 'Bedienungshilfe'
            },
            {
                keywords: ['basis', 'modell', 'zeitraffer', 'grundwasser'],
                text: 'Der Grundwasser-Zeitraffer basiert auf historischen LANUV-Daten und einem interpolierten Trendmodell für den Wiederanstieg nach Ende der Tagebausümpfung.',
                source: 'Grundwasser-Modell AquaRevier'
            }
        ];
    }

    /**
     * Main entry point for a question.
     * @param {string} question
     * @returns {Promise<Object>} Response with answer, source and suggestedAction.
     */
    async ask(question, options = {}) {
        if (!question || typeof question !== 'string' || question.trim().length === 0) {
            return { answer: "Bitte stellen Sie eine Frage.", source: "System", suggestedAction: { type: 'none' }, mode: 'local' };
        }
        const cleanQuestion = question.trim().slice(0, 2000);
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: cleanQuestion,
                    history: this.history.slice(-this.maxHistoryItems),
                    mapContext: options.mapContext || {},
                })
            });
            if (response.ok) {
                const result = await response.json();
                if (result && typeof result.answer === 'string' && result.answer.trim()) {
                    this.remember(cleanQuestion, result.answer);
                    return result;
                }
            }
        } catch (_) {
            // Network and provider failures deliberately continue in local mode.
        }
        const fallback = { ...this.localFallback(cleanQuestion), mode: 'local' };
        this.remember(cleanQuestion, fallback.answer);
        return fallback;
    }

    remember(question, answer) {
        this.history.push({ role: 'user', content: question }, { role: 'assistant', content: answer });
        if (this.history.length > this.maxHistoryItems) this.history = this.history.slice(-this.maxHistoryItems);
    }

    clearHistory() {
        this.history = [];
    }

    getLevenshteinDistance(a, b) {
        if (!a || !b) return Math.max((a || "").length, (b || "").length);
        const m = a.length;
        const n = b.length;
        const matrix = [];
        for (let i = 0; i <= m; i++) { matrix[i] = [i]; }
        for (let j = 0; j <= n; j++) { matrix[0][j] = j; }
        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                if (a[i - 1] === b[j - 1]) { matrix[i][j] = matrix[i - 1][j - 1]; }
                else { matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1); }
            }
        }
        return matrix[m][n];
    }

    findBestMatch(tokens, list, threshold = 2) {
        let bestItem = null;
        let minDistance = threshold + 1;

        const items = Array.isArray(list) ? list : Object.keys(list);

        for (const item of items) {
            for (const token of tokens) {
                if (token.length < 3) continue;
                const dist = this.getLevenshteinDistance(token, item);
                if (dist <= threshold && dist < minDistance) {
                    minDistance = dist;
                    bestItem = item;
                }
            }
        }
        return bestItem;
    }

    /**
     * Robust local rule-based logic for offline use or missing API key.
     */
    localFallback(question, reason = "") {
        const q = question.toLowerCase().trim();
        const tokens = q.split(/[ \?\.\!\,]+/);

        // 1. Check FAQ first
        for (const item of this.FAQ) {
            const matchCount = item.keywords.filter(kw => {
                return tokens.some(t => t.length >= 3 && this.getLevenshteinDistance(t, kw) <= 1);
            }).length;
            if (matchCount >= 2) {
                return {
                    answer: (reason ? reason + " " : "") + item.text,
                    source: item.source,
                    suggestedAction: { type: "none" }
                };
            }
        }

        let location = this.findBestMatch(tokens, this.MUNICIPALITIES, 2);
        let river = this.findBestMatch(tokens, this.RIVERS, 1);
        let topic = null;

        for (const [key, data] of Object.entries(this.TOPICS)) {
            if (this.findBestMatch(tokens, [key, ...data.synonyms], 2)) {
                topic = key;
                break;
            }
        }

        // Colour terminology is a domain question, not a fuzzy topic search
        // ("was" could otherwise match the short synonym "ka").
        if (q.includes('rot')) topic = null;

        let answer = "";
        let source = "Lokale Logik";
        let action = { type: "none" };

        if (topic) {
            const targetName = location || river;
            const locDisplay = targetName
                ? targetName.charAt(0).toUpperCase() + targetName.slice(1)
                : 'dem Rheinischen Revier';
            const topicDisplay = topic === 'kläranlage' ? 'Kläranlagen' : (topic.charAt(0).toUpperCase() + topic.slice(1));

            answer = `Ich habe Informationen zu ${topicDisplay} in/an ${locDisplay} für Sie gefunden.`;

            // Check if we have real data to back this up
            if (typeof window !== 'undefined' && window.layerDataStore && this.TOPICS[topic].storeKey) {
                const data = window.layerDataStore[this.TOPICS[topic].storeKey];
                if (data && data.features) {
                    answer += ` Auf der Karte sind aktuell ${data.features.length} Standorte für diese Ebene geladen.`;
                }
            }

            const hideLayer = /(?:blende|schalte|layer).*(?:aus|deaktiv)|(?:aus|deaktiv).*(?:blende|schalte|layer)/.test(q);
            action = hideLayer ? {
                type: 'toggle_layer',
                layer: this.TOPICS[topic].layer,
                visible: false
            } : {
                type: 'zoom_and_activate',
                location: location,
                river: river,
                topic: topic
            };
        } else if (q.includes('risiko') || q.includes('relevanz') || q.includes('rot')) {
            answer = "Projektinterne Relevanzklassen basieren auf der Abwasserverordnung (AbwV), der Einleitungsart und der Menge. 'Hoch' (rot) bedeutet Direkteinleitung oder große Mengen (> 50.000 m³/a).";
            source = "AquaRevier Fachmethodik";
            action = { type: 'activateLayer', name: 'btn-toggle-einleiter' };
        } else {
            answer = "Dazu liegen mir aktuell keine spezifischen Fachdaten vor. Ich kann Ihnen Informationen zu Kläranlagen, Pegeln, Akteuren oder der Relevanzklasse von Industrieeinleitern im Rheinischen Revier geben.";
            source = "System-Hinweis";
        }

        if (reason && !answer.includes(reason)) {
            answer = `${reason} ${answer}`;
        }

        return {
            answer: answer,
            source: source,
            suggestedAction: action
        };
    }
}

root.AquaRevierAssistantV3 = AquaRevierAssistantV3;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AquaRevierAssistantV3 };
}
