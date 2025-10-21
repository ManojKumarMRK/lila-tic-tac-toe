# Node.js Version Management

This project requires Node.js version 20.19.5 or higher for optimal compatibility with Expo SDK 54 and React Native 0.81+.

## Using .nvmrc

Both the client and server directories contain `.nvmrc` files that specify the required Node.js version.

### Automatic Version Switching

If you have `nvm` installed, you can automatically switch to the correct Node.js version:

```bash
# In the client directory
cd client
nvm use

# In the server directory  
cd server
nvm use
```

### Installing the Required Version

If you don't have the required Node.js version installed:

```bash
nvm install 20.19.5
nvm use 20.19.5
```

### Setting as Default

To make Node.js 20.19.5 your default version:

```bash
nvm alias default 20.19.5
```

## Verification

Verify you're using the correct version:

```bash
node --version
# Should output: v20.19.5
```

## Why Node.js 20.19.5?

- **Expo SDK 54**: Requires Node.js 18+ for modern JavaScript features
- **React Native 0.81+**: Requires Node.js 20+ for Metro bundler and build tools
- **Nakama Client**: Better compatibility with modern networking libraries
- **Performance**: Improved V8 engine and better memory management