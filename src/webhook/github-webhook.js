import api, { route } from "@forge/api";

export const run = async (event, context) => {
  const ticketNumber = extractTicketNumber(event);

  if (!ticketNumber) {
    console.log("No ticket found in GitHub event");
    return { statusCode: 204 };
  }

  await api
    .asApp()
    .requestJira(route`/rest/api/3/issue/${ticketNumber}/transitions`, {
      method: "POST",
      body: JSON.stringify({ transition: { id: "31" } }),
      headers: { "Content-Type": "application/json" },
    });

  console.log(`${ticketNumber} moved to Done`);

  return { statusCode: 204 };
};

function extractTicketNumber(event) {
  if (!event) return null;

  const ticketRegex = /([A-Z]{2,10}-\d+)/;

  const sources = [JSON.stringify(event)].filter(Boolean);

  for (const source of sources) {
    const match = source.match(ticketRegex);
    if (match) {
      return match[1];
    }
  }

  return null;
}
