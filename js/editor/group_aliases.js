window.updateGroupName = function(group, val) {
    if (window.styleSettings && window.styleSettings.groupNames) {
        window.styleSettings.groupNames[group] = val;
        if (typeof window.updateFilterButtonNames === 'function') window.updateFilterButtonNames();
        if (typeof window.renderMapAndSidebar === 'function') window.renderMapAndSidebar();
        if (typeof window.persistLocal === 'function') window.persistLocal();
    }
};
