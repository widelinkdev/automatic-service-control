import pino from 'pino';

export const logger = pino({
  level: 'info',
  transport: {
    targets: [
      {
        target: 'pino/file',
        options: { destination: './logs/app.log', mkdir: true },
      },
      { target: 'pino-pretty' } // para ver bonito en consola
    ]
  }
});
