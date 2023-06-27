const bot = require('../bot/index');
const Reception = require("../models/Reception");
const Client = require("../models/Client");
const Master = require("../models/Master");
const Service = require("../models/Service");
const { getDates, dateTimezone } = require("../utils/date");
const { getExcludedTimes } = require("../utils/time");

class ReceptionController {
  async getAllReceptions(req, res) {
    try {
      const receptions = await Reception.find();

      return res.status(200).send({ success: true, receptions });
    } catch (e) {
      return res.status(500).send({ success: false, message: e.message });
    }
  }
  async addNewReception(req, res) {
    try {
      const client = await Client.create(req.body.client);

      if (!client) {
        return res.status(500).send({ success: false, message: "Cannot create new reception" });
      }

      console.log(client);

      const selectedServices = await Service.find({ _id: { $in: req.body.reception.services } });
      const fullTime =
        selectedServices.reduce((acc, service) => acc + parseInt(service.time), 0) / 60;
      const startTime = req.body.reception.startTime;
      const endTime = parseInt(startTime) + fullTime + ":00";

      const receptions = await Reception.find({
        $and: [
          { masterId: req.body.reception.masterId },
          {
            date: {
              $eq: new Date(req.body.reception.date),
            },
          },
        ],
      });

      //get current time
      let timeNow = startTime;
      if (
        new Date(req.body.reception.date).toISOString().substr(0, 10) ===
        dateTimezone(Date.now()).toISOString().substr(0, 10)
      ) {
        timeNow = new Date();
        timeNow = `${timeNow.getHours()}:${timeNow.getMinutes()}`;
      }

      const excludedTimes = getExcludedTimes({
        receptions,
        selectedServices,
        timeNow,
        startTime,
        endTime,
        masters: [req.body.reception.masterId],
      });

      if (excludedTimes.includes(startTime)) {
        return res.status(500).send({
          success: false,
          message: "Cannot create new reception with this date. Please choose another.",
        });
      }

      const reception = await Reception.create({
        ...req.body.reception,
        endTime,
        clientId: client._id,
      });

      if (!reception) {
        await Client.findOneAndDelete(client._id);
        return res.status(500).send({ success: false, message: "Cannot create new reception" });
      }

      const { queryId } = req.body;

      await bot.answerWebAppQuery(queryId, {
        type: 'article',
        id: queryId,
        title: 'Успешная покупка',
        input_message_content: {
            message_text: `${req.body.client}, вы записались в барбешоп на время: ${startTime}`
        }
      })

      return res.status(200).send({ success: true, reception });
    } catch (e) {
      return res.status(500).send({ success: false, message: e.message });
    }
  }
  async getDates(req, res) {
    try {
      const {
        type,
        masterId,
        services: strServices,
        startTime,
        endTime,
        weekends: strWeekends,
        daysRange = 30,
      } = req.query;
      const services = strServices ? strServices.split("_") : [];
      const weekends = strWeekends ? strWeekends.split("_") : [];
      const fromDate = dateTimezone(Date.now());
      const toDate = dateTimezone(Date.now());
      toDate.setDate(fromDate.getDate() + daysRange);

      let receptions;

      receptions = await Reception.find({
        $and: [
          masterId ? { masterId } : {},
          {
            date: {
              $gte: dateTimezone(fromDate).toISOString().substr(0, 10),
              $lte: dateTimezone(toDate).toISOString().substr(0, 10),
            },
          },
        ],
      });

      let masters;

      if (!masterId) {
        masters = await Master.find({});
        masters = masters.map((master) => master._id);
      } else {
        masters = [masterId];
      }

      const selectedServices = await Service.find({ _id: { $in: services } });

      const dates = getDates({
        type,
        receptions,
        selectedServices,
        startTime,
        endTime,
        fromDate,
        toDate,
        weekends,
        masters,
      });

      const minDate = dateTimezone(fromDate).toISOString().substr(0, 10);
      const maxDate = dateTimezone(toDate).toISOString().substr(0, 10);

      return res.status(200).send({
        success: true,
        data: {
          dates,
          minDate,
          maxDate,
        },
      });
    } catch (e) {
      return res.status(500).send({ success: false, message: e.message });
    }
  }
  async getBusyTimes(req, res) {
    try {
      const { masterId, services: strServices, startTime, endTime, date } = req.query;
      const services = strServices ? strServices.split("_") : [];

      let receptions;

      receptions = await Reception.find({
        $and: [
          masterId ? { masterId } : {},
          {
            date: {
              $eq: new Date(date),
            },
          },
        ],
      });

      let timeNow = startTime;
      if (
        new Date(date).toISOString().substr(0, 10) ===
        dateTimezone(Date.now()).toISOString().substr(0, 10)
      ) {
        timeNow = new Date(Date.now());
        timeNow = `${timeNow.getHours()}:${timeNow.getMinutes()}`;
      }

      let masters;

      if (!masterId) {
        masters = await Master.find({});
        masters = masters.map((master) => master._id);
      } else {
        masters = [masterId];
      }

      const selectedServices = await Service.find({ _id: { $in: services } });
      const excludedTimes = getExcludedTimes({
        receptions,
        selectedServices,
        startTime,
        endTime,
        timeNow,
        masters,
      });

      return res.status(200).send({ success: true, excludedTimes });
    } catch (e) {
      return res.status(500).send({ success: false, message: e.message });
    }
  }
}

module.exports = new ReceptionController();
