/**
 * js/modules/wms_loader.js
 * Centralized configuration and creation of external WMS (Web Map Service) layers.
 */

window.WMSLoader = {
    createBaseWebAtlas: function() {
        return L.tileLayer.wms("https://sgx.geodatenzentrum.de/wms_topplus_open", {
            layers: 'web',
            format: 'image/png',
            transparent: false,
            attribution: "&copy; BKG / Geodatenzentrum"
        });
    },

    createWmsBorders: function() {
        return L.tileLayer.wms("https://www.wms.nrw.de/geobasis/wms_nw_dvg", {
            layers: 'nw_dvg_la,nw_dvg_k', // Landesgrenze (la) und Kreisgrenzen (k)
            format: 'image/png',
            transparent: true,
            opacity: 0.6,
            attribution: "Geobasis NRW"
        });
    },

    createWmsRivers: function() {
        return L.tileLayer.wms("https://www.wms.nrw.de/umwelt/gsk3e", {
            layers: 'gsk3e_hauptgewaesser_seen,gsk3e_hauptgewaesser_linien',
            format: 'image/png',
            transparent: true,
            opacity: 0.8,
            attribution: "LANUV NRW"
        });
    },

    createWmsDetailedRivers: function() {
        return L.tileLayer.wms("https://www.wms.nrw.de/umwelt/gsk3e", {
            layers: '2,3,4,5,6,8,9,10',
            format: 'image/png',
            transparent: true,
            opacity: 0.8,
            attribution: "LANUV NRW"
        });
    },

    createWmsCatchments: function() {
        return L.tileLayer.wms("https://www.wms.nrw.de/umwelt/gsk3e", {
            layers: '0,11',
            format: 'image/png',
            transparent: true,
            opacity: 0.4,
            attribution: "LANUV NRW"
        });
    },

    createWmsMining: function() {
        return L.tileLayer.wms("https://www.wms.nrw.de/wms/bebu", {
            layers: '19',
            format: 'image/png',
            transparent: true,
            opacity: 0.5,
            attribution: "GD NRW"
        });
    },

    createWmsHwgkHaeufig: function() {
        return L.tileLayer.wms("https://www.wms.nrw.de/umwelt/HW_Gefahrenkarte", {
            layers: 'Tiefen_Ueberflutungsgebiet_hw',
            format: 'image/png',
            transparent: true,
            opacity: 0.6,
            attribution: "LANUV NRW"
        });
    },

    createWmsHwgkHq100: function() {
        return L.tileLayer.wms("https://www.wms.nrw.de/umwelt/HW_Gefahrenkarte", {
            layers: 'Tiefen_Ueberflutungsgebiet_mw',
            format: 'image/png',
            transparent: true,
            opacity: 0.6,
            attribution: "LANUV NRW"
        });
    },

    createWmsHwgkExtrem: function() {
        return L.tileLayer.wms("https://www.wms.nrw.de/umwelt/HW_Gefahrenkarte", {
            layers: 'Tiefen_Ueberflutungsgebiet_nw',
            format: 'image/png',
            transparent: true,
            opacity: 0.6,
            attribution: "LANUV NRW"
        });
    },

    createWmsStarkregenEuskirchen: function() {
        return L.tileLayer.wms("https://starkregen-euskirchen-v11.cismet.de/geoserver/wms", {
            layers: 'starkregen:L_T100_v1.1_depth3857',
            format: 'image/png',
            transparent: true,
            opacity: 0.6,
            attribution: "Kreis Euskirchen / cismet GmbH"
        });
    }
};
