#!/bin/bash
# Completely fresh test with new shell

# Start with completely clean environment
env -i /bin/bash -l -c "
  echo '=== Fresh Shell Test ==='
  echo 'MONGODB_URI in fresh shell: ' \$MONGODB_URI
  
  # Load only our .env file
  source .env
  echo 'MONGODB_URI after sourcing .env: ' \$MONGODB_URI
  
  # Test Node.js with clean environment
  node -e '
    require(\"dotenv\").config();
    console.log(\"MONGODB_URI from dotenv:\", process.env.MONGODB_URI);
  '
"