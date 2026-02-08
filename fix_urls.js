const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
    fs.readdirSync(dir).forEach(file => {
        const dirPath = path.join(dir, file);
        if (fs.statSync(dirPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.next') {
                filelist = walkSync(dirPath, filelist);
            }
        } else {
            if (file.endsWith('.js')) {
                filelist.push(dirPath);
            }
        }
    });
    return filelist;
};

const clientDir = path.join(process.cwd(), 'client');
const files = walkSync(clientDir);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const original = content;

    // Patterns to replace with template literal
    const patterns = [
        /'"\+process\.env\.NEXT_PUBLIC_API_URL\+"\/api/g,
        /'process\.env\.NEXT_PUBLIC_API_URL\/api/g,
        /'http:\/\/localhost:5002\/api/g,
        /'http:\/\/127\.0\.0\.1:5002\/api/g
    ];

    patterns.forEach(pattern => {
        content = content.replace(pattern, "`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002'}/api");
    });

    // Fix the closing ' if we replaced it
    if (content !== original) {
        // Replace the first ' after our injected variable with `
        // Example: `${...}/api/login', formData) -> `${...}/api/login`, formData)
        content = content.replace(/(\$\{process\.env\.NEXT_PUBLIC_API_URL \|\| 'http:\/\/localhost:5002'\}\/api\/[^']*)'/g, '$1`');

        // Add import or variable if it's missing (naive but safe for now)
        // Actually, I'll just use the full process.env inside the template literal as I did above.

        fs.writeFileSync(file, content);
        console.log(`Fixed: ${file}`);
    }
});
