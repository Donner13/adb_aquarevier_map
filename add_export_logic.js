const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const targetStr = `        // Initial Load parsing URL`;

const exportLogicStr = `        // Export Logic
        function getFilteredDataForExport() {
            const searchQuery = document.getElementById('search-input').value.toLowerCase();
            const mainPartners = [
                'wver', 'schoellershammer', 'smurfit', 'tillmann',
                'rlv', 'eschweiler', 'fiw', 'isa', 'iww'
            ];
            const isMainPartner = (name) => {
                const nameLower = name.toLowerCase();
                return mainPartners.some(p => nameLower.includes(p));
            };

            return geojsonData.features.filter(feature => {
                const props = feature.properties;
                const matchesFilter = activeFilters.has(props.group) || isMainPartner(props.name);
                const matchesSearch = !searchQuery ||
                    props.name.toLowerCase().includes(searchQuery) ||
                    props.group.toLowerCase().includes(searchQuery);
                return matchesFilter && matchesSearch;
            }).map(f => f.properties);
        }

        document.getElementById('export-csv-btn').addEventListener('click', () => {
            const data = getFilteredDataForExport();
            if (data.length === 0) {
                alert("Keine Daten zum Exportieren vorhanden.");
                return;
            }

            const headers = ['Name', 'Organisation', 'Gruppe', 'E-Mail'];
            const csvRows = [headers.join(';')];

            data.forEach(props => {
                const row = [
                    props.name || '',
                    props.organisation || '',
                    props.group || '',
                    props.email || ''
                ].map(val => \`"\${val.toString().replace(/"/g, '""')}"\`);
                csvRows.push(row.join(';'));
            });

            const csvContent = "data:text/csv;charset=utf-8,\\uFEFF" + csvRows.join("\\n");
            const encodedUri = encodeURI(csvContent);

            const today = new Date().toISOString().split('T')[0];
            const filename = \`Akteure_\${today}.csv\`;

            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });

        document.getElementById('export-pdf-btn').addEventListener('click', () => {
            const data = getFilteredDataForExport();
            if (data.length === 0) {
                alert("Keine Daten zum Exportieren vorhanden.");
                return;
            }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            doc.setFontSize(18);
            doc.text("AquaRevier Akteursliste", 14, 22);
            doc.setFontSize(11);
            doc.text(\`Gefilterte Ergebnisse: \${data.length} Akteure\`, 14, 30);

            const tableData = data.map(props => [
                props.name || '',
                props.organisation || '',
                props.group || '',
                props.email || ''
            ]);

            doc.autoTable({
                startY: 36,
                head: [['Name', 'Organisation', 'Gruppe', 'E-Mail']],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [79, 70, 229] },
                styles: { fontSize: 9 }
            });

            const today = new Date().toISOString().split('T')[0];
            doc.save(\`Akteure_\${today}.pdf\`);
        });

` + targetStr;

html = html.replace(targetStr, exportLogicStr);

fs.writeFileSync('index.html', html);
console.log("Export logic added.");
