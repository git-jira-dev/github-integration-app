import api, { route } from "@forge/api";

export const run = async (event, context) => {
  let payload = JSON.parse(event.body);

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

  const transitionsData = await transitionsResponse.json();
  const transitions = transitionsData.transitions;

  const closeTransition = transitions.find((transition) => {
    const targetStatus = transition.to.name.toLowerCase();
    return (
      targetStatus === "done" ||
      targetStatus === "closed" ||
      targetStatus === "resolved"
    );
  });

  if (!closeTransition) {
    const availableStatuses = transitions.map((t) => t.to.name).join(", ");
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

const isPRClosedOrMerged = (payload) => {
  // Check if it's a pull_request event with closed action
  if (payload.action !== "closed") return false;

  // Must have pull_request data
  if (!payload.pull_request) return false;

  // PR must be either merged or just closed
  return (
    payload.pull_request.merged === true ||
    payload.pull_request.state === "closed"
  );
};

const extractTicketNumber = (payload) => {
  const ticketRegex = /([A-Za-z]{2,10}-\d+)/i;

  const sources = [
    payload.pull_request?.title,
    payload.pull_request?.head?.ref,
  ].filter(Boolean);

  for (const source of sources) {
    const match = source.match(ticketRegex);
    if (match) {
      console.log(`Found ticket ${match[1]} in: ${source}`);
      return match[1];
    }
  }

  return null;
};

const message = (msg) => {
  console.log(msg);
  return { statusCode: 204 };
};
