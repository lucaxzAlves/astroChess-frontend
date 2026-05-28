import { getClassificationMeta } from "../../utils/reviewClassification";

type MoveQualityIconProps = {
  classification?: string | null;
  label?: string;
  size?: "sm" | "md" | "lg" | "board";
};

const ASSET_BASE_PATH = "/astro_chess_move_quality_assets";

export default function MoveQualityIcon({
  classification,
  label,
  size = "sm",
}: MoveQualityIconProps) {
  const meta = getClassificationMeta(classification);
  const assetId = "assetId" in meta ? meta.assetId : undefined;

  if (!assetId) {
    return (
      <span className={`move-quality-icon fallback ${size}`} aria-hidden={label ? undefined : "true"}>
        {meta.symbol}
      </span>
    );
  }

  return (
    <img
      src={`${ASSET_BASE_PATH}/${assetId}.svg`}
      alt={label || meta.label}
      className={`move-quality-icon ${size}`}
      draggable={false}
    />
  );
}
