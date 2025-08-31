import { ForgeWebTriggerPayload, JiraTransitionsResponse, PullRequestEvent } from '@app/shared';
import api, { route } from '@forge/api';

export const run = async ({ body }: ForgeWebTriggerPayload) => {
  if (!body) {
    return message('Missing body, skipping event');
  }
  const payload: unknown = JSON.parse(body);

  if (!isPullRequestEvent(payload)) {
    return message('Not a PR event - skipping');
  }

  if (!isPRClosedOrMerged(payload)) {
    return message('Not a PR closed/merged event - skipping');
  }

  const ticketNumber = extractTicketNumber(payload);
  if (!ticketNumber) {
    return message('No ticket found in GitHub event');
  }

  const transitionsResponse = await api
    .asApp()
    .requestJira(route`/rest/api/3/issue/${ticketNumber}/transitions`);

  if (transitionsResponse.status === 404) {
    return message(`Issue ${ticketNumber} not found`);
  }

  if (transitionsResponse.status !== 200) {
    return message(`Failed to get transitions for ${ticketNumber}`);
  }

  const { transitions } = (await transitionsResponse.json()) as JiraTransitionsResponse;

  const closeTransition = transitions.find(({ to: { name } }) =>
    ['done', 'closed', 'resolved'].includes(name.toLowerCase()),
  );

  if (!closeTransition) {
    const availableStatuses = transitions
      .map(({ to: { name } }) => name)
      .join(', ');
    return message(
      `No Done/Closed transition found for ${ticketNumber}. Available: ${availableStatuses}`,
    );
  }

  const transitionResponse = await api
    .asApp()
    .requestJira(route`/rest/api/3/issue/${ticketNumber}/transitions`, {
      method: 'POST',
      body: JSON.stringify({ transition: { id: closeTransition.id } }),
      headers: { 'Content-Type': 'application/json' },
    });

  if (transitionResponse.status !== 204) {
    return message(
      `Failed to transition ${ticketNumber}. Status: ${transitionResponse.status.toString()}`,
    );
  }

  return message(`${ticketNumber} moved to ${closeTransition.to.name}`);
};

const isPullRequestEvent = (payload: unknown): payload is PullRequestEvent => {
  return typeof payload === 'object'
    && payload !== null
    && 'action' in payload
    && 'pull_request' in payload;
};

const isPRClosedOrMerged = ({ action, pull_request }: PullRequestEvent) =>
  action === 'closed' && pull_request.merged;

const extractTicketNumber = ({ pull_request }: PullRequestEvent) => {
  const ticketRegex = /([A-Za-z]{2,10}-\d+)/i;

  const sources = [pull_request.title, pull_request.head.ref].filter(
    Boolean,
  );

  const foundTicket = sources
    .map(source => (ticketRegex.exec(source))?.[1])
    .find(Boolean);
  if (foundTicket) {
    // eslint-disable-next-line no-console
    console.log(`Found ticket ${foundTicket} in PR`);
  }

  return foundTicket ?? null;
};

// eslint-disable-next-line no-console
const message = (msg: string) => (console.log(msg), { statusCode: 204 });
