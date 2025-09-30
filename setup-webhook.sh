#!/bin/bash

echo "🚀 Setting up Veriff webhook for local development"
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed. Please install it first:"
    echo "   Visit: https://ngrok.com/download"
    echo "   Or install via package manager"
    exit 1
fi

echo "✅ ngrok is installed"
echo ""

# Start backend server in background
echo "🔧 Starting backend server..."
cd job-portal-backend
npm start &
BACKEND_PID=$!

# Wait for server to start
sleep 3

echo "✅ Backend server started (PID: $BACKEND_PID)"
echo ""

# Start ngrok tunnel
echo "🌐 Starting ngrok tunnel..."
ngrok http 5000 &
NGROK_PID=$!

# Wait for ngrok to start
sleep 3

echo "✅ ngrok tunnel started (PID: $NGROK_PID)"
echo ""

# Get the public URL
echo "📡 Getting public URL..."
PUBLIC_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*' | grep -o 'https://[^"]*' | head -1)

if [ -z "$PUBLIC_URL" ]; then
    echo "❌ Could not get ngrok public URL"
    echo "   Please check ngrok status at: http://localhost:4040"
    exit 1
fi

echo "✅ Public URL: $PUBLIC_URL"
echo ""

# Display webhook URL
WEBHOOK_URL="$PUBLIC_URL/api/verification/webhook"
echo "🔗 Webhook URL: $WEBHOOK_URL"
echo ""

echo "📋 Next steps:"
echo "1. Go to your Veriff Customer Portal"
echo "2. Navigate to your integration settings"
echo "3. Set webhook URL to: $WEBHOOK_URL"
echo "4. Select these events:"
echo "   - verification.created"
echo "   - verification.finished"
echo "   - verification.declined"
echo ""

echo "🧪 Test your webhook:"
echo "curl -X POST $WEBHOOK_URL -H 'Content-Type: application/json' -d '{\"test\": \"data\"}'"
echo ""

echo "⏹️  To stop the services:"
echo "   kill $BACKEND_PID $NGROK_PID"
echo ""

echo "🎉 Setup complete! Your webhook is ready for testing."
