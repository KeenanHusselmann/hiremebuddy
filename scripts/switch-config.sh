#!/bin/bash

# HireMeBuddy Capacitor Configuration Switcher

case "$1" in
  "prod"|"production")
    echo "🚀 Switching to PRODUCTION configuration..."
    cp capacitor.config.ts capacitor.config.current.ts
    echo "✅ Using production config (https://hiremebuddy.app)"
    ;;
  "dev"|"development")
    echo "🔧 Switching to DEVELOPMENT configuration..."
    cp capacitor.config.dev.ts capacitor.config.current.ts
    echo "✅ Using development config (http://localhost:8080)"
    ;;
  *)
    echo "Usage: $0 {prod|dev}"
    echo "  prod - Switch to production configuration (https://hiremebuddy.app)"
    echo "  dev  - Switch to development configuration (http://localhost:8080)"
    exit 1
    ;;
esac

echo ""
echo "📱 Current configuration:"
echo "App ID: $(grep -o '"appId": "[^"]*"' capacitor.config.current.ts 2>/dev/null || echo 'Not found')"
echo "Server URL: $(grep -o '"url": "[^"]*"' capacitor.config.current.ts 2>/dev/null || echo 'Not found')"