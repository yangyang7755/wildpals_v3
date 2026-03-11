#!/bin/bash

# Deploy Email Verification Edge Function to Supabase
# This script deploys the send-verification-email function and sets up required secrets

echo "🚀 Deploying Email Verification Function to Supabase"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found!"
    echo ""
    echo "Install it with:"
    echo "  brew install supabase/tap/supabase"
    echo ""
    echo "Or use npx:"
    echo "  npx supabase [command]"
    exit 1
fi

# Check if logged in
echo "📝 Checking Supabase login status..."
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase"
    echo ""
    echo "Please login first:"
    echo "  supabase login"
    exit 1
fi

echo "✅ Logged in to Supabase"
echo ""

# Check if linked to project
if [ ! -f ".supabase/config.toml" ]; then
    echo "⚠️  Not linked to a Supabase project"
    echo ""
    echo "Linking to project: xikaltnufqbysnrsjzwa"
    supabase link --project-ref xikaltnufqbysnrsjzwa
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to link project"
        exit 1
    fi
fi

echo "✅ Linked to Supabase project"
echo ""

# Check for Resend API key
echo "🔑 Checking for RESEND_API_KEY..."
if supabase secrets list | grep -q "RESEND_API_KEY"; then
    echo "✅ RESEND_API_KEY is already set"
else
    echo "⚠️  RESEND_API_KEY not found"
    echo ""
    read -p "Enter your Resend API key (from https://resend.com/api-keys): " RESEND_KEY
    
    if [ -z "$RESEND_KEY" ]; then
        echo "❌ No API key provided"
        exit 1
    fi
    
    echo "Setting RESEND_API_KEY..."
    supabase secrets set RESEND_API_KEY="$RESEND_KEY"
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to set secret"
        exit 1
    fi
    
    echo "✅ RESEND_API_KEY set successfully"
fi

echo ""
echo "📦 Deploying send-verification-email function..."
supabase functions deploy send-verification-email

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed"
    exit 1
fi

echo ""
echo "✅ Deployment successful!"
echo ""
echo "📋 Next steps:"
echo "1. Test the function with:"
echo "   supabase functions invoke send-verification-email --data '{\"email\":\"test@example.com\",\"userId\":\"test-id\",\"userName\":\"Test User\"}'"
echo ""
echo "2. Update your app to call this function (see EMAIL-VERIFICATION-IMPLEMENTATION.md)"
echo ""
echo "3. Monitor function logs:"
echo "   supabase functions logs send-verification-email"
echo ""
