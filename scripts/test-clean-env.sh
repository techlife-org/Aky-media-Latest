#!/bin/bash
# Test with a clean environment

# Unset all MONGODB related environment variables
unset MONGODB_URI

# Manually export variables from .env
export NEXT_PUBLIC_BASE_URL="http://localhost:4000"
export NEXT_PUBLIC_BACKEND_URL="https://server.bitcoops.com"
export MONGODB_URI="mongodb+srv://puffingroup:fKRoteTccn3d2Rtl@techlife.yonsh1a.mongodb.net/aky-media?retryWrites=true&w=majority&appName=techlife"
export JWT_SECRET="AKY_Youth_Program_2025_Super_Secret_JWT_Key_For_Authentication_System_v1.0"
export ADMIN_EMAIL="admin@abbakabiryusuf.com"
export ADMIN_PASSWORD="MasterAKYpassowrd"
export BROADCAST_ADMIN_EMAIL="admin@akymediacenter.com"
export BROADCAST_ADMIN_PASSWORD="BroadcastAdmin2024!"
export BROADCAST_ADMIN_NAME="Broadcast Administrator"
export NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="sirdurx"
export NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="AKYMEDIA"
export NEXT_PUBLIC_CLOUDINARY_API_KEY="296882133542631"
export CLOUDINARY_API_SECRET="89EPbnxfmXwwfClRgYgCmy2p5jA"
export SMTP_HOST="smtp.hostinger.com"
export SMTP_PORT="465"
export SMTP_SECURE="true"
export SMTP_USER="notify@abbakabiryusuf.info"
export SMTP_PASS="Abbakabir2024!"
export SMTP_FROM="notify@abbakabiryusuf.info"
export EMAIL_FROM_NAME="AKY Communication System"
export TERMII_API_KEY="TLhiasBRtIGNICOlyfGjZqVIcqzuTKSoTYZozKPLylxCeIwyjZSkiODLamxsYG"
export NODE_ENV="development"

echo "MONGODB_URI from manual export:"
echo $MONGODB_URI

# Run a simple connection test
node scripts/test-clean-env.js