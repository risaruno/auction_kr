#!/bin/bash

# Find the PID of the process listening on port 3000 using netstat
PID=$(netstat -tulpn 2>/dev/null | grep ':3000' | awk '{print $7}' | cut -d'/' -f1)

if [ -z "$PID" ]; then
  echo "❌ No process found on port 3000."
else
  echo "�� Stopping process with PID $PID on port 3000..."
  kill -9 $PID
  echo "✅ Process stopped."
fi

