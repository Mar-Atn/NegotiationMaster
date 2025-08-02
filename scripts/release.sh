#!/bin/bash

# NegotiationMaster Release Script
# Usage: ./scripts/release.sh [major|minor|patch]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default to patch if no argument provided
RELEASE_TYPE=${1:-patch}

echo -e "${GREEN}🚀 Starting NegotiationMaster release process...${NC}"

# Verify we're on develop branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "develop" ]; then
    echo -e "${RED}❌ Error: Must be on develop branch to create release${NC}"
    exit 1
fi

# Ensure working directory is clean
if ! git diff-index --quiet HEAD --; then
    echo -e "${RED}❌ Error: Working directory not clean. Commit or stash changes.${NC}"
    exit 1
fi

# Pull latest changes
echo -e "${YELLOW}📥 Pulling latest changes...${NC}"
git pull origin develop

# Get current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "${YELLOW}📋 Current version: $CURRENT_VERSION${NC}"

# Calculate new version
case $RELEASE_TYPE in
    major)
        NEW_VERSION=$(npm version major --no-git-tag-version)
        ;;
    minor)
        NEW_VERSION=$(npm version minor --no-git-tag-version)
        ;;
    patch)
        NEW_VERSION=$(npm version patch --no-git-tag-version)
        ;;
    *)
        echo -e "${RED}❌ Error: Invalid release type. Use major, minor, or patch${NC}"
        exit 1
        ;;
esac

# Remove 'v' prefix from npm version output
NEW_VERSION=${NEW_VERSION#v}
echo -e "${GREEN}🆕 New version: $NEW_VERSION${NC}"

# Update frontend package.json
echo -e "${YELLOW}📝 Updating frontend version...${NC}"
cd frontend
npm version $NEW_VERSION --no-git-tag-version
cd ..

# Update backend package.json  
echo -e "${YELLOW}📝 Updating backend version...${NC}"
cd backend
npm version $NEW_VERSION --no-git-tag-version
cd ..

# Create release branch
RELEASE_BRANCH="release/v$NEW_VERSION"
echo -e "${YELLOW}🌿 Creating release branch: $RELEASE_BRANCH${NC}"
git checkout -b $RELEASE_BRANCH

# Update CHANGELOG.md
echo -e "${YELLOW}📝 Updating CHANGELOG.md...${NC}"
cat > CHANGELOG.md.tmp << EOF
# Changelog

## [v$NEW_VERSION] - $(date +%Y-%m-%d)

### Added
- 

### Changed
- 

### Fixed
- 

### Security
- 

EOF

if [ -f CHANGELOG.md ]; then
    tail -n +2 CHANGELOG.md >> CHANGELOG.md.tmp
else
    echo "All notable changes to this project will be documented in this file." >> CHANGELOG.md.tmp
fi

mv CHANGELOG.md.tmp CHANGELOG.md

# Run tests
echo -e "${YELLOW}🧪 Running tests...${NC}"
cd backend && npm test && cd ..
cd frontend && npm test -- --watchAll=false && cd .. 

# Build frontend
echo -e "${YELLOW}🏗️  Building frontend...${NC}"
cd frontend && npm run build && cd ..

# Commit version changes
echo -e "${YELLOW}💾 Committing version changes...${NC}"
git add .
git commit -m "chore(release): prepare release v$NEW_VERSION"

# Push release branch
echo -e "${YELLOW}📤 Pushing release branch...${NC}"
git push origin $RELEASE_BRANCH

echo -e "${GREEN}✅ Release preparation complete!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Review the release branch: $RELEASE_BRANCH"
echo -e "2. Update CHANGELOG.md with actual changes"
echo -e "3. Create PR from $RELEASE_BRANCH to main"
echo -e "4. After merge, run: git tag v$NEW_VERSION && git push origin v$NEW_VERSION"
echo -e "5. Merge main back to develop"
echo -e "6. Create GitHub release with tag v$NEW_VERSION"