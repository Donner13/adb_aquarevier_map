import os
import re

def fix_file(f):
    if os.path.exists(f):
        with open(f, 'r') as file:
            content = file.read()

        # The regex previously didn't match because of the aria-pressed addition!
        # It's:
        # btn.classList.add('active'); btn.setAttribute('aria-pressed', 'true');
        # btn.classList.remove('inactive');

        target1 = """                    btn.classList.add('active'); btn.setAttribute('aria-pressed', 'true');
                    btn.classList.remove('inactive');"""
        rep1 = """                    btn.classList.add('active'); btn.setAttribute('aria-pressed', 'true'); btn.classList.remove('inactive');"""

        target2 = """                    btn.classList.remove('active'); btn.setAttribute('aria-pressed', 'false');
                    btn.classList.add('inactive');"""
        rep2 = """                    btn.classList.remove('active'); btn.setAttribute('aria-pressed', 'false'); btn.classList.add('inactive');"""

        content = content.replace(target1, rep1).replace(target2, rep2)

        target1_b = """btn.classList.add('active');
                    btn.classList.remove('inactive');"""
        rep1_b = """btn.classList.add('active'); btn.setAttribute('aria-pressed', 'true'); btn.classList.remove('inactive');"""

        target2_b = """btn.classList.remove('active');
                    btn.classList.add('inactive');"""
        rep2_b = """btn.classList.remove('active'); btn.setAttribute('aria-pressed', 'false'); btn.classList.add('inactive');"""

        content = content.replace(target1_b, rep1_b).replace(target2_b, rep2_b)

        # Also need to fix the extracted click handler in index.html, internal.html
        target_click = """        document.querySelectorAll('.filter-btn[data-group]').forEach(btn => {
            btn.addEventListener('click', () => {
                const group = btn.getAttribute('data-group');
                if (activeFilters.has(group)) {
                    activeFilters.delete(group);
                } else {
                    activeFilters.add(group);
                }
                updateButtonVisualStates();
                renderMapAndSidebar();
            });
        });"""

        rep_click = """        document.querySelectorAll('.filter-btn[data-group]').forEach(btn => {
            btn.addEventListener('click', () => {
                const group = btn.getAttribute('data-group');
                if (activeFilters.has(group)) {
                    activeFilters.delete(group);
                    btn.classList.remove('active'); btn.classList.add('inactive'); btn.setAttribute('aria-pressed', 'false');
                } else {
                    activeFilters.add(group);
                    btn.classList.add('active'); btn.classList.remove('inactive'); btn.setAttribute('aria-pressed', 'true');
                }
                updateButtonVisualStates();
                renderMapAndSidebar();
            });
        });"""
        content = content.replace(target_click, rep_click)

        # What about _extracted.js? Let's fix the same click bug there just in case.
        # But wait, in _extracted.js we know it manually toggles `btn.classList.remove('active')`
        # Let's ensure it adds inactive.

        with open(f, 'w') as file:
            file.write(content)

fix_file('index.html')
fix_file('internal.html')

def fix_extracted(f):
    if os.path.exists(f):
        with open(f, 'r') as file:
            content = file.read()

        content = content.replace("b.classList.remove('active');", "b.classList.remove('active'); b.classList.add('inactive'); b.setAttribute('aria-pressed', 'false');")
        content = content.replace("b.classList.add('active');", "b.classList.add('active'); b.classList.remove('inactive'); b.setAttribute('aria-pressed', 'true');")

        content = content.replace("btn.classList.remove('active');", "btn.classList.remove('active'); btn.classList.add('inactive'); btn.setAttribute('aria-pressed', 'false');")
        content = content.replace("btn.classList.add('active');", "btn.classList.add('active'); btn.classList.remove('inactive'); btn.setAttribute('aria-pressed', 'true');")

        content = content.replace("allBtn.classList.remove('active');", "allBtn.classList.remove('active'); allBtn.classList.add('inactive'); allBtn.setAttribute('aria-pressed', 'false');")
        content = content.replace("allBtn.classList.add('active');", "allBtn.classList.add('active'); allBtn.classList.remove('inactive'); allBtn.setAttribute('aria-pressed', 'true');")

        # Avoid duplicate aria-pressed
        content = content.replace("btn.setAttribute('aria-pressed', 'false'); btn.setAttribute('aria-pressed', 'false');", "btn.setAttribute('aria-pressed', 'false');")
        content = content.replace("btn.setAttribute('aria-pressed', 'true'); btn.setAttribute('aria-pressed', 'true');", "btn.setAttribute('aria-pressed', 'true');")
        content = content.replace("b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-pressed', 'false');", "b.setAttribute('aria-pressed', 'false');")
        content = content.replace("b.setAttribute('aria-pressed', 'true'); b.setAttribute('aria-pressed', 'true');", "b.setAttribute('aria-pressed', 'true');")
        content = content.replace("allBtn.setAttribute('aria-pressed', 'false'); allBtn.setAttribute('aria-pressed', 'false');", "allBtn.setAttribute('aria-pressed', 'false');")
        content = content.replace("allBtn.setAttribute('aria-pressed', 'true'); allBtn.setAttribute('aria-pressed', 'true');", "allBtn.setAttribute('aria-pressed', 'true');")

        content = content.replace("b.classList.remove('inactive'); b.classList.remove('inactive');", "b.classList.remove('inactive');")
        content = content.replace("b.classList.add('inactive'); b.classList.add('inactive');", "b.classList.add('inactive');")

        content = content.replace("btn.classList.remove('inactive'); btn.classList.remove('inactive');", "btn.classList.remove('inactive');")
        content = content.replace("btn.classList.add('inactive'); btn.classList.add('inactive');", "btn.classList.add('inactive');")

        content = content.replace("allBtn.classList.remove('inactive'); allBtn.classList.remove('inactive');", "allBtn.classList.remove('inactive');")
        content = content.replace("allBtn.classList.add('inactive'); allBtn.classList.add('inactive');", "allBtn.classList.add('inactive');")

        with open(f, 'w') as file:
            file.write(content)

fix_extracted('_extracted.js')
