import { useGetReviewersForPrQuery } from '@/hooks/useContext';
import Spinner from '@atlaskit/spinner';
import { Text } from '@atlaskit/primitives';
import AvatarGroup, { AvatarProps } from '@atlaskit/avatar-group';
import { ReviewState } from '@app/shared';

interface Props {
  prID: number;
  repositoryFullName: string;
}

// ReviewState = "APPROVED" | "CHANGES_REQUESTED" | "COMMENTED" | "DISMISSED" | "PENDING"
const statusMap: Record<ReviewState, string> = {
  APPROVED: 'approved',
  CHANGES_REQUESTED: 'locked',
  DISMISSED: 'declined',
};

const PullRequestReviewers = ({ prID, repositoryFullName }: Props) => {
  const { data, isLoading } = useGetReviewersForPrQuery({ id: prID.toString(), repo_full_name: repositoryFullName });
  if (isLoading) {
    return <Spinner />;
  }
  if (!data || data.length === 0) {
    return <Text>No reviewers found</Text>;
  }

  const avatars: AvatarProps[] = data.map(d => ({
    key: d.id,
    name: d.user?.login ?? '',
    src: d.user?.avatar_url,
    status: statusMap[d.state],
  }));
  return (
    <AvatarGroup appearance="stack" data={avatars} />
  );
};

export default PullRequestReviewers;
