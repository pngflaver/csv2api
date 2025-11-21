#!/bin/bash

# Ports to check
ports=(300 3001 3002)

# Loop through each port
for port in "${ports[@]}"; do
    # Get the PID of the process using the specified port
    pid=$(netstat -tulnp | grep ":$port" | awk '{print $7}' | cut -d'/' -f1)
    
    # Check if a PID was found
    if [ -n "$pid" ]; then
        echo "Killing process with PID $pid on port $port"
        kill -9 $pid  # Force kill the process
    else
        echo "No process found on port $port"
    fi
done
