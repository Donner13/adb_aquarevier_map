/**
 * js/modules/wms_loader.js
 * Provides shared WMS Layer creation functions for both index.html and internal.html.
 */

/**
 * Configuration object for Web Map Service (WMS) tile layers.
 */
window.WMS_LAYERS_CONFIG = {
    baseWebAtlas: {
        url: "https://sgx.geodatenzentrum.de/wms_topplus_open",
        options: {
            layers: 'web',
            format: 'image/png',
            transparent: false,
            attribution: "&copy; BKG / Geodatenzentrum"
        }
    },
    wmsBorders: {
        url: "https://www.wms.nrw.de/geobasis/wms_nw_dvg",
        options: {
            layers: 'nw_dvg_la,nw_dvg_k', // Landesgrenze (la) und Kreisgrenzen (k)
            format: 'image/png',
            transparent: true,
            opacity: 0.6,
            attribution: "Geobasis NRW"
        }
    },
    wmsRivers: {
        url: "https://www.wms.nrw.de/umwelt/gsk3e",
        options: {
            layers: 'gsk3e_hauptgewaesser_seen,gsk3e_hauptgewaesser_linien',
            format: 'image/png',
            transparent: true,
            opacity: 0.8,
            attribution: "LANUV NRW"
        }
    },
    wmsDetailedRivers: {
        url: "https://www.wms.nrw.de/umwelt/gsk3e",
        options: {
            layers: '2,3,4,5,6,8,9,10',
            format: 'image/png',
            transparent: true,
            opacity: 0.8,
            attribution: "LANUV NRW"
        }
    },
    wmsCatchments: {
        url: "https://www.wms.nrw.de/umwelt/gsk3e",
        options: {
            layers: '0,11',
            format: 'image/png',
            transparent: true,
            opacity: 0.4,
            attribution: "LANUV NRW"
        }
    },
    wmsMining: {
        url: "https://www.wms.nrw.de/wms/bebu",
        options: {
            layers: '19',
            format: 'image/png',
            transparent: true,
            opacity: 0.5,
            attribution: "GD NRW"
        }
    },
    wmsHwgkHaeufig: {
        url: "https://www.wms.nrw.de/umwelt/HW_Gefahrenkarte",
        options: {
            layers: 'Tiefen_Ueberflutungsgebiet_hw',
            format: 'image/png',
            transparent: true,
            opacity: 0.6,
            attribution: "LANUV NRW"
        }
    },
    wmsHwgkHq100: {
        url: "https://www.wms.nrw.de/umwelt/HW_Gefahrenkarte",
        options: {
            layers: 'Tiefen_Ueberflutungsgebiet_mw',
            format: 'image/png',
            transparent: true,
            opacity: 0.6,
            attribution: "LANUV NRW"
        }
    },
    wmsHwgkExtrem: {
        url: "https://www.wms.nrw.de/umwelt/HW_Gefahrenkarte",
        options: {
            layers: 'Tiefen_Ueberflutungsgebiet_nw',
            format: 'image/png',
            transparent: true,
            opacity: 0.6,
            attribution: "LANUV NRW"
        }
    },
    wmsStarkregenEuskirchen: {
        url: "https://starkregen-euskirchen-v11.cismet.de/geoserver/wms",
        options: {
            layers: 'starkregen:L_T100_v1.1_depth3857',
            format: 'image/png',
            transparent: true,
            opacity: 0.6,
            attribution: "Kreis Euskirchen / cismet GmbH"
        }
    }
};


/**
 * Creates a Leaflet WMS tile layer based on a configuration key.
 *
 * @param {string} key - The key representing the desired WMS layer in `window.WMS_LAYERS_CONFIG`.
 * @returns {L.TileLayer.WMS|null} The Leaflet WMS layer instance, or null if the key is unknown.
 */
window.createWmsLayer = function(key) {
    if (!window.WMS_LAYERS_CONFIG[key]) {
        console.error("Unknown WMS layer key:", key);
        return null;
    }
    const config = window.WMS_LAYERS_CONFIG[key];
    return L.tileLayer.wms(config.url, config.options);
};
