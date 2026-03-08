const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.module.css') || file.endsWith('globals.css')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(srcDir);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    if (content.includes('background-color: white;')) {
        content = content.replace(/background-color:\s*white;/g, 'background-color: var(--bg-secondary);');
        changed = true;
    }
    if (content.includes('background: white;')) {
        content = content.replace(/background:\s*white;/g, 'background: var(--bg-secondary);');
        changed = true;
    }
    // Handle VisualBoard toolbar
    if (content.includes('rgba(255, 255, 255, 0.85)')) {
        content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.85\)/g, 'var(--bg-glass)');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(file, content);
        console.log(`Updated ${file}`);
    }
});
