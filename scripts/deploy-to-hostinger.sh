#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 Starting deployment to Hostinger..."

# 1. Load environment variables from .env.deploy if it exists
if [ -f .env.deploy ]; then
  set -a
  source .env.deploy
  set +a
fi

# 2. Check if required SSH variables are set
if [ -z "$HOSTINGER_USER" ] || [ -z "$HOSTINGER_HOST" ] || [ -z "$HOSTINGER_PATH" ]; then
  echo "❌ Error: SSH details are not configured."
  echo "Please create a '.env.deploy' file with the following variables:"
  echo ""
  echo "HOSTINGER_USER=u123456789"
  echo "HOSTINGER_HOST=185.xx.xx.xx"
  echo "HOSTINGER_PATH=domains/yourdomain.com/public_html"
  echo "HOSTINGER_PORT=65002  # 65002 is Hostinger's default SSH port"
  echo ""
  exit 1
fi

PORT="${HOSTINGER_PORT:-65002}"

echo "📦 Building and creating deploy.zip..."
npm run build:hostinger

echo "📤 Uploading deploy.zip to $HOSTINGER_HOST on port $PORT..."
scp -P "$PORT" deploy.zip "$HOSTINGER_USER@$HOSTINGER_HOST:$HOSTINGER_PATH/"

echo "🔧 Extracting and setting up on the remote server..."
# Using a Here-Doc to run commands over SSH
ssh -p "$PORT" "$HOSTINGER_USER@$HOSTINGER_HOST" << EOF
  set -e
  cd "$HOSTINGER_PATH"
  
  echo "Unzipping files..."
  unzip -o deploy.zip
  
  # Clean up the zip file on the server to save space
  rm deploy.zip
  
  echo "Installing production dependencies..."
  source ~/.bashrc 2>/dev/null || true
  source ~/.bash_profile 2>/dev/null || true
  export PATH=$PATH:~/.npm-global/bin:~/.nvm/versions/node/$(nvm current 2>/dev/null)/bin
  
  if command -v npm &> /dev/null; then
    npm install --production
  else
    echo "⚠️ npm command still not found. You will need to click 'NPM Install' inside your Hostinger Web Dashboard!"
  fi
  
  echo "Restarting Node.js application..."
  # LiteSpeed/Passenger typical restart method is to touch tmp/restart.txt
  mkdir -p tmp
  touch tmp/restart.txt
  
  echo "✅ Remote setup completed successfully!"
EOF

echo "🎉 All done! Your app should be live in a few moments."
