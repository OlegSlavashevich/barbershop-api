const getDates = ({
  type = "excluded",
  receptions,
  selectedServices,
  startTime,
  endTime,
  fromDate,
  toDate,
  weekends,
  masters,
}) => {
  const fullTime = selectedServices.reduce((acc, service) => acc + parseInt(service.time), 0) / 60;

  //push all dates to excluded
  let excludedDates = getDatesRange({ start: fromDate, end: toDate });

  masters.forEach((m) => {
    const mastersReceptions = receptions.filter((r) => r.masterId.toString() === m);
    const excludedMasterDates = [];

    //find and push busy dates for each master
    mastersReceptions.forEach((r) => {
      if (!excludedMasterDates.includes(r.date.toISOString().substr(0, 10))) {
        const currDateRecs = mastersReceptions
          .filter((rec) => rec.date.toISOString() === r.date.toISOString())
          .sort((a, b) => parseInt(a.startTime) - parseInt(b.startTime));

        let start = startTime;
        let end;
        let i;

        for (i = 0; i < currDateRecs.length; i++) {
          end = currDateRecs[i].startTime;
          if (
            i === currDateRecs.length - 1 &&
            parseInt(endTime) - parseInt(currDateRecs[i].endTime) >= fullTime
          ) {
            break;
          }
          if (parseInt(end) - parseInt(start) >= fullTime) {
            break;
          }
          start = currDateRecs[i].endTime;
        }

        if (i === currDateRecs.length) {
          excludedMasterDates.push(r.date.toISOString().substr(0, 10));
        }
      }
    });

    excludedDates = excludedMasterDates.filter((date) => excludedDates.includes(date));
  });

  //push weekends
  const weekendDate = new Date(fromDate);

  while (weekendDate.toISOString() !== toDate.toISOString()) {
    weekends.includes(weekendDate.getDay().toString()) &&
      excludedDates.push(weekendDate.toISOString().substr(0, 10));
    weekendDate.setDate(weekendDate.getDate() + 1);
  }

  if (type === "excluded") {
    return excludedDates;
  }

  //get included dates

  const allowedDates = [];

  date = new Date(fromDate);

  while (date.toISOString() !== toDate.toISOString()) {
    !excludedDates.includes(date.toISOString().substr(0, 10)) &&
      allowedDates.push(date.toISOString().substr(0, 10));
    date.setDate(date.getDate() + 1);
  }

  return allowedDates;
};

const getDatesRange = ({ start, end }) => {
  const dates = [];
  let date = new Date(start);
  while (date.toISOString().substr(0, 10) !== end.toISOString().substr(0, 10)) {
    dates.push(date.toISOString().substr(0, 10));
    date.setDate(date.getDate() + 1);
  }

  return dates;
};

const dateTimezone = (date) => {
  return new Date(date - new Date().getTimezoneOffset() * 60000);
};

module.exports = {
  getDates,
  getDatesRange,
  dateTimezone,
};
