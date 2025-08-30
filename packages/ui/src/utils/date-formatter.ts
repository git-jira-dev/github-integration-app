class TimeStampFormatter {
  formatter = new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true, // AM/PM
  });

  formatTimestamp(input: string): string {
    if (!input) {
      throw new Error('Input date string is required');
    }

    const date = new Date(input);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }

    const parts = this.formatter.formatToParts(date);
    const getValue = (type: Intl.DateTimeFormatPartTypes): string => {
      const part = parts.find(p => p.type === type);
      if (!part) {
        throw new Error(`Could not format date: missing ${type}`);
      }
      return part.value;
    };

    try {
      const day = getValue('day');
      const month = getValue('month');
      const year = getValue('year');
      const hour = getValue('hour');
      const minute = getValue('minute');
      const dayPeriod = getValue('dayPeriod');

      return `${day}/${month}/${year} ${hour}:${minute} ${dayPeriod}`;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to format timestamp: ${error.message}`);
      }
      throw error;
    }
  }
}

export default new TimeStampFormatter();
