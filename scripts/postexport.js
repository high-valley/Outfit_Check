// expo export -p web の後に dist/index.html を iPhone（Safari / ホーム画面起動）向けに整える
const fs = require('fs');
const path = require('path');

const app = JSON.parse(fs.readFileSync('app.json', 'utf8'));
const base = (app.expo.experiments?.baseUrl ?? '').replace(/\/$/, '');
const dist = 'dist';
const file = path.join(dist, 'index.html');
let html = fs.readFileSync(file, 'utf8');

const head = `
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="コーデスコア" />
    <meta name="theme-color" content="#FFFFFF" />
    <link rel="manifest" href="${base}/manifest.webmanifest" />
    <link rel="apple-touch-icon" href="${base}/apple-touch-icon.png" />
    <style>
      html, body { background: #FFFFFF; -webkit-text-size-adjust: 100%; overscroll-behavior: none; }
      body { -webkit-tap-highlight-color: transparent; -webkit-touch-callout: none; }
      #root { height: 100%; height: 100dvh; }
      input, textarea { font-size: 16px; }
    </style>`;

html = html
  .replace('<html lang="en">', '<html lang="ja">')
  .replace(/<meta name="viewport"[^>]*>/, head)
  .replace(/<title>[^<]*<\/title>/, '<title>コーデスコア</title>')
  .replace(/href="\/favicon\.ico"/, `href="${base}/favicon.ico"`);
fs.writeFileSync(file, html);

fs.writeFileSync(
  path.join(dist, 'manifest.webmanifest'),
  JSON.stringify(
    {
      name: 'コーデスコア',
      short_name: 'コーデスコア',
      start_url: `${base}/`,
      scope: `${base}/`,
      display: 'standalone',
      orientation: 'portrait',
      background_color: '#FFFFFF',
      theme_color: '#FFFFFF',
      icons: [
        { src: `${base}/icon-192.png`, sizes: '192x192', type: 'image/png' },
        { src: `${base}/icon-512.png`, sizes: '512x512', type: 'image/png' },
      ],
    },
    null,
    2,
  ),
);
console.log('postexport: patched dist/index.html (base="' + base + '")');
