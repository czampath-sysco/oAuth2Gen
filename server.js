#!/usr/bin/env node
// Author: Chathuranga Sampath
// Date: 23-06-2025
// App Name: OAuth Token Generator
// Version: 1.0.0
//
// Description:
// This is a self-contained Node.js application that provides a web interface
// to generate an OAuth2/OIDC access token using the Authorization Code grant type.
//
// How to Run:
//
// 1. Install the required dependencies by running:
//    `npm install`
// 2. Run the application: `npm start`, you'll be navigated to http://localhost:8080.
// 3. Fill in the form with your OAuth2/OIDC provider's details
//
// Warning: Do not change the port number or the redirect URI unless you know what you're doing.

import express from 'express';
import session from 'express-session';
import { AuthorizationCode } from 'simple-oauth2';
import { spawn } from 'child_process';

const app = express();
const PORT = 8080;
const BASE_URL = `http://localhost:${PORT}`;
const REDIRECT_URI = `${BASE_URL}/callback`;

app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'a-secure-and-random-secret-key', // just a temp thing, not a concern since this a local app
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } 
}));

const getFormHtml = () => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OAuth Token Generator</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        .form-label { @apply block text-sm font-medium text-gray-700 mb-1; }
        .form-input { width: 100%; height: 40px; padding: 5px; }
        .form-input { @apply block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm; }
    </style>
</head>
<body class="bg-gray-50">
    <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-3xl w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
            <div>
                <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    OAuth Token Generator
                </h2>
            </div>
            <form class="mt-8 space-y-6" id="config-form" action="/auth" method="POST">
                <div class="rounded-md shadow-sm -space-y-px">
                    <div>
                        <label for="authorizationUrl" class="form-label">Authorization Endpoint</label>
                        <input id="authorizationUrl" name="authorizationUrl" type="url" required class="form-input" placeholder="https://provider.com/auth">
                    </div>
                    <div class="pt-4">
                        <label for="tokenUrl" class="form-label">Token Endpoint</label>
                        <input id="tokenUrl" name="tokenUrl" type="url" required class="form-input" placeholder="https://provider.com/token">
                    </div>
                    <div class="pt-4">
                        <label for="clientId" class="form-label">OIDC Client ID</label>
                        <input id="clientId" name="clientId" type="text" required class="form-input" placeholder="Your client ID">
                    </div>
                    <div class="pt-4">
                        <label for="clientSecret" class="form-label">OIDC Client Secret</label>
                        <input id="clientSecret" name="clientSecret" type="password" required class="form-input" placeholder="Your client secret">
                    </div>
                    <div class="pt-4">
                        <label for="scope" class="form-label">Scope</label>
                        <input id="scope" name="scope" type="text" required class="form-input" placeholder="e.g., openid profile email">
                    </div>
                </div>

                <div>
                    <button type="submit" class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Generate Token
                    </button>
                </div>
            </form>
        </div>
    </div>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const form = document.getElementById('config-form');
            const formFields = ['authorizationUrl', 'tokenUrl', 'clientId', 'clientSecret', 'scope'];
            
            formFields.forEach(field => {
                const savedValue = localStorage.getItem(field);
                if (savedValue) {
                    document.getElementById(field).value = savedValue;
                }
            });

            form.addEventListener('submit', () => {
                 formFields.forEach(field => {
                    const value = document.getElementById(field).value;
                    if(value) {
                       localStorage.setItem(field, value);
                    }
                });
            });
        });
    </script>
</body>
</html>
`;

const getResultHtml = (token, error) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your OAuth Token</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        pre { white-space: pre-wrap; word-wrap: break-word; }
    </style>
</head>
<body class="bg-gray-50">
    <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-4xl w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
            ${error ? `
            <div>
                <h2 class="text-center text-3xl font-extrabold text-red-600">
                    An Error Occurred
                </h2>
                <div class="mt-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                    <pre>${error}</pre>
                </div>
            </div>
            ` : `
            <div>
                <h2 class="text-center text-3xl font-extrabold text-gray-900">
                    Your Token
                </h2>
                <p class="mt-2 text-center text-sm text-gray-600">
                    Your token is below. Click the button to copy it to your clipboard.
                </p>
            </div>
            <div class="relative">
                 <textarea id="token-display" readonly class="w-full h-64 p-4 font-mono text-sm bg-gray-900 text-green-300 rounded-md focus:outline-none resize-none">${token}</textarea>
                 <button id="copy-btn" class="absolute top-2 right-5 px-5 py-2 text-xs font-large text-gray-900 bg-gray-200 rounded-md hover:bg-gray-300">Copy</button>
            </div>
            `}
             <div class="mt-6 text-center">
                 <a href="/" class="font-medium text-indigo-600 hover:text-indigo-500">Start Over</a>
            </div>
        </div>
    </div>
    <script>
        const copyButton = document.getElementById('copy-btn');
        if (copyButton) {
            copyButton.addEventListener('click', () => {
                const tokenText = document.getElementById('token-display');
                tokenText.select();
                document.execCommand('copy'); // execCommand is used for broad compatibility
                copyButton.textContent = 'Copied!';
                setTimeout(() => { copyButton.textContent = 'Copy'; }, 2000);
            });
        }
    </script>
</body>
</html>
`;

app.get('/', (req, res) => {
    res.send(getFormHtml());
});

app.post('/auth', (req, res) => {
    const { authorizationUrl, tokenUrl, clientId, clientSecret, scope } = req.body;


    req.session.oauth_config = {
        auth: { tokenHost: new URL(tokenUrl).origin, tokenPath: new URL(tokenUrl).pathname, authorizePath: new URL(authorizationUrl).pathname },
        client: { id: clientId, secret: clientSecret },
    };

    const client = new AuthorizationCode(req.session.oauth_config);

    const authorizationUri = client.authorizeURL({
        redirect_uri: REDIRECT_URI,
        scope: scope,
        state: 'random-state-string-for-security' // You can generate a random string here
    });

    res.redirect(authorizationUri);
});

app.get('/callback', async (req, res) => {
    const { code } = req.query;
    const config = req.session.oauth_config;

    if (!config) {
        res.status(400).send(getResultHtml(null, 'Session expired or configuration missing. Please start over.'));
        return;
    }
    
    req.session.oauth_config = null; 

    const client = new AuthorizationCode(config);

    const tokenParams = {
        code: code,
        redirect_uri: REDIRECT_URI,
    };

    try {
        const accessToken = await client.getToken(tokenParams);
        const tokenPayload = accessToken.token;

        // Prioritize id_token (OIDC), but fall back to access_token (OAuth2)
        const displayToken = tokenPayload.id_token || tokenPayload.access_token;
        
        if (!displayToken) {
             throw new Error(`Could not find 'id_token' or 'access_token' in the response. Full response: ${JSON.stringify(tokenPayload)}`);
        }

        res.send(getResultHtml(displayToken, null));

    } catch (error) {
        console.error('Access Token Error', error.message);
        const errorMessage = `Error Name: ${error.name}\nError Message: ${error.message}\nData: ${JSON.stringify(error.data?.payload, null, 2)}`;
        res.status(500).send(getResultHtml(null, errorMessage));
    }
});

function openBrowser(url) {
    const platform = process.platform;
    let cmd, args;
    if (platform === 'win32') {
        cmd = 'cmd';
        args = ['/c', 'start', '""', url];
    } else if (platform === 'darwin') {
        cmd = 'open';
        args = [url];
    } else {
        cmd = 'xdg-open';
        args = [url];
    }
    spawn(cmd, args, { stdio: 'ignore', detached: true }).unref();
}

app.listen(PORT, async () => {
    console.log(`🚀 Server started on http://localhost:${PORT}`);
    openBrowser(BASE_URL);
});
