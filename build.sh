#!/bin/bash
echo "minifiying"
java -jar ~/closure/compiler.jar --js=constants.js --js=effects.js --js=backgrounds.js --js=main.js --js_output_file=lazerhead.min.js
