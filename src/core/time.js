export const HOURS_PER_DAY=24;
export const DAYS_PER_YEAR=360;
export const START_AGE=18;
export const START_HOUR=8;

export function getCalendar(totalHours){
  const absolute=START_HOUR+Math.max(0,Math.floor(totalHours));
  const totalDays=Math.floor(absolute/HOURS_PER_DAY);
  const dayOfLife=1+totalDays;
  const yearOffset=Math.floor(totalDays/DAYS_PER_YEAR);
  const dayInYear=totalDays%DAYS_PER_YEAR;
  const month=1+Math.floor(dayInYear/30);
  const day=1+(dayInYear%30);
  return {
    age:START_AGE+yearOffset,
    month,
    day,
    dayOfLife,
    hour:absolute%24
  };
}

export function addHours(state,hours){
  state.time.totalHours=Math.max(0,state.time.totalHours+Math.max(0,hours));
}
