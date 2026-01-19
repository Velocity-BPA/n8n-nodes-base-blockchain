#!/bin/bash
set -e

echo "📦 Installing n8n-nodes-base-blockchain locally..."

# Build the project
./scripts/build.sh

# Create n8n custom directory if it doesn't exist
mkdir -p ~/.n8n/nodes

# Remove existing symlink if present
rm -f ~/.n8n/nodes/n8n-nodes-base-blockchain

# Create symlink
ln -s "$(pwd)" ~/.n8n/nodes/n8n-nodes-base-blockchain

echo "✅ Installation complete!"
echo "🔄 Please restart n8n to load the new node."
