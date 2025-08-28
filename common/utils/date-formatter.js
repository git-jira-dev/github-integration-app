class TimeStampFormatter {
  formatter = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, // AM/PM
  });

  formatTimestamp(input) {
    const date = new Date(input);
    const parts = this.formatter.formatToParts(date);
    const day = parts.find((p) => p.type === "day").value;
    const month = parts.find((p) => p.type === "month").value;
    const year = parts.find((p) => p.type === "year").value;
    const hour = parts.find((p) => p.type === "hour").value;
    const minute = parts.find((p) => p.type === "minute").value;
    const dayPeriod = parts.find((p) => p.type === "dayPeriod").value;

    return `${day}/${month}/${year} ${hour}:${minute} ${dayPeriod}`;
  }
}

export default new TimeStampFormatter();
