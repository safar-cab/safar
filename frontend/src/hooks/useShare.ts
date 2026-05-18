export function useShare() {
  const canShare = typeof navigator !== 'undefined' && !!navigator.share;

  const share = async (data: { title: string; text: string; url: string }) => {
    if (!canShare) {
      await navigator.clipboard.writeText(data.url);
      return 'copied';
    }
    try {
      await navigator.share(data);
      return 'shared';
    } catch (e) {
      if ((e as Error).name === 'AbortError') return 'cancelled';
      await navigator.clipboard.writeText(data.url);
      return 'copied';
    }
  };

  return { canShare, share };
}
