#!/bin/bash
set -euo pipefail

# Script to create a sealed secret for GitHub Container Registry authentication
# for the Sikyon app in the burnside namespace

NAMESPACE="burnside"
SECRET_NAME="ghcr-secret"
SEALED_SECRET_FILE="infra/k8s/base/ghcr-sealed-secret.yaml"

echo "==================================================================="
echo "GitHub Container Registry (GHCR) Sealed Secret Generator"
echo "==================================================================="
echo ""
echo "This script will create a sealed secret for pulling private images"
echo "from GitHub Container Registry for the Sikyon app."
echo ""
echo "You will need:"
echo "  1. Your GitHub username"
echo "  2. A GitHub Personal Access Token (PAT) with 'read:packages' scope"
echo ""
echo "To create a PAT:"
echo "  1. Go to: https://github.com/settings/tokens/new"
echo "  2. Note: 'GHCR read access for k8s'"
echo "  3. Expiration: 90 days (or your preference)"
echo "  4. Select scope: read:packages"
echo "  5. Generate token and copy it"
echo ""
read -p "Press Enter to continue..."

# Prompt for credentials
read -p "Enter your GitHub username: " GITHUB_USERNAME
read -sp "Enter your GitHub PAT: " GITHUB_TOKEN
echo ""

if [ -z "$GITHUB_USERNAME" ] || [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ Error: Username and token are required"
    exit 1
fi

echo ""
echo "Creating sealed secret..."

# Create temporary docker-registry secret and seal it
kubectl create secret docker-registry "$SECRET_NAME" \
  --docker-server=ghcr.io \
  --docker-username="$GITHUB_USERNAME" \
  --docker-password="$GITHUB_TOKEN" \
  --docker-email="$GITHUB_USERNAME@users.noreply.github.com" \
  --namespace="$NAMESPACE" \
  --dry-run=client -o yaml | \
  kubeseal --format yaml --namespace="$NAMESPACE" > "$SEALED_SECRET_FILE"

echo "✅ Sealed secret created: $SEALED_SECRET_FILE"
echo ""
echo "Next steps:"
echo "  1. Add 'ghcr-sealed-secret.yaml' to kustomization.yaml resources"
echo "  2. Commit and push to trigger ArgoCD sync"
echo ""
echo "The sealed secret is safe to commit to Git."
