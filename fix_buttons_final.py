import re

with open('internal.html', 'r') as f:
    text = f.read()

# I see in the diff output that internal.html still has:
# <button class="filter-btn" id="export-csv-btn" style="display:none;" ...></button>
# <button class="filter-btn" id="open-data-export-btn" ...
# These are mixed in the editor panel (around line 21-38 of the diff output).

# Let's remove the duplicate hidden buttons from the editor panel area if they exist,
# and ensure the real export section is correct.

# First, clean up the top duplicate buttons in the editor panel area
text = re.sub(r'\s*<button class="filter-btn" id="export-csv-btn".*?</button>', '', text)
text = re.sub(r'\s*<button class="filter-btn" id="export-pdf-btn".*?</button>', '', text)
text = re.sub(r'\s*<button class="filter-btn" id="open-data-export-btn".*?</button>', '', text)
text = re.sub(r'\s*<button class="filter-btn" id="embed-open-btn".*?</button>', '', text)
text = re.sub(r'\s*<button class="filter-btn" id="generate-sprechzettel-btn".*?</button>', '', text)
text = re.sub(r'\s*<button class="filter-btn" id="generate-beschlussvorlage-btn".*?</button>', '', text)
text = re.sub(r'\s*<button class="filter-btn" id="generate-report-btn".*?</button>', '', text)


with open('internal.html', 'w') as f:
    f.write(text)

print("Done")
