// ------------------------------------------------------------
// Soil Moisture calculation using SMAP data
// Google Earth Engine JavaScript
//
// Part of a cloud-based workflow for drought-related analysis.
// Example study area: Indonesia
// ------------------------------------------------------------

// Load country boundaries
var countries = ee.FeatureCollection("FAO/GAUL/2015/level0");

// Select study area
var AOI = countries.filter(ee.Filter.eq('ADM0_NAME', 'Indonesia'));

// Define date range
var startDate = '2020-06-01';
var endDate = '2020-10-31';

// Load SMAP soil moisture data
var soilMoisture = ee.ImageCollection("NASA_USDA/HSL/SMAP10KM_soil_moisture")
  .filterDate(startDate, endDate)
  .select('ssm')
  .mean()
  .clip(AOI);

// Visualization parameters
var soilMoistureVis = {
  min: 0,
  max: 25.39,
  palette: ['red', 'yellow', 'white', 'green', 'blue']
};

// Display layer
Map.centerObject(AOI, 5);
Map.addLayer(soilMoisture, soilMoistureVis, 'Soil Moisture');

// Calculate zonal mean soil moisture
var zonalSoilMoisture = soilMoisture.reduceRegions({
  collection: AOI,
  reducer: ee.Reducer.mean(),
  scale: 90
});

// Export zonal statistics
Export.table.toDrive({
  collection: zonalSoilMoisture,
  description: 'SoilMoisture_AOI',
  fileFormat: 'GeoJSON'
});

/*
// Optional raster export
Export.image.toDrive({
  image: soilMoisture,
  description: 'SoilMoisture_AOI_Raster',
  scale: 90,
  maxPixels: 1e10,
  region: AOI.geometry()
});
*/
