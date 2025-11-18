#!/bin/bash

###############################################################################
# Sikyon Shapefile to GeoJSON Batch Converter
#
# This script automatically finds all .shp files in a directory and converts
# them to GeoJSON format using ogr2ogr.
#
# Usage:
#   ./convert-all-shapefiles.sh <input_directory> [output_directory]
#
# Examples:
#   ./convert-all-shapefiles.sh ./sikyon-data/GIS
#   ./convert-all-shapefiles.sh ./sikyon-data/GIS ./backend/public/data
###############################################################################

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if ogr2ogr is installed
if ! command -v ogr2ogr &> /dev/null; then
    echo -e "${RED}Error: ogr2ogr is not installed.${NC}"
    echo ""
    echo "Please install GDAL first:"
    echo "  macOS:          brew install gdal"
    echo "  Ubuntu/Debian:  sudo apt-get install gdal-bin"
    echo "  Windows:        Download from https://gdal.org/"
    exit 1
fi

# Check arguments
if [ $# -lt 1 ]; then
    echo "Usage: $0 <input_directory> [output_directory]"
    echo ""
    echo "Examples:"
    echo "  $0 ./sikyon-data/GIS"
    echo "  $0 ./sikyon-data/GIS ./backend/public/data"
    exit 1
fi

INPUT_DIR="$1"
OUTPUT_DIR="${2:-./geojson-output}"

# Validate input directory
if [ ! -d "$INPUT_DIR" ]; then
    echo -e "${RED}Error: Input directory '$INPUT_DIR' does not exist.${NC}"
    exit 1
fi

# Create output directory if it doesn't exist
if [ ! -d "$OUTPUT_DIR" ]; then
    echo -e "${BLUE}Creating output directory: $OUTPUT_DIR${NC}"
    mkdir -p "$OUTPUT_DIR"
fi

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Sikyon Shapefile to GeoJSON Batch Converter         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Input directory:  ${YELLOW}$INPUT_DIR${NC}"
echo -e "Output directory: ${YELLOW}$OUTPUT_DIR${NC}"
echo ""

# Find all .shp files
echo -e "${BLUE}Searching for shapefiles...${NC}"
shp_files=()
while IFS= read -r -d '' file; do
    shp_files+=("$file")
done < <(find "$INPUT_DIR" -type f -name "*.shp" -print0)

# Check if any shapefiles were found
if [ ${#shp_files[@]} -eq 0 ]; then
    echo -e "${YELLOW}No shapefiles (.shp) found in $INPUT_DIR${NC}"
    exit 0
fi

echo -e "${GREEN}Found ${#shp_files[@]} shapefile(s)${NC}"
echo ""

# Counters
success_count=0
error_count=0
skipped_count=0

# Convert each shapefile
for shp_file in "${shp_files[@]}"; do
    # Get the filename without path and extension
    basename=$(basename "$shp_file" .shp)

    # Get the directory structure relative to input dir
    relative_path=$(dirname "${shp_file#$INPUT_DIR/}")

    # Create subdirectory in output if needed (to preserve structure)
    if [ "$relative_path" != "." ]; then
        mkdir -p "$OUTPUT_DIR/$relative_path"
        output_file="$OUTPUT_DIR/$relative_path/${basename}.geojson"
    else
        output_file="$OUTPUT_DIR/${basename}.geojson"
    fi

    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "Converting: ${YELLOW}$basename.shp${NC}"

    # Check if output file already exists
    if [ -f "$output_file" ]; then
        echo -e "${YELLOW}⚠ Output file already exists. Overwriting...${NC}"
    fi

    # Perform conversion
    if ogr2ogr -f GeoJSON "$output_file" "$shp_file" 2>&1; then
        # Check if file was created and has content
        if [ -f "$output_file" ] && [ -s "$output_file" ]; then
            # Get feature count
            feature_count=$(grep -o '"type":"Feature"' "$output_file" | wc -l)
            file_size=$(du -h "$output_file" | cut -f1)

            echo -e "${GREEN}✓ Success${NC}"
            echo -e "  Output: $output_file"
            echo -e "  Features: $feature_count"
            echo -e "  Size: $file_size"
            ((success_count++))
        else
            echo -e "${RED}✗ Failed: Output file is empty${NC}"
            ((error_count++))
        fi
    else
        echo -e "${RED}✗ Failed: ogr2ogr conversion error${NC}"
        ((error_count++))
    fi
    echo ""
done

# Summary
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Conversion Summary                                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Total shapefiles found: ${BLUE}${#shp_files[@]}${NC}"
echo -e "Successfully converted: ${GREEN}$success_count${NC}"
if [ $error_count -gt 0 ]; then
    echo -e "Failed conversions:     ${RED}$error_count${NC}"
fi
echo ""

if [ $success_count -gt 0 ]; then
    echo -e "${GREEN}GeoJSON files saved to: $OUTPUT_DIR${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "  1. Review the converted files in: $OUTPUT_DIR"
    echo "  2. Copy desired files to: backend/public/data/"
    echo "  3. Restart the backend server"
    echo "  4. Refresh the web application"
fi

# Exit with error code if any conversions failed
if [ $error_count -gt 0 ]; then
    exit 1
fi

exit 0
