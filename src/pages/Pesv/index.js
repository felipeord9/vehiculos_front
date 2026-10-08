import React, { useState, useEffect } from 'react';
import { BsFileEarmarkPdfFill } from "react-icons/bs";
import { FaFileWord } from "react-icons/fa6";
import { FaFilePowerpoint } from "react-icons/fa6";
import { FaFileExcel } from "react-icons/fa6";
import { config } from "../../config";

const Pesv = () => {
  const [currentPath, setCurrentPath] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const urlList = `${config.apiUrl2}/pesv/files/list`;
  const urlDownload = `${config.apiUrl2}/pesv/files/download`;
  const [isMobile, setIsMobile] = useState(null);

  const fetchFiles = async (folderPath = '') => {
    setLoading(true);
    try {
      const res = await fetch(`${urlList}?path=${encodeURIComponent(folderPath)}`);
      const data = await res.json();
      setItems(data.items || []);
      setCurrentPath(folderPath);
    } catch (error) {
      alert(error)
      console.error('Error al cargar archivos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles('');
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 600px)");
    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener("change", () =>
      setIsMobile(mediaQuery.matches)
    );
    return () =>
      mediaQuery.removeEventListener("change", () =>
        setIsMobile(mediaQuery.matches)
      );
  }, []);

  const handleOpenFolder = (folderName) => {
    const nextPath = currentPath ? `${currentPath}/${folderName}` : folderName;
    fetchFiles(nextPath);
  };

  const handleGoBack = () => {
    if (!currentPath) return;
    const pathParts = currentPath.split('/');
    pathParts.pop();
    fetchFiles(pathParts.join('/'));
  };

  const handleNavigateBreadcrumb = (index) => {
    if (index === -1) {
      fetchFiles('');
      return;
    }
    const pathParts = currentPath.split('/');
    const newPath = pathParts.slice(0, index + 1).join('/');
    fetchFiles(newPath);
  };

  const handleDownload = (fileName) => {
    const relativeFilePath = currentPath ? `${currentPath}/${fileName}` : fileName;
    const downloadUrl = `${urlDownload}?filePath=${encodeURIComponent(relativeFilePath)}`;
    window.open(downloadUrl, '_blank');
  };

  const pathSegments = currentPath ? currentPath.split('/') : [];

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();

    switch (ext) {
      // Documentos
      case 'pdf':
        return <BsFileEarmarkPdfFill className='text-danger'/>;
      case 'doc':
      case 'docx':
        return <FaFileWord className='text-primary'/>;
      case 'xls':
      case 'xlsx':
      case 'csv':
        return <FaFileExcel className='text-success'/>;
      case 'ppt':
      case 'pptx':
        return <FaFilePowerpoint className='text-warning'/>;
      case 'txt':
        return '📄';

      // Imágenes
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
      case 'webp':
        return '🖼️';

      // Comprimidos
      case 'zip':
      case 'rar':
      case '7z':
      case 'tar':
      case 'gz':
        return '📦';

      // Audio y Video
      case 'mp3':
      case 'wav':
      case 'ogg':
        return '🎵';
      case 'mp4':
      case 'avi':
      case 'mkv':
      case 'mov':
        return '🎬';

      // Código y Web
      case 'html':
      case 'js':
      case 'jsx':
      case 'json':
      case 'css':
      case 'py':
        return '💻';

      // Ejecutables / Sistema
      case 'exe':
      case 'sh':
      case 'bat':
        return '⚙️';

      // Formato genérico
      default:
        return '📄';
    }
  };

  return (
    <div className="container py-4 mt-5" style={{ maxWidth: '900px' }}> 

      {/* 2. Contenedor Principal de Archivos */}
      <div
        className="rounded-3 border"
        style={{
          borderColor: '#30363d',
          height: '85vh',
          overflow: 'auto'
        }}
      >
        {/* Encabezado */}
        <div
          className="border-bottom d-flex align-items-center text-secondary small fw-semibold"
          style={{ backgroundColor: '#007bff', borderColor: 'white', color: 'white' }}
        >
            {isMobile ?
                <span
                    className="text-white text-decoration-none mt-1 mb-1 "
                    style={{ cursor: 'pointer', fontSize: 15 }}
                >
                    Plan Estratégico de Seguridad Vial
                </span>
                :
                <div className="d-flex align-items-center gap-1 mb-1 mt-1 fs-5 fw-bold" style={{fontSize: '12px'}}>
                    <span
                        className="text-dark text-decoration-none"
                        style={{ cursor: 'pointer', fontSize: 15 }}
                        onClick={() => handleNavigateBreadcrumb(-1)}
                    >
                        PESV
                    </span>
                    {pathSegments.map((segment, idx) => (
                        <React.Fragment key={idx}>
                            <span className="text-dark">/</span>
                            <span
                                className={idx === pathSegments.length - 1 ? 'text-white' : 'text-dark'}
                                style={{ cursor: idx === pathSegments.length - 1 ? 'default' : 'pointer', fontSize: 15 }}
                                onClick={() => idx !== pathSegments.length - 1 && handleNavigateBreadcrumb(idx)}
                            >
                            {segment}
                            </span>
                        </React.Fragment>
                    ))}
                </div>
            }
        </div>

        {/* Lista de Elementos */}
        {loading ? (
          <div className="p-4 text-center" style={{color: 'black'}}>Cargando contenido...</div>
        ) : (
          <div className="list-group list-group-flush">
            {/* Opción para subir de nivel '..' */}
            {currentPath && (
              <div
                className={`list-group-item d-flex align-items-center gap-0 ${isMobile ? 'px-0' : 'px-3'} py-2 border-bottom`}
                style={{
                  borderColor: '#007bff',
                  color: '#c9d1d9',
                  cursor: 'pointer'
                }}
                onClick={handleGoBack}
              >
                <span className="text-secondary">📁</span>
                <span className="fw-semibold text-dark">..</span>
              </div>
            )}

            {items.length === 0 && !currentPath ? (
              <div className="p-3 text-center text-secondary">Carpeta vacía</div>
            ) : (
              items.map((item, idx) => (
                <div
                  key={idx}
                  className={`list-group-item d-flex align-items-center justify-content-between ${isMobile ? 'px-0':'px-3'} py-2 border-bottom`}
                  style={{
                    borderColor: '#21262d',
                    color: 'black'
                  }}
                >
                  {item.isFolder ?
                    <div 
                        className="d-flex align-items-center gap-2 text-truncate" style={{ maxWidth: '80%' }}
                        className="fw-semibold"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleOpenFolder(item.name)}
                    >
                        <span>📁</span>
                        <span style={{fontSize: isMobile && 14}}>
                            {item.name}
                        </span>
                    </div>
                    :
                    <div className="d-flex align-items-center gap-2 text-truncate" style={{ maxWidth: '80%' }}>
                        <span>{getFileIcon(item.name)}</span>
                        <span>{item.name}</span>
                    </div>
                  }

                  {!item.isFolder && (
                    <button
                      className="btn btn-sm btn-outline-dark py-0 px-2"
                      style={{ fontSize: '0.75rem', borderColor: 'black' }}
                      onClick={() => handleDownload(item.name)}
                    >
                      Descargar
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Pesv;