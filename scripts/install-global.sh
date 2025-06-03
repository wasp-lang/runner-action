#!/bin/bash
set -e  # Exit on error

npm ci
npm run build
FILENAME=$(npm pack --silent)
npm install -g "./$FILENAME"
rm "./$FILENAME"