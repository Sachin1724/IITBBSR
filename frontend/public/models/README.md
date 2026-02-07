# 3D Models

This directory contains 3D model files used in the simulation.

## Files

- `Earth.glb` - 3D Earth model for the impact simulation visualization (GLB format)

## Usage

Place your `Earth.glb` file in this directory. The file will be automatically loaded by the EarthModel component and accessible at `/models/Earth.glb`.

## Supported Formats

- GLB (recommended) - Binary GLTF format, optimized for web
- GLTF - JSON-based 3D format

## Model Requirements

- The Earth model should be centered at origin (0, 0, 0)
- Recommended size: ~10 units in diameter (will be auto-scaled)
- Include textures embedded in the GLB file for best performance
