const fs = require('fs');
const path = require('path');

const adminDir = "f:\\Рабочий стол\\Проект КУТОК МІСТА\\Интернет-магазин\\src\\app\\[locale]\\admin";
const protectedDir = path.join(adminDir, '(protected)');

if (!fs.existsSync(protectedDir)) {
  fs.mkdirSync(protectedDir);
}

const itemsToMove = ['products', 'page.tsx'];

for (const item of itemsToMove) {
  const oldPath = path.join(adminDir, item);
  const newPath = path.join(protectedDir, item);
  if (fs.existsSync(oldPath)) {
    try {
      fs.cpSync(oldPath, newPath, { recursive: true });
      fs.rmSync(oldPath, { recursive: true, force: true });
      console.log(`Copied & deleted ${item}`);
    } catch (err) {
      console.error(`Failed on ${item}`, err);
    }
  } else {
    console.log(`Skipped ${item} (does not exist)`);
  }
}
