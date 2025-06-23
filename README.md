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
