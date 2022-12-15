#!/bin/bash

files="index.html music.js utaware.tsv"

for fn in $files; do
    curl https://staphylococcus.aureus.ga/Player/$fn > $fn
done
