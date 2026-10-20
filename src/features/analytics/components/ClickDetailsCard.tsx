import type { ClickDetail } from "../types/Analytics";

const CLICK_GROUPS: { key: string; title: string; matches: (linkType?: string) => boolean }[] = [
  { key: "social", title: "Redes Sociales", matches: (t) => t === "social" },
  { key: "regular", title: "Enlaces Regulares", matches: (t) => t === "regular" },
  { key: "app", title: "Apps", matches: (t) => t === "app" },
  { key: "whatsapp", title: "WhatsApp", matches: (t) => t === "whatsapp" },
  { key: "post", title: "Publicaciones", matches: (t) => t === "social_post" },
  { key: "other", title: "Otros Enlaces", matches: (t) => !t },
];

/** Clicks por link agrupados por tipo de enlace. */
const ClickDetailsCard = ({ clickDetails }: { clickDetails: ClickDetail[] }) => (
  <div className="bg-white rounded-3xl p-10">
    <h2 className="text-lg font-medium text-black mb-4">Clicks por Link</h2>
    {clickDetails && clickDetails.length > 0 ? (
      <div className="space-y-4">
        {CLICK_GROUPS.map((group) => {
          const clicks = clickDetails.filter((click) => group.matches(click.link_type));
          if (clicks.length === 0) return null;

          return (
            <div key={group.key} className="border-b-2 border-gray-800 ">
              <h3 className="text-sm font-medium text-gray-400 mb-2 px-2">{group.title}</h3>
              <div className="bg-white rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <tbody>
                    {clicks.map((click, index) => (
                      <tr key={`${group.key}-${index}`} className="border-b border-gray-400 last:border-b-0">
                        <td className="px-4 py-3 text-black text-sm">{click.label}</td>
                        <td className="px-4 py-3 text-black font-semibold text-right">{click.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    ) : (
      <div className="bg-black/50 p-6 rounded-lg text-center">
        <p className="text-gray-400">No click data available yet.</p>
      </div>
    )}
  </div>
);

export default ClickDetailsCard;
