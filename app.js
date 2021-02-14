import express from 'express';
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { router } from './registration.js';

dotenv.config();

const {
  PORT: port = 3000,
} = process.env;

const app = express();

app.use(express.urlencoded({ extended: true }));

const { url } = import.meta;
const path = dirname(fileURLToPath(url));

app.set('views', './views');
app.set('view engine', 'ejs');

app.use(express.static(join(path, './public')));
app.use('/', router);

/**
 * Hjálparfall til að athuga hvort reitur sé gildur eða ekki.
 *
 * @param {string} field Middleware sem grípa á villur fyrir
 * @param {array} errors Fylki af villum frá express-validator pakkanum
 * @returns {boolean} `true` ef `field` er í `errors`, `false` annars
 */
function isInvalid(field, errors) {
  return Boolean(errors.find((i) => i.param === field));
}

app.locals.isInvalid = isInvalid;

// TODO setja upp rest af virkni!
/**
 * Fall sem sér um 404 villur (middleware)
 *
 * @param { object } req Request hlutur
 * @param { object } res  Response hlutur
 * @param { function } next  Næsta middleware
 */
function fannstEkkiHandler(req, res, next) {    //eslint-disable-line
  const title = 'Efni fannst ekki';
  const message = '404 Villa - þetta efni fannst ekki';
  res.status(404).render('error', { title, message });
}
/**
 * Fall sem sér um 500 villur (middleware)
 *
 * @param { object } err  Villa sem kom upp
 * @param { object } req  Request hlutur
 * @param { object } res  Response hlutur
 * @param { function } next   Næsta middleware
 */
function villaHandler(err, req, res, next) {    //eslint-disable-line
  console.error(err);               //eslint-disable-line
  const title = 'Villa kom upp';
  const message = 'Því miður kom upp villa';
  res.status(500).render('error', { title, message });
}

app.use(fannstEkkiHandler);
app.use(villaHandler);

// Verðum að setja bara *port* svo virki á heroku
app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
