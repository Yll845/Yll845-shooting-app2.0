import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

/**
 * ImportExcelDialog - komponent i ripërdorshëm për import nga Excel
 * Props:
 *   open, onOpenChange - kontrolli i dialogut
 *   title - titulli i dialogut
 *   columnMap - { 'Emri i Kolonës Excel': 'field_name_entity' }
 *   onImport(rows) - funksioni që merr rreshtat dhe i ruan në DB
 */
export default function ImportExcelDialog({ open, onOpenChange, title, columnMap, onImport }) {
  const [preview, setPreview] = useState([]);
  const [fileName, setFileName] = useState('');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const fileRef = useRef();

  const reset = () => {
    setPreview([]);
    setFileName('');
    setResult(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const wb = XLSX.read(ev.target.result, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

      // Mapëzo kolonat shqip → fushat e entitetit
      const mapped = rows.map(row => {
        const obj = {};
        Object.entries(columnMap).forEach(([colName, fieldName]) => {
          const val = row[colName];
          if (val !== undefined && val !== '') {
            // Konverto true/false string
            if (val === 'true') obj[fieldName] = true;
            else if (val === 'false') obj[fieldName] = false;
            else obj[fieldName] = val;
          }
        });
        return obj;
      }).filter(r => Object.keys(r).length > 0);

      setPreview(mapped);
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    setImporting(true);
    let success = 0, failed = 0;
    for (const row of preview) {
      try {
        await onImport(row);
        success++;
      } catch {
        failed++;
      }
    }
    setImporting(false);
    setResult({ success, failed });
  };

  const previewColumns = preview.length > 0 ? Object.keys(preview[0]) : [];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">{title}</DialogTitle>
        </DialogHeader>

        {result ? (
          <div className="py-6 text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
            <p className="text-lg font-semibold">{result.success} rekorde u importuan me sukses</p>
            {result.failed > 0 && (
              <p className="text-sm text-destructive">{result.failed} rekorde dështuan</p>
            )}
            <Button onClick={handleClose} className="mt-4">Mbyll</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Upload zona */}
            <div
              className="border-2 border-dashed border-muted rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">{fileName || 'Kliko për të zgjedhur skedarin Excel (.xlsx)'}</p>
              <p className="text-xs text-muted-foreground mt-1">Vetëm skedarë .xlsx</p>
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleFile}
              />
            </div>

            {/* Paralajmërim */}
            {preview.length === 0 && fileName && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Skedari nuk ka të dhëna të vlefshme. Sigurohu që po përdor template-n e saktë.</span>
              </div>
            )}

            {/* Preview */}
            {preview.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2 text-muted-foreground">
                  Parapamje: {preview.length} rreshta të gjetur
                </p>
                <div className="overflow-x-auto border rounded-lg">
                  <table className="text-xs w-full">
                    <thead className="bg-muted/60">
                      <tr>
                        {previewColumns.map(c => (
                          <th key={c} className="px-3 py-2 text-left font-semibold whitespace-nowrap">{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.slice(0, 5).map((row, i) => (
                        <tr key={i} className="border-t">
                          {previewColumns.map(c => (
                            <td key={c} className="px-3 py-1.5 whitespace-nowrap">{String(row[c] ?? '')}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {preview.length > 5 && (
                    <p className="text-xs text-muted-foreground px-3 py-2 border-t">...dhe {preview.length - 5} rreshta të tjerë</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={handleClose}>Anulo</Button>
              <Button
                onClick={handleImport}
                disabled={preview.length === 0 || importing}
              >
                {importing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {importing ? 'Duke importuar...' : `Importo ${preview.length} rekorde`}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}