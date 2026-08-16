import re

with open('internal.html', 'r') as f:
    text = f.read()

presentation_old = '''        <div id="presentation-bar">
            <div class="title" id="presentation-title"></div>
            <div class="step-counter" id="presentation-step-counter"></div>
            <div class="caption" id="presentation-caption"></div>
            <div class="controls">
                <button id="prev-step-btn" class="control-btn">← Zurück</button>
                <button id="next-step-btn" class="control-btn">Weiter →</button>
                <button id="exit-presentation-btn" class="control-btn exit-btn">✕ Beenden</button>
            </div>
        </div>
    </div>'''

presentation_new = '''    <div id="presentation-bar">
        <div class="title" id="presentation-title"></div>
        <div class="step-counter" id="presentation-step-counter"></div>
        <div class="caption" id="presentation-caption"></div>
        <div class="controls">
            <button id="prev-step-btn" class="control-btn">← Zurück</button>
            <button id="next-step-btn" class="control-btn">Weiter →</button>
            <button id="exit-presentation-btn" class="control-btn exit-btn">✕ Beenden</button>
        </div>
    </div>
    </div>'''

text = text.replace(presentation_old, presentation_new)

with open('internal.html', 'w') as f:
    f.write(text)

print("Done")
