export interface CalendarDay {
  date: string;
  events: { id: number; title: string }[];
}

export function buildMonthDays(
  year: number,
  month: number,
  apiDays: CalendarDay[]
): CalendarDay[] {
  const daysInMonth = new Date(year, month, 0).getDate();

  const apiMap = new Map(
    apiDays.map(d => [d.date, d.events])
  );

  const result: CalendarDay[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day)
      .toISOString()
      .split("T")[0];

    result.push({
      date,
      events: apiMap.get(date) ?? [],
    });
  }

  return result;
}
