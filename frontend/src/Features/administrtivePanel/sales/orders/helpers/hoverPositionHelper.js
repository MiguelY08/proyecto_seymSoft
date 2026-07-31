export function calculateHoverPosition(target, options = {}) {
  const {
    tooltipWidth = 320,
    tooltipMaxHeight = 360,
    margin = 12,
    gap = 8,
  } = options;

  const rect = target.getBoundingClientRect();

  const centeredLeft = rect.left + rect.width / 2;

  const minLeft = tooltipWidth / 2 + margin;
  const maxLeft = window.innerWidth - tooltipWidth / 2 - margin;

  const spaceAbove = rect.top - margin;
  const spaceBelow = window.innerHeight - rect.bottom - margin;

  const opensAbove =
    spaceBelow < tooltipMaxHeight &&
    spaceAbove > spaceBelow;

  const availableHeight = opensAbove
    ? spaceAbove
    : spaceBelow;

  return {
    left: Math.min(Math.max(centeredLeft, minLeft), maxLeft),
    placement: opensAbove ? 'top' : 'bottom',
    top: opensAbove ? undefined : rect.bottom + gap,
    bottom: opensAbove
      ? window.innerHeight - rect.top + gap
      : undefined,
    maxHeight: Math.max(
      180,
      Math.min(tooltipMaxHeight, availableHeight - gap)
    ),
  };
}