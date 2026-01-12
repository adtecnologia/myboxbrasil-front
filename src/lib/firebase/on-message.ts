import { onMessage } from 'firebase/messaging';
import { messaging } from './firebase';

export function listenForegroundMessages() {
  onMessage(messaging, (payload) => {
    // console.log('Mensagem recebida:', payload);

    new Notification(payload.notification?.title ?? '', {
      body: payload.notification?.body,
    });
  });
}
