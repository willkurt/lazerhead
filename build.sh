#!/bin/bash
echo "minifiying"
java -jar ~/closure/compiler.jar --js=src/constants.js --js=src/sound.js --js=src/effects.js --js=src/backgrounds.js --js=src/main.js --js_output_file=lazerhead.min.js
