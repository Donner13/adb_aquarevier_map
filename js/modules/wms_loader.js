/**
 * js/modules/wms_loader.js
 * Centralized configuration and creation of external WMS (Web Map Service) layers.
 */

/**
 * Configuration and factory methods for Web Map Service (WMS) tile layers.
 */
window.WMSLoader = {
    /**
     * Creates the Base WebAtlas layer.
     * @returns {L.TileLayer.WMS} The initialized WMS tile layer.
     */
    createBaseWebAtlas: function() {
        return L.tileLayer.wms("https://sgx.geodatenzentrum.de/wms_topplus_open", {
            layers: 'web',
            format: 'image/png',
            transparent: false,
            attribution: "&copy; BKG / Geodatenzentrum"
        });
    },

    /**
     * Creates the WMS Borders layer.
     * @returns {L.TileLayer.WMS} The initialized WMS tile layer.
     */
    createWmsBorders: function() {
        return L.tileLayer.wms("https://www.wms.nrw.de/geobasis/wms_nw_dvg", {
            layers: 'nw_dvg_la,nw_dvg_k', // Landesgrenze (la) und Kreisgrenzen (k)
            format: 'image/png',
            transparent: true,
            opacity: 0.6,
            attribution: "Geobasis NRW"
        });
    },

    /**
     * Creates the WMS Rivers layer.
     * @returns {L.TileLayer.WMS} The initialized WMS tile layer.
     */
    createWmsRivers: function() {
        return L.tileLayer.wms("https://www.wms.nrw.de/umwelt/gsk3e", {
            layers: 'gsk3e_hauptgewaesser_seen,gsk3e_hauptgewaesser_linien',
            format: 'image/png',
            transparent: true,
            opacity: 0.8,
            attribution: "LANUV NRW"
        });
    },

    /**
     * Creates the WMS DetailedRivers layer.
     * @returns {L.TileLayer.WMS} The initialized WMS tile layer.
     */
    createWmsDetailedRivers: function() {
        return L.tileLayer.wms("https://www.wms.nrw.de/umwelt/gsk3e", {
            layers: '2,3,4,5,6,8,9,10',
            format: 'image/png',
            transparent: true,
            opacity: 0.8,
            attribution: "LANUV NRW"
        });
    },

    /**
     * Creates the WMS Catchments layer.
     * @returns {L.TileLayer.WMS} The initialized WMS tile layer.
     */
    createWmsCatchments: function() {
        return L.tileLayer.wms("https://www.wms.nrw.de/umwelt/gsk3e", {
            layers: '0,11',
            format: 'image/png',
            transparent: true,
            opacity: 0.4,
            attribution: "LANUV NRW"
        });
    },

    /**
     * Creates the WMS Mining layer.
     * @returns {L.TileLayer.WMS} The initialized WMS tile layer.
     */
    createWmsMining: function() {
        return L.tileLayer.wms("https://www.wms.nrw.de/wms/bebu", {
            layers: '19',
            format: 'image/png',
            transparent: true,
            opacity: 0.5,
            attribution: "GD NRW"
        });
    },

    /**
     * Creates the WMS HwgkHaeufig layer.
     * @returns {L.TileLayer.WMS} The initialized WMS tile layer.
     */
    createWmsHwgkHaeufig: function() {
        return L.tileLayer.wms("https://www.wms.nrw.de/umwelt/HW_Gefahrenkarte", {
            layers: 'Tiefen_Ueberflutungsgebiet_hw',
            format: 'image/png',
            transparent: true,
            opacity: 0.6,
            attribution: "LANUV NRW"
        });
    },

    /**
     * Creates the WMS HwgkHq100 layer.
     * @returns {L.TileLayer.WMS} The initialized WMS tile layer.
     */
    createWmsHwgkHq100: function() {
        return L.tileLayer.wms("https://www.wms.nrw.de/umwelt/HW_Gefahrenkarte", {
            layers: 'Tiefen_Ueberflutungsgebiet_mw',
            format: 'image/png',
            transparent: true,
            opacity: 0.6,
            attribution: "LANUV NRW"
        });
    },

    /**
     * Creates the WMS HwgkExtrem layer.
     * @returns {L.TileLayer.WMS} The initialized WMS tile layer.
     */
    createWmsHwgkExtrem: function() {
        return L.tileLayer.wms("https://www.wms.nrw.de/umwelt/HW_Gefahrenkarte", {
            layers: 'Tiefen_Ueberflutungsgebiet_nw',
            format: 'image/png',
            transparent: true,
            opacity: 0.6,
            attribution: "LANUV NRW"
        });
    },

    /**
     * Creates the WMS StarkregenEuskirchen layer.
     * @returns {L.TileLayer.WMS} The initialized WMS tile layer.
     */
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
