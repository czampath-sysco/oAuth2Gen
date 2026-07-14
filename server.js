#!/usr/bin/env node
// Author: Chathuranga Sampath
// Date: 23-06-2025
// App Name: OAuth Token Generator
// Version: 1.2.0
//
// Description:
// This is a self-contained Node.js application that provides a web interface
// to generate an OAuth2/OIDC access token. It includes a dedicated control panel
// to manage a local development server on port 5000.
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
import cors from 'cors';
import net from 'net';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = 3000;
const DEV_APP_PORT = 5000;
const BASE_URL = `http://localhost:${PORT}`;
const REDIRECT_URI = `${BASE_URL}/auth/callback`;

let token;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'a-secure-and-random-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Utility to check if a port is in use
function isPortInUse(port) {
    return new Promise((resolve) => {
        const tester = net.createServer()
            .once('error', (err) => (err.code === 'EADDRINUSE' ? resolve(true) : resolve(false)))
            .once('listening', () => tester.once('close', () => resolve(false)).close())
            .listen(port, '127.0.0.1');
    });
}

// Utility to start the dev application
async function startDevApp(appDir) {
    const inUse = await isPortInUse(DEV_APP_PORT);
    if (!inUse && appDir && fs.existsSync(appDir)) {
        console.log(`Starting development app in directory: ${appDir}`);
        const command = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
        const child = spawn(command, ['run', 'dev'], {
            cwd: path.resolve(appDir),
            stdio: 'ignore',
            shell: true,
            detached: true
        });
        child.unref();
        return { success: true, message: `Attempted to start the app in ${appDir}.` };
    } else if (inUse) {
        return { success: false, message: 'App is already running.' };
    } else {
        return { success: false, message: 'App directory not found or not provided.' };
    }
}

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
        .form-label { @apply block text-xs font-medium text-gray-700 mb-0.5; }
        .form-label { font-weight: 500; color:rgb(102, 117, 143); padding-left: 3px; font-size: 0.93rem; }
        .form-input { width: 100%; height: 36px; padding: 4px; }
        .form-input { @apply block w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-xs; }
    </style>
</head>
<body class="bg-gray-50">
    <div class="min-h-screen flex items-center justify-center py-10 px-3 sm:px-5 lg:px-7">
        <div class="max-w-2xl w-full space-y-6 p-7 bg-white rounded-lg shadow-md">
            <div>
                <h2 class="text-center text-2xl font-extrabold text-gray-900">
                    OAuth Token Generator
                </h2>
            </header>

            <form class="space-y-4 mt-4" id="config-form" action="/auth" method="POST">
                <div class="rounded-md space-y-3">
                    <div>
                        <label for="authorizationUrl" class="form-label">Authorization Endpoint</label>
                        <input id="authorizationUrl" name="authorizationUrl" type="url" required class="form-input">
                    </div>
                    <div>
                        <label for="tokenUrl" class="form-label">Token Endpoint</label>
                        <input id="tokenUrl" name="tokenUrl" type="url" required class="form-input">
                    </div>
                    <div>
                        <label for="clientId" class="form-label">Client ID</label>
                        <input id="clientId" name="clientId" type="text" required class="form-input">
                    </div>
                    <div>
                        <label for="clientSecret" class="form-label">Client Secret</label>
                        <input id="clientSecret" name="clientSecret" type="password" class="form-input">
                    </div>
                    <div>
                        <label for="scope" class="form-label">Scope</label>
                        <input id="scope" name="scope" type="text" required class="form-input" placeholder="e.g., openid profile email">
                    </div>
                </div>
                <div>
                    <button type="submit" class="group relative w-full flex justify-center py-2.5 px-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Generate Token
                    </button>
                </div>
            </form>

            <hr/>
            
            <div class="relative mt-4 p-4 border rounded-lg bg-slate-50 space-y-3">
                <div class="flex justify-between items-center">
                    <h3 class="text-base font-bold text-slate-800">Root App Control</h3>
                    <button id="settings-btn" class="text-slate-500 hover:text-slate-800" title="Configure server path">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.608 3.292 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                </div>
                
                <div class="flex items-center space-x-3 w-full">
                    <span class="text-sm text-slate-600">Status:</span>
                    <div id="app-status-container" class="text-sm font-semibold flex items-center">
                        <span id="status-indicator" class="h-2.5 w-2.5 rounded-full mr-2"></span>
                        <span id="status-text"></span>
                    </div>
                    <div id="start-app-container" class="hidden ml-auto w-full flex">
                        <button id="start-app-btn" class="ml-auto w-28 justify-center py-1.5 px-3 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                            Start
                        </button>
                    </div>
                    <button id="stop-app-btn" class="ml-auto hidden w-28 px-3 py-1.5 text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700" style="margin-left:auto;">Stop</button>
                </div>

                <div id="settings-panel" class="settings-panel pt-2 border-t border-slate-200" style="display: none;">
                    <label for="appDir" class="form-label">App Directory: </label>
                    <input id="appDir" name="appDir" type="text" class="form-input" placeholder="Paste the full path to your app directory...">
                </div>
            </div>
        </div>
    </div>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            let btnStatus = 'to-be-started';
            const formFields = ['authorizationUrl', 'tokenUrl', 'clientId', 'clientSecret', 'scope', 'appDir'];
            
            formFields.forEach(field => {
                const savedValue = localStorage.getItem(field);
                if (savedValue && document.getElementById(field)) {
                    document.getElementById(field).value = savedValue;
                }
            });

            document.getElementById('config-form').addEventListener('submit', () => {
                formFields.forEach(field => {
                    const el = document.getElementById(field);
                    if (el && el.value) localStorage.setItem(field, el.value);
                });
            });
            
            const settingsBtn = document.getElementById('settings-btn');
            const settingsPanel = document.getElementById('settings-panel');
            const startAppBtn = document.getElementById('start-app-btn');
            const stopAppBtn = document.getElementById('stop-app-btn');
            const startAppContainer = document.getElementById('start-app-container');
            const appDirInput = document.getElementById('appDir');

            settingsBtn.addEventListener('click', () => {
                const isHidden = settingsPanel.style.display === 'none' || !settingsPanel.style.display;
                settingsPanel.style.display = isHidden ? 'block' : 'none';
            });
            
            appDirInput.addEventListener('input', (e) => {
                localStorage.setItem('appDir', e.target.value);
            });

            startAppBtn.addEventListener('click', async () => {
                btnStatus = 'starting';
                const appDir = appDirInput.value;
                if (!appDir) {
                    alert('Please configure the application directory path in the settings first.');
                    settingsPanel.style.display = 'block';
                    appDirInput.focus();
                    return;
                }
                startAppBtn.textContent = 'Starting...';
                startAppBtn.disabled = true;
                
                await fetch('/start-app', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ appDir }),
                });
            });

            stopAppBtn.addEventListener('click', async () => {
                btnStatus = 'stopping';
                stopAppBtn.textContent = 'Stopping...';
                stopAppBtn.disabled = true;
                await fetch('/stop-app', { method: 'POST' });
            });

            const statusIndicator = document.getElementById('status-indicator');
            const statusText = document.getElementById('status-text');
            const statusContainer = document.getElementById('app-status-container');

            async function checkAppStatus() {
                try {
                    const response = await fetch('/status');
                    const data = await response.json();
                    if (data.online) {
                        btnStatus = 'running';
                        statusIndicator.className = 'h-3 w-3 rounded-full mr-2 bg-green-500';
                        statusText.textContent = 'Online at port ${DEV_APP_PORT}';
                        statusText.className = 'text-green-700';
                        startAppContainer.classList.add('hidden');
                        stopAppBtn.classList.remove('hidden');
                        if( btnStatus !== 'starting') {
                            startAppBtn.disabled = false;
                            startAppBtn.textContent = 'Start Root App';
                        }
                    } else {
                        btnStatus = 'stopped';
                        statusIndicator.className = 'h-3 w-3 rounded-full mr-2 bg-red-500';
                        statusText.textContent = 'Offline';
                        statusText.className = 'text-red-700';
                        startAppContainer.classList.remove('hidden');
                        stopAppBtn.classList.add('hidden');
                        if( btnStatus !== 'stopping') {
                            stopAppBtn.disabled = false;
                            stopAppBtn.textContent = 'Stop App';
                        }
                    }
                } catch (error) {
                    console.error('Error checking app status:', error);
                    statusText.textContent = 'Error checking status.';
                    statusText.className = 'text-gray-500';
                }
            }

            setInterval(checkAppStatus, 2000);
            checkAppStatus();
        });
    </script>
</body>
</html>
`;

// ... (The rest of the backend code remains unchanged as it was functionally correct)


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
<body class="bg-gray-100">
    <div class="min-h-screen flex items-center justify-center py-10 px-3 sm:px-5 lg:px-7">
        <div class="max-w-3xl w-full space-y-6 p-7 bg-white rounded-lg shadow-xl">
            ${error ? `
            <div>
                <h2 class="text-center text-2xl font-extrabold text-red-600">
                    An Error Occurred
                </h2>
                <div class="mt-6 p-3 bg-red-50 border border-red-300 text-red-800 rounded-md">
                    <pre>${error}</pre>
                </div>
            </div>
            ` : `
            <div>
                <h2 class="text-center text-2xl font-extrabold text-gray-900">
                    Your Token
                </h2>
                <p class="mt-1 text-center text-xs text-gray-600">
                    Click the button to copy your token to the clipboard.
                </p>
            </div>
            <div class="relative">
                 <textarea id="token-display" readonly class="w-full h-52 p-3 font-mono text-xs bg-gray-900 text-green-300 rounded-md focus:outline-none resize-none">${token}</textarea>
                 <button id="copy-btn" class="absolute top-3 right-3 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-gray-900 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-200">Copy</button>
            </div>
            `}
             <div class="mt-4 text-center">
                 <a href="/" class="font-medium text-indigo-600 hover:text-indigo-500">
                    &larr; Start Over
                </a>
             </div>
        </div>
    </div>
    <script>
        const copyButton = document.getElementById('copy-btn');
        if (copyButton) {
            copyButton.addEventListener('click', () => {
                const tokenText = document.getElementById('token-display');
                tokenText.select();
                navigator.clipboard.writeText(tokenText.value).then(() => {
                    copyButton.textContent = 'Copied!';
                    setTimeout(() => { copyButton.textContent = 'Copy'; }, 2000);
                });
            });
        }
    </script>
</body>
</html>
`;

app.use(cors({
    origin: /^http:\/\/localhost:\d+$/,
    credentials: true
}));

app.get('/', (req, res) => {
    res.send(getFormHtml());
});

app.post('/auth', (req, res) => {
    const { authorizationUrl, tokenUrl, clientId, clientSecret, scope } = req.body;

    const trimmedClientSecret = (clientSecret || '').trim();
    const clientConfig = trimmedClientSecret
        ? { id: clientId, secret: trimmedClientSecret }
        : { id: clientId };

    req.session.oauth_config = {
        auth: { tokenHost: new URL(tokenUrl).origin, tokenPath: new URL(tokenUrl).pathname, authorizePath: new URL(authorizationUrl).pathname },
        client: clientConfig,
    };

    const client = new AuthorizationCode(req.session.oauth_config);

    const authorizationUri = client.authorizeURL({
        redirect_uri: REDIRECT_URI,
        scope: scope,
        state: 'random-state-string-for-security'
    });

    res.redirect(authorizationUri);
});

app.get('/token', (req, res) => {
    if (token) {
        res.send(token);
    } else {
        res.send('-1');
    }
});

// Endpoint to check dev app status
app.get('/status', async (req, res) => {
    const inUse = await isPortInUse(DEV_APP_PORT);
    res.json({ online: inUse });
});

// Endpoint to start the dev app
app.post('/start-app', async (req, res) => {
    const { appDir } = req.body;
    if (!appDir) {
        return res.status(400).json({ success: false, message: 'appDir is required.' });
    }
    const result = await startDevApp(appDir);
    res.json(result);
});

// Backend: Add /stop-app endpoint
app.post('/stop-app', (req, res) => {
    const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    const args = ['--yes', 'kill-port', '5000'];
    const child = spawn(cmd, args, { shell: true });
    let output = '';
    let error = '';
    child.stdout.on('data', (data) => { output += data; });
    child.stderr.on('data', (data) => { error += data; });
    child.on('close', (code) => {
        if (code === 0) {
            res.json({ success: true, message: output });
        } else {
            res.status(500).json({ success: false, message: error || 'Failed to stop app.' });
        }
    });
});

app.get('/auth/callback', async (req, res) => {
    const { code } = req.query;
    const config = req.session.oauth_config;

    if (!config) {
        res.status(400).send(getResultHtml(null, 'Session expired or configuration missing. Please start over.'));
        return;
    }

    req.session.oauth_config = null;

    try {
        let tokenPayload;

        if (config.client.secret) {
            const client = new AuthorizationCode(config);
            const tokenParams = {
                code: code,
                redirect_uri: REDIRECT_URI,
            };
            const accessToken = await client.getToken(tokenParams);
            tokenPayload = accessToken.token;
        } else {
            const tokenEndpoint = `${config.auth.tokenHost}${config.auth.tokenPath}`;
            const form = new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: config.client.id,
                code: String(code || ''),
                redirect_uri: REDIRECT_URI,
            });

            const tokenResponse = await fetch(tokenEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: form.toString(),
            });

            const tokenJson = await tokenResponse.json();
            if (!tokenResponse.ok) {
                throw new Error(`Response Error: ${tokenResponse.status} ${tokenResponse.statusText}\nData: ${JSON.stringify(tokenJson, null, 2)}`);
            }

            tokenPayload = tokenJson;
        }

        const displayToken = tokenPayload.id_token || tokenPayload.access_token;
        token = displayToken;

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