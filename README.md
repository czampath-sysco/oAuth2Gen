# OAuth2Gen

A simple, self-contained OAuth2/OIDC token generator with a modern web UI.

---

## 🚀 Standalone Executable Usage

Standalone executables are available for Windows, Linux, and Mac. **Only the Windows build has been tested.**

### 1. Download the Executable

- Windows: `dist/oauth2gen-win.exe`
- Linux: `dist/oauth2gen-linux`
- Mac: `dist/oauth2gen-mac`

### 2. Run the Executable

- On Windows: `oauth2gen-win.exe`
- On Linux/Mac: `./oauth2gen-linux` or `./oauth2gen-mac`

Your browser will open at [http://localhost:8080](http://localhost:8080).

1. Fill in your OAuth2/OIDC provider’s details:
   - Authorization Endpoint
   - Token Endpoint
   - Client ID
   - Client Secret
   - Scope
2. Click **Generate Token** and follow the authentication flow.
3. Your token will be displayed and can be copied for use.
4. **New:** Applications can now request the token directly from this server via the `/token` endpoint (e.g., `http://localhost:8080/token`). No need to copy and paste the token manually.

> **Note:** Do not change the port or redirect URI unless you know what you’re doing. The redirect URI is always `http://localhost:8080/callback`.

> **API Note:** All localhost ports are allowed for CORS. You can access the `/token` endpoint from any local application running on any port.

> **Disclaimer:** Only the Windows executable has been tested. Linux and Mac builds are provided for convenience and may require additional testing or adjustments.

---

## Developer Setup & Usage

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- npm

### Installation

1. Clone or download this repository.
2. Install dependencies:
   ```
   npm install
   ```

### Development Usage

1. Start the server:
   ```
   npm start
   ```
2. Your browser will open at [http://localhost:8080](http://localhost:8080).
3. Use the web UI as described above.
4. **New:** You can now request the token directly from the `/token` endpoint in your own applications (e.g., `http://localhost:8080/token`).

### Build Standalone Executables

This app can be packaged as a single executable for Windows, Linux, and Mac using [`pkg`](https://github.com/vercel/pkg) and `esbuild`.

#### 1. Install pkg (if not already installed)

```
npm install -g pkg
```

#### 2. Build for All Platforms

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

---

## Dependencies

- express
- express-session
- simple-oauth2
- axios
- cors

## Security

- This tool is intended for local/developer use only.
- Credentials are not stored on disk; session data is kept in memory.

## License

ISC

---

## Notes

- No need to install Node.js on the target machine for executables.
- All dependencies are bundled.
- For best results, build on the target OS or use CI/CD for cross-compilation.
