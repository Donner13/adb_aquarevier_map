'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const vendorRoot = path.join(root, 'vendor');
const assets = {
  'leaflet/leaflet.js': 'node_modules/leaflet/dist/leaflet.js',
  'leaflet/leaflet.css': 'node_modules/leaflet/dist/leaflet.css',
  'leaflet/images/layers.png': 'node_modules/leaflet/dist/images/layers.png',
  'leaflet/images/layers-2x.png': 'node_modules/leaflet/dist/images/layers-2x.png',
  'leaflet/images/marker-icon.png': 'node_modules/leaflet/dist/images/marker-icon.png',
  'leaflet/images/marker-icon-2x.png': 'node_modules/leaflet/dist/images/marker-icon-2x.png',
  'leaflet/images/marker-shadow.png': 'node_modules/leaflet/dist/images/marker-shadow.png',
  'leaflet-markercluster/leaflet.markercluster.js': 'node_modules/leaflet.markercluster/dist/leaflet.markercluster.js',
  'leaflet-markercluster/MarkerCluster.css': 'node_modules/leaflet.markercluster/dist/MarkerCluster.css',
  'leaflet-markercluster/MarkerCluster.Default.css': 'node_modules/leaflet.markercluster/dist/MarkerCluster.Default.css',
  'popper/popper.min.js': 'node_modules/@popperjs/core/dist/umd/popper.min.js',
  'tippy/tippy-bundle.umd.min.js': 'node_modules/tippy.js/dist/tippy-bundle.umd.min.js',
  'tippy/tippy.css': 'node_modules/tippy.js/dist/tippy.css',
  'docx/index.umd.js': 'node_modules/docx/build/index.umd.js',
  'jspdf/jspdf.umd.min.js': 'node_modules/jspdf/dist/jspdf.umd.min.js',
  'jspdf/jspdf.plugin.autotable.min.js': 'node_modules/jspdf-autotable/dist/jspdf.plugin.autotable.min.js',
  'html2canvas/html2canvas.min.js': 'node_modules/html2canvas/dist/html2canvas.min.js',
};

for (const [destination, source] of Object.entries(assets)) {
  const sourcePath = path.join(root, source);
  const destinationPath = path.join(vendorRoot, destination);
  if (!fs.existsSync(sourcePath)) throw new Error(`Missing vendor source: ${source}`);
  fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
  fs.copyFileSync(sourcePath, destinationPath);
}

console.log(`Vendor assets ready: ${Object.keys(assets).length} files`);
