import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Seo from '../../../components/common/Seo';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

export default function ImportExportPage() {
  const router = useRouter();
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResults, setImportResults] = useState<any>(null);
  const [exportStatus, setExportStatus] = useState('');
  const [exportFilters, setExportFilters] = useState({
    status: '',
    productId: '',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setImportFile(file);
        setImportResults(null);
      } else {
        alert('Please select a CSV file');
        e.target.value = '';
      }
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      alert('Please select a CSV file to import');
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/profile?login=true');
      return;
    }

    setImporting(true);
    setImportResults(null);

    try {
      const formData = new FormData();
      formData.append('file', importFile);

      const response = await fetch(`${API_GATEWAY_URL}/api/reviews/admin/import`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setImportResults(data.results);
        alert(data.message);
      } else {
        alert(data.message || 'Import failed');
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('Failed to import reviews. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/profile?login=true');
      return;
    }

    setExporting(true);
    setExportStatus('');

    try {
      const params = new URLSearchParams();
      if (exportFilters.status) params.append('status', exportFilters.status);
      if (exportFilters.productId) params.append('productId', exportFilters.productId);

      const response = await fetch(
        `${API_GATEWAY_URL}/api/reviews/admin/export?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reviews-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        setExportStatus('Export successful! File downloaded.');
      } else {
        const data = await response.json();
        alert(data.message || 'Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export reviews. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const downloadSampleCSV = () => {
    const sampleData = `userId,userName,userEmail,productId,productTitle,orderId,rating,title,comment,images,isVerifiedPurchase,status
694b6a0b0d061f44ab3d6e11,John Doe,john@example.com,69525ceda173ca03dde70bad,Bridal Necklace Set,ORD123,5,Amazing quality!,This necklace is absolutely stunning. The craftsmanship is excellent.,image1.jpg|image2.jpg,true,approved
694b6a0b0d061f44ab3d6e12,Jane Smith,jane@example.com,69525ceda173ca03dde70baf,Wedding Diamond Ring,ORD124,4,Very good,Beautiful ring but slightly smaller than expected.,image3.jpg,true,approved`;

    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-reviews-import.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <>
      <Seo title="Import/Export Reviews - Admin | SNM Jewelry" description="Bulk import reviews from CSV or export existing reviews from your SNM Jewelry admin panel." />

      <div className="import-export-page">
        <div className="admin-container">
          {/* Header */}
          <div className="admin-header">
            <div>
              <h1 className="admin-title">Import/Export Reviews</h1>
              <p className="admin-subtitle">
                Bulk import reviews from CSV or export existing reviews
              </p>
            </div>

            <button
              className="btn-back"
              onClick={() => router.push('/admin/reviews')}
            >
              ← Back to Reviews
            </button>
          </div>

          <div className="import-export-grid">
            {/* Import Section */}
            <div className="import-section">
              <div className="section-card">
                <div className="section-header">
                  <h2>📥 Import Reviews</h2>
                  <p>Upload a CSV file to bulk import reviews</p>
                </div>

                <div className="section-content">
                  {/* Sample Template */}
                  <div className="info-box">
                    <h3>📄 CSV Format Required</h3>
                    <p>Your CSV file must include these columns:</p>
                    <ul className="csv-columns">
                      <li><code>userId</code> - User's database ID</li>
                      <li><code>userName</code> - User's display name</li>
                      <li><code>userEmail</code> - User's email</li>
                      <li><code>productId</code> - Product MongoDB ObjectId</li>
                      <li><code>productTitle</code> - Product name</li>
                      <li><code>orderId</code> - Order ID</li>
                      <li><code>rating</code> - 1-5 (integer)</li>
                      <li><code>title</code> - Review title</li>
                      <li><code>comment</code> - Review text</li>
                      <li><code>images</code> - Pipe-separated URLs (optional)</li>
                      <li><code>isVerifiedPurchase</code> - true/false</li>
                      <li><code>status</code> - pending/approved/rejected</li>
                    </ul>

                    <button
                      className="btn-download-sample"
                      onClick={downloadSampleCSV}
                    >
                      📥 Download Sample CSV
                    </button>
                  </div>

                  {/* File Upload */}
                  <div className="upload-area">
                    <label htmlFor="csv-file" className="upload-label">
                      {importFile ? (
                        <>
                          <span className="file-icon">📄</span>
                          <span className="file-name">{importFile.name}</span>
                          <span className="file-size">
                            ({(importFile.size / 1024).toFixed(2)} KB)
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="upload-icon">📁</span>
                          <span>Click to select CSV file</span>
                          <small>or drag and drop</small>
                        </>
                      )}
                    </label>
                    <input
                      type="file"
                      id="csv-file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="file-input"
                    />
                  </div>

                  <button
                    className="btn-import"
                    onClick={handleImport}
                    disabled={!importFile || importing}
                  >
                    {importing ? '⏳ Importing...' : '📥 Import Reviews'}
                  </button>

                  {/* Import Results */}
                  {importResults && (
                    <div className="import-results">
                      <h3>Import Results</h3>
                      <div className="results-summary">
                        <div className="result-item success">
                          <span className="result-icon">✓</span>
                          <span className="result-label">Success:</span>
                          <span className="result-value">{importResults.success}</span>
                        </div>
                        <div className="result-item error">
                          <span className="result-icon">✕</span>
                          <span className="result-label">Failed:</span>
                          <span className="result-value">{importResults.failed}</span>
                        </div>
                      </div>

                      {importResults.errors && importResults.errors.length > 0 && (
                        <div className="import-errors">
                          <h4>Errors:</h4>
                          <ul>
                            {importResults.errors.slice(0, 10).map((err: any, index: number) => (
                              <li key={index}>
                                <strong>Row {index + 1}:</strong> {err.error}
                              </li>
                            ))}
                          </ul>
                          {importResults.errors.length > 10 && (
                            <p className="more-errors">
                              And {importResults.errors.length - 10} more errors...
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Export Section */}
            <div className="export-section">
              <div className="section-card">
                <div className="section-header">
                  <h2>📤 Export Reviews</h2>
                  <p>Download reviews as CSV file</p>
                </div>

                <div className="section-content">
                  {/* Export Filters */}
                  <div className="export-filters">
                    <h3>Export Filters (Optional)</h3>

                    <div className="filter-group">
                      <label>Status:</label>
                      <select
                        value={exportFilters.status}
                        onChange={(e) =>
                          setExportFilters({ ...exportFilters, status: e.target.value })
                        }
                        className="filter-select"
                      >
                        <option value="">All Reviews</option>
                        <option value="pending">Pending Only</option>
                        <option value="approved">Approved Only</option>
                        <option value="rejected">Rejected Only</option>
                      </select>
                    </div>

                    <div className="filter-group">
                      <label>Product ID (Optional):</label>
                      <input
                        type="text"
                        placeholder="Enter product ID to filter"
                        value={exportFilters.productId}
                        onChange={(e) =>
                          setExportFilters({ ...exportFilters, productId: e.target.value })
                        }
                        className="filter-input"
                      />
                    </div>
                  </div>

                  <button
                    className="btn-export"
                    onClick={handleExport}
                    disabled={exporting}
                  >
                    {exporting ? '⏳ Exporting...' : '📤 Export to CSV'}
                  </button>

                  {exportStatus && (
                    <div className="export-status success">
                      ✓ {exportStatus}
                    </div>
                  )}

                  {/* Export Info */}
                  <div className="info-box">
                    <h3>ℹ️ Export Information</h3>
                    <p>The exported CSV will include:</p>
                    <ul>
                      <li>All review data (user, product, ratings, comments)</li>
                      <li>Status and moderation information</li>
                      <li>Helpful vote counts</li>
                      <li>Timestamps (created & updated)</li>
                    </ul>
                    <p className="note">
                      <strong>Note:</strong> You can use the exported file to:
                    </p>
                    <ul>
                      <li>Backup your reviews</li>
                      <li>Analyze review data</li>
                      <li>Re-import after modifications</li>
                      <li>Migrate to another platform</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
