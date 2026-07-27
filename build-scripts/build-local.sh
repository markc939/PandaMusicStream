#!/bin/bash
# Build script for local testing
# Usage: ./build-scripts/build-local.sh <path-to-private-repo>

set -e

PRIVATE_REPO="${1:-../PandaMusicStream_private}"
WORKSPACE_NAME="PandaMusicStreamer"

echo "=== Building unsigned IPA ==="
echo "Private repo: $PRIVATE_REPO"

# Check private repo exists
if [ ! -d "$PRIVATE_REPO" ]; then
  echo "ERROR: Private repo not found at $PRIVATE_REPO"
  exit 1
fi

# Install dependencies
echo "Installing dependencies..."
cd "$PRIVATE_REPO"
npm ci --legacy-peer-deps

# Expo prebuild
echo "Running expo prebuild..."
npx expo prebuild --platform ios --clean

# Install CocoaPods
echo "Installing CocoaPods..."
cd ios
pod install

# Patch ExpoModulesJSI (fails in CI)
echo "Patching ExpoModulesJSI..."
find Pods -path "*ExpoModulesJSI*" -name "*.sh" -type f 2>/dev/null | while read f; do
  echo "#!/bin/bash" > "$f"
  echo 'exit 0' >> "$f"
  chmod +x "$f"
done

# Find workspace and scheme
WORKSPACE=$(ls -d *.xcworkspace | head -1)
SCHEME=$(xcodebuild -workspace "$WORKSPACE" -list | sed -n '/Schemes:/,/Targets:/p' | grep -v "Schemes:" | grep -v "Targets:" | head -1 | xargs)

echo "Workspace: $WORKSPACE"
echo "Scheme: $SCHEME"

# Build
echo "Building..."
xcodebuild \
  -workspace "$WORKSPACE" \
  -scheme "$SCHEME" \
  -configuration Debug \
  -sdk iphoneos \
  -derivedDataPath build \
  -clean \
  CODE_SIGN_IDENTITY="-" \
  CODE_SIGNING_REQUIRED=NO

# Create IPA
APP_PATH=$(find build/Build/Products/Debug-iphoneos -name "*.app" -maxdepth 1 | head -1)
if [ -z "$APP_PATH" ]; then
  echo "ERROR: No .app found"
  exit 1
fi

echo "Creating IPA..."
cd ..
mkdir -p Payload
cp -r "$PRIVATE_REPO/ios/$APP_PATH" Payload/
zip -r PandaMusicStreamer.ipa Payload
rm -rf Payload

echo "=== Done ==="
echo "IPA: $(pwd)/PandaMusicStreamer.ipa"
ls -lh PandaMusicStreamer.ipa
