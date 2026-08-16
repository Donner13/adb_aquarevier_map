import re
with open('tests/ui-regression/popup-sanitizer.spec.js', 'r') as f:
    content = f.read()

# Make the feature group match one that actually displays the properties in popup.
# Looking at the test, it uses "Forschung" as group.
# Wait, let's look at what popupFields "Forschung" uses. It's 'contacts' layer.
