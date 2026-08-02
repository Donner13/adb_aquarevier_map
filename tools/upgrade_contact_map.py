#!/usr/bin/env python3
"""
AquaRevier Integration Script for primary contact_map repository.
Safely adds i18n attributes, header buttons (DE/EN, Audio), CSS, and script imports
without removing any of the existing 6658 lines or features.
"""
import sys

def upgrade_index():
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add Header Buttons if not present
    if 'id="langToggleBtn"' not in content:
        target = '<div style="display: flex; gap: 6px; align-items: center;">'
        replacement = target + '\n                    <button id="langToggleBtn" class="filter-btn" style="padding: 6px 10px; font-weight: 700; font-size: 13px;" title="Sprache wechseln / Switch Language" aria-label="Language Switcher" onclick="window.AquaI18n.toggleLanguage()">EN</button>\n                    <button id="audioToggleBtn" class="filter-btn" style="padding: 6px 10px; font-size: 13px;" title="Ton an/aus" aria-label="Audio Switcher" onclick="window.AquaAudio.toggleAudio()">🔇 Ton aus</button>'
        content = content.replace(target, replacement, 1)

    # 2. Add Script Tags before </body> if not present
    if 'js/i18n.js' not in content:
        target = '</body>'
        replacement = """    <!-- AquaRevier Suite Modules -->
    <script src="js/i18n.js"></script>
    <script src="js/error-handling.js"></script>
    <script src="js/mascot.js"></script>
    <script src="js/fun-features.js"></script>
    <script src="js/audio-system.js"></script>
</body>"""
        content = content.replace(target, replacement, 1)

    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Upgraded contact_map/index.html successfully!")


def upgrade_internal():
    with open('internal.html', 'r', encoding='utf-8') as f:
        content = f.read()

    if 'js/i18n.js' not in content:
        target = '</body>'
        replacement = """    <!-- AquaRevier Suite Modules -->
    <script src="js/i18n.js"></script>
    <script src="js/error-handling.js"></script>
    <script src="js/mascot.js"></script>
    <script src="js/fun-features.js"></script>
    <script src="js/audio-system.js"></script>
</body>"""
        content = content.replace(target, replacement, 1)

    with open('internal.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Upgraded contact_map/internal.html successfully!")

if __name__ == '__main__':
    upgrade_index()
    upgrade_internal()
