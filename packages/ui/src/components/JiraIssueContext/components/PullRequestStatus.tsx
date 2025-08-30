import { PullRequest } from '@app/shared';
import Lozenge, { ThemeAppearance } from '@atlaskit/lozenge';

interface Props {
  pr: PullRequest | undefined;
}

const statusMap: Record<PrStatus, ThemeAppearance> = {
  OPEN: 'inprogress',
  MERGED: 'success',
  DECLINED: 'removed',
  UNKNOWN: 'default',
};

function mapAppearance(status: PrStatus): ThemeAppearance {
  return statusMap[status];
}

type PrStatus = 'OPEN' | 'DECLINED' | 'MERGED' | 'UNKNOWN';

function resolvePrStatus(pr: PullRequest): PrStatus {
  if (pr.state === 'open') {
    return 'OPEN';
  }
  if (pr.state === 'closed' && !pr.merged_at) {
    return 'DECLINED';
  }
  if (pr.state === 'closed' && pr.merged_at) {
    return 'MERGED';
  }
  return 'UNKNOWN';
}

const PullRequestStatus = ({ pr }: Props) => {
  if (!pr) {
    return null;
  }
  const status = resolvePrStatus(pr);
  return (
    <Lozenge appearance={mapAppearance(status)} isBold>
      {status}
    </Lozenge>
  );
};

export default PullRequestStatus;
