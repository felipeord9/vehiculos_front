import React, { useRef, useState } from 'react';
import { BsCloudUploadFill } from 'react-icons/bs';

const FileUploadCard = ({
  label,
  description,
  file,
  onFileSelect,
  onRemoveFile,
  accept = ".pdf", // 🎯 Restringido únicamente a PDF
  colors
}) => {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      // Validar que sea PDF si lo arrastran
      if (droppedFile.type === "application/pdf" || droppedFile.name.endsWith(".pdf")) {
        onFileSelect(droppedFile);
      } else {
        alert("Por favor selecciona únicamente archivos en formato PDF.");
      }
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div className='d-flex flex-column'>
      {label && <label className="form-label fw-semibold text-secondary mb-1">{label}</label>}

      <div
        className="text-center rounded-3 mb-2 d-flex flex-column align-items-center justify-content-center"
        style={{
          border: `2px dashed ${dragActive ? colors.primary : colors.border}`,
          padding: '20px 15px',
          cursor: file ? 'default' : 'pointer',
          transition: 'all 0.2s ease',
          backgroundColor: dragActive ? 'rgba(111, 66, 193, 0.05)' : '#ffffff',
          minHeight: '160px'
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={file ? undefined : onButtonClick}
      >
        <BsCloudUploadFill size={40} style={{ color: colors.primary, marginBottom: '10px' }} />

        {file ? (
          <div className="d-flex align-items-center justify-content-between w-100 border rounded-3 p-2 bg-light">
            <div className="text-start text-truncate me-2">
              <h6 className="fw-semibold text-dark mb-0 text-truncate" style={{ fontSize: '0.85rem' }}>
                {file.name}
              </h6>
              <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </small>
            </div>

            <button
              type="button"
              className="btn btn-sm btn-outline-danger border-0 rounded-circle"
              onClick={(e) => {
                e.stopPropagation();
                if (inputRef.current) inputRef.current.value = '';
                onRemoveFile();
              }}
              title="Eliminar archivo"
            >
              ✕
            </button>
          </div>
        ) : (
          <>
            <h6 className="fw-semibold text-dark mb-1" style={{ fontSize: '0.85rem' }}>
              {description || "Arrastra tu archivo PDF aquí o haz clic para seleccionar"}
            </h6>
            <small className="text-muted" style={{ fontSize: '0.75rem' }}>Solo archivos PDF</small>

            <input
              ref={inputRef}
              type="file"
              accept={accept}
              onChange={handleChange}
              style={{ display: "none" }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default FileUploadCard;