#!/bin/bash

echo "Fixing WSL DNS configuration..."
echo ""

# Step 1: Create WSL config
echo "Step 1: Creating /etc/wsl.conf..."
sudo bash -c 'cat > /etc/wsl.conf << EOF
[network]
generateResolvConf = false
EOF'

if [ $? -eq 0 ]; then
    echo "✓ /etc/wsl.conf created"
else
    echo "✗ Failed to create /etc/wsl.conf"
    exit 1
fi

# Step 2: Update DNS servers
echo ""
echo "Step 2: Updating /etc/resolv.conf with Google DNS..."
sudo bash -c 'cat > /etc/resolv.conf << EOF
nameserver 8.8.8.8
nameserver 8.8.4.4
EOF'

if [ $? -eq 0 ]; then
    echo "✓ /etc/resolv.conf updated"
else
    echo "✗ Failed to update /etc/resolv.conf"
    exit 1
fi

# Step 3: Make it immutable
echo ""
echo "Step 3: Making /etc/resolv.conf immutable..."
sudo chattr +i /etc/resolv.conf

if [ $? -eq 0 ]; then
    echo "✓ /etc/resolv.conf is now immutable"
else
    echo "✗ Failed to make /etc/resolv.conf immutable"
    exit 1
fi

echo ""
echo "=========================================="
echo "DNS configuration updated successfully!"
echo "=========================================="
echo ""
echo "IMPORTANT: You must now restart WSL for changes to take effect."
echo ""
echo "Run this command in Windows PowerShell:"
echo "  wsl --shutdown"
echo ""
echo "Then restart WSL and test with:"
echo "  npm run indexer"
echo ""
