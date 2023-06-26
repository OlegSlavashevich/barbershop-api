const Service = require("../models/Service");
const Master = require("../models/Master");
const Reception = require("../models/Reception");
const { getExcludedTimes } = require("../utils/time");
const { getDatesRange } = require("../utils/date");

class ServiceController {
  async getAllServices(req, res) {
    try {
      const { masterId, date, time, startTime, endTime, daysRange = 30 } = req.query;
      const fromDate = new Date();
      const toDate = new Date();
      toDate.setDate(fromDate.getDate() + daysRange);

      let masters;

      if (!masterId) {
        masters = await Master.find({});
        masters = masters.map((master) => master._id);
      } else {
        masters = [masterId];
      }

      let services = await Service.find();

      const receptions = await Reception.find({
        $and: [
          masterId ? { masterId } : {},
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

      const allServices = services.map((service) => {
        const invalid =
          parseInt(time) < parseInt(startTime) ||
          parseInt(time) >= parseInt(endTime) ||
          dates.every((date) => {
            const dateReceptions = receptions.filter(
              (r) => r.date.toISOString().substr(0, 10) === date
            );

            //get current time
            let timeNow = startTime;
            if (
              new Date(date).toISOString().substr(0, 10) === new Date().toISOString().substr(0, 10)
            ) {
              timeNow = new Date();
              timeNow = `${timeNow.getHours()}:${timeNow.getMinutes()}`;
            }

            const excludedTimes = getExcludedTimes({
              receptions: dateReceptions,
              selectedServices: [service],
              startTime,
              endTime,
              timeNow,
              masters,
            });

            if (!excludedTimes.includes(time)) {
              return false;
            }
            return true;
          });

        return { ...service._doc, invalid };
      });

      return res.status(200).send({ success: true, services: allServices });
    } catch (e) {
      return res.status(500).send({ success: false, message: e.message });
    }
  }
  async addNewService(req, res) {
    try {
      const service = await Service.create(req.body);

      if (!service) {
        return res.status(500).send({ success: false, message: "Cannot create new service" });
      }

      return res.status(200).send({ success: true, service });
    } catch (e) {
      return res.status(500).send({ success: false, message: e.message });
    }
  }
}

module.exports = new ServiceController();
