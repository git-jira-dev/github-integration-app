import { PullRequest } from '@app/shared';
import { Flex, Text, xcss } from '@atlaskit/primitives';
import { token } from '@atlaskit/tokens';
import Heading from '@atlaskit/heading';
import { IconButton } from '@atlaskit/button/new';
import CrossIcon from '@atlaskit/icon/core/cross';
import DynamicTable from '@atlaskit/dynamic-table';
import PullRequestStatus from '@/components/JiraIssueContext/components/PullRequestStatus';
import TimeStampFormatter from '@/utils/date-formatter';
import Tooltip from '@atlaskit/tooltip';
import Avatar from '@atlaskit/avatar';
import PullRequestReviewers from '@/components/JiraIssueContext/components/PullRequestReviewers';
import { router } from '@forge/bridge';
import { HeadType } from '@atlaskit/dynamic-table/types';

interface Props {
  prs: PullRequest[];
  onClose: () => void;
}
export const head: HeadType = {
  cells: [
    {
      key: 'id',
      content: 'ID',
      isSortable: true,
    },
    {
      key: 'repository',
      content: 'Repository',
      isSortable: true,
    },
    {
      key: 'title',
      content: 'Title',
      isSortable: true,
    },
    {
      key: 'status',
      content: 'Status',
    },
    {
      key: 'author',
      content: 'Author',
    },
    {
      key: 'reviewer',
      content: 'Reviewer',
    },
    {
      key: 'updated',
      content: 'Updated',
    },
  ],
};

const PullRequestsModal = ({ prs, onClose }: Props) => {
  const rows = prs.map((pr, index) => ({
    key: `row-${index.toString()}-${pr.id.toString()}`,
    onClick: () => void router.open(pr.html_url),
    className: 'clickable-row',
    cells: [
      {
        key: 'id',
        content: (
          <Text size="small">{pr.number}</Text>
        ),
      },
      {
        key: 'repository',
        content: <Text size="small">{pr.head.repo.full_name}</Text>,
      },
      {
        key: 'title',
        // content: <Button appearance="subtle" onClick={() => void router.open(pr.html_url)}>{pr.title}</Button>,
        content: pr.title,
      },
      {
        key: 'status',
        content: <PullRequestStatus pr={pr} />,
      },
      {
        key: 'author',
        content: (
          <Tooltip content={pr.user?.login}>
            <Avatar src={pr.user?.avatar_url} />
          </Tooltip>
        ),
      },
      {
        key: 'reviewer',
        content: (
          <PullRequestReviewers
            prID={pr.number}
            repositoryFullName={pr.head.repo.full_name}
          />
        ),
      },
      {
        key: 'updated',
        content: TimeStampFormatter.formatTimestamp(pr.updated_at),
      },
    ],
  }));
  return (
    <Flex
      direction="column"
      xcss={xcss({
        width: '100%',
      })}
    >
      <Flex
        justifyContent="space-between"
        alignItems="center"
        xcss={xcss({
          padding: 'space.200',
          borderBottom: `1px solid ${token('color.border')}`,
        })}
      >
        <Heading size="medium">
          {prs.length}
          {' '}
          Pull requests
        </Heading>
        <IconButton
          label="close"
          appearance="subtle"
          icon={CrossIcon}
          onClick={onClose}
        />
      </Flex>
      <Flex
        justifyContent="center"
        alignItems="center"
        xcss={xcss({
          padding: 'space.200',
          flex: 1,
          width: '100%',
          height: '100%',
        })}
      >
        <DynamicTable head={head} rows={rows} />
      </Flex>
    </Flex>
  );
};

export default PullRequestsModal;
