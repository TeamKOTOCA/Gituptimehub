#!/bin/bash

# メインループ
while true; do
  node ./scripts/checks/index.js
  sleep 1
done
