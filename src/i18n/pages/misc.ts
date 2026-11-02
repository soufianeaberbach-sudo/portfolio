import { defineDict } from '../dict';

/* The no-JavaScript brief confirmation and the not-found page. */
export const misc = defineDict(
  {
    sent: {
      title: 'Brief received — Soufiane Aberbach',
      description: 'Your development brief has been received.',
      eyebrow: 'Contact / brief received',
      heading: 'That’s everything<br />needed to <em>start</em>.',
      line: 'The brief has been received. The reply comes back to the email address you gave, in writing, with an honest scope and a realistic next step.',
      work: 'See the work',
      home: 'Back to the start',
    },
    notFound: {
      title: 'Page not found — Soufiane Aberbach',
      description:
        "The requested page is not available. Return to Soufiane Aberbach's portfolio or start a project brief.",
      eyebrow: '404 / Page not found',
      heading: 'Wrong turn.<br /><em>Clear route.</em>',
      line: 'The page may have moved, but the portfolio and project brief are still one step away.',
      home: 'Return home',
    },
  },
  {
    fr: {
      sent: {
        title: 'Brief reçu — Soufiane Aberbach',
        description: 'Votre brief de développement a bien été reçu.',
        eyebrow: 'Contact / brief reçu',
        heading: 'Tout ce qu’il faut<br />pour <em>commencer</em>.',
        line: 'Le brief a bien été reçu. La réponse vous parviendra par écrit à l’adresse e-mail indiquée, avec un périmètre honnête et une prochaine étape réaliste.',
        work: 'Voir le travail',
        home: 'Revenir à l’accueil',
      },
      notFound: {
        title: 'Page introuvable — Soufiane Aberbach',
        description:
          'La page demandée n’est pas disponible. Revenez au portfolio de Soufiane Aberbach ou lancez un brief de projet.',
        eyebrow: '404 / Page introuvable',
        heading: 'Mauvais détour.<br /><em>Chemin tout tracé.</em>',
        line: 'La page a peut-être changé d’adresse, mais le portfolio et le brief de projet restent à portée de main.',
        home: 'Retour à l’accueil',
      },
    },
    es: {
      sent: {
        title: 'Brief recibido — Soufiane Aberbach',
        description: 'Tu brief de desarrollo se ha recibido.',
        eyebrow: 'Contacto / brief recibido',
        heading: 'Es todo lo necesario<br />para <em>empezar</em>.',
        line: 'El brief se ha recibido. La respuesta llegará por escrito a la dirección de correo que indicaste, con un alcance honesto y un siguiente paso realista.',
        work: 'Ver el trabajo',
        home: 'Volver al inicio',
      },
      notFound: {
        title: 'Página no encontrada — Soufiane Aberbach',
        description:
          'La página solicitada no está disponible. Vuelve al portfolio de Soufiane Aberbach o inicia un brief de proyecto.',
        eyebrow: '404 / Página no encontrada',
        heading: 'Camino equivocado.<br /><em>Ruta clara.</em>',
        line: 'Puede que la página se haya movido, pero el portfolio y el brief de proyecto siguen a un paso.',
        home: 'Volver al inicio',
      },
    },
  },
);
