import Meetup from '../models/Meetup';
import File from '../models/File';

class MyMettupController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const meetup = await Meetup.findAll({
      where: { owner_id: req.userId },
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
      ],
    });

    return res.json(meetup);
  }
}

export default new MyMettupController();
