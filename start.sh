#!/bin/bash

# Run Next.js start script in background using nohup
nohup npm run start > output.log 2>&1 &

echo "Next.js app started in background. Logs are in nextjs.log"

