export function getWeekNumber(date: Date): number {
  const tempDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = tempDate.getUTCDay() || 7;
  tempDate.setUTCDate(tempDate.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tempDate.getUTCFullYear(), 0, 1));
  return Math.ceil((tempDate.getTime() - yearStart.getTime() + 1) / 86400000 / 7);
}

export function getCurrentWeekDays(): { dayName: string; date: string; fullDate: Date }[] {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  return Array.from({ length: 5 }).map((_, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    return {
      dayName: day.toLocaleDateString("nl-NL", { weekday: "long" }),
      date: `${day.getDate().toString().padStart(2, "0")}/${(day.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`,
      fullDate: day,
    };
  });
}
