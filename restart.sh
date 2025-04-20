#!/bin/bash

PORT=3000

# Find the PID using the port
PID=$(lsof -ti :$PORT)

# Check if PID exists and kill it
if [ -n "$PID" ]; then
    echo "Killing process on port $PORT with PID $PID"
    kill -9 $PID
    echo "Process killed!"
else
    echo "No process found on port $PORT"
fi
