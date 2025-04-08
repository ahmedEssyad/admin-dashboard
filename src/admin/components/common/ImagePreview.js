import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { Delete } from '@mui/icons-material';

function ImagePreview({ src, alt, onDelete }) {
  return (
    <Box
      sx={{
        position: 'relative',
        width: 150,
        height: 150,
        display: 'inline-block',
        m: 1,
        border: '1px solid #ddd',
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
      {src ? (
        <>
          <img
            src={src}
            alt={alt || "Aperçu"}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          {onDelete && (
            <IconButton
              size="small"
              sx={{
                position: 'absolute',
                top: 5,
                right: 5,
                bgcolor: 'rgba(255, 255, 255, 0.7)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                },
              }}
              onClick={onDelete}
            >
              <Delete color="error" />
            </IconButton>
          )}
        </>
      ) : (
        <Typography
          variant="body2"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'text.secondary',
          }}
        >
          Aucune image
        </Typography>
      )}
    </Box>
  );
}

export default ImagePreview;