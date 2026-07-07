
        // Group Color Map
        const groupColors = {
            'Behörde': '#f43f5e',
            'Forschung': '#3b82f6',
            'Gebietskörperschaft': '#fbbf24',
            'Gewerbe/ Industrie': '#d946ef',
            'Landwirtschaft': '#10b981',
            'Netzwerk/ Multiplikator': '#ff007f',
            'Ver-/ Entsorger': '#ff7300',
            'Sonstige': '#8b5cf6',
            'Konsortium': '#1d4ed8'
        };

        // Initialize Map centered on NRW (Düsseldorf / Aachen area)
        const map = L.map('map', {
            zoomControl: false
        }).setView([51.15, 6.75], 9);

        // Position Zoom Control
        L.control.zoom({
            position: 'bottomright'
        }).addTo(map);

        // Base Maps
        const baseLight = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(map);

        const baseDark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        });

        // 2. Base Map: OpenStreetMap Standard
        const baseOsm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });

        // 3. Base Map: WebAtlasDE NRW (Official Base Map from Geobasis NRW)
        const baseWebAtlas = L.tileLayer.wms("https://www.wms.nrw.de/geobasis/wms_nw_webatlasde", {
            layers: 'webatlasde',
            format: 'image/png',
            transparent: false,
            attribution: "Geobasis NRW"
        });

        // 4. Overlays: NRW Administrative Boundaries (Landkreisgrenzen & Landesgrenze)
        const wmsBorders = L.tileLayer.wms("https://www.wms.nrw.de/geobasis/wms_nw_dvg", {
            layers: 'nw_dvg_la,nw_dvg_k', // Landesgrenze (la) und Kreisgrenzen (k)
            format: 'image/png',
            transparent: true,
            opacity: 0.6,
            attribution: "Geobasis NRW"
        }).addTo(map);

        // 5. Overlays: NRW Rivers and Lakes (Gewässernetz)
        const wmsRivers = L.tileLayer.wms("https://www.wms.nrw.de/umwelt/gsk3e", {
            layers: 'gsk3e_hauptgewaesser_seen,gsk3e_hauptgewaesser_linien',
            format: 'image/png',
            transparent: true,
            opacity: 0.8,
            attribution: "LANUV NRW"
        }); // Disabled by default

        // 5b. Overlays: Detailed Rivers (LANUV WMS showing minor/piped streams)
        const wmsDetailedRivers = L.tileLayer.wms("https://www.wms.nrw.de/umwelt/gsk3e", {
            layers: '2,3,4,5,6,8,9,10',
            format: 'image/png',
            transparent: true,
            opacity: 0.8,
            attribution: "LANUV NRW"
        }); // Disabled by default

        // 5c. Overlays: Hydrological Catchments (LANUV WMS showing exact watersheds)
        const wmsCatchments = L.tileLayer.wms("https://www.wms.nrw.de/umwelt/gsk3e", {
            layers: '0,11',
            format: 'image/png',
            transparent: true,
            opacity: 0.4,
            attribution: "LANUV NRW"
        }); // Disabled by default

        // 6. Overlays: Tagebaue / Bergbauberechtigungen Gewinnung (GD NRW)
        const wmsMining = L.tileLayer.wms("https://www.wms.nrw.de/gd/wms_nw_bergbauberechtigungen", {
            layers: 'nw_bergbauberechtigungen_gewinnend',
            format: 'image/png',
            transparent: true,
            opacity: 0.5,
            attribution: "GD NRW"
        });

        // 7. Overlays: Wasserschutzgebiete gesamt (LANUV NRW)
        const wmsWSG = L.tileLayer.wms("https://www.wms.nrw.de/umwelt/wsg", {
            layers: 'wsg_festgesetzt_gesamt',
            format: 'image/png',
            transparent: true,
            opacity: 0.45,
            attribution: "LANUV NRW"
        });

        // 8. Custom Boundary: Untersuchungsgebiet (Landkreise als Hintergrund)
        const boundaryLayer = L.layerGroup().addTo(map);
        fetch('untersuchungsgebiet.geojson')
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(data => {
                L.geoJSON(data, {
                    style: {
                        color: "#4f46e5", // Contrasting dark indigo border
                        weight: 2,
                        dashArray: "5, 5",
                        fillColor: "#818cf8",
                        fillOpacity: 0.08 // Semi-transparent indigo fill
                    }
                }).addTo(boundaryLayer);
            })
            .catch(err => console.log("Landkreis layer not loaded:", err));

        // 8b. Rur Hydrological Catchment Boundary (Echtes Einzugsgebiet)
        const catchmentLayer = L.layerGroup().addTo(map);
        fetch('rur_einzugsgebiet_outline.geojson')
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(data => {
                L.geoJSON(data, {
                    style: {
                        color: "#1e3a8a", // Darker blue border
                        weight: 2.5,
                        fillColor: "#3b82f6", // Medium blue fill matching image
                        fillOpacity: 0.2 // 20% opacity
                    }
                }).addTo(catchmentLayer);
            })
            .catch(err => console.log("Catchment layer not loaded:", err));

        // 9. Custom Rivers: Offizielle Gewässer mit Namen (GeoJSON) - Dynamically rendered based on zoom
        let riverGeoJson = null;
        const riverLayer = L.layerGroup().addTo(map);

        function drawRivers() {
            if (!riverGeoJson) return;
            riverLayer.clearLayers();
            const labeledRivers = new Set();
            const sortedFeatures = [...riverGeoJson.features].sort((a, b) => {
                const lenA = a.geometry && a.geometry.coordinates ? a.geometry.coordinates.length : 0;
                const lenB = b.geometry && b.geometry.coordinates ? b.geometry.coordinates.length : 0;
                return lenB - lenA;
            });

            L.geoJSON({ type: "FeatureCollection", features: sortedFeatures }, {
                filter: function(feature) {
                    const name = feature.properties ? (feature.properties.name || "") : "";
                    const nameLower = name.toLowerCase().trim();
                    const isMainRiver = nameLower === 'rur' || nameLower === 'roer' || 
                                        nameLower === 'inde' || 
                                        nameLower === 'wurm' || 
                                        nameLower === 'erft' || 
                                        nameLower === 'maas' || 
                                        nameLower === 'rhein';
                    
                    const isZoomedOut = map.getZoom() < 11;
                    if (isZoomedOut) {
                        return isMainRiver; // Only show main rivers in overview mode
                    }
                    return true; // Show all when zoomed in
                },
                style: function(feature) {
                    const isZoomedOut = map.getZoom() < 11;
                    return {
                        color: isZoomedOut ? "#2563eb" : "#ff7300", // Blue for main rivers in overview, Orange in detail mode
                        weight: isZoomedOut ? 3.0 : 2.5,
                        opacity: 0.85
                    };
                },
                onEachFeature: function (feature, layer) {
                    let name = "";
                    if (feature.properties) {
                        name = feature.properties.name || "";
                    }
                    if (name && name !== "None" && name !== "undefined") {
                        if (!labeledRivers.has(name)) {
                            layer.bindTooltip(name, {
                                permanent: true,
                                direction: "center",
                                className: "river-label"
                            });
                            labeledRivers.add(name);
                        }
                    }
                }
            }).addTo(riverLayer);
        }

        fetch('gewaesser_rur_official.geojson')
            .then(res => {
                if (res.ok) return res.json();
                throw new Error("Could not load official rivers");
            })
            .then(data => {
                riverGeoJson = data;
                drawRivers();
            })
            .catch(err => console.log("Official river layer not loaded:", err));

        // 9b. Teilgewässer (Kanalisiert) Layer - Loaded from Shapefiles in Orange
        const tgKanalisiertLayer = L.layerGroup();
        fetch('tg_kanalisiert.geojson')
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(data => {
                L.geoJSON(data, {
                    style: {
                        color: "#ff7300", // Orange border
                        weight: 2,
                        fillColor: "#ff7300",
                        fillOpacity: 0.25 // Orange semi-transparent fill
                    },
                    onEachFeature: function(feature, layer) {
                        if (feature.properties && feature.properties.TG_ID) {
                            layer.bindTooltip(`Kanalisiertes Teilgewässer: ${feature.properties.TG_ID}<br>Höhe: ${feature.properties.HOEHE}m`, {
                                sticky: true
                            });
                        }
                    }
                }).addTo(tgKanalisiertLayer);
            })
            .catch(err => console.log("tg_kanalisiert layer not loaded:", err));

        // 9c. Teilgewässer (Natürlich) Layer - Loaded from Shapefiles in Green
        const tgNatuerlichLayer = L.layerGroup();
        fetch('tg_natuerlich.geojson')
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(data => {
                L.geoJSON(data, {
                    style: {
                        color: "#10b981", // Green border
                        weight: 2,
                        fillColor: "#10b981",
                        fillOpacity: 0.2 // Green semi-transparent fill
                    },
                    onEachFeature: function(feature, layer) {
                        if (feature.properties && feature.properties.TG_ID) {
                            layer.bindTooltip(`Natürliches Teilgewässer: ${feature.properties.TG_ID}<br>Höhe: ${feature.properties.HOEHE}m`, {
                                sticky: true
                            });
                        }
                    }
                }).addTo(tgNatuerlichLayer);
            })
            .catch(err => console.log("tg_natuerlich layer not loaded:", err));

        // 9d. Stakeholder 2025 Archiv Layer - Loaded from Shapefiles
        const stakeholder2025Layer = L.layerGroup();
        fetch('contacts_2025_anonymized.geojson')
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(data => {
                L.geoJSON(data, {
                    pointToLayer: function (feature, latlng) {
                        const color = '#94a3b8'; // Slate grey for 2025 archive
                        const size = 10;
                        const border = 1.5;
                        const html = `
                            <div style="
                                width: ${size}px;
                                height: ${size}px;
                                background-color: ${color};
                                border: ${border}px solid #ffffff;
                                border-radius: 50%;
                                box-shadow: 0 0 6px ${color}, 0 0 2px rgba(0,0,0,0.5);
                            "></div>
                        `;
                        const icon = L.divIcon({
                            html: html,
                            className: 'custom-map-marker-2025',
                            iconSize: [size, size],
                            iconAnchor: [size / 2, size / 2]
                        });
                        return L.marker(latlng, { icon: icon });
                    },
                    onEachFeature: function(feature, layer) {
                        const props = feature.properties;
                        let popupContent = `
                            <div class="popup-card">
                                <div class="popup-group" style="color: #94a3b8">Akteur (Stand 2025)</div>
                                <div class="popup-title">${props.name}</div>
                        `;
                        if (props.abbreviation) popupContent += `<div style="font-size: 11px; margin-top:-4px; margin-bottom:6px; color:#cbd5e1">${props.abbreviation}</div>`;
                        popupContent += `<div class="popup-detail">💼 Gruppe: ${props.group}</div>`;
                        if (props.sector) popupContent += `<div class="popup-detail">🏢 Branche: ${props.sector}</div>`;
                        if (props.address) popupContent += `<div class="popup-detail">📍 Adresse: ${props.address}</div>`;
                        if (props.common_projects) popupContent += `<div class="popup-detail">🤝 Projekte: ${props.common_projects}</div>`;
                        popupContent += `</div>`;
                        layer.bindPopup(popupContent);
                    }
                }).addTo(stakeholder2025Layer);
            })
            .catch(err => console.log("2025 stakeholder layer not loaded:", err));

        // Map layer controller
        const baseMaps = {
            "Dunkles Design (Standard)": baseDark,
            "OpenStreetMap": baseOsm,
            "WebAtlasDE NRW (Offiziell)": baseWebAtlas
        };

        const overlayMaps = {
            "Rur Einzugsgebiet (Hydrologisch)": catchmentLayer,
            "Teilgewässer (Kanalisiert) [Orange]": tgKanalisiertLayer,
            "Teilgewässer (Natürlich) [Grün]": tgNatuerlichLayer,
            "Akteure (Stand 2025, Archiv)": stakeholder2025Layer,
            "Landkreisgrenzen (Rheinisches Revier)": boundaryLayer,
            "Eigene Gewässer mit Namen": riverLayer,
            "NRW Landkreise & Grenzen": wmsBorders,
            "Flüsse & Gewässer (LANUV)": wmsRivers,
            "Gewässernetz Detailliert (LANUV)": wmsDetailedRivers,
            "Einzugsgebiete Hydrologisch (LANUV)": wmsCatchments,
            "Tagebaue & Bergbaufelder (GD)": wmsMining,
            "Wasserschutzgebiete (LANUV)": wmsWSG
        };

        L.control.layers(baseMaps, overlayMaps, { position: 'topright' }).addTo(map);

        // Contacts State
        let geojsonData = { type: "FeatureCollection", features: [] };
        let activeFilters = new Set(Object.keys(groupColors));
        let markersLayer = L.layerGroup().addTo(map);

        // Fetch anonymized contacts
        async function loadContacts() {
            try {
                const res = await fetch('contacts_anonymized.geojson');
                if (res.ok) {
                    geojsonData = await res.json();
                    renderMapAndSidebar();
                }
            } catch (err) {
                console.error("Error loading anonymized contacts:", err);
            }
        }

        // Custom marker generator
        function createCustomMarker(lat, lng, color, name, group) {
            const size = 14;
            const border = 2.0;
            
            let html = '';
            if (group === 'Gewerbe/ Industrie' || group === 'Landwirtschaft') {
                // Diamond (Raute) styled using CSS transform
                html = `
                    <div style="
                        width: ${size - 2}px;
                        height: ${size - 2}px;
                        background-color: ${color};
                        border: ${border}px solid #ffffff;
                        transform: rotate(45deg);
                        box-shadow: 0 0 6px ${color}, 0 0 2px rgba(0,0,0,0.5);
                        margin: 2px;
                    "></div>
                `;
            } else if (group === 'Forschung' || group === 'Netzwerk/ Multiplikator' || group === 'Ver-/ Entsorger') {
                // Pentagon (Fünfeck) using clip-path with nested div to simulate border
                html = `
                    <div style="
                        width: ${size + 2}px;
                        height: ${size + 2}px;
                        background-color: #ffffff;
                        clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        box-shadow: 0 0 6px ${color};
                    ">
                        <div style="
                            width: ${size - 2}px;
                            height: ${size - 2}px;
                            background-color: ${color};
                            clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
                        "></div>
                    </div>
                `;
            } else {
                // Circle
                html = `
                    <div style="
                        width: ${size}px;
                        height: ${size}px;
                        background-color: ${color};
                        border: ${border}px solid #ffffff;
                        border-radius: 50%;
                        box-shadow: 0 0 6px ${color}, 0 0 2px rgba(0,0,0,0.5);
                    "></div>
                `;
            }

            const icon = L.divIcon({
                html: html,
                className: 'custom-map-marker',
                iconSize: [size + 4, size + 4],
                iconAnchor: [(size + 4) / 2, (size + 4) / 2]
            });

            return L.marker([lat, lng], { icon: icon });
        }

        // Custom Logo Callout Marker generator
        function createLogoCalloutMarker(lat, lng, name) {
            const nameLower = name.toLowerCase();
            let logoHtml = '';
            let svgContent = '';
            let dx = 0, dy = 0; // Logo box offset from actual point
            let sizeX = 350, sizeY = 250; // Leaflet DivIcon bounding box
            let ax = 175, ay = 125;
            if (nameLower.includes('wver') || nameLower.includes('eifel-rur')) {
                // CENTRAL: WVER (waves writing)
                dx = -75; dy = -50;
                logoHtml = `
                    <div class="logo-box logo-wver-box" style="left: ${ax + dx}px; top: ${ay + dy}px; padding: 3px 6px; background: #ffffff; border: 1.2px solid #0067b1; display: flex; align-items: center; justify-content: center; width: 100px; height: 32px; box-sizing: border-box; box-shadow: 0 1.5px 5px rgba(0,103,177,0.15); border-radius: 4px;">
                        <img src="https://wver.de/wp-content/uploads/2025/08/wver-logo.png" style="max-width: 100%; max-height: 100%; object-fit: contain;" alt="WVER">
                    </div>
                `;
                const targetX = ax + dx + 50;
                const targetY = ay + dy + 16;
                svgContent = `
                    <line x1="${ax}" y1="${ay}" x2="${targetX}" y2="${targetY}" stroke="#475569" stroke-width="1.3" stroke-dasharray="2.5,2.5" />
                    <line x1="${ax}" y1="${ay}" x2="${ax + (targetX - ax)*0.25}" y2="${ay + (targetY - ay)*0.25}" stroke="#0067b1" stroke-width="2" />
                    <circle cx="${ax}" cy="${ay}" r="3.5" fill="#0067b1" stroke="#ffffff" stroke-width="1.2" />
                    <polygon points="${ax},${ay} ${ax + (targetX-ax)*0.09 - (targetY-ay)*0.05},${ay + (targetY-ay)*0.09 + (targetX-ax)*0.05} ${ax + (targetX-ax)*0.09 + (targetY-ay)*0.05},${ay + (targetY-ay)*0.09 - (targetX-ax)*0.05}" fill="#0067b1" />
                `;
            } else if (nameLower.includes('schoellershammer')) {
                // CENTRAL RIGHT: SCHOELLERSHAMMER (Official logo)
                dx = 30; dy = -50;
                logoHtml = `
                    <div class="logo-box logo-schoellershammer-box" style="left: ${ax + dx}px; top: ${ay + dy}px; padding: 3px 6px; background: #ffffff; border: 1.2px solid #000000; display: flex; align-items: center; justify-content: center; width: 130px; height: 32px; box-sizing: border-box; box-shadow: 0 1.5px 5px rgba(0,0,0,0.1); border-radius: 4px;">
                        <img src="https://www.schoellershammer.de/wp-content/themes/schoellershammer/assets/images/logo.png" style="max-width: 100%; max-height: 100%; object-fit: contain;" alt="SCHOELLERSHAMMER">
                    </div>
                `;
                const targetX = ax + dx + 10;
                const targetY = ay + dy + 16;
                svgContent = `
                    <line x1="${ax}" y1="${ay}" x2="${targetX}" y2="${targetY}" stroke="#475569" stroke-width="1.3" stroke-dasharray="2.5,2.5" />
                    <line x1="${ax}" y1="${ay}" x2="${ax + (targetX - ax)*0.25}" y2="${ay + (targetY - ay)*0.25}" stroke="#000000" stroke-width="2" />
                    <circle cx="${ax}" cy="${ay}" r="3.5" fill="#000000" stroke="#ffffff" stroke-width="1.2" />
                    <polygon points="${ax},${ay} ${ax + (targetX-ax)*0.09 - (targetY-ay)*0.05},${ay + (targetY-ay)*0.09 + (targetX-ax)*0.05} ${ax + (targetX-ax)*0.09 + (targetY-ay)*0.05},${ay + (targetY-ay)*0.09 - (targetX-ax)*0.05}" fill="#000000" />
                `;
            } else if (nameLower.includes('smurfit')) {
                // EAST: Smurfit Westrock (Official logo)
                dx = 30; dy = -20;
                logoHtml = `
                    <div class="logo-box logo-smurfit-box" style="left: ${ax + dx}px; top: ${ay + dy}px; padding: 3px 6px; background: #ffffff; border: 1.2px solid #005a9c; display: flex; align-items: center; justify-content: center; width: 120px; height: 32px; box-sizing: border-box; box-shadow: 0 1.5px 5px rgba(0,90,156,0.1); border-radius: 4px;">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/6/61/Smurfit_Westrock_%28logo%29.svg" style="max-width: 100%; max-height: 100%; object-fit: contain;" alt="Smurfit Westrock">
                    </div>
                `;
                const targetX = ax + dx + 10;
                const targetY = ay + dy + 16;
                svgContent = `
                    <line x1="${ax}" y1="${ay}" x2="${targetX}" y2="${targetY}" stroke="#475569" stroke-width="1.3" stroke-dasharray="2.5,2.5" />
                    <line x1="${ax}" y1="${ay}" x2="${ax + (targetX - ax)*0.25}" y2="${ay + (targetY - ay)*0.25}" stroke="#005a9c" stroke-width="2" />
                    <circle cx="${ax}" cy="${ay}" r="3.5" fill="#005a9c" stroke="#ffffff" stroke-width="1.2" />
                    <polygon points="${ax},${ay} ${ax + (targetX-ax)*0.09 - (targetY-ay)*0.05},${ay + (targetY-ay)*0.09 + (targetX-ax)*0.05} ${ax + (targetX-ax)*0.09 + (targetY-ay)*0.05},${ay + (targetY-ay)*0.09 - (targetX-ax)*0.05}" fill="#005a9c" />
                `;
            } else if (nameLower.includes('tillmann') || nameLower.includes('tillman')) {
                // EAST BELOW: Papierfabrik Tillmann (pure blue sans-serif text)
                dx = 20; dy = 20;
                logoHtml = `
                    <div class="logo-box logo-tillmann-box" style="left: ${ax + dx}px; top: ${ay + dy}px; border: 1.2px solid #1d4ed8; display: flex; flex-direction: column; align-items: center; padding: 3px 8px; background: #ffffff; border-radius: 4px; box-shadow: 0 1.5px 5px rgba(29,78,216,0.1); width: 110px; height: 32px; box-sizing: border-box; justify-content: center; gap: 0px;">
                        <div style="font-family:'Outfit',sans-serif; font-weight:900; font-size:7px; letter-spacing:0.07em; color:#1d4ed8; text-transform:uppercase; border-bottom: 1.5px solid #1d4ed8; line-height: 1.0; margin-bottom: 2px; padding-bottom: 1px;">PAPIERFABRIK</div>
                        <div style="font-family:'Outfit',sans-serif; font-weight:900; font-size:12px; letter-spacing:0.04em; color:#1d4ed8; text-transform:uppercase; line-height: 1.0;">TILLMANN</div>
                    </div>
                `;
                const targetX = ax + dx + 10;
                const targetY = ay + dy + 16;
                svgContent = `
                    <line x1="${ax}" y1="${ay}" x2="${targetX}" y2="${targetY}" stroke="#475569" stroke-width="1.3" stroke-dasharray="2.5,2.5" />
                    <line x1="${ax}" y1="${ay}" x2="${ax + (targetX - ax)*0.25}" y2="${ay + (targetY - ay)*0.25}" stroke="#1d4ed8" stroke-width="2" />
                    <circle cx="${ax}" cy="${ay}" r="3.5" fill="#1d4ed8" stroke="#ffffff" stroke-width="1.2" />
                    <polygon points="${ax},${ay} ${ax + (targetX-ax)*0.09 - (targetY-ay)*0.05},${ay + (targetY-ay)*0.09 + (targetX-ax)*0.05} ${ax + (targetX-ax)*0.09 + (targetY-ay)*0.05},${ay + (targetY-ay)*0.09 - (targetX-ax)*0.05}" fill="#1d4ed8" />
                `;
            } else if (nameLower.includes('rlv') || nameLower.includes('landwirtschafts-verband')) {
                // NORTH: RLV (Official logo)
                dx = -60; dy = -70;
                logoHtml = `
                    <div class="logo-box logo-rlv-box" style="left: ${ax + dx}px; top: ${ay + dy}px; padding: 3px 6px; background: #ffffff; border: 1.2px solid #15803d; display: flex; align-items: center; justify-content: center; width: 90px; height: 32px; box-sizing: border-box; box-shadow: 0 1.5px 5px rgba(21,128,61,0.15); border-radius: 4px;">
                        <img src="https://www.rlv.de/wp-content/themes/rlv_template_final/assets/img/logo_rlv.png" style="max-width: 100%; max-height: 100%; object-fit: contain;" alt="RLV">
                    </div>
                `;
                const targetX = ax + dx + 45;
                const targetY = ay + dy + 16;
                svgContent = `
                    <line x1="${ax}" y1="${ay}" x2="${targetX}" y2="${targetY}" stroke="#475569" stroke-width="1.3" stroke-dasharray="2.5,2.5" />
                    <line x1="${ax}" y1="${ay}" x2="${ax + (targetX - ax)*0.25}" y2="${ay + (targetY - ay)*0.25}" stroke="#15803d" stroke-width="2" />
                    <circle cx="${ax}" cy="${ay}" r="3.5" fill="#15803d" stroke="#ffffff" stroke-width="1.2" />
                    <polygon points="${ax},${ay} ${ax + (targetX-ax)*0.09 - (targetY-ay)*0.05},${ay + (targetY-ay)*0.09 + (targetX-ax)*0.05} ${ax + (targetX-ax)*0.09 + (targetY-ay)*0.05},${ay + (targetY-ay)*0.09 - (targetX-ax)*0.05}" fill="#15803d" />
                `;
            } else if (nameLower.includes('eschweiler')) {
                // WEST: Stadt Eschweiler (Official Wappen)
                dx = -140; dy = -20;
                logoHtml = `
                    <div class="logo-box logo-eschweiler-box" style="left: ${ax + dx}px; top: ${ay + dy}px; padding: 3px 6px; background: #ffffff; border: 1.2px solid #1d4ed8; display: flex; align-items: center; justify-content: center; width: 140px; height: 36px; box-sizing: border-box; box-shadow: 0 1.5px 5px rgba(29,78,216,0.15); border-radius: 4px; gap: 6px;">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/DEU_Eschweiler_COA.svg" style="max-width: 24px; max-height: 100%; object-fit: contain;" alt="Stadt Eschweiler">
                        <span style="font-family:'Outfit',sans-serif; font-weight:800; font-size:10px; color:#1d4ed8; letter-spacing:0.02em; line-height: 1.1; text-align: left;">STADT<br>ESCHWEILER</span>
                    </div>
                `;
                const targetX = ax + dx + 110;
                const targetY = ay + dy + 18;
                svgContent = `
                    <line x1="${ax}" y1="${ay}" x2="${targetX}" y2="${targetY}" stroke="#475569" stroke-width="1.3" stroke-dasharray="2.5,2.5" />
                    <line x1="${ax}" y1="${ay}" x2="${ax + (targetX - ax)*0.25}" y2="${ay + (targetY - ay)*0.25}" stroke="#1d4ed8" stroke-width="2" />
                    <circle cx="${ax}" cy="${ay}" r="3.5" fill="#1d4ed8" stroke="#ffffff" stroke-width="1.2" />
                    <polygon points="${ax},${ay} ${ax + (targetX-ax)*0.09 - (targetY-ay)*0.05},${ay + (targetY-ay)*0.09 + (targetX-ax)*0.05} ${ax + (targetX-ax)*0.09 + (targetY-ay)*0.05},${ay + (targetY-ay)*0.09 - (targetX-ax)*0.05}" fill="#1d4ed8" />
                `;
            } else if (nameLower.includes('fiw') || nameLower.includes('isa') || nameLower.includes('iww')) {
                // SOUTH-WEST: RWTH Institute (Combined logo box using the uploaded crop)
                dx = -120; dy = 20;
                logoHtml = `
                    <div class="logo-box logo-combined-box" style="left: ${ax + dx}px; top: ${ay + dy}px; padding: 2px; border: 1.2px solid #000000; border-radius: 4px; display: flex; align-items: center; justify-content: center; width: 110px; height: 52px; box-sizing: border-box; box-shadow: 0 1.5px 5px rgba(0,0,0,0.15); background: #ffffff;">
                        <img src="isa_iww_fiw.png" style="width: 100%; height: 100%; object-fit: contain;" alt="ISA / IWW / FiW">
                    </div>
                `;
                // Double arrow pointers pointing up-right from box (dx + 90, dy + 12)
                const startX = ax + dx + 90;
                const startY = ay + dy + 12;
                // Target 1: actual point (ax, ay)
                // Target 2: neighboring point (ax + 25, ay - 18)
                const t2x = ax + 25;
                const t2y = ay - 18;
                svgContent = `
                    <!-- Arrow 1 (to Aachen Center) -->
                    <line x1="${startX}" y1="${startY}" x2="${ax}" y2="${ay}" stroke="#475569" stroke-width="1.2" stroke-dasharray="2,2" />
                    <line x1="${startX}" y1="${startY}" x2="${startX + (ax - startX)*0.3}" y2="${startY + (ay - startY)*0.3}" stroke="#1d4ed8" stroke-width="1.8" />
                    <circle cx="${ax}" cy="${ay}" r="3" fill="#1d4ed8" stroke="#ffffff" stroke-width="1" />
                    <polygon points="${ax},${ay} ${ax - 6},${ay + 3} ${ax - 3},${ay + 6}" fill="#1d4ed8" />

                    <!-- Arrow 2 (to Städteregion Aachen area) -->
                    <line x1="${startX}" y1="${startY}" x2="${t2x}" y2="${t2y}" stroke="#475569" stroke-width="1.2" stroke-dasharray="2,2" />
                    <line x1="${startX}" y1="${startY}" x2="${startX + (t2x - startX)*0.3}" y2="${startY + (t2y - startY)*0.3}" stroke="#16a34a" stroke-width="1.8" />
                    <circle cx="${t2x}" cy="${t2y}" r="3" fill="#16a34a" stroke="#ffffff" stroke-width="1" />
                    <polygon points="${t2x},${t2y} ${t2x - 6},${t2y + 3} ${t2x - 3},${t2y + 6}" fill="#16a34a" />
                `;
            } else {
                return null;
            }

            const html = `
                <div class="logo-callout-container">
                    <svg width="${sizeX}" height="${sizeY}" style="position: absolute; left: 0; top: 0; pointer-events: none; overflow: visible;">
                        ${svgContent}
                    </svg>
                    ${logoHtml}
                </div>
            `;

            const icon = L.divIcon({
                html: html,
                className: 'logo-callout-marker',
                iconSize: [sizeX, sizeY],
                iconAnchor: [ax, ay]
            });

            return L.marker([lat, lng], { icon: icon });
        }

        // Render Sidebar and Markers
        function renderMapAndSidebar() {
            markersLayer.clearLayers();
            const listContainer = document.getElementById('contact-list-container');
            listContainer.innerHTML = '';

            const searchQuery = document.getElementById('search-input').value.toLowerCase();

            const mainPartners = [
                'wver',
                'schoellershammer',
                'smurfit',
                'tillmann',
                'rlv',
                'eschweiler',
                'fiw',
                'isa',
                'iww'
            ];

            const isMainPartner = (name) => {
                const nameLower = name.toLowerCase();
                return mainPartners.some(p => nameLower.includes(p));
            };

            // Filter features
            const filteredFeatures = geojsonData.features.filter(feature => {
                const props = feature.properties;
                const matchesFilter = activeFilters.has(props.group) || isMainPartner(props.name);
                
                const matchesSearch = !searchQuery || 
                    props.name.toLowerCase().includes(searchQuery) ||
                    props.group.toLowerCase().includes(searchQuery);
                return matchesFilter && matchesSearch;
            });

            // Update Counter
            document.getElementById('contacts-count').innerText = 
                `${filteredFeatures.length} von ${geojsonData.features.length} Institutionen angezeigt`;

            if (filteredFeatures.length === 0) {
                listContainer.innerHTML = `<div class="info-msg">Keine Institutionen entsprechen den Kriterien</div>`;
            }

            const getCleanPartnerLabel = (name) => {
                const nameLower = name.toLowerCase();
                if (nameLower.includes('wver') || nameLower.includes('eifel-rur')) return 'WVER';
                if (nameLower.includes('schoellershammer')) return 'SCHOELLERSHAMMER';
                if (nameLower.includes('smurfit')) return 'Smurfit Westrock';
                if (nameLower.includes('tillmann') || nameLower.includes('tillman')) return 'PAPIERFABRIK TILLMANN';
                if (nameLower.includes('rlv') || nameLower.includes('landwirtschafts-verband')) return 'RLV';
                if (nameLower.includes('eschweiler')) return 'STADT ESCHWEILER';
                if (nameLower.includes('fiw') || nameLower.includes('isa') || nameLower.includes('iww')) return 'ISA / IWW / FiW';
                return name;
            };

            filteredFeatures.forEach(feature => {
                const [lng, lat] = feature.geometry.coordinates;
                const props = feature.properties;
                const color = groupColors[props.group] || '#8b5cf6';

                // Add Marker to Map
                let marker;
                if (isMainPartner(props.name)) {
                    marker = createLogoCalloutMarker(lat, lng, props.name);
                } else {
                    marker = createCustomMarker(lat, lng, color, props.name, props.group);
                }
                
                const popupContent = `
                    <div class="popup-card">
                        <div class="popup-group" style="color: ${color}">${props.group}</div>
                        <div class="popup-title">${props.name}</div>
                        <div class="popup-detail" style="font-family: monospace; font-size:10px; margin-top: 6px;">
                            📍 ${lat.toFixed(6)}, ${lng.toFixed(6)}
                        </div>
                    </div>
                `;
                marker.bindPopup(popupContent);
                markersLayer.addLayer(marker);

                // Add Item to Sidebar
                const item = document.createElement('div');
                const safeGroupClass = props.group.toLowerCase().replace(/[\s\/]/g, '_');
                item.className = `contact-item ${safeGroupClass}`;
                item.innerHTML = `
                    <div class="contact-name">
                        <span>${props.name}</span>
                        <span class="contact-group-badge badge-${props.group.toLowerCase().split('/')[0].trim().replace(/\s/g, '')}">${props.group}</span>
                    </div>
                    <div class="contact-coords">
                        <span>Lat: ${lat.toFixed(4)}</span>
                        <span>Lng: ${lng.toFixed(4)}</span>
                    </div>
                `;

                item.addEventListener('click', () => {
                    map.panTo([lat, lng]);
                    marker.openPopup();
                });

                listContainer.appendChild(item);
            });
        }

        // Filter button toggle logic
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const group = btn.getAttribute('data-group');
                if (!group) return;

                if (group === 'all') {
                    const isAnyInactive = activeFilters.size < Object.keys(groupColors).length;
                    document.querySelectorAll('.filter-btn[data-group]').forEach(b => {
                        const bg = b.getAttribute('data-group');
                        if (bg === 'all') return;
                        if (isAnyInactive) {
                            b.classList.add('active');
                            activeFilters.add(bg);
                        } else {
                            b.classList.remove('active');
                            activeFilters.delete(bg);
                        }
                    });
                } else {
                    if (activeFilters.has(group)) {
                        activeFilters.delete(group);
                        btn.classList.remove('active');
                    } else {
                        activeFilters.add(group);
                        btn.classList.add('active');
                    }
                }
                
                // Update All btn active state
                const allBtn = document.querySelector('.filter-btn[data-group="all"]');
                if (activeFilters.size === Object.keys(groupColors).length) {
                    allBtn.classList.add('active');
                } else {
                    allBtn.classList.remove('active');
                }

                renderMapAndSidebar();
            });
        });

        // Search trigger
        document.getElementById('search-input').addEventListener('input', renderMapAndSidebar);

        baseMaps["Helles Design"] = baseLight;

        const themeToggle = document.getElementById('theme-toggle');
        let isDarkMode = false;

        themeToggle.addEventListener('click', () => {
            isDarkMode = !isDarkMode;
            if (isDarkMode) {
                document.body.classList.remove('light-theme');
                themeToggle.innerText = '☀️';
                if (map.hasLayer(baseLight)) map.removeLayer(baseLight);
                baseDark.addTo(map);
            } else {
                document.body.classList.add('light-theme');
                themeToggle.innerText = '🌙';
                if (map.hasLayer(baseDark)) map.removeLayer(baseDark);
                baseLight.addTo(map);
            }
        });

        // Rerender when zoom changes to show/hide details dynamically
        map.on('zoomend', () => {
            renderMapAndSidebar();
            drawRivers();
        });

        // Initial Load
        loadContacts();
    