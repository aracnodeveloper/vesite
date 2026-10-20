import { useEffect, useState } from "react";
import { onBiositeChanged } from "../../../core/events/biositeEvents";

/**
 * Número que aumenta cada vez que se guarda un cambio del biosite. Agrupa las
 * ráfagas (p. ej. subir una imagen y luego guardar el link) en un solo cambio.
 */
export const useBiositeChangeVersion = (debounceMs = 400) => {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const unsubscribe = onBiositeChanged(() => {
      clearTimeout(timer);
      timer = setTimeout(() => setVersion((v) => v + 1), debounceMs);
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [debounceMs]);

  return version;
};
