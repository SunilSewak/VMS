export function isEventClosed(lifecycleStatus: string | undefined): boolean {
  return lifecycleStatus === 'CLOSED';
}

export function canModifyEvent(lifecycleStatus: string | undefined): boolean {
  return !isEventClosed(lifecycleStatus);
}
