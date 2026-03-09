const STATUS_PROGRESS = {
  draft: 0,
  quoted: 10,
  confirmed: 20,
  in_production: 50,
  quality_check: 70,
  ready_for_dispatch: 85,
  dispatched: 95,
  completed: 100,
  cancelled: 0,
  on_hold: 40,
};

export function getOrderProgress(status, statusPercentage) {
  const numericPercentage = Number(statusPercentage);

  if (Number.isFinite(numericPercentage) && numericPercentage > 0) {
    return Math.max(0, Math.min(100, numericPercentage));
  }

  return STATUS_PROGRESS[status] ?? 0;
}
