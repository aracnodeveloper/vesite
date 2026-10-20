import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const OPEN_HEIGHT = 85;

/**
 * Drawer inferior de la vista móvil: se abre al navegar a una sección, se
 * cierra arrastrándolo hacia abajo y bloquea el scroll de la página mientras
 * está abierto. Su estado se recuerda en localStorage.
 */
export const useMobileDrawer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem("drawerOpen");
    return saved ? JSON.parse(saved) : false;
  });
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [height, setHeight] = useState(OPEN_HEIGHT);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Bloquear el scroll de la página (salvo dentro del drawer) mientras está abierto
  useEffect(() => {
    const unlock = () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };

    if (!isOpen) {
      unlock();
      return unlock;
    }

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const preventOutsideScroll = (e: TouchEvent) => {
      if (e.target && drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        e.preventDefault();
      }
    };
    document.addEventListener("touchmove", preventOutsideScroll, { passive: false });

    return () => {
      document.removeEventListener("touchmove", preventOutsideScroll);
    };
  }, [isOpen]);

  useEffect(() => {
    localStorage.setItem("drawerOpen", JSON.stringify(isOpen));
  }, [isOpen]);

  // Cualquier ruta distinta de /sections abre el drawer
  useEffect(() => {
    if (location.pathname != "/sections" || isOpen == true) {
      setIsOpen(true);
      setHeight(OPEN_HEIGHT);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const openSection = (section: string) => {
    navigate(section);
    setSelectedSection(section);
    setIsOpen(true);
    setHeight(OPEN_HEIGHT);
  };

  const close = () => {
    setIsOpen(false);
    setSelectedSection(null);
    navigate("../");
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    setDragStartY("touches" in e ? e.touches[0].clientY : e.clientY);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleDragMove = (e: MouseEvent | TouchEvent) => {
      if (!drawerRef.current) return;

      const currentY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const deltaY = currentY - dragStartY;
      setHeight(Math.max(0, Math.min(95, height - (deltaY / window.innerHeight) * 100)));
      setDragStartY(currentY);
    };

    const handleDragEnd = () => {
      setIsDragging(false);
      if (height < 40) {
        close();
      } else {
        setHeight(OPEN_HEIGHT);
      }
    };

    document.addEventListener("mousemove", handleDragMove);
    document.addEventListener("mouseup", handleDragEnd);
    document.addEventListener("touchmove", handleDragMove);
    document.addEventListener("touchend", handleDragEnd);

    return () => {
      document.removeEventListener("mousemove", handleDragMove);
      document.removeEventListener("mouseup", handleDragEnd);
      document.removeEventListener("touchmove", handleDragMove);
      document.removeEventListener("touchend", handleDragEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging, dragStartY, height]);

  return {
    isOpen,
    open: () => setIsOpen(true),
    height,
    selectedSection,
    drawerRef,
    openSection,
    close,
    handleDragStart,
  };
};
