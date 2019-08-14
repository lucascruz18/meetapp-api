import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class NewMeetupMail {
  get key() {
    return 'NewMeetupMail';
  }

  async handle({ data }) {
    const { user, meetup } = data;

    console.log('A fila executou!');

    await Mail.sendMail({
      to: `${user.name} <${user.email}>`,
      subject: 'Novo Inscrito para seu meetup',
      template: 'newmeetup',
      context: {
        owner: meetup.owner.name,
        subscribed: user.name,
        email: user.email,
        meetup: meetup.title,
        description: meetup.description,
        date: format(
          parseISO(meetup.date),
          "'dia' dd 'de' MMMM,' às' H:mm'h'",
          {
            locale: pt,
          }
        ),
      },
    });
  }
}

export default new NewMeetupMail();
