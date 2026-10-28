import type { BiositeFull, BiositeLink } from "../biosite/types/Biosite";

const VIDEO_ICON = "video-embed";
const APP_ICONS = ["appstore", "googleplay"];

/**
 * Qué comparte el admin con los biosites de sus usuarios hijos: el video, cada
 * tienda de apps y los links que marca (isSelected). Null si el link es propio.
 */
const sharedKind = (link: BiositeLink): string | null => {
  if (link.icon === VIDEO_ICON) return VIDEO_ICON;
  if (link.icon && APP_ICONS.includes(link.icon)) return link.icon;
  if (link.isSelected) return "selected";
  return null;
};

/**
 * El biosite del hijo tal como se muestra: con el fondo, los colores y los
 * links compartidos de su admin, leídos del padre al cargar. No guarda nada, así
 * que funciona para cualquier visitante y siempre refleja lo último del admin,
 * sin depender de que este entre a su biosite.
 *
 * - Los links marcados del hijo son siempre copias del admin (un hijo no puede
 *   marcar links): se cambian por los marcados actuales del padre.
 * - El video y cada tienda de apps se cambian solo si el padre tiene uno.
 * - Si el hijo tiene una copia antigua del link, se conserva su id para que
 *   los clics se sigan contando en el biosite del hijo.
 */
export const inheritFromParent = (child: BiositeFull, parent: BiositeFull): BiositeFull => {
  const parentShared = (parent.links ?? []).filter((link) => link.isActive && sharedKind(link));
  const replacedKinds = new Set(["selected", ...parentShared.map(sharedKind)]);

  const childLinks = child.links ?? [];
  const copies = childLinks.filter((link) => replacedKinds.has(sharedKind(link) ?? ""));
  const own = childLinks.filter((link) => !copies.includes(link));

  const usedCopies = new Set<string>();
  const inherited = parentShared.map((link) => {
    const kind = sharedKind(link);
    const copy = copies.find(
      (candidate) =>
        !usedCopies.has(candidate.id) &&
        sharedKind(candidate) === kind &&
        (kind !== "selected" || candidate.url === link.url || candidate.label === link.label)
    );
    if (copy) usedCopies.add(copy.id);
    return { ...link, id: copy?.id ?? link.id, biositeId: child.id };
  });

  return {
    ...child,
    backgroundImage: parent.backgroundImage || child.backgroundImage,
    colors: parent.colors ?? child.colors,
    links: [...own, ...inherited],
  };
};
