import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter'; 
import { marked } from 'marked';
import { generateServicesHTML } from './genService.js';

// パス設定
const SRC_DIR = path.resolve('./src');
const DEST_DIR = path.resolve('./final_html');
const SETTING_PATH = path.resolve('./setting.json');
const RESULT_DIR = path.resolve('./result');
const INCIDENTS_DIR = path.resolve('./incidents');
const INCIDENT_TEMPLATE = path.resolve('./src/templates/incident.html');

// /result から最新タイムスタンプを取得
async function getLastTime() {
    try {
        const files = await fs.readdir(RESULT_DIR);
        const jsonFiles = files.filter(f => f.endsWith('.json'));
        if (jsonFiles.length === 0) return '';

        const latestFile = jsonFiles
            .map(f => ({ file: f, time: new Date(f.replace('.json','')) }))
            .sort((a,b) => b.time - a.time)[0];

        return latestFile.time.toString();
    } catch (err) {
        console.error('Failed to get last time:', err);
        return '';
    }
}

async function replaceALL(content) {
    const setting = JSON.parse(await fs.readFile(SETTING_PATH, 'utf-8'));
    const meta = setting.meta || {};

    meta.lasttime = await getLastTime();
    return content.replaceAll(/\{\{(\w+)\}\}/g, (match, key) => {
        switch (key) {
            case 'theme':
                if (meta.theme === 'dark') return '#1a1a1a';
                if (meta.theme === 'light') return '#ffffff';
                return match;
            case 'theme_reverse':
                if (meta.theme === 'dark') return '#ffffff';
                if (meta.theme === 'light') return '#2c2c2c';
                return match;
            default:
                return meta[key] ?? match;
        }
    });
}

async function generateIncidentsHTML() {
    const files = await fs.readdir(INCIDENTS_DIR);
    const mdFiles = files.filter(f => f.endsWith('.md'));

    let html = '';

    const now = new Date();

    for (const file of mdFiles) {
        const filePath = path.join(INCIDENTS_DIR, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const { data, content: mdContent } = matter(content);

        const start = data.start_date ? new Date(data.start_date) : now;
        const end = data.end_date ? new Date(data.end_date) : now;

        console.log(end + ":" + now);
        if (end < now) continue;

        const tagClass = data.tags ? `incident_${data.tags}` : 'incident_info';

        html += `
<a href="./incidents/${file.replace('.md','.html')}" class="${tagClass}">
    <h3>${data.title || 'No Title'}</h3>
    <p>${data.description || mdContent.slice(0,100)}</p>
</a>
        `;
    }

    if (!html) {
        html = '<p>現在発生中の障害はありません</p>';
    }

    return html;
}

async function generateIncidentPages(meta) {
    const template = await fs.readFile(INCIDENT_TEMPLATE, 'utf-8');
    const files = await fs.readdir(INCIDENTS_DIR);
    const mdFiles = files.filter(f => f.endsWith('.md'));
    const destDir = path.join(DEST_DIR, 'incidents');

    await fs.mkdir(destDir, { recursive: true });
    const now = new Date();

    for (const file of mdFiles) {
        const filePath = path.join(INCIDENTS_DIR, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const { data, content: mdContent } = matter(content);

        const start = data.start_date ? new Date(data.start_date) : now;
        const end = data.end_date ? new Date(data.end_date) : now;

        // Markdown を HTML に変換
        const htmlIncident = marked(mdContent);

        let htmlContent = template.replace('{{incident_contents}}', htmlIncident);

        // theme などの置換
        htmlContent = await replaceALL(htmlContent);

        const destPath = path.join(destDir, file.replace('.md','.html'));
        await fs.writeFile(destPath, htmlContent, 'utf-8');
        console.log(`Generated incident page: ${destPath}`);
    }
}

async function copyAndReplace() {

    await fs.mkdir(DEST_DIR, { recursive: true });

    // 4. src のファイル一覧を取得
    const files = await fs.readdir(SRC_DIR);

    for (const file of files) {
        const srcPath = path.join(SRC_DIR, file);
        const destPath = path.join(DEST_DIR, file);
        const stat = await fs.stat(srcPath);

        // templates フォルダはスキップ
        if (stat.isDirectory() && file === 'templates') continue;

        if (stat.isFile() && (file.endsWith('.html') || file.endsWith('.css'))) {
            let content = await fs.readFile(srcPath, 'utf-8');
        
            if (file === 'index.html') {
                const incidentsHTML = await generateIncidentsHTML();
                content = content.replace(
                    /<div id="incidents_div"><\/div>/,
                    `<div id="incidents_div">\n${incidentsHTML}\n</div>`
                );
                const servicesHTML = await generateServicesHTML();
                content = content.replace(
                    /<div id="services_div"><\/div>/,
                    `<div id="services_div">\n${servicesHTML}\n</div>`
                );
            }

            content = await replaceALL(content);

            await fs.writeFile(destPath, content, 'utf-8');
            console.log(`Processed ${file}`);
        } else if (stat.isFile()) {
            await fs.copyFile(srcPath, destPath);
        }
    }
    await generateIncidentPages();

    console.log('All files processed!');
}

copyAndReplace().catch(err => {
    console.error(err);
    process.exit(1);
});
