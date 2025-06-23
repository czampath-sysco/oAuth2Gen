# OAuth2Gen

A simple, self-contained Node.js web application to generate OAuth2/OIDC access tokens using the Authorization Code grant type. It provides a modern web interface for quickly obtaining tokens from any standards-compliant OAuth2 or OIDC provider.

## Features

- Web UI for entering OAuth2/OIDC provider details
- Supports Authorization Code flow
- Displays and allows copying of the generated token
- No external database or persistent storage required
- Built with Express and simple-oauth2

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- npm

### Installation

1. Clone or download this repository.
2. Install dependencies:
   ```
   npm install
   ```

### Usage

1. Start the server:
   ```
   npm start
   ```
2. Your browser will open at [http://localhost:8080](http://localhost:8080).
3. Fill in your OAuth2/OIDC provider’s details:
   - Authorization Endpoint
   - Token Endpoint
   - Client ID
   - Client Secret
   - Scope
4. Click **Generate Token** and follow the authentication flow.
5. Your token will be displayed and can be copied for use.

> **Note:** Do not change the port or redirect URI unless you know what you’re doing. The redirect URI is always `http://localhost:8080/callback`.

## Dependencies

- express
- express-session
- simple-oauth2
- open
- axios

## Security

- This tool is intended for local/developer use only.
- Credentials are not stored on disk; session data is kept in memory.

## License

ISC

---

## Standalone Executable Distribution

This app can be packaged as a single executable for Windows, Linux, and Mac using [`pkg`](https://github.com/vercel/pkg).

### 1. Install pkg

```
npm install -g pkg
```

### 2. Build for All Platforms

```
npm run build:all
```

- Windows: `dist/oauth2gen-win.exe`
- Linux: `dist/oauth2gen-linux`
- Mac: `dist/oauth2gen-mac`

Or build for a specific platform:

```
npm run build:win   # Windows
npm run build:linux # Linux
npm run build:mac   # Mac
```

### 3. Run the Executable

- On Windows: `oauth2gen-win.exe`
- On Linux/Mac: `./oauth2gen-linux` or `./oauth2gen-mac`

The app will open in your browser at [http://localhost:8080](http://localhost:8080).

---

## Notes
- No need to install Node.js on the target machine.
- All dependencies are bundled.
- For best results, build on the target OS or use CI/CD for cross-compilation.
