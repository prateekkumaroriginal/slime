# Create New Release

Use this command to create a new GitHub release with tag and release notes.

## Steps

1. **Get the last tag and commits since then**:
   ```bash
   git describe --tags --abbrev=0  # Get latest tag
   git log <last-tag>..HEAD --oneline  # Commits since last tag
   ```

2. **Determine version bump** (ask user if unclear):
   - **Major** (v1.0.0 → v2.0.0): Breaking changes
   - **Minor** (v1.0.0 → v1.1.0): New features, backward compatible
   - **Patch** (v1.0.0 → v1.0.1): Bug fixes only

3. **Generate release notes** from commits:
   - Group by type: Features, Fixes, Improvements, Other
   - Use commit messages, clean up formatting
   - Highlight breaking changes if any

4. **Create and push the tag**:
   ```bash
   git tag -a v<version> -m "Release v<version>"
   git push origin v<version>
   ```

5. **Create GitHub release** using `gh`:
   ```bash
   gh release create v<version> --title "v<version>" --notes "$(cat <<'EOF'
   ## What's Changed
   
   ### Features
   - Feature 1
   
   ### Fixes  
   - Fix 1
   
   **Full Changelog**: https://github.com/USER/REPO/compare/v<prev>...v<version>
   EOF
   )"
   ```

## Release Notes Format

```markdown
## What's Changed

### Features
- Add new feature X (#PR)

### Improvements
- Improve performance of Y

### Fixes
- Fix bug in Z (#PR)

### Breaking Changes
- Changed API for X (if applicable)

**Full Changelog**: https://github.com/USER/REPO/compare/vPREV...vNEW
```

## Checklist

- [ ] All changes committed and pushed to main
- [ ] Version number follows semver
- [ ] Release notes are clear and complete
- [ ] Tag created and pushed
- [ ] GitHub release published
