import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const IGNORED_DIRECTORIES = ['node_modules', '.git'];

function generateFileTree(dirPath, prefix = '') {
    let tree = '';

    const dirContents = fs.readdirSync(dirPath);
    const { length } = dirContents;

    dirContents.forEach((itemName, index) => {
        // Skip ignored directories
        if (IGNORED_DIRECTORIES.includes(itemName)) {
            return;
        }

        const isLast = index === length - 1;
        tree += prefix + (isLast ? '└── ' : '├── ') + itemName + '\n';

        const itemPath = path.join(dirPath, itemName);
        const stats = fs.statSync(itemPath);

        if (stats.isDirectory()) {
            const newPrefix = prefix + (isLast ? '    ' : '│   ');
            tree += generateFileTree(itemPath, newPrefix);
        }
    });

    return tree;
}

app.get('/', (req, res) => {
    try {
        const tree = generateFileTree('.');
        res.type('text/plain');
        res.send(tree);
    } catch (error) {
        res.status(500).send(error.message);
    }
});
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
	console.log(`http://localhost:${PORT}`)
});