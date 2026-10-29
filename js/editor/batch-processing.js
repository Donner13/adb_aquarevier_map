// js/editor/batch-processing.js
// Handles batch editing/deleting of actors in internal.html (TASK-20)

let batchSelectedContactIds = new Set();
let isBatchModeActive = false;

function toggleBatchMode() {
    isBatchModeActive = !isBatchModeActive;
    batchSelectedContactIds.clear();

    const batchControls = document.getElementById('batch-controls');
    const toggleBtn = document.getElementById('toggle-batch-mode-btn');

    if (isBatchModeActive) {
        if (batchControls) batchControls.style.display = 'block';
        if (toggleBtn) {
            toggleBtn.classList.add('active');
            toggleBtn.style.background = 'var(--accent-primary)';
            toggleBtn.style.color = '#fff';
        }
        const groupSelect = document.getElementById('batch-group-select');
        if (groupSelect && typeof styleSettings !== 'undefined' && styleSettings.groupColors) {
            const currentVal = groupSelect.value;
            groupSelect.innerHTML = '<option value="">Neue Gruppe wählen...</option>';
            Object.keys(styleSettings.groupColors).forEach(g => {
                const opt = document.createElement('option');
                opt.value = g;
                opt.text = (styleSettings.groupNames && styleSettings.groupNames[g]) ? styleSettings.groupNames[g] : g;
                groupSelect.appendChild(opt);
            });
            if (currentVal) groupSelect.value = currentVal;
        }
    } else {
        if (batchControls) batchControls.style.display = 'none';
        if (toggleBtn) {
            toggleBtn.classList.remove('active');
            toggleBtn.style.background = '';
            toggleBtn.style.color = '';
        }
    }

    // Re-render sidebar to show/hide checkboxes
    if (typeof renderMapAndSidebar === 'function') {
        renderMapAndSidebar();
    }
}

function handleBatchSelection(checkbox, contactId) {
    if (checkbox.checked) {
        batchSelectedContactIds.add(contactId);
    } else {
        batchSelectedContactIds.delete(contactId);
    }
    updateBatchControlsState();
}

function updateBatchControlsState() {
    const selectedCount = batchSelectedContactIds.size;
    const deleteBtn = document.getElementById('batch-delete-btn');
    const groupSelect = document.getElementById('batch-group-select');
    const assignBtn = document.getElementById('batch-assign-btn');
    const countDisplay = document.getElementById('batch-selected-count');

    if (countDisplay) {
        countDisplay.innerText = `${selectedCount} ausgewählt`;
    }

    if (selectedCount > 0) {
        if (deleteBtn) deleteBtn.disabled = false;
        if (groupSelect) groupSelect.disabled = false;
        if (assignBtn && groupSelect && groupSelect.value) assignBtn.disabled = false;
    } else {
        if (deleteBtn) deleteBtn.disabled = true;
        if (groupSelect) groupSelect.disabled = true;
        if (assignBtn) assignBtn.disabled = true;
    }
}

function handleBatchGroupSelectChange() {
    const groupSelect = document.getElementById('batch-group-select');
    const assignBtn = document.getElementById('batch-assign-btn');

    if (assignBtn && groupSelect) {
        assignBtn.disabled = !groupSelect.value || batchSelectedContactIds.size === 0;
    }
}

function executeBatchDelete() {
    if (batchSelectedContactIds.size === 0) return;

    if (!confirm(`Möchten Sie wirklich ${batchSelectedContactIds.size} Akteure unwiderruflich löschen?`)) {
        return;
    }

    if (typeof geojsonData !== 'undefined' && geojsonData.features) {
        geojsonData.features = geojsonData.features.filter(f => !batchSelectedContactIds.has(f.properties.id));

        // Save to server
        if (typeof saveToServer === 'function') {
            saveToServer(geojsonData).then(() => {
                batchSelectedContactIds.clear();
                updateBatchControlsState();
                if (typeof renderMapAndSidebar === 'function') {
                    renderMapAndSidebar();
                }
            }).catch(err => {
                alert('Fehler beim Löschen: ' + err);
            });
        }
    }
}

function executeBatchAssign() {
    if (batchSelectedContactIds.size === 0) return;

    const groupSelect = document.getElementById('batch-group-select');
    if (!groupSelect || !groupSelect.value) return;

    const newGroup = groupSelect.value;

    if (typeof geojsonData !== 'undefined' && geojsonData.features) {
        geojsonData.features.forEach(f => {
            if (batchSelectedContactIds.has(f.properties.id)) {
                f.properties.group = newGroup;
            }
        });

        // Save to server
        if (typeof saveToServer === 'function') {
            saveToServer(geojsonData).then(() => {
                // Clear selection and re-render
                batchSelectedContactIds.clear();
                // Optionally auto-close batch mode
                // toggleBatchMode();
                updateBatchControlsState();
                if (typeof renderMapAndSidebar === 'function') {
                    renderMapAndSidebar();
                }
            }).catch(err => {
                alert('Fehler beim Zuweisen: ' + err);
            });
        }
    }
}

// Will be called in internal.html sidebar rendering hook
function injectBatchCheckboxHtml(props) {
    if (!isBatchModeActive) return '';

    const isChecked = batchSelectedContactIds.has(props.id);
    return `
        <div class="batch-checkbox-container" style="margin-right: 8px; display: flex; align-items: center;" onclick="event.stopPropagation();">
            <input type="checkbox" class="batch-checkbox"
                   ${isChecked ? 'checked' : ''}
                   onchange="handleBatchSelection(this, '${props.id}')"
                   aria-label="Akteur für Stapelverarbeitung auswählen">
        </div>
    `;
}
