# Cloud-based workflow for drought indicator calculation

This repository contains Google Earth Engine (GEE) JavaScript scripts developed as part of a cloud-based open-source workflow for calculating drought-related indicators.

## Purpose
The scripts support automated calculation of drought indicators and preparation of outputs for visualization and dashboard development.

## Study Area
Indonesia is used as the example study area in the scripts. Users can modify the study area to apply the workflow to other regions.

## Data Sources
The scripts use publicly available datasets from the Google Earth Engine catalogue, including MODIS NDVI, MODIS Land Surface Temperature (LST), CHIRPS Pentad: Climate Hazards, Group InfraRed Precipitation with Station Data, 5.56 km, and NASA-USDA Enhanced SMAP Global Soil Moisture Data, 1 km

## Parameters
The repository includes scripts for calculating the following drought indicators:

- Vegetation Health Index (VHI)
- Standardized Precipitation Index (SPI)
- Soil Moisture Index (SMI)

## Zonal Statistics
The scripts calculate zonal statistics for spatial units of analysis. In the original workflow, a custom hexagonal grid was used for the zonal statistics. In the shared example script, administrative boundaries from the FAO GAUL 2015 dataset are used.

The scripts can be adapted by modifying the study area, temporal range, and spatial units.


@ Chathurika Thilakarathna
