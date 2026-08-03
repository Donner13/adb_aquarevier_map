/**
 * AquaRevier Mascot & Persona Module ("Platschi" the Water Otter)
 * Provides interactive onboarding tips, Pegel-Tamagotchi mood, character popup notes, and daily fun facts.
 */
(function(window) {
    'use strict';

    const FUN_FACTS = [
        "Wusstest du? Die Rur fließt durch drei Länder: Belgien, Deutschland und die Niederlande!",
        "Das Rheinische Revier umfasst über 60 Kläranlagen, die täglich Hunderttausende Kubikmeter Abwasser reinigen.",
        "Grundwasser braucht oft Jahrzehnte, um durch Erdschichten zu filtern – echte Naturreinigung!",
        "Ein durchschnittliches Regenrückhaltebecken im Revier fasst so viel Wasser wie 15 olympische Schwimmbecken.",
        "Der Wasserspiegel in Tagebau-Restseen wird über Jahrzehnte sorgfältig gesteuert, um stabile Ufer zu sichern."
    ];

    class AquaMascot {
        constructor() {
            this.activeMood = 'happy'; // 'happy', 'worried', 'curious'
            this.widget = null;
            this.popover = null;
            this.initUI();
        }

        initUI() {
            if (document.getElementById('platschi-widget')) return;
            if (!document.getElementById('platschi-styles')) {
                const style = document.createElement('style');
                style.id = 'platschi-styles';
                style.textContent = `
                    .platschi-container {
                        position: fixed;
                        right: 18px;
                        bottom: 78px;
                        z-index: 3000;
                    }
                    .platschi-avatar {
                        position: relative;
                        width: 52px;
                        height: 52px;
                        display: grid;
                        place-items: center;
                        border: 2px solid rgba(255,255,255,.9);
                        border-radius: 50%;
                        background: #0e7490;
                        box-shadow: 0 8px 24px rgba(15,23,42,.3);
                        cursor: pointer;
                    }
                    .platschi-emoji { font-size: 28px; line-height: 1; }
                    .platschi-mood-badge {
                        position: absolute;
                        right: -3px;
                        bottom: -3px;
                        font-size: 13px;
                        background: var(--bg-surface, #fff);
                        border-radius: 50%;
                        padding: 2px;
                    }
                    .platschi-speech-bubble {
                        position: absolute;
                        right: 0;
                        bottom: 64px;
                        width: min(300px, calc(100vw - 36px));
                        padding: 14px 38px 14px 14px;
                        color: var(--text-primary, #0f172a);
                        background: var(--bg-surface, #fff);
                        border: 1px solid var(--border-color, #94a3b8);
                        border-radius: 12px;
                        box-shadow: 0 12px 32px rgba(15,23,42,.25);
                        line-height: 1.45;
                    }
                    .platschi-bubble-close {
                        position: absolute;
                        top: 5px;
                        right: 8px;
                        border: 0;
                        background: transparent;
                        color: inherit;
                        cursor: pointer;
                        font-size: 22px;
                    }
                    @media (max-width: 480px) {
                        .platschi-container { right: 12px; bottom: 76px; }
                    }
                `;
                document.head.appendChild(style);
            }

            const widget = document.createElement('div');
            widget.id = 'platschi-widget';
            widget.className = 'platschi-container';
            widget.innerHTML = `
                <div class="platschi-speech-bubble" id="platschiBubble" style="display: none;">
                    <span id="platschiText">Hallo! Ich bin Platschi, dein Wasser-Guide! 🦦</span>
                    <button class="platschi-bubble-close" onclick="window.AquaMascot.hideBubble()">&times;</button>
                </div>
                <button class="platschi-avatar" id="platschiAvatar" type="button" aria-label="Platschi Tipps" onclick="window.AquaMascot.toggleBubble()">
                    <span class="platschi-emoji" id="platschiEmoji">🦦</span>
                    <span class="platschi-mood-badge" id="platschiMoodBadge">🟢</span>
                </button>
            `;
            document.body.appendChild(widget);
            this.widget = widget;

            // Trigger random fun fact on first daily load
            setTimeout(() => {
                const hasSeenToday = localStorage.getItem('platschi_fact_date') === new Date().toDateString();
                if (!hasSeenToday) {
                    this.showRandomFact();
                    try { localStorage.setItem('platschi_fact_date', new Date().toDateString()); } catch (e) { console.warn('Storage unavailable:', e); }
                }
            }, 2500);
        }

        showText(text, duration = 6000) {
            const bubble = document.getElementById('platschiBubble');
            const textSpan = document.getElementById('platschiText');
            if (bubble && textSpan) {
                textSpan.textContent = text;
                bubble.style.display = 'block';
                if (duration > 0) {
                    setTimeout(() => {
                        this.hideBubble();
                    }, duration);
                }
            }
        }

        hideBubble() {
            const bubble = document.getElementById('platschiBubble');
            if (bubble) bubble.style.display = 'none';
        }

        toggleBubble() {
            const bubble = document.getElementById('platschiBubble');
            if (bubble.style.display === 'none' || !bubble.style.display) {
                this.showRandomFact();
            } else {
                this.hideBubble();
            }
        }

        showRandomFact() {
            const fact = FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)];
            const greeting = this.getTimeGreeting();
            this.showText(`${greeting} ${fact}`);
        }

        getTimeGreeting() {
            const hour = new Date().getHours();
            if (hour < 11) return "Guten Morgen am Revier! 🌅";
            if (hour < 18) return "Hallo Wasserfan! 🌊";
            return "Guten Abend! 🌙";
        }

        updatePegelTamagotchi(waterLevel, thresholdNQ, thresholdHQ) {
            const badge = document.getElementById('platschiMoodBadge');
            const emoji = document.getElementById('platschiEmoji');

            if (waterLevel <= thresholdNQ) {
                this.activeMood = 'worried';
                if (badge) badge.textContent = '🔴';
                if (emoji) emoji.textContent = '🦦💧';
                this.showText("Niedrigwasser gemeldet! Platschi empfiehlt sparsamen Umgang mit Wasser.");
            } else if (waterLevel >= thresholdHQ) {
                this.activeMood = 'curious';
                if (badge) badge.textContent = '🟡';
                if (emoji) emoji.textContent = '🦦🌊';
                this.showText("Hochwassergefahr! Bitte die aktuellen Warnpegel beobachten.");
            } else {
                this.activeMood = 'happy';
                if (badge) badge.textContent = '🟢';
                if (emoji) emoji.textContent = '🦦✨';
                this.showText("Der Pegelstand ist stabil im optimalen Bereich! 🐟");
            }
        }

        getCharacterFact(type, val) {
            if (type === 'klaeranlage') {
                const pitchCount = Math.max(1, Math.round((val || 50000) / 4000));
                return `✨ Platschi-Fun-Fact: Diese Kläranlage reinigt täglich genug Wasser für ca. ${pitchCount} Fußballfelder!`;
            }
            if (type === 'pegel') {
                return `📊 Platschi-Tipp: Dieser Pegel misst kontinuierlich die Strömung der Rur.`;
            }
            return `🌊 Wasser-Wissen: Das Wasser hier fließt weiter in Richtung Maas und Nordsee!`;
        }
    }

    window.AquaMascot = new AquaMascot();
})(window);
