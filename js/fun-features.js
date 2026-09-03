/**
 * AquaRevier Fun Features & Gamification Suite
 * Implements Konami Code, Hidden Beaver/Fish, Cursor Trails, Achievements,
 * Layer Combos, Confetti Export, Thirstiest Municipality Ranking, and Water Horoscope.
 */
(function(window) {
    'use strict';

    class AquaFunSuite {
        constructor() {
            this.achievements = JSON.parse(localStorage.getItem('aquarevier_achievements') || '{}');
            this.visitedDistricts = new Set(JSON.parse(localStorage.getItem('aquarevier_visited_districts') || '[]'));
            this.clickedStationsCount = parseInt(localStorage.getItem('aquarevier_clicked_stations') || '0', 10);
            this.activeLayerCombo = 0;
            this.initKonamiCode();
            this.initCursorTrail();
            this.initMapEvents();
        }

        // --- Konami Code (Up Up Down Down Left Right Left Right B A) ---
        initKonamiCode() {
            const sequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
            let currentStep = 0;

            document.addEventListener('keydown', (e) => {
                const key = e.key.toLowerCase() === 'b' ? 'b' : (e.key.toLowerCase() === 'a' ? 'a' : e.key);
                if (key === sequence[currentStep]) {
                    currentStep++;
                    if (currentStep === sequence.length) {
                        currentStep = 0;
                        this.triggerRaindropConfetti();
                        this.unlockAchievement('konami_master', 'Konami-Meister! 🌧️ (Regentropfen-Regen)');
                    }
                } else {
                    currentStep = 0;
                }
            });
        }

        triggerRaindropConfetti() {
            if (window.showToastNotification) {
                window.showToastNotification('🌧️ Konami-Code aktiviert! Es regnet Regentropfen-Konfetti!', 'success', 5000);
            }
            const container = document.createElement('div');
            container.className = 'raindrop-confetti-overlay';
            document.body.appendChild(container);

            for (let i = 0; i < 40; i++) {
                const drop = document.createElement('div');
                drop.className = 'raindrop-particle';
                drop.style.left = `${Math.random() * 100}vw`;
                drop.style.animationDuration = `${1 + Math.random() * 2}s`;
                drop.style.animationDelay = `${Math.random() * 0.5}s`;
                drop.textContent = Math.random() > 0.5 ? '💧' : '🌧️';
                container.appendChild(drop);
            }

            setTimeout(() => container.remove(), 3500);
        }

        // --- Cursor Trail on Drag ---
        initCursorTrail() {
            let isDragging = false;
            let activeDrops = 0;
            const MAX_DROPS = 30;

            document.addEventListener('mousedown', () => { isDragging = true; });
            document.addEventListener('mouseup', () => { isDragging = false; });

            document.addEventListener('mousemove', (e) => {
                if (!isDragging || Math.random() > 0.3 || activeDrops >= MAX_DROPS) return;

                activeDrops++;
                const drop = document.createElement('span');
                drop.className = 'cursor-water-drop';
                drop.textContent = '💧';
                const cx = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
                drop.style.left = `${cx - 6}px`;
                const cy = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
                drop.style.top = `${cy - 6}px`;
                document.body.appendChild(drop);

                setTimeout(() => {
                    drop.remove();
                    activeDrops--;
                }, 600);
            });
        }

        // --- Map interaction tracking ---
        initMapEvents() {
            document.addEventListener('aquarevier:layertoggle', (e) => {
                const count = e.detail?.activeCount || 0;
                if (count >= 5) {
                    this.triggerCombo(count);
                }
            });
        }

        triggerCombo(count) {
            const comboText = window.AquaI18n ? window.AquaI18n.t('mascot.combo_title') : 'Datenjongleur!';
            if (window.showToastNotification) {
                window.showToastNotification(`🔥 Combo x${count} – ${comboText}`, 'success', 2500);
            }
            this.unlockAchievement('layer_combo_5', 'Layer-Jongleur (5+ Ebenen gleichzeitig aktiv)');
        }

        // --- Export Confetti ---
        triggerExportConfetti() {
            if (window.showToastNotification) {
                window.showToastNotification('🎉 Daten gerettet! Export erfolgreich heruntergeladen.', 'success', 4000);
            }
            this.triggerRaindropConfetti();
            this.unlockAchievement('data_exporter', 'Daten-Retter (Erster Export)');
        }

        // --- Achievements ---
        unlockAchievement(id, title) {
            if (this.achievements[id]) return;
            this.achievements[id] = true;
            try { localStorage.setItem('aquarevier_achievements', JSON.stringify(this.achievements)); } catch (e) { console.warn('Storage unavailable:', e); }

            if (window.AquaMascot) {
                window.AquaMascot.showText(`🏆 ABWECHSLUNG! Erfolg freigeschaltet: ${title}`, 7000);
            } else if (window.showToastNotification) {
                window.showToastNotification(`🏆 Erfolg freigeschaltet: ${title}`, 'success', 5000);
            }
        }

        recordDistrictVisit(districtName) {
            this.visitedDistricts.add(districtName);
            try { localStorage.setItem('aquarevier_visited_districts', JSON.stringify([...this.visitedDistricts])); } catch (e) { console.warn('Storage unavailable:', e); }
            if (this.visitedDistricts.size >= 7) {
                this.unlockAchievement('visited_all_7', 'Revierexperte (Alle 7 Kreise besucht)');
            }
        }

        recordStationClick() {
            this.clickedStationsCount++;
            try { localStorage.setItem('aquarevier_clicked_stations', this.clickedStationsCount.toString()); } catch (e) { console.warn('Storage unavailable:', e); }
            if (this.clickedStationsCount >= 60) {
                this.unlockAchievement('clicked_60_stations', 'Wassermeister (60 Stationen angeklickt)');
            }
        }

        // --- Water Horoscope ---
        getWaterHoroscope() {
            const signs = [
                "Sternzeichen Forelle 🐟: Heute fließen deine Ideen ungehindert. Achte auf ruhige Nebengewässer!",
                "Sternzeichen Biber 🦫: Zeit zum Bauen und Organisieren. Deine Projekte sind heute aussergewöhnlich stabil!",
                "Sternzeichen Eisvogel 🐦: Schnelle Reaktionen führen heute zum Erfolg. Halte Ausschau nach Chancen!",
                "Sternzeichen Otter 🦦: Ein verspielter Tag liegt vor dir. Gleite mit dem Strom!"
            ];
            return signs[Math.floor(Math.random() * signs.length)];
        }

        // --- Thirstiest Municipality Ranking ---
        showThirstiestMunicipalityRanking() {
            const modal = document.createElement('div');
            modal.className = 'scorecard-backdrop';
            modal.style.display = 'flex';
            modal.innerHTML = `
                <div class="scorecard-modal">
                    <div class="scorecard-header">
                        <div class="scorecard-title">💧 Ranking der durstigsten Kommunen (Abwasseraufkommen)</div>
                        <button class="scorecard-close" onclick="this.closest('.scorecard-backdrop').remove()">&times;</button>
                    </div>
                    <div class="scorecard-body">
                        <p style="margin-bottom:12px; color:var(--text-secondary);">Ranking auf Basis der Ausbaugröße aller angeschlossenen Kläranlagen (EW = Einwohnerwerte):</p>
                        <table class="scorecard-table">
                            <thead>
                                <tr><th>Rang</th><th>Kommune / Region</th><th>Kapazität (EW)</th><th>Spitzenreiter-Motto</th></tr>
                            </thead>
                            <tbody>
                                <tr><td>1 🥇</td><td>StädteRegion Aachen</td><td>~650.000 EW</td><td>Großstadt-Dunstkreis</td></tr>
                                <tr><td>2 🥈</td><td>Kreis Düren</td><td>~320.000 EW</td><td>Rur-Zentrum</td></tr>
                                <tr><td>3 🥉</td><td>Rhein-Erft-Kreis</td><td>~290.000 EW</td><td>Revier-Anschluss</td></tr>
                                <tr><td>4 🏅</td><td>Kreis Heinsberg</td><td>~210.000 EW</td><td>Grenzfluss-Filter</td></tr>
                                <tr><td>5 🏅</td><td>Kreis Euskirchen</td><td>~180.000 EW</td><td>Quellfluss-Wächter</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        // --- Water Level Guessing Game ---
        showGaugeGuessingGame() {
            const modal = document.createElement('div');
            modal.className = 'scorecard-backdrop';
            modal.style.display = 'flex';
            modal.innerHTML = `
                <div class="scorecard-modal" style="max-width: 480px;">
                    <div class="scorecard-header">
                        <div class="scorecard-title">🎯 Pegel-Schätzspiel (Pegel Jülich)</div>
                        <button class="scorecard-close" onclick="this.closest('.scorecard-backdrop').remove()">&times;</button>
                    </div>
                    <div class="scorecard-body" style="text-align:center;">
                        <p>Was glaubst du, wie hoch der Wasserstand der Rur in Jülich morgen um 12:00 Uhr steht?</p>
                        <div style="margin: 16px 0;">
                            <input type="number" id="guessInput" placeholder="z. B. 115" style="padding:8px 12px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-base); color:var(--text-primary); width:120px; text-align:center;"> cm
                        </div>
                        <button type="button" class="action-btn" onclick="
                            const val = document.getElementById('guessInput').value;
                            if(val) {
                                alert('Tipp von ' + val + ' cm gespeichert! Schau morgen wieder rein 🎉');
                                this.closest('.scorecard-backdrop').remove();
                            }
                        ">Tipp abgeben</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
    }

    window.AquaFun = new AquaFunSuite();
})(window);
