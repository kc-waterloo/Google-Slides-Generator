#!/usr/bin/env bash
set -euo pipefail

# Release script for Google Slides Generator
# Usage: ./release.sh [patch|minor|major] [--push]
# Default: patch, no push

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

BUMP="${1:-patch}"
PUSH=false

for arg in "$@"; do
	case "$arg" in
		--push) PUSH=true ;;
	esac
done

# Validate bump type
if [[ "$BUMP" != "patch" && "$BUMP" != "minor" && "$BUMP" != "major" ]]; then
	echo "Usage: $0 [patch|minor|major]"
	exit 1
fi

# Ensure working tree is clean
if ! git diff --quiet HEAD; then
	echo "Error: Working tree has uncommitted changes. Commit or stash first."
	exit 1
fi

# Run full validation
echo "Running tests..."
if ! npm run check; then
	echo "Error: Tests, lint, or type-check failed."
	exit 1
fi

# Read current version from root package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "Current version: $CURRENT_VERSION"

# Calculate next version
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"
case "$BUMP" in
	patch)
		PATCH=$((PATCH + 1))
		;;
	minor)
		MINOR=$((MINOR + 1))
		PATCH=0
		;;
	major)
		MAJOR=$((MAJOR + 1))
		MINOR=0
		PATCH=0
		;;
esac
NEXT_VERSION="$MAJOR.$MINOR.$PATCH"
echo "Next version: $NEXT_VERSION ($BUMP)"

# Update all package.json versions
PACKAGES=(
	"package.json"
	"apps/gas/package.json"
	"apps/shared/package.json"
	"apps/web-ui/package.json"
	"apps/desktop/package.json"
)

for pkg in "${PACKAGES[@]}"; do
	if [[ -f "$pkg" ]]; then
		node -e "
			const p = require('./$pkg');
			p.version = '$NEXT_VERSION';
			require('fs').writeFileSync('$pkg', JSON.stringify(p, null, '\t') + '\n');
		"
		echo "  Updated $pkg → $NEXT_VERSION"
	fi
done

# Update workspace dependencies
node -e "
	const root = require('./package.json');
	for (const pkg of ['apps/gas/package.json', 'apps/shared/package.json', 'apps/web-ui/package.json', 'apps/desktop/package.json']) {
		const p = require('./' + pkg);
		for (const [dep, ver] of Object.entries(p.dependencies || {})) {
			if (root.workspaces && dep.startsWith('@gsg/')) {
				p.dependencies[dep] = '$NEXT_VERSION';
			}
		}
		require('fs').writeFileSync(pkg, JSON.stringify(p, null, '\t') + '\n');
	}
"

# Generate changelog from conventional commits, grouped by type
CHANGELOG_FILE="CHANGELOG.md"
echo "# Changelog" > "$CHANGELOG_FILE.tmp"
echo "" >> "$CHANGELOG_FILE.tmp"
echo "## $NEXT_VERSION ($(date +%Y-%m-%d))" >> "$CHANGELOG_FILE.tmp"
echo "" >> "$CHANGELOG_FILE.tmp"

PREV_TAG=$(git describe --tags --abbrev=0 --match="v*" 2>/dev/null || git rev-list --max-parents=0 HEAD)

for GROUP in "feat: Features" "fix: Bug Fixes" "test: Tests" "refactor: Refactoring" "chore: Chores" "docs: Documentation" "ci: CI/CD"; do
	PREFIX="${GROUP%%:*}"
	LABEL="${GROUP#*: }"
	COMMITS=$(git log "$PREV_TAG"..HEAD --no-merges --pretty=format:"%s" | grep -i "^$PREFIX" | sed "s/^$PREFIX//I" | sed 's/^[[:space:]]*//' | sed 's/^://' | sed 's/^[[:space:]]*//')
	if [[ -n "$COMMITS" ]]; then
		echo "### $LABEL" >> "$CHANGELOG_FILE.tmp"
		echo "$COMMITS" | while read -r line; do
			echo "- $line" >> "$CHANGELOG_FILE.tmp"
		done
		echo "" >> "$CHANGELOG_FILE.tmp"
	fi
done

# Remaining commits that don't match any conventional commit type
OTHER=$(git log "$PREV_TAG"..HEAD --no-merges --pretty=format:"%s" | grep -vi "^feat\|^fix\|^test\|^refactor\|^chore\|^docs\|^ci")
if [[ -n "$OTHER" ]]; then
	echo "### Other" >> "$CHANGELOG_FILE.tmp"
	echo "$OTHER" | while read -r line; do
		echo "- $line" >> "$CHANGELOG_FILE.tmp"
	done
	echo "" >> "$CHANGELOG_FILE.tmp"
fi

if [[ -f "$CHANGELOG_FILE" ]]; then
	tail -n +2 "$CHANGELOG_FILE" >> "$CHANGELOG_FILE.tmp"
fi
mv "$CHANGELOG_FILE.tmp" "$CHANGELOG_FILE"

# Commit version bump and changelog
git add -A
git commit -m "chore: release v$NEXT_VERSION"

# Tag
git tag -a "v$NEXT_VERSION" -m "Release v$NEXT_VERSION"

echo ""

if $PUSH; then
	echo "=== Pushing v$NEXT_VERSION ==="
	git push --follow-tags
	echo "=== Pushed! CI/CD will handle GAS deploy and desktop packaging ==="
else
	echo "=== Release v$NEXT_VERSION ready ==="
	echo "Tag: v$NEXT_VERSION"
	echo "Next steps:"
	echo "  ./release.sh $BUMP --push   # Commit + tag + push in one step"
	echo "  git push --follow-tags      # Push to trigger CI/CD release"
fi
