const express = require('express');
const asyncHandler = require('express-async-handler');
const webpush = require('web-push');
require('dotenv').config();

const { getEmployees, delEmployee } = require('../model/employees');

const router = express.Router();

const subscription = [];

router.get(
  '/employees',
  asyncHandler(async (req, res) => {
    res.json(getEmployees());
  }),
);

router.delete(
  '/employee/:id',
  asyncHandler(async (req, res) => {
    res.status(200).send(delEmployee(req.params.id));
  }),
);

router.post(
  '/subscribe',
  asyncHandler(async (req, res) => {
    subscription.push(req.body);
    res.status(201).end();
  }),
);

const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;
webpush.setVapidDetails('mailto:younas.h03@htlwienwest.at', publicVapidKey, privateVapidKey);

router.post('/notify', (req) => {
  const payload = JSON.stringify({ title: 'Push Notification geklappt', body: req.body });
  for (const sub of subscription) {
    try {
      webpush.sendNotification(sub, payload);
    } catch (error) {
      console.error(error);
    }
  }
});

module.exports = router;
