import { useState } from 'react';
import { ComplianceDashboard } from './components/ComplianceDashboard';
import { CMMCLevel1Analysis } from './types/cmmc';
import Sidebar from './components/layout/Sidebar';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Upload } from 'lucide-react';

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<CMMCLevel1Analysis | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze file');
      }

      const result = await response.json();
      setAnalysisResult(result);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setUploading(false);
    }
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-64">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-foreground">CMMC Level 1 Compliance Dashboard</h1>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept=".csv,.json"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <Button
                onClick={() => {
                  if (file) {
                    handleUpload();
                  } else {
                    document.getElementById('file-upload')?.click();
                  }
                }}
                disabled={uploading}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {uploading ? 'Uploading...' : file ? 'Start Upload' : 'Upload Findings'}
              </Button>
              {file && (
                <Badge variant="secondary" className="text-sm">
                  {file.name}
                </Badge>
              )}
            </div>
          </div>
          <Card className="w-full">
            <ComplianceDashboard analysisData={analysisResult} />
          </Card>
        </div>
      </div>
    </div>
  );
  };
}
