import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Request } from "express";
import morgan from "morgan";
import { BadRequestError } from "./errors/http/bad-request.error";
import { NotFoundError } from "./errors/http/not-found.error";
import db from "./lib/db";
import errorHandler from "./lib/error-handler";
import { isAuth } from "./middlewares/is-auth";
import { Router } from "./utils/router";
import translator from "./utils/translator";
import userRepository from "./repositories/user.repository";
import chatRepository from "./repositories/chat.repository";
const app = express();
const router = new Router();
app.set('trust proxy', true)
app.set('view engine', 'ejs');
app.use(cors({ origin: 'http://localhost:3000', exposedHeaders: ['Access-Control-Allow-Origin'] }))
app.use(translator.translate());
app.use(express.json({
  verify: (req: Request, res, buf, encoding) => {
    try {
      JSON.parse(buf.toString());
    } catch (e) {
      throw new BadRequestError(req.t('invalid_json_body'));
    }
  }
}));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(morgan('combined'));
app.use('/assets', express.static('views/assets'));
app.get('/', (req, res) => {
  res.render('index');
})
app.get('/chats', isAuth(), async (req, res, next) => {
  const user = await userRepository.view({ id: req.user?.id })
  if (!user) throw new NotFoundError()
  const contacts = await userRepository.getContacts(user!.contacts)
  const unreadCounts = await chatRepository.getUnreadCounts(contacts.map(contact => [user.id, contact.id].sort().join('_')), user.id)
  // @ts-ignore
  contacts.forEach(contact => { contact.unread_count = unreadCounts.find(e => e.created_by == contact.id)?.unread_count || '0' })
  res.render('chats', {
    me: {
      id: req.user?.id,
      // first_name: user?.first_name,
      // last_name: user?.last_name,
      email: user?.email,
      dp: user?.dp,
      contacts
    },
    scripts: `
    <script> 
    var me = ${JSON.stringify({
      id: req.user?.id,
      // first_name: user?.first_name,
      // last_name: user?.last_name,
      email: user?.email,
      dp: user?.dp,
      contacts
    })}
    var current_chat = null;
    </script>
    `
  })
})

app.get('/setup-encryption', isAuth(), async (req, res, next) => {
  const user = await userRepository.view({ id: req.user?.id })
  if (!user) throw new NotFoundError()
  res.render('setup-encryption', {
    me: {
      id: req.user?.id,
      // first_name: user?.first_name,
      // last_name: user?.last_name,
      email: user?.email,
      dp: user?.dp,
    },
    scripts: `
    <script> 
    var me = ${JSON.stringify({
      id: req.user?.id,
      // first_name: user?.first_name,
      // last_name: user?.last_name,
      email: user?.email,
      dp: user?.dp,
    })}
    var current_chat = null;
    </script>
    `
  })
})

const views = ['register', 'login']

views.forEach((view) => {
  app.get(`/${view}`, (_req, res) => {
    res.render(view);
  });
});
app.get('/v1/ready', (_req, res) => { res.json({ message: 'OK' }); });
app.get('/v1/health-check', async (_req, res) => { res.json({ db: await db.healthCheck() }); });
app.all('/v1/:module/:action?/:id?', isAuth(), router.handle);
app.all('*', (_, __, next) => { next(new NotFoundError()) });
app.use(errorHandler());

export default app;