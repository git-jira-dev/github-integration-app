import { Box, Inline, Text } from '@atlaskit/primitives';
import { extractAppIdAndEnvFromContext, GITHUB_TOKEN_IS_NOT_CONFIGURED, PullRequest } from '@app/shared';
import Button from '@atlaskit/button/new';
import { ReactElement, useEffect, useState } from 'react';
import PullRequestStatus from '@/components/JiraIssueContext/components/PullRequestStatus';
import { Modal as ModalDialogClass } from '@forge/bridge/out/modal/modal';
import PullRequestsModal from '@/components/JiraIssueContext/components/PullRequestsModal';
import { useGetContextQuery, useGetPrForTicketQuery } from '@/hooks/useContext';
import { router, view } from '@forge/bridge';
import Spinner from '@atlaskit/spinner';
import SectionMessage, { SectionMessageAction, SectionMessageActionProps } from '@atlaskit/section-message';

const PullRequests = () => {
  const { data: context } = useGetContextQuery();
  const { data: prs, isLoading, error } = useGetPrForTicketQuery();
  const [latestPr, setLatestPr] = useState<PullRequest | undefined>(undefined);
  useEffect(() => {
    if (prs && prs.length > 0) {
      const latest = prs.reduce((a, b) => new Date(a.updated_at) > new Date(b.updated_at) ? a : b);
      setLatestPr(latest);
    }
  }, [prs]);

  if (error) {
    const actions: ReactElement<SectionMessageActionProps>[] = [];
    if (error === GITHUB_TOKEN_IS_NOT_CONFIGURED) {
      const { appId, envId } = extractAppIdAndEnvFromContext(context);
      if (appId && envId) {
        actions.push(<SectionMessageAction href="#" onClick={() => void router.open(`/jira/settings/apps/${appId}/${envId}`)}>GitHub settings</SectionMessageAction>);
      }
    }
    return (
      <SectionMessage appearance="error" actions={actions}>
        <Text>{error as string}</Text>
      </SectionMessage>
    );
  }

  const showModalClickHandler = () => {
    const modal = new ModalDialogClass({
      resource: 'ui',
      size: 'large',
      context: {
        prs: prs,
      },
    });

    void modal.open();
  };

  const closeModalDialogHandler = async () => {
    await view.close();
  };
  // this is Modal Dialog
  if (context?.extension.modal) return (
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    <PullRequestsModal prs={context.extension.modal.prs} onClose={closeModalDialogHandler} />
  );

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <Button
      appearance="subtle"
      onClick={showModalClickHandler}
      isDisabled={!prs || prs.length === 0}
    >
      <Inline space="space.100">
        <Box>
          <Text weight="bold">{prs?.length ?? 0}</Text>
        </Box>
        <Box>
          <Text>Pull requests</Text>
        </Box>
        <Box>
          <PullRequestStatus pr={latestPr} />
        </Box>
      </Inline>
    </Button>
  );
};

export default PullRequests;
