import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Cookies from "js-cookie";
import { ImagePlus, Save, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "../../../shared/BackButton";
import Loading from "../../../shared/Loading";
import { useHistory } from "../../../../hooks/useHistory";
import { historyService } from "../../../../service/historyService";

const HistoryEditorPage = () => {
  const navigate = useNavigate();
  const { historyId } = useParams();
  const biositeId = Cookies.get("biositeId");
  const { getHistoryById, createHistory, updateHistory, loading, error } = useHistory();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [media, setMedia] = useState<string>();
  const [mediaFile, setMediaFile] = useState<File>();
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [isActive, setIsActive] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!historyId) return;
    void getHistoryById(historyId).then((item) => {
      if (!item) {
        setNotFound(true);
        return;
      }
      setTitle(item.title);
      setDescription(item.description ?? "");
      setMedia(item.image);
      setMediaType(item.mediaType);
      setIsActive(item.isActive);
    });
  }, [historyId, getHistoryById]);

  const processFile = (file: File) => {
    setUploadError(null);
    if (file.size > 20 * 1024 * 1024) {
      setUploadError("El archivo no puede superar los 20 MB");
      return;
    }
    setMediaFile(file);
    setMediaType(file.type.startsWith("video/") ? "video" : "image");
    const reader = new FileReader();
    reader.onload = () => setMedia(String(reader.result));
    reader.readAsDataURL(file);
  };

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    processFile(file);
    event.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || (!historyId && !biositeId)) return;

    setUploading(true);
    setUploadError(null);
    try {
      const mediaUrl = mediaFile
        ? await historyService.uploadMedia(mediaFile)
        : media?.startsWith("data:")
          ? undefined
          : media;
      const saved = historyId
        ? await updateHistory(historyId, { title, description, image: mediaUrl || "", mediaType, isActive })
        : await createHistory({ biosite_id: biositeId!, title, description, image: mediaUrl, mediaType, isActive });

      if (saved) navigate("/histories");
    } catch (uploadFailure) {
      setUploadError(
        uploadFailure instanceof Error
          ? uploadFailure.message
          : "No se pudo subir el contenido de la historia"
      );
    } finally {
      setUploading(false);
    }
  };

  if (loading && historyId && !title && !notFound) {
    return <div className="flex h-full items-center justify-center"><Loading /></div>;
  }

  return (
    <div className="mx-auto h-full w-full max-w-xl p-2 pb-10 lg:mt-20">
      <div className="border-b border-gray-700 px-4 py-4">
        <BackButton text={historyId ? "Editar historia" : "Nueva historia"} to="/histories" />
      </div>

      {notFound ? (
        <div className="m-4 rounded-2xl bg-white/60 p-8 text-center">
          <h2 className="font-semibold text-gray-900">Historia no encontrada</h2>
          <button type="button" onClick={() => navigate("/histories")} className="mt-4 rounded-full bg-black px-5 py-2 text-white">Volver</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 px-4 pt-6">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700">Título</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={60}
              required
              placeholder="Ej. Conoce nuestra novedad"
              className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-3 outline-none focus:border-[#98C022]"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700">Descripción</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={180}
              rows={3}
              placeholder="Añade un mensaje breve"
              className="w-full resize-none rounded-xl border border-gray-200 bg-white/80 px-4 py-3 outline-none focus:border-[#98C022]"
            />
          </label>

          <div>
            <span className="mb-2 block text-sm font-medium text-gray-700">Contenido</span>
            <div className="relative flex aspect-[4/5] max-h-[390px] items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 bg-white/50">
              {media ? (
                <>
                  {mediaType === "video" ? <video src={media} controls className="h-full w-full object-cover" /> : <img src={media} alt="Vista previa" className="h-full w-full object-cover" />}
                  <button type="button" onClick={() => { setMedia(undefined); setMediaFile(undefined); }} className="absolute right-3 top-3 rounded-full bg-black/50 p-2 text-white"><X size={16} /></button>
                </>
              ) : (
                <label 
                  className={`absolute inset-0 flex cursor-pointer flex-col items-center justify-center px-6 text-center transition-all ${
                    isDragging ? "bg-[#98C022]/10" : "hover:bg-gray-50/80"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <ImagePlus size={42} className={`mb-4 transition-colors ${isDragging ? "text-[#98C022]" : "text-gray-400"}`} />
                  <span className="text-base font-semibold text-gray-800">
                    {isDragging ? "Suelta el archivo aquí" : "Haz clic o arrastra un archivo"}
                  </span>
                  <span className="mt-2 text-sm text-gray-500">
                    {isDragging ? "..." : "Soporta imágenes o videos (Máx 20MB)"}
                  </span>
                  <input type="file" accept="image/*,video/*" className="hidden" onChange={handleFile} />
                </label>
              )}
            </div>
          </div>

          <label className="flex items-center justify-between rounded-xl bg-white/60 p-4">
            <span>
              <span className="block font-medium text-gray-900">Historia activa</span>
              <span className="text-xs text-gray-500">Desactívala para guardarla como borrador.</span>
            </span>
            <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} className="h-5 w-5 accent-[#98C022]" />
          </label>

          {(error || uploadError) && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{uploadError || error}</p>}
          <button type="submit" disabled={loading || uploading || !title.trim()} className="flex w-full items-center justify-center gap-2 rounded-full bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50">
            <Save size={17} /> {loading || uploading ? "Guardando..." : "Guardar historia"}
          </button>
        </form>
      )}
    </div>
  );
};

export default HistoryEditorPage;
