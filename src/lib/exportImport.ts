import type { Drop, Collection } from '@/types';

export function exportData(drops: Drop[], collections: Collection[]): void {
  const data = { version: 1, exportedAt: new Date().toISOString(), drops, collections };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `braindrop-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importData(file: File): Promise<{ drops: Drop[]; collections: Collection[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (!data.drops || !data.collections) reject(new Error('Formato inválido'));
        else resolve(data);
      } catch { reject(new Error('JSON inválido')); }
    };
    reader.readAsText(file);
  });
}
