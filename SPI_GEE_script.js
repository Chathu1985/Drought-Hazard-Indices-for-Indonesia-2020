// ------------------------------------------------------------
// Standardized Precipitation Index (SPI) calculation
// Google Earth Engine JavaScript
//
// Part of a cloud-based workflow for drought-related analysis.
// Example study area: Indonesia
// ------------------------------------------------------------

// Load country boundaries
var countries = ee.FeatureCollection("FAO/GAUL/2015/level0");

// Select example study area
var AOI = countries.filter(ee.Filter.eq('ADM0_NAME', 'Indonesia'));

// Color palettes
var red2blue = ['a60027', 'de3e2c', 'fa8b50', 'ffd485', 'e1e1e1', 'd3edf5', '90c4de', '5183bd', '313694'];

var rainfallViz = {
  min: 0,
  max: 25,
  palette: ['B8810B', 'CB8C08', 'FFE47E', 'FFF2C1', 'DAF7A6', 'D2FFFF', '2DE7E7', '00B9D6', '008BD6', '006399']
};

var rainAnomViz = {
  min: 0,
  max: 200,
  palette: red2blue
};

var spiColor = [
  '8B0000',
  'B22222',
  'FF4500',
  'FFA500',
  'FFD700',
  'FFFFFF',
  '98FB98',
  '32CD32',
  '1E90FF',
  '0000CD',
  '00008B'
];

var spiViz = {
  min: -2,
  max: 2,
  palette: spiColor
};

// Define long-term period
var startDate = ee.Date.fromYMD(2019, 12, 1);
var endDate = ee.Date.fromYMD(2020, 2, 29);

// Load long-term precipitation data
var longTerm = ee.ImageCollection('UCSB-CHG/CHIRPS/PENTAD')
  .filterDate(startDate, endDate)
  .filterBounds(AOI);

// Calculate long-term mean and standard deviation
var longMean = longTerm.select('precipitation').mean().clip(AOI);
var longStd = longTerm.select('precipitation').reduce(ee.Reducer.stdDev()).clip(AOI);

// Load current period precipitation data
var currentPeriod = ee.ImageCollection('UCSB-CHG/CHIRPS/PENTAD')
  .filterDate('2020-01-01', '2020-01-31')
  .filterBounds(AOI);

var rainfallNow = currentPeriod.select('precipitation').mean().clip(AOI);

// Calculate rainfall anomaly and SPI
var anomaly = rainfallNow.divide(longMean).multiply(100).rename('Rainfall_Anomaly');
var spi = rainfallNow.subtract(longMean).divide(longStd).rename('SPI');

// Display results
Map.centerObject(AOI, 5);
Map.addLayer(spi, spiViz, 'SPI');
Map.addLayer(AOI, {}, 'Study Area');

// Calculate zonal statistics
var zonalSPI = spi.reduceRegions({
  collection: AOI,
  reducer: ee.Reducer.mean(),
  scale: 90
});

// ------------------------------------------------------------
// Export options
// Uncomment the format you need
// ------------------------------------------------------------

// 1. Export zonal statistics as GeoJSON
/*
Export.table.toDrive({
  collection: zonalSPI,
  description: 'SPI_AOI_GeoJSON',
  fileFormat: 'GeoJSON'
});
*/

// 2. Export zonal statistics as CSV
Export.table.toDrive({
  collection: zonalSPI,
  description: 'SPI_AOI_CSV',
  fileFormat: 'CSV'
});

// 3. Export SPI raster as GeoTIFF
/*
Export.image.toDrive({
  image: spi.clip(AOI),
  description: 'SPI_AOI_GeoTIFF',
  scale: 90,
  maxPixels: 1e10,
  region: AOI.geometry(),
  fileFormat: 'GeoTIFF'
});
*/
