import * as Yup from 'yup';
import { isBefore, parseISO, startOfDay, endOfDay } from 'date-fns';
import { Op } from 'sequelize';
import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

class MeetupController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const parseDate = parseISO(req.query.date);

    const checkDate = req.query.date;

    if (checkDate) {
      const meetup = await Meetup.findAll({
        where: {
          date: { [Op.between]: [startOfDay(parseDate), endOfDay(parseDate)] },
        },
        order: ['date'],
        attributes: ['id', 'title', 'description', 'location', 'date', 'past'],
        limit: 10,
        offset: (page - 1) * 10,
        include: [
          {
            model: File,
            as: 'banner',
            attributes: ['id', 'path', 'url'],
          },
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'name'],
            include: [
              {
                model: File,
                as: 'avatar',
                attributes: ['id', 'path', 'url'],
              },
            ],
          },
        ],
      });

      return res.json(meetup);
    }

    const meetup = await Meetup.findAll({
      order: ['date'],
      attributes: ['id', 'title', 'description', 'location', 'date', 'past'],
      limit: 10,
      offset: (page - 1) * 10,
      include: [
        {
          model: File,
          as: 'banner',
          attributes: ['id', 'path', 'url'],
        },
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });

    return res.json(meetup);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      file_id: Yup.number().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    if (isBefore(parseISO(req.body.date), new Date())) {
      return res.status(400).json({ error: 'Past dates are not permited' });
    }

    const owner_id = req.userId;
    const meetup = await Meetup.create({
      owner_id,
      ...req.body,
    });

    return res.json(meetup);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      file_id: Yup.number(),
      description: Yup.string(),
      location: Yup.string(),
      date: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const meetup = await Meetup.findByPk(req.params.id);

    if (isBefore(parseISO(meetup.date), new Date())) {
      return res.status(400).json({ error: 'impossible to edit past meetups' });
    }

    if (meetup.owner_id !== req.userId) {
      return res
        .status(401)
        .json({ error: 'Only the organizer will be able to edit' });
    }

    if (meetup.past) {
      return res.status(400).json({ error: "Can't update past meetups." });
    }

    await meetup.update(req.body);

    return res.json(meetup);
  }

  async delete(req, res) {
    const meetup = await Meetup.findByPk(req.params.id);

    if (!meetup) {
      return res.status(400).json({ error: 'Meetup not found' });
    }

    if (isBefore(parseISO(meetup.date), new Date())) {
      return res.status(400).json({ error: 'impossible to edit past meetups' });
    }

    if (meetup.owner_id !== req.userId) {
      return res
        .status(401)
        .json({ error: 'Only the organizer will be able to delete' });
    }

    if (meetup.past) {
      return res.status(400).json({ error: "Can't update past meetups." });
    }

    await Meetup.destroy({ where: { id: meetup.id } });

    return res.json(meetup);
  }
}

export default new MeetupController();
