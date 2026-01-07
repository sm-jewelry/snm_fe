import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Close as CloseIcon,
  Image as ImageIcon,
} from '@mui/icons-material';

interface ImageUploadFieldProps {
  value?: string;
  onChange: (url: string) => void;
  onUpload: (file: File) => Promise<string>;
  label?: string;
  maxSizeMB?: number;
  aspectRatio?: string;
}

/**
 * ImageUploadField Component
 * MUI-styled file input with image preview, progress indicator, and drag-and-drop support
 */
const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  value,
  onChange,
  onUpload,
  label = 'Upload Image',
  maxSizeMB = 5,
  aspectRatio,
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    setError(null);

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed');
      return;
    }

    try {
      setUploading(true);
      const url = await onUpload(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClear = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box>
      <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
        {label}
      </Typography>

      <Box
        sx={{
          border: 2,
          borderColor: 'divider',
          borderStyle: 'dashed',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          bgcolor: 'background.paper',
          position: 'relative',
          transition: 'all 0.2s',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover',
          },
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {value ? (
          <Box sx={{ position: 'relative' }}>
            <Box
              component="img"
              src={value}
              alt="Preview"
              sx={{
                maxWidth: '100%',
                maxHeight: 200,
                objectFit: 'contain',
                borderRadius: 1,
                aspectRatio: aspectRatio || 'auto',
              }}
            />
            <IconButton
              onClick={handleClear}
              size="small"
              sx={{
                position: 'absolute',
                top: -8,
                right: -8,
                bgcolor: 'background.paper',
                boxShadow: 1,
                '&:hover': {
                  bgcolor: 'error.main',
                  color: 'white',
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        ) : uploading ? (
          <Box sx={{ py: 3 }}>
            <CircularProgress size={40} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Uploading...
            </Typography>
          </Box>
        ) : (
          <Box>
            <ImageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Drag and drop an image here, or click to browse
            </Typography>
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={handleClick}
            >
              Choose File
            </Button>
            <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
              Max size: {maxSizeMB}MB
            </Typography>
          </Box>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default ImageUploadField;
