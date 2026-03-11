// ------------------------------------------------------------
// Vegetation Health Index (VHI) Calculation
// Google Earth Engine JavaScript
//
// Part of a cloud-based workflow for drought indicator analysis.
// Example study area: Indonesia
// ------------------------------------------------------------

// Load administrative boundary dataset
var countries = ee.FeatureCollection("FAO/GAUL/2015/level0");

// Select study area (example: Indonesia)
var AOI = countries.filter(ee.Filter.eq('ADM0_NAME', 'Indonesia'));

// Import MODIS datasets
var lst = ee.ImageCollection("MODIS/006/MOD11A2");
var ndvi = ee.ImageCollection("MODIS/006/MOD13A1");

// Define date range
var startDate = '2020-06-01';
var endDate = '2020-10-31';

// Filter datasets
var ndviFiltered = ndvi
  .select('NDVI')
  .filterDate(startDate, endDate)
  .filterBounds(AOI);

var lstFiltered = lst
  .select('LST_Day_1km')
  .filterDate(startDate, endDate)
  .filterBounds(AOI);

// Apply scale factors
var NDVI = ndviFiltered.map(function(img) {
  return img.multiply(0.0001)
    .copyProperties(img, ['system:time_start']);
});

var LST = lstFiltered.map(function(img) {
  return img.multiply(0.02)
    .subtract(273.15)
    .copyProperties(img, ['system:time_start']);
});

// Calculate overall min and max for NDVI and LST
var ndviMin = NDVI.reduce(ee.Reducer.min());
var ndviMax = NDVI.reduce(ee.Reducer.max());

var lstMin = LST.reduce(ee.Reducer.min());
var lstMax = LST.reduce(ee.Reducer.max());

// Calculate VCI
var VCI = NDVI.map(function(image) {
  return image.expression(
    '(NDVI - NDVImin) / (NDVImax - NDVImin) * 100', {
      NDVI: image,
      NDVImin: ndviMin,
      NDVImax: ndviMax
    })
    .clip(AOI)
    .rename('VCI')
    .copyProperties(image, ['system:time_start'])
    .set('date', image.date().format('YYYY_MM_dd'));
});

// Calculate TCI
var TCI = LST.map(function(image) {
  return image.expression(
    '(LSTmax - LST) / (LSTmax - LSTmin) * 100', {
      LST: image,
      LSTmin: lstMin,
      LSTmax: lstMax
    })
    .clip(AOI)
    .rename('TCI')
    .copyProperties(image, ['system:time_start'])
    .set('date', image.date().format('YYYY_MM_dd'));
});

// Compute mean VCI and TCI over the study period
VCI = VCI.mean().clip(AOI);
TCI = TCI.mean().clip(AOI);

// Combine VCI and TCI
var vciTciStack = VCI.addBands(TCI);

// Calculate VHI
var VHI = vciTciStack.expression(
  'VCI / 2 + TCI / 2', {
    VCI: vciTciStack.select('VCI'),
    TCI: vciTciStack.select('TCI')
  })
  .divide(100)
  .rename('VHI');

// Zonal statistics
var zonalVHI = VHI.reduceRegions({
  collection: AOI,
  reducer: ee.Reducer.mean(),
  scale: 90
});

// Visualization
var vhiVis = {
  min: 0,
  max: 1,
  palette: ['red', 'yellow', 'white', 'green', 'blue']
};

Map.centerObject(AOI, 5);
Map.addLayer(VHI, vhiVis, 'VHI');

// Export zonal statistics
Export.table.toDrive({
  collection: zonalVHI,
  description: 'VHI_AOI',
  fileFormat: 'GeoJSON'
});

/*
// Optional image export
Export.image.toDrive({
  image: VHI.clip(AOI),
  description: 'VHI_AOI_Raster',
  scale: 90,
  maxPixels: 1e10,
  region: AOI.geometry()
});
*/
