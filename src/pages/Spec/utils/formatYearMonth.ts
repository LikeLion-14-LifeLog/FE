export const formatYearMonth = (value: string) => {
  const [year, month] = value.split("-");
  return year && month ? `${year}.${Number(month)}` : value;
};