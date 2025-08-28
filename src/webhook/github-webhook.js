import api, { route } from "@forge/api";

export const run = async ({ body }) => {
  const payload = JSON.parse(body);

  if (!isPRClosedOrMerged(payload)) {
    return message("Not a PR closed/merged event - skipping");
  }

  const ticketNumber = extractTicketNumber(payload);
  if (!ticketNumber) {
    return message("No ticket found in GitHub event");
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

  const { transitions } = await transitionsResponse.json();

  const closeTransition = transitions.find(({ to: { name } }) =>
    ["done", "closed", "resolved"].includes(name.toLowerCase()),
  );

  if (!closeTransition) {
    const availableStatuses = transitions
      .map(({ to: { name } }) => name)
      .join(", ");
    return message(
      `No Done/Closed transition found for ${ticketNumber}. Available: ${availableStatuses}`,
    );
  }

  const transitionResponse = await api
    .asApp()
    .requestJira(route`/rest/api/3/issue/${ticketNumber}/transitions`, {
      method: "POST",
      body: JSON.stringify({ transition: { id: closeTransition.id } }),
      headers: { "Content-Type": "application/json" },
    });

  if (transitionResponse.status !== 204) {
    return message(
      `Failed to transition ${ticketNumber}. Status: ${transitionResponse.status}`,
    );
  }

  return message(`${ticketNumber} moved to ${closeTransition.to.name}`);
};

const isPRClosedOrMerged = ({ action, pull_request }) =>
  action === "closed" &&
  pull_request &&
  (pull_request.merged === true || pull_request.state === "closed");

const extractTicketNumber = ({ pull_request }) => {
  const ticketRegex = /([A-Za-z]{2,10}-\d+)/i;

  const sources = [pull_request?.title, pull_request?.head?.ref].filter(
    Boolean,
  );

  const foundTicket = sources
    .map((source) => source.match(ticketRegex)?.[1])
    .find(Boolean);

  if (foundTicket) {
    console.log(`Found ticket ${foundTicket} in PR`);
  }

  return foundTicket ?? null;
};

const message = (msg) => (console.log(msg), { statusCode: 204 });
