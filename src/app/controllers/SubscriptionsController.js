import { Op } from 'sequelize';
import User from '../models/User';
import Meetup from '../models/Meetup';
import Subscription from '../models/Subscription';

class SubscriptionsController {
  async index(req, res) {
    const subscriptions = await Subscription.findAll({
      where: {
        user_id: req.userId,
      },
      include: [
        {
          model: Meetup,
          where: {
            date: {
              [Op.gt]: new Date(),
            },
          },
          required: true,
        },
      ],
      order: [[Meetup, 'date']],
    });

    return res.json(subscriptions);
  }

  async store(req, res) {
    const meetup = await Meetup.findByPk(req.params.meetupId, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name'],
        },
      ],
    });

    const user = await User.findByPk(req.userId);

    /**
     * check if meetup exists
     */

    if (!meetup) {
      return res.status(400).json({ error: 'meetup not found' });
    }

    /**
     * Check meetup owner
     */

    if (meetup.owner_id === req.userId) {
      return res
        .status(400)
        .json({ error: "Can't subscribe to you own meetups" });
    }

    /**
     * Check meetup past
     */

    if (meetup.past) {
      return res.status(400).json({ error: "Can't subscribe to past meetups" });
    }

    /**
     * Check duplicate subscription
     */

    const checkDuplicate = await Subscription.findOne({
      where: {
        meetup_id: meetup.id,
        user_id: user.id,
      },
    });

    if (checkDuplicate) {
      return res
        .status(400)
        .json({ error: 'You are already subscribed to this meetup' });
    }

    /**
     * Check duplicate date
     */

    const checkAvailableDate = await Subscription.findOne({
      where: {
        user_id: user.id,
      },
      include: [
        {
          model: Meetup,
          required: true,
          where: {
            date: meetup.date,
          },
        },
      ],
    });

    if (checkAvailableDate) {
      return res
        .status(400)
        .json({ error: 'You cannot join two meetups at the same time.' });
    }

    const subscription = await Subscription.create({
      meetup_id: req.params.meetupId,
      user_id: req.userId,
    });

    return res.json(subscription);
  }
}

export default new SubscriptionsController();
