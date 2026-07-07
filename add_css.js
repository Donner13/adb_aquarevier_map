const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const targetStr = `        .info-msg {`;

const cssToAdd = `
        /* Extended Popup Styles */
        .extended-popup {
            max-height: 350px;
            overflow-y: auto;
            padding-right: 4px;
        }

        .extended-popup::-webkit-scrollbar {
            width: 4px;
        }
        .extended-popup::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 2px;
        }
        body.light-theme .extended-popup::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.2);
        }

        .popup-body {
            margin-top: 10px;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .popup-detail strong {
            color: var(--text-primary);
            font-weight: 600;
            margin-right: 4px;
        }

        .popup-detail a {
            color: var(--accent-primary);
            text-decoration: none;
        }
        .popup-detail a:hover {
            text-decoration: underline;
        }

        .coords-detail {
            font-family: monospace;
            font-size: 10px;
            margin-top: 6px;
            color: var(--text-secondary);
        }

        .popup-footer {
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid var(--border-color);
        }

        .website-btn {
            display: block;
            text-align: center;
            background: var(--accent-primary);
            color: #ffffff;
            padding: 8px;
            border-radius: 6px;
            text-decoration: none;
            font-size: 12px;
            font-weight: 500;
            transition: background 0.2s, transform 0.2s;
        }
        .website-btn:hover {
            background: #4f46e5;
            transform: translateY(-1px);
            color: #ffffff;
        }
        body.light-theme .website-btn {
            color: #ffffff !important;
        }

`;

if (html.includes(targetStr)) {
    html = html.replace(targetStr, cssToAdd + targetStr);
    fs.writeFileSync('index.html', html);
    console.log("CSS added successfully.");
} else {
    console.log("Could not find the target string to insert CSS.");
}
