# ShadowRoute

A lightweight Chrome extension that silently redirects websites to privacy-friendly alternatives before any connection is made to the original site

## Features

- Intercepts requests before they are sent to the original website
- Routes traffic to privacy-friendly alternative services
- Enable or disable individual redirects
- Add custom redirects with your preferred alternatives
- HTTPS enforced for all redirects

## Default Redirects

The extension comes with the following default redirects:

- YouTube → Invidious (yewtu.be)
- Twitter → Nitter
- Instagram → Bibliogram
- Reddit → Teddit
- Google Search → DuckDuckGo

## Installation

Since this extension is not published to the Chrome Web Store, you'll need to install it manually:

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top-right corner)
4. Click "Load unpacked" and select the folder containing the extension files
5. The extension should now be installed and active

## Usage

- Click the extension icon in your browser toolbar to see the current status
- Click "Open Settings" to manage redirects
- In the settings page, you can:
  - Enable/disable default redirects
  - Add, edit, or remove custom redirects
  - Customize source and target domains

## Adding Custom Redirects

1. In the settings page, click "Add New Redirect"
2. Fill in the following fields:
   - Name: A descriptive name for your redirect
   - Description (optional): More details about the redirect
   - Source Domain: The domain you want to redirect from (e.g., youtube.com)
   - Target Domain: The domain you want to redirect to (e.g., yewtu.be)
3. Click "Save" to add the redirect

## Technical Details

ShadowRoute uses Chrome's declarativeNetRequest API to intercept and modify network requests before they are sent. This ensures that:

1. No connection is ever established with the original website
2. No data is leaked to the original service
3. All traffic is routed directly to the privacy-friendly alternative
4. HTTPS is enforced for all redirects
