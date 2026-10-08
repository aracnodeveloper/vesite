import PhonePreview from "../../biosite/preview/phonePreview.tsx";
import NewBiositePage from "../../biosite-public/NewBiositePage.tsx";

interface AnalyticsHeroProps {
  slug?: string;
  views: number;
  clicks: number;
  ctr: number;
}

const BUBBLE = "bg-[#E8FAD5] border border-gray-400 rounded-full flex flex-col items-center justify-center";

/** Cabecera de escritorio: el biosite en un teléfono rodeado de las métricas clave. */
const AnalyticsHero = ({ slug, views, clicks, ctr }: AnalyticsHeroProps) => (
  <div className="relative flex items-center justify-center mb-16">
    <div
      className="absolute transform rounded-full flex flex-col items-center justify-center"
      style={{ height: "700px", width: "700px" }}
    >
      <svg width="900" height="900" viewBox="0 0 900 900" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_d_2019_354)">
          <circle cx="429" cy="425" r="416" fill="white" />
        </g>
        <defs>
          <filter
            id="filter0_d_2019_354"
            x="0"
            y="0"
            width="900"
            height="900"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feMorphology radius="3" operator="dilate" in="SourceAlpha" result="effect1_dropShadow_2019_354" />
            <feOffset dy="4" />
            <feGaussianBlur stdDeviation="5" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.03 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2019_354" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2019_354" result="shape" />
          </filter>
        </defs>
      </svg>
    </div>

    <div className={`absolute left-24 top-1/3 transform -translate-y-1/2 w-44 h-44 ${BUBBLE}`}>
      <div className="text-xs text-black mb-1">VISTAS</div>
      <div className="text-4xl font-bold text-black">{views}</div>
    </div>

    <div className="z-10 overflow-y-hidden w-[370px] h-[700px] ">
      <PhonePreview>
        <NewBiositePage slug={slug} />
      </PhonePreview>
    </div>

    <div className={`absolute right-30 top-52 w-38 h-38 ${BUBBLE}`}>
      <div className="text-xs text-black mb-1">CLICKS</div>
      <div className="text-2xl font-bold text-black">{clicks}</div>
    </div>

    <div className={`absolute right-40 bottom-40 w-32 h-32 ${BUBBLE}`}>
      <div className="text-xs text-black mb-1">CTR</div>
      <div className="text-2xl font-bold text-black">{ctr}%</div>
    </div>
    <div className={`absolute left-60 top-22 w-13 h-13 ${BUBBLE}`}></div>

    <div className={`absolute left-58 bottom-38 w-10 h-10 ${BUBBLE}`}></div>
  </div>
);

export default AnalyticsHero;
