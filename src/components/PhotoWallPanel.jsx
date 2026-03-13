import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchTableRows, submitToTable, TABLES } from '../lib/api';

const PHOTO_REFRESH_MS = 6000;

function fileToCompressedDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxSize = 1280;
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const context = canvas.getContext('2d');
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.78));
      };
      img.onerror = () => reject(new Error('Impossible de lire cette image.'));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier image.'));
    reader.readAsDataURL(file);
  });
}

function PhotoWallPanel() {
  const [preview, setPreview] = useState('');
  const [photos, setPhotos] = useState([]);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const projectionRef = useRef(null);
  const galleryInputRef = useRef(null);
  const videoRef = useRef(null);
  const cameraStreamRef = useRef(null);

  const loadPhotos = async () => {
    const rows = await fetchTableRows(TABLES.PHOTOS);
    setPhotos(rows);
  };

  useEffect(() => {
    loadPhotos();
    const timer = window.setInterval(loadPhotos, PHOTO_REFRESH_MS);
    return () => {
      window.clearInterval(timer);
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((track) => track.stop());
        cameraStreamRef.current = null;
      }
    };
  }, []);

  const normalizedPhotos = useMemo(
    () =>
      photos
        .map((row) => ({
          id: String(row.id ?? row.created_at ?? Math.random()),
          author: row.author || 'Anonyme',
          caption: row.caption || '',
          imageData: row.image_data ?? row.imageData ?? '',
          createdAt: row.created_at ?? row.createdAt ?? '',
        }))
        .filter((row) => row.imageData),
    [photos],
  );

  const selectedPhoto = normalizedPhotos[0] || null;

  const onFileSelected = async (event) => {
    setStatus({ type: '', message: '' });
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      setPreview(dataUrl);
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    }
  };

  const openLiveCamera = async () => {
    setStatus({ type: '', message: '' });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      cameraStreamRef.current = stream;
      setCameraOpen(true);
      window.setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 0);
    } catch {
      setStatus({
        type: 'error',
        message: 'Impossible d’ouvrir la caméra. Utilise "🖼️ Galerie" en fallback.',
      });
    }
  };

  const closeLiveCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
    setCameraOpen(false);
  };

  const captureLivePhoto = () => {
    if (!videoRef.current) {
      return;
    }
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    setPreview(canvas.toDataURL('image/jpeg', 0.82));
    closeLiveCamera();
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });
    if (!preview) {
      setStatus({ type: 'error', message: 'Ajoute d’abord une photo.' });
      return;
    }

    setLoading(true);
    try {
      await submitToTable(TABLES.PHOTOS, {
        author: 'Invité',
        caption: '',
        imageData: preview,
      });
      setPreview('');
      setStatus({ type: 'success', message: 'Photo projetée 📸' });
      await loadPhotos();
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const openFullscreen = async () => {
    if (!projectionRef.current) {
      return;
    }
    if (projectionRef.current.requestFullscreen) {
      await projectionRef.current.requestFullscreen();
    }
  };

  return (
    <article className="card">
      <h2>Photo live 📸</h2>
      <p className="section-help">Prends une photo puis projette-la.</p>

      <form className="form" onSubmit={onSubmit}>
        <div className="photo-actions">
          <button type="button" onClick={openLiveCamera}>
            📸 Prendre une photo en live
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() => galleryInputRef.current?.click()}
          >
            🖼️ Galerie
          </button>
        </div>
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          onChange={onFileSelected}
          hidden
        />

        {cameraOpen && (
          <div className="camera-stage">
            <video ref={videoRef} autoPlay playsInline muted />
            <div className="photo-actions">
              <button type="button" onClick={captureLivePhoto}>
                Capturer la photo
              </button>
              <button type="button" className="secondary-button" onClick={closeLiveCamera}>
                Annuler
              </button>
            </div>
          </div>
        )}

        {preview && (
          <div className="photo-preview">
            <img src={preview} alt="Aperçu avant envoi" />
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Projection...' : 'Projeter la photo'}
        </button>
        {status.message && <p className={`status ${status.type}`}>{status.message}</p>}
      </form>

      <div className="bet-block">
        <h3>Projection en grand</h3>
        {selectedPhoto ? (
          <>
            <div className="projection-stage" ref={projectionRef}>
              <img src={selectedPhoto.imageData} alt="Photo projetée" />
            </div>
            <button type="button" className="secondary-button" onClick={openFullscreen}>
              Afficher en grand (plein écran)
            </button>
          </>
        ) : (
          <p className="muted">Aucune photo pour le moment.</p>
        )}
      </div>
    </article>
  );
}

export default PhotoWallPanel;
