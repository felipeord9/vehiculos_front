import React from 'react';

const Gps = () => {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <h2>Sitio Web Integrado</h2>
      <iframe
        src="https://www.analiticaituran.com/login.php"
        title="Página Externa"
        width="100%"
        height="92%"
        style={{ border: 'none' }}
        sandbox="allow-scripts allow-same-origin allow-forms"
      />
    </div>
  );
};

export default Gps;