/* 局域网静态服务器：手机与电脑连同一 Wi-Fi 后，手机浏览器打开命令输出的地址即可刷题
 * 用法：node tools/serve.js [端口，默认 8080]
 * 说明：题库在文件里、学习记录在本机浏览器 localStorage；手机与电脑的记录各自独立，
 *       可用「设置 → 数据与题库 → 导出 / 导入 JSON」互相迁移。
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.argv[2] || 8080);
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.ico': 'image/x-icon', '.svg': 'image/svg+xml', '.woff2': 'font/woff2'
};

function lanIPs() {
  const out = [];
  Object.entries(os.networkInterfaces()).forEach(([name, list]) => (list || []).forEach(n => {
    if (n.family === 'IPv4' && !n.internal) out.push({ name, address: n.address });
  }));
  // 家用 Wi-Fi 网卡（WLAN/Wi-Fi）优先，其次 192.168.x / 10.x
  return out.sort((a, b) => {
    const rank = x => {
      if (/wlan|wi-?fi|无线/i.test(x.name)) return 0;
      if (x.address.startsWith('192.168.')) return 1;
      if (x.address.startsWith('10.')) return 2;
      return 3;
    };
    return rank(a) - rank(b);
  });
}

http.createServer((req, res) => {
  let p = decodeURIComponent((req.url || '/').split('?')[0]);
  if (p === '/') p = '/index.html';
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end('forbidden'); return; }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }); res.end('not found: ' + p); return; }
    res.writeHead(200, {
      'content-type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'cache-control': 'no-store'
    });
    res.end(buf);
  });
}).listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('  306 训练台 · 局域网服务已启动');
  console.log('  电脑本机:  http://localhost:' + PORT + '/');
  lanIPs().forEach(x => console.log('  手机访问:  http://' + x.address + ':' + PORT + '/   （网卡: ' + x.name + '）'));
  console.log('');
  console.log('  关闭：Ctrl+C');
});
