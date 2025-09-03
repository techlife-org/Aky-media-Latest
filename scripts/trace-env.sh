#!/bin/bash
# Script to trace where MONGODB_URI is being set

echo "=== Tracing MONGODB_URI Source ==="
echo

echo "1. Current MONGODB_URI value:"
echo "$MONGODB_URI"
echo

echo "2. Checking if it's exported in current shell:"
if export | grep -q MONGODB_URI; then
  export | grep MONGODB_URI
else
  echo "Not exported in current shell"
fi
echo

echo "3. Checking if it's in environment:"
if env | grep -q MONGODB_URI; then
  env | grep MONGODB_URI
else
  echo "Not in environment"
fi
echo

echo "4. Checking if it's in /etc/environment:"
if [ -f /etc/environment ]; then
  grep MONGODB_URI /etc/environment 2>/dev/null || echo "Not in /etc/environment"
else
  echo "/etc/environment does not exist"
fi
echo

echo "5. Checking if it's in /etc/profile:"
grep MONGODB_URI /etc/profile 2>/dev/null || echo "Not in /etc/profile"
echo

echo "6. Checking if it's in any process environment:"
for pid in $(ps -eo pid --no-headers); do
  if [ -r "/proc/$pid/environ" ]; then
    if tr '\0' '\n' < "/proc/$pid/environ" 2>/dev/null | grep -q MONGODB_URI; then
      echo "Found in process $pid: $(ps -p $pid -o comm= 2>/dev/null)"
    fi
  fi
done 2>/dev/null || echo "Cannot check process environments on this system"