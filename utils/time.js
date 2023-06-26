const getExcludedTimes = ({
  receptions,
  selectedServices,
  timeNow,
  startTime = "10:00",
  endTime = "23:00",
  masters,
}) => {
  let excludedTimes = [];

  //push all times to excluded
  let time = startTime;
  while (parseInt(time) !== parseInt(endTime)) {
    excludedTimes.push(time);
    time = parseInt(time) + 1 + ":00";
  }

  const fullTime =
    selectedServices.reduce((acc, service) => acc + parseInt(service.time), 0) / 60 || 1;

  masters.forEach((m) => {
    const mastersReceptions = receptions.filter((r) => r.masterId.toString() === m.toString());

    const excludedMasterTimes = [];

    for (let i = parseInt(startTime); i <= parseInt(endTime); i++) {
      if (i + fullTime > parseInt(endTime)) {
        for (let j = i; j < parseInt(endTime); j++) {
          !excludedMasterTimes.includes(j + ":00") && excludedMasterTimes.push(j + ":00");
        }
        break;
      }

      const busyReception = mastersReceptions.find((r) => parseInt(r.startTime) === i);

      let j;
      if (busyReception) {
        for (
          j = -fullTime + 1;
          j < parseInt(busyReception.endTime) - parseInt(busyReception.startTime);
          j++
        ) {
          i + j >= parseInt(startTime) &&
            !excludedMasterTimes.includes(i + j + ":00") &&
            excludedMasterTimes.push(i + j + ":00");
        }
        continue;
      }
      for (j = 0; j < fullTime; j++) {
        const busyReception = mastersReceptions.find((r) => parseInt(r.startTime) === i + j);
        if (busyReception) break;
      }

      if (j !== fullTime) {
        for (let k = 0; k < fullTime; k++) {
          !excludedMasterTimes.includes(i + k + ":00") && excludedMasterTimes.push(i + k + ":00");
        }
      }
    }

    excludedTimes = excludedMasterTimes.filter((time) => excludedTimes.includes(time));
  });

  //push todays times that are already expired
  if (parseInt(timeNow) !== parseInt(startTime) && parseInt(timeNow) > parseInt(startTime)) {
    let time = startTime;
    while (parseInt(time) <= parseInt(timeNow)) {
      !excludedTimes.includes(time) && excludedTimes.push(time);
      time = parseInt(time) + 1 + ":00";
    }
  }

  return excludedTimes.sort((a, b) => parseInt(a) - parseInt(b));
};

const getTimeRange = ({ start, end }) => {
  const times = [];
  let time = start;
  while (parseInt(time) < parseInt(end)) {
    times.push(time);
    time = parseInt(time) + 1 + ":00";
  }

  return times;
};

module.exports = {
  getExcludedTimes,
  getTimeRange,
};
