const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const leafletScript = `    <!-- Leaflet JS -->
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>`;

const jspdfScript = `    <!-- Leaflet JS -->
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>

    <!-- jsPDF for PDF Export -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js"></script>`;

html = html.replace(leafletScript, jspdfScript);

const exportSection = `
                <!-- Export Section -->
                <div style="margin-top: auto; padding-top: 15px; border-top: 1px solid var(--border-color); display: flex; gap: 8px;">
                    <button id="export-csv-btn" class="filter-btn" style="flex: 1; justify-content: center;">📄 CSV Export</button>
                    <button id="export-pdf-btn" class="filter-btn" style="flex: 1; justify-content: center;">📑 PDF Export</button>
                </div>
            </div>
        </div>`;

const sidebarContentEnd = `            </div>
        </div>`;

if (html.includes(sidebarContentEnd)) {
    // Only replace the last occurrence to inject at the end of sidebar-content
    const lastIndex = html.lastIndexOf(sidebarContentEnd);
    html = html.substring(0, lastIndex) + exportSection + html.substring(lastIndex + sidebarContentEnd.length);
}

fs.writeFileSync('index.html', html);
console.log("Export scripts and UI added.");
