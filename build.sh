#!/bin/bash
echo "minifiying"
java -jar ~/closure/compiler.jar --js=effects.js --js=lazerhead.js --js_output_file=lazerhead.min.js
