import re

def extract_groups(html_content):
    # Find the filter section for Akteursgruppen
    section_match = re.search(r'<h3>Akteursgruppen.*?</h3>(.*?)(?:<h3>|$)', html_content, re.DOTALL)
    if not section_match:
        return []
    section = section_match.group(1)

    # Extract button groups and badges
    buttons = re.findall(r'<button class="filter-btn active" data-group="([^"]+)"', section)
    return buttons

with open('index.html', 'r') as f:
    index_html = f.read()

with open('internal.html', 'r') as f:
    internal_html = f.read()

index_groups = extract_groups(index_html)
internal_groups = extract_groups(internal_html)

print("Groups in index.html:", index_groups)
print("Groups in internal.html:", internal_groups)
