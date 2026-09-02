/**
 * AquaRevier Internationalization (i18n) Module
 * Supports German (de) and English (en) with data-i18n-key bindings and dynamic string translation.
 */
(function(window) {
    'use strict';

    const TRANSLATIONS = {
        de: {
            // General & Header
            "app.title": "Akteure - AquaRevier",
            "app.subtitle": "Rheinische Wasserlandschaft im Wandel",
            "app.lang": "EN",
            "app.lang_title": "Sprache wechseln / Switch Language",
            "app.lang_aria": "Sprachumschalter",
            "app.search_placeholder": "Akteure, Messstellen, Orte suchen...",
            "app.night_mode": "Nachtangel-Modus",
            "app.day_mode": "Tageslicht-Modus",
            "app.audio_on": "Ton an",
            "app.audio_off": "Ton aus",
            "app.mascot_toggle": "Platschi Tipps",
            // Legacy data-i18n-key bindings used by index.html/internal.html.
            // Keep these aliases until the markup is migrated to namespaced keys.
            "search_placeholder": "Nach Name oder Ort suchen...",
            "cmd_placeholder": "Schnellsuche (Gemeinden, Layer, Akteure, Aktionen)...",
            "share_view": "🔗 Ansicht teilen",
            "reset_filters": "Filter zurücksetzen",
            "generate_report": "📊 Bericht generieren (PDF)",
            "open_data_export": "💾 Geodaten-Export",
            "health_online": "ELWAS & WMS 🟢 Operational",
            "layer_gwm": "Grundwassermessstellen",
            "layer_gwwa": "Grundwasserwiederanstieg",
            "layer_pegel": "Flusspegel",
            "layer_stauanlagen": "Stauanlagen",
            "layer_regenbecken": "Regenbecken",
            "layer_querbauwerke": "Querbauwerke",
            "layer_h2": "H2-Industrie (NRW)",
            
            // Sidebar & Navigation
            "sidebar.layers": "Ebenen & Overlays",
            "sidebar.contacts": "Akteure & Netzwerk",
            "sidebar.scorecard": "Kreisvergleich",
            "sidebar.stats": "Statistiken",
            "sidebar.export": "Daten-Export",
            "sidebar.reset": "Ansicht zurücksetzen",
            "sidebar.feedback": "Feedback geben",
            "sidebar.actors_title": "👥 Regionale Akteure",
            "sidebar.einleiter_title": "🏭 Industrieeinleiter (Risikoklasse)",
            "sidebar.all_on": "Alle an",
            "sidebar.all_off": "Alle aus",

            // Groups & Risk
            "group.behorde": "Behörde",
            "group.behorde_tooltip": "Wasserbehörden, Bezirksregierungen und Ministerien",
            "group.forschung": "Forschung",
            "group.forschung_tooltip": "Universitäten und wissenschaftliche Institute im Rurgebiet",
            "group.gebietskorperschaft": "Gebietskörperschaft",
            "group.gebietskorperschaft_tooltip": "Städte, Gemeinden und Kreise im Untersuchungsgebiet",
            "group.gewerbe": "Gewerbe/ Industrie",
            "group.gewerbe_tooltip": "Gewerbebetriebe und größere Industriestandorte",
            "group.landwirtschaft": "Landwirtschaft",
            "group.landwirtschaft_tooltip": "Landwirtschaftliche Verbände und Betriebe",
            "group.netzwerk": "Netzwerk/ Mult.",
            "group.netzwerk_tooltip": "Netzwerke, Vereine und Multiplikatoren",
            "group.entsorger": "Ver-/ Entsorger",
            "group.entsorger_tooltip": "Wasserverbände, Ver- und Entsorgungsbetriebe",
            "group.sonstige": "Sonstige",
            "group.sonstige_tooltip": "Sonstige Akteure und Interessenvertreter",
            "group.einzelakteure": "Einzelakteure",
            "group.einzelakteure_tooltip": "Einzelpersonen und direkte Kontakte",
            "group.konsortium": "Konsortium",
            "group.konsortium_tooltip": "Mitglieder des AquaRevier-Konsortiums",
            "risk.high": "Risiko: Hoch",
            "risk.high_tooltip": "Hohes Risiko (z.B. Direkteinleiter, Chemische Industrie, große Abwassermengen)",
            "risk.medium": "Risiko: Mittel",
            "risk.medium_tooltip": "Mittleres Risiko (z.B. Textil, Wäscherei, mittlere Abwassermengen)",
            "risk.low": "Risiko: Niedrig",
            "risk.low_tooltip": "Niedriges Risiko (Indirekteinleiter ohne spezifisches Profil)",
            "risk.unbekannt": "Risiko: Unbekannt",
            "risk.unbekannt_tooltip": "Keine Klassifizierung möglich (fehlende Daten)",

            // Layer Categories
            "layer_group.hydrology": "🌊 Hydrologie & Gewässer",
            "layer_group.infrastructure": "🏗️ Infrastruktur & Abwasser",
            "layer_group.protection": "🛡️ Schutz- & Umweltzonen",
            "layer_group.administration": "🏛️ Verwaltung & Reviere",

            // Layers
            "layer.pegel": "Pegelmessstellen (Wasserstand)",
            "layer.gewaesser": "Gewässernetz (Rur, Inde, Wurm)",
            "layer.einzugsgebiet": "Rur-Einzugsgebiet",
            "layer.klaeranlagen": "Kläranlagen & Kapazität",
            "layer.regenbecken": "Regenrückhaltebecken",
            "layer.querbauwerke": "Querbauwerke & Fischaufstieg",
            "layer.einleiter": "Industrielle Einleiter",
            "layer.wasserschutz": "Wasserschutzgebiete",
            "layer.gewaesserguede": "Gewässergüte (EU-WRRL)",
            "layer.grundwasser": "Grundwassermessstellen",
            "layer.kreise": "7 Kreise im Revier",
            "layer.untersuchungsgebiet": "Projektgebiet",

            // Popups & Tools
            "popup.capacity": "Kapazität",
            "popup.water_level": "Aktueller Wasserstand",
            "popup.discharge": "Abfluss",
            "popup.operator": "Betreiber / Träger",
            "popup.details": "Weitere Details",
            "popup.share": "Standort teilen",
            "popup.bookmark": "Lesezeichen setzen",

            // Radius Tool
            "radius.title": "Umkreis-Analyse",
            "radius.label": "Radius (km):",
            "radius.fallback_msg": "Standort konnte nicht ermittelt werden. Kartenmittelpunkt wird verwendet.",

            // Footer & Mottos
            "footer.motto": "Fließ mit uns – Gemeinsam für eine nachhaltige Wasserwirtschaft im Revier.",
            "footer.fact_title": "Wasser-Fakt des Tages:",
            
            // Mascot & Gamification
            "mascot.greeting_morning": "Guten Morgen am Revier! Frisches Wasser, frische Daten!",
            "mascot.greeting_day": "Hallo! Bereit für eine Entdeckungstour durch das Wassernetz?",
            "mascot.greeting_evening": "Guten Abend! Ruhige Gewässer für deinen Feierabend-Check.",
            "mascot.tamagotchi_happy": "Pegelstand im grünen Bereich! Die Fische jubeln 🐟",
            "mascot.tamagotchi_worried": "Niedrigwasser gemeldet! Vorsichtig mit den Wasserressourcen umgehen 💧",
            "mascot.achievement_unlocked": "Erfolg freigeschaltet:",
            "mascot.combo_text": "Combo x",
            "mascot.combo_title": "Datenjongleur!",

            // Export & Feedback
            "export.success_title": "Daten gerettet!",
            "export.success_msg": "GeoJSON/CSV-Export wurde erfolgreich heruntergeladen.",
            "feedback.thanks": "Vielen Dank für dein Feedback!",
            "feedback.thumbs_up": "Klasse!",
            "feedback.thumbs_down": "Verbesserungswürdig",

            // Seasonal
            "seasonal.autumn": "Herbststimmung aktiv 🍂",
            "seasonal.winter": "Winterzauber aktiv ❄️",
            "seasonal.spring": "Frühlingserwachen active 🌸",
            "seasonal.rainbow": "Regenbogen-Modus 🌈"
        },
        en: {
            // General & Header
            "app.title": "Stakeholders - AquaRevier",
            "app.subtitle": "Rhenish Water Landscape in Transition",
            "app.lang": "DE",
            "app.lang_title": "Switch language / Sprache wechseln",
            "app.lang_aria": "Language Switcher",
            "app.search_placeholder": "Search stakeholders, stations, places...",
            "app.night_mode": "Night Fishing Mode",
            "app.day_mode": "Daylight Mode",
            "app.audio_on": "Audio On",
            "app.audio_off": "Audio Off",
            "app.mascot_toggle": "Platschi Tips",
            // Legacy data-i18n-key bindings used by index.html/internal.html.
            "search_placeholder": "Search by name or location...",
            "cmd_placeholder": "Quick search (Municipalities, Layers, Stakeholders, Actions)...",
            "share_view": "🔗 Share View",
            "reset_filters": "Reset Filters",
            "generate_report": "📊 Generate Report (PDF)",
            "open_data_export": "💾 Open Data Export",
            "health_online": "ELWAS & WMS 🟢 Operational",
            "layer_gwm": "Groundwater monitoring stations",
            "layer_gwwa": "Groundwater level rise",
            "layer_pegel": "River gauges",
            "layer_stauanlagen": "Reservoirs / dams",
            "layer_regenbecken": "Stormwater basins",
            "layer_querbauwerke": "Cross structures",
            "layer_h2": "H2 industry (NRW)",
            
            // Sidebar & Navigation
            "sidebar.layers": "Layers & Overlays",
            "sidebar.contacts": "Stakeholders & Network",
            "sidebar.scorecard": "District Comparison",
            "sidebar.stats": "Statistics",
            "sidebar.export": "Data Export",
            "sidebar.reset": "Reset View",
            "sidebar.feedback": "Give Feedback",
            "sidebar.actors_title": "👥 Regional Stakeholders",
            "sidebar.einleiter_title": "🏭 Industrial Dischargers (Risk Class)",
            "sidebar.all_on": "All on",
            "sidebar.all_off": "All off",

            // Groups & Risk
            "group.behorde": "Authority",
            "group.behorde_tooltip": "Water authorities, regional governments and ministries",
            "group.forschung": "Research",
            "group.forschung_tooltip": "Universities and scientific institutes in the Rur region",
            "group.gebietskorperschaft": "Municipality / District",
            "group.gebietskorperschaft_tooltip": "Cities, municipalities and districts in the study area",
            "group.gewerbe": "Commerce / Industry",
            "group.gewerbe_tooltip": "Commercial enterprises and major industrial sites",
            "group.landwirtschaft": "Agriculture",
            "group.landwirtschaft_tooltip": "Agricultural associations and farms",
            "group.netzwerk": "Network / Multiplier",
            "group.netzwerk_tooltip": "Networks, associations and multipliers",
            "group.entsorger": "Utility / Waste Mgmt",
            "group.entsorger_tooltip": "Water associations, supply and waste management companies",
            "group.sonstige": "Other",
            "group.sonstige_tooltip": "Other stakeholders and representatives",
            "group.einzelakteure": "Individual Stakeholders",
            "group.einzelakteure_tooltip": "Individual contacts and representatives",
            "group.konsortium": "Consortium",
            "group.konsortium_tooltip": "Members of the AquaRevier Consortium",
            "risk.high": "Risk: High",
            "risk.high_tooltip": "High risk (e.g., direct dischargers, chemical industry, high wastewater flow)",
            "risk.medium": "Risk: Medium",
            "risk.medium_tooltip": "Medium risk (e.g., textiles, laundry, moderate wastewater flow)",
            "risk.low": "Risk: Low",
            "risk.low_tooltip": "Low risk (indirect dischargers without specific profile)",
            "risk.unbekannt": "Risk: Unknown",
            "risk.unbekannt_tooltip": "No classification possible (missing data)",

            // Layer Categories
            "layer_group.hydrology": "🌊 Hydrology & Water Bodies",
            "layer_group.infrastructure": "🏗️ Infrastructure & Wastewater",
            "layer_group.protection": "🛡️ Protected & Environmental Zones",
            "layer_group.administration": "🏛️ Administration & Districts",

            // Layers
            "layer.pegel": "Water Level Gauges",
            "layer.gewaesser": "Waterway Network (Rur, Inde, Wurm)",
            "layer.einzugsgebiet": "Rur Catchment Area",
            "layer.klaeranlagen": "Wastewater Treatment Plants",
            "layer.regenbecken": "Stormwater Retention Basins",
            "layer.querbauwerke": "Weirs & Fish Passages",
            "layer.einleiter": "Industrial Dischargers",
            "layer.wasserschutz": "Water Protection Areas",
            "layer.gewaesserguede": "Water Quality (EU WFD)",
            "layer.grundwasser": "Groundwater Monitoring Stations",
            "layer.kreise": "7 Districts in Rhenish Revier",
            "layer.untersuchungsgebiet": "Project Area",

            // Popups & Tools
            "popup.capacity": "Capacity",
            "popup.water_level": "Current Water Level",
            "popup.discharge": "Discharge",
            "popup.operator": "Operator / Authority",
            "popup.details": "More Details",
            "popup.share": "Share Location",
            "popup.bookmark": "Bookmark Location",

            // Radius Tool
            "radius.title": "Radius Analysis",
            "radius.label": "Radius (km):",
            "radius.fallback_msg": "Location could not be determined. Using map center.",

            // Footer & Mottos
            "footer.motto": "Flow with us – Together for sustainable water management in the region.",
            "footer.fact_title": "Water Fact of the Day:",

            // Mascot & Gamification
            "mascot.greeting_morning": "Good morning at the Revier! Fresh water, fresh data!",
            "mascot.greeting_day": "Hello! Ready to explore the water network?",
            "mascot.greeting_evening": "Good evening! Calm waters for your evening check.",
            "mascot.tamagotchi_happy": "Water level optimal! The fish are cheering 🐟",
            "mascot.tamagotchi_worried": "Low water level detected! Mind water resource usage 💧",
            "mascot.achievement_unlocked": "Achievement Unlocked:",
            "mascot.combo_text": "Combo x",
            "mascot.combo_title": "Data Juggler!",

            // Export & Feedback
            "export.success_title": "Data Rescued!",
            "export.success_msg": "GeoJSON/CSV export downloaded successfully.",
            "feedback.thanks": "Thank you for your feedback!",
            "feedback.thumbs_up": "Great!",
            "feedback.thumbs_down": "Could be improved",

            // Seasonal
            "seasonal.autumn": "Autumn Vibe Active 🍂",
            "seasonal.winter": "Winter Magic Active ❄️",
            "seasonal.spring": "Spring Bloom Active 🌸",
            "seasonal.rainbow": "Rainbow Mode 🌈"
        }
    };

    class AquaI18n {
        constructor() {
            this.currentLang = localStorage.getItem('aquarevier_lang') || 'de';
        }

        init() {
            this.applyLanguage(this.currentLang);
        }

        setLanguage(lang) {
            if (!TRANSLATIONS[lang]) return;
            this.currentLang = lang;
            try { localStorage.setItem('aquarevier_lang', lang); } catch (e) { console.warn('Storage unavailable:', e); }
            this.applyLanguage(lang);
            document.dispatchEvent(new CustomEvent('aquarevier:langchange', { detail: { lang } }));
        }

        toggleLanguage() {
            const nextLang = this.currentLang === 'de' ? 'en' : 'de';
            this.setLanguage(nextLang);
        }

        t(key, fallback = '') {
            return TRANSLATIONS[this.currentLang]?.[key] || TRANSLATIONS['de']?.[key] || fallback || key;
        }

        applyLanguage(lang) {
            document.documentElement.lang = lang;
            const elements = document.querySelectorAll('[data-i18n-key]');
            elements.forEach(el => {
                const key = el.getAttribute('data-i18n-key');
                const translation = TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.de?.[key];
                // Missing translations must never replace useful visible copy
                // with an implementation key such as "reset_filters".
                if (translation === undefined) return;

                if (el.tagName === 'TITLE') {
                    document.title = translation;
                } else if (el.tagName === 'INPUT' && el.type === 'text') {
                    el.placeholder = translation;
                } else if (el.hasAttribute('data-i18n-target')) {
                    const targetAttr = el.getAttribute('data-i18n-target');
                    el.setAttribute(targetAttr, translation);
                } else {
                    el.textContent = translation;
                }
            });

            const titleElements = document.querySelectorAll('[data-i18n-title-key]');
            titleElements.forEach(el => {
                const key = el.getAttribute('data-i18n-title-key');
                const translation = TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.de?.[key];
                if (translation !== undefined) {
                    el.setAttribute('title', translation);
                }
            });

            const ariaElements = document.querySelectorAll('[data-i18n-aria-key]');
            ariaElements.forEach(el => {
                const key = el.getAttribute('data-i18n-aria-key');
                const translation = TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.de?.[key];
                if (translation !== undefined) {
                    el.setAttribute('aria-label', translation);
                }
            });

            // Update language toggle button text
            const toggleBtn = document.getElementById('langToggleBtn');
            if (toggleBtn) {
                toggleBtn.textContent = lang === 'de' ? 'EN' : 'DE';
                if (!toggleBtn.hasAttribute('data-i18n-title-key')) {
                    toggleBtn.setAttribute('title', lang === 'de' ? 'Switch to English' : 'Auf Deutsch wechseln');
                }
                if (!toggleBtn.hasAttribute('data-i18n-aria-key')) {
                    toggleBtn.setAttribute('aria-label', lang === 'de' ? 'Switch to English' : 'Auf Deutsch wechseln');
                }
            }

            const legacyToggleBtn = document.getElementById('lang-toggle-btn');
            if (legacyToggleBtn) {
                legacyToggleBtn.textContent = lang === 'de' ? '🇬🇧 English' : '🇩🇪 Deutsch';
            }
        }
    }

    window.AquaI18n = new AquaI18n();
    document.addEventListener('DOMContentLoaded', () => {
        window.AquaI18n.init();
    });
})(window);
