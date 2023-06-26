const Service = require("../models/Service");
const Master = require("../models/Master");
const Reception = require("../models/Reception");
const { getExcludedTimes, getTimeRange } = require("../utils/time");
const { getDatesRange, dateTimezone } = require("../utils/date");

class MasterController {
  async getAllMasters(req, res) {
    try {
      const {
        services: strServices,
        date,
        time,
        startTime = "10:00",
        endTime = "23:00",
        daysRange = 30,
      } = req.query;
      const services = strServices ? strServices.split("_") : [];
      const fromDate = dateTimezone(Date.now());
      const toDate = dateTimezone(Date.now());
      toDate.setDate(fromDate.getDate() + daysRange);

      const masters = await Master.find();

      const selectedServices = await Service.find({ _id: { $in: services } });

      const receptions = await Reception.find({
        $and: [
          date && time
            ? {
                date: {
                  $eq: new Date(date),
                },
              }
            : {},
        ],
      });

      //push all dates to excluded
      let dates = [];
      if (date && time) {
        dates = [date];
      } else {
        dates = getDatesRange({ start: fromDate, end: toDate });
      }

      const allMasters = masters.map((master) => {
        const invalid = dates.every((date) => {
          const dateReceptions = receptions.filter(
            (r) => r.date.toISOString().substr(0, 10) === date
          );

          //get current time
          let timeNow = startTime;
          if (
            new Date(date).toISOString().substr(0, 10) ===
            dateTimezone(Date.now()).toISOString().substr(0, 10)
          ) {
            timeNow = new Date(Date.now());
            timeNow = `${timeNow.getHours()}:${timeNow.getMinutes()}`;
          }

          const excludedTimes = getExcludedTimes({
            receptions: dateReceptions,
            selectedServices,
            startTime,
            endTime,
            timeNow,
            masters: [master._id],
          });

          if (!excludedTimes.includes(time)) {
            return false;
          }
          return true;
        });

        return { ...master._doc, invalid };
      });

      return res.status(200).send({ success: true, masters: allMasters });
    } catch (e) {
      return res.status(500).send({ success: false, message: e.message });
    }
  }

  async addNewMaster(req, res) {
    try {
      const master = await Master.create(req.body);

      if (!master) {
        return res.status(500).send({ success: false, message: "Cannot create new master" });
      }

      return res.status(200).send({ success: true, master });
    } catch (e) {
      return res.status(500).send({ success: false, message: e.message });
    }
  }

  async getNearestReceptions(req, res) {
    try {
      const {
        masterId,
        num,
        services: strServices,
        startTime,
        endTime,
        daysRange = 30,
      } = req.query;
      const services = strServices ? strServices.split("_") : [];
      const fromDate = dateTimezone(Date.now());
      const toDate = dateTimezone(Date.now());
      toDate.setDate(fromDate.getDate() + daysRange);
      const result = [];

      const selectedServices = await Service.find({ _id: { $in: services } });

      const dates = getDatesRange({ start: fromDate, end: toDate });

      let masters;

      if (!masterId) {
        masters = await Master.find({});
        masters = masters.map((master) => master._id);
      } else {
        masters = [masterId];
      }

      for (let j = 0; j < masters.length; j++) {
        for (let i = 0; i < dates.length; i++) {
          let allowedTimes = [];
          let allowedDate = dates[i];

          const receptions = await Reception.find({
            $and: [
              { masterId: masters[j] },
              {
                date: {
                  $eq: new Date(dates[i]),
                },
              },
            ],
          });

          //get current time
          let timeNow = startTime;
          if (
            new Date(dates[i]).toISOString().substr(0, 10) ===
            dateTimezone(Date.now()).toISOString().substr(0, 10)
          ) {
            timeNow = new Date(Date.now());
            timeNow = `${timeNow.getHours()}:${timeNow.getMinutes()}`;
          }

          const excludedTimes = getExcludedTimes({
            receptions,
            selectedServices,
            startTime,
            endTime,
            timeNow,
            masters: [masters[j]],
          });

          const allTimes = getTimeRange({ start: startTime, end: endTime });

          allowedTimes = allTimes.filter((time, i) => !excludedTimes.includes(time)).slice(0, num);

          if (allowedTimes.length) {
            result.push({
              date: allowedDate,
              times: allowedTimes,
              masterId: masters[j],
            });
            break;
          }
        }
      }

      return res.status(200).send({
        success: true,
        data: result,
      });
    } catch (e) {
      return res.status(500).send({ success: false, message: e.message });
    }
  }
}

module.exports = new MasterController();
