/**
 * AquaRevier Audio & Sound System (Web Audio API Synthesizer)
 * Default OFF with header toggle switch.
 */
(function(window) {
    'use strict';

    class AquaAudioSystem {
        constructor() {
            this.audioEnabled = window.AppStorage.getItem('aquarevier_audio') === 'true';
            this.ctx = null;
            this.ambientNode = null;
        }

        initContext() {
            if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                this.ctx = new AudioCtx();
            }
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
        }

        toggleAudio() {
            this.audioEnabled = !this.audioEnabled;
            window.AppStorage.setItem('aquarevier_audio', this.audioEnabled.toString());
            this.updateButtonUI();

            if (this.audioEnabled) {
                this.initContext();
                this.playBlubSound();
                if (window.showToastNotification) {
                    window.showToastNotification('🔊 Ton & Sound-Effekte aktiviert.', 'info', 2000);
                }
            } else {
                this.stopAmbient();
                if (window.showToastNotification) {
                    window.showToastNotification('🔇 Ton deaktiviert.', 'info', 2000);
                }
            }
        }

        updateButtonUI() {
            const btn = document.getElementById('audioToggleBtn');
            if (btn) {
                btn.textContent = this.audioEnabled ? '🔊 Ton an' : '🔇 Ton aus';
                btn.classList.toggle('active', this.audioEnabled);
            }
        }

        playSplashSound() {
            if (!this.audioEnabled) return;
            this.initContext();
            if (!this.ctx) return;

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.2);

            gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.2);
        }

        playBlubSound() {
            if (!this.audioEnabled) return;
            this.initContext();
            if (!this.ctx) return;

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(200, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.12);

            gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.12);
        }

        stopAmbient() {
            if (this.ambientNode) {
                try { this.ambientNode.stop(); } catch(e) {}
                this.ambientNode = null;
            }
        }
    }

    window.AquaAudio = new AquaAudioSystem();
})(window);
