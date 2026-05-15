const fs = require('fs');
const path = require('path');

const replacements = {
    "#8b5cf6": "#2563eb",
    "#7c3aed": "#1d4ed8",
    "139, 92, 246": "37, 99, 235",
    "#ec4899": "#0ea5e9",
    "#db2777": "#0284c7",
    "236, 72, 153": "14, 165, 233",
    "#a78bfa": "#60a5fa",
    "#f472b6": "#38bdf8",
    "167, 139, 250": "96, 165, 250",
    "244, 114, 182": "56, 189, 248",
    "Vibrant Purple": "Professional Blue",
    "Neon Pink": "Sky Blue"
};

function processDirectory(dirPath) {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.css') || fullPath.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let original = content;
            for (const [oldVal, newVal] of Object.entries(replacements)) {
                content = content.split(oldVal).join(newVal);
            }
            if (content !== original) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

processDirectory(path.join(__dirname, 'src', 'app'));
