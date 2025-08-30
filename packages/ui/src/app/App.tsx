import { useGetContextQuery } from '@/hooks/useContext';
import { MODULE_KEYS } from '@app/shared';
import Spinner from '@atlaskit/spinner';
import { lazy, Suspense } from 'react';
import SectionMessage from '@atlaskit/section-message';

const JiraIssuePanel = lazy(() => import('@/components/JiraIssueContext/JiraIssueContext'));

export const App = () => {
  const { data: context, isLoading } = useGetContextQuery();
  if (isLoading) {
    return <Spinner />;
  }

  switch (context?.moduleKey) {
    case MODULE_KEYS.jiraIssueContext:
      return (<Suspense fallback={<Spinner size="large" />}><JiraIssuePanel /></Suspense>);
    default:
      return (
        <SectionMessage appearance="error">
          {`Component is not configured for ${context?.moduleKey ?? 'unknown'}`}
        </SectionMessage>
      );
  }
};
