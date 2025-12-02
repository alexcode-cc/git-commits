# NPM Package Publishing Guide

**[繁體中文版 (Traditional Chinese)](./PUBLISHING-CHT.md)**

This document uses the `@alexcode-cc/git-commits` toolkit as an example to explain how to publish a package to GitHub and npm.

## Prerequisites

1. **GitHub Account**: Ensure you have permissions for the `github` user account.
2. **npm Account**: Ensure you have registered an npm account and are logged in.
3. **Git Configuration**: Ensure local Git has the correct remote repository configured.

## 1. Configure Git Remote Repository

If you haven't configured the GitHub remote repository yet, execute the following commands:

```bash
# Remove old origin (if exists)
git remote remove origin

# Add GitHub origin
git remote add origin git@github.com:username/package-name.git

# Verify configuration
git remote -v
```

## 2. Login to npm

Execute the following command in the terminal to login to npm:

```bash
npm login
```

Follow the prompts to enter your username, password, and email.

## 3. Prepare Release Version

Before publishing a new version, ensure all changes have been committed.

### Update Version Number

Use the `npm version` command to update the version number, which will automatically modify `package.json` and create a git tag.

```bash
# Update patch version (e.g., 1.0.0 -> 1.0.1)
npm version patch

# Or update minor version (e.g., 1.0.0 -> 1.1.0)
npm version minor

# Or update major version (e.g., 1.0.0 -> 2.0.0)
npm version major
```

## 4. Publish to npm

Execute the following command to publish the package to npm:

```bash
npm publish --access public
```

> **Note**: Since this project is a Scoped Package (`@username/package-name`), it is recommended to add the `--access public` parameter when publishing to ensure the package is publicly accessible.

## 5. Push to GitHub

Push the code and tags to GitHub:

```bash
git push origin main --tags
```

## Common Issues

### Permission Errors

If you encounter permission errors, please confirm:
1. Whether you are logged in to the correct npm account.
2. Whether you have permission to publish with that package name.
