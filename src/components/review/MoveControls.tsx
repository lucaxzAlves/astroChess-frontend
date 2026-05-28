type MoveControlsProps = {
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
  onFlip: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
};

function ControlButton({
  label,
  onClick,
  className = "",
}: {
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button type="button" onClick={onClick} className={`game-review-control-button ${className}`}>
      {label}
    </button>
  );
}

export default function MoveControls({
  onPrev,
  onNext,
  onReset,
  onFlip,
  soundEnabled,
  onToggleSound,
}: MoveControlsProps) {
  return (
    <div className="game-review-controls">
      <ControlButton label="Anterior" onClick={onPrev} />
      <ControlButton label="Próximo" onClick={onNext} />
      <ControlButton label="Reiniciar" onClick={onReset} />
      <ControlButton label="Virar" onClick={onFlip} />
      <ControlButton
        label={soundEnabled ? "Som ligado" : "Som desligado"}
        onClick={onToggleSound}
        className="sound-toggle-button"
      />
    </div>
  );
}
