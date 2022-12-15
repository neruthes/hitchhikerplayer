#!/bin/bash

files="index.html about.html
music.js utaware.tsv
"

if [[ ! -z "$1" ]]; then
    files="$*"
fi

for fn in $files; do
    curl https://staphylococcus.aureus.ga/Player/$fn > $fn
done
