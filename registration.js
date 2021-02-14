import express from 'express';
import xss from 'xss';
import { check, validationResult, body } from 'express-validator';
import { insert, select } from './src/db.js';

export const router = express.Router();

/**
 * Higher-order fall sem umlykur async middleware með villumeðhöndlun.
 *
 * @param {function} fn Middleware sem grípa á villur fyrir
 * @returns {function} Middleware með villumeðhöndlun
 */
function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

/**
 * Hjálparfall sem XSS hreinsar reit í formi eftir heiti.
 *
 * @param {string} fieldName Heiti á reit
 * @returns {function} Middleware sem hreinsar reit ef hann finnst
 */
function sanitizeXss(fieldName) {
  return (req, res, next) => {
    if (!req.body) {
      next();
    }

    const field = req.body[fieldName];

    if (field) {
      req.body[fieldName] = xss(field);
    }

    next();
  };
}

const validations = [
  check('name')
    .isLength({ min: 1 })
    .withMessage('Nafn má ekki vera tómt'),

  check('name')
    .isLength({ max: 128 })
    .withMessage('Nafn má að hámarki vera 128 stafir'),

  check('nationalId')
    .isLength({ min: 1 })
    .withMessage('Kennitala má ekki vera tóm'),

  check('nationalId')
    .matches(/^[0-9]{6}-?[0-9]{4}$/)
    .withMessage('Kennitala verður að vera á forminu 000000-0000 eða 0000000000'),

  check('comment')
    .isLength({ max: 400 })
    .withMessage('Athugasemd má að hámarki vera 400 stafir'),

];

// Fylki af öllum hreinsunum fyrir umsókn
const sanitazions = [
  body('name').trim().escape(),
  sanitizeXss('name'),

  sanitizeXss('nationalId'),
  body('nationalId')
    .trim().blacklist(' ').escape()
    .toInt(),

  sanitizeXss('comment'),
  body('comment').trim().escape(),
];

/**
 * Route handler fyrir skráningu og birtingu gagna.
 *
 * @param {object} req Request hlutur
 * @param {object} res Response hlutur
 * @returns {string} Form fyrir skráningu
 */
async function form(req, res) {
  const list = await select();

  const data = {
    title: 'Skráning',
    name: '',
    nationalId: '',
    comment: '',
    aLista: '',
    list,
    errors: [],
  };

  res.render('forms', data);
}

/**
 * Route handler sem athugar stöðu á umsókn og birtir villur ef einhverjar,
 * sendir annars áfram í næsta middleware.
 *
 * @param {object} req Request hlutur
 * @param {object} res Response hlutur
 * @param {function} next Næsta middleware
 * @returns Næsta middleware ef í lagi, annars síðu með villum
 */
async function showErrors(req, res, next) {
  const {
    body: {
      name = '',
      nationalId = '',
      comment = '',
      aLista = '',
    } = {},
  } = req;

  const list = await select();

  const data = {
    name,
    nationalId,
    comment,
    aLista,
    list,
  };

  const validation = validationResult(req);

  if (!validation.isEmpty()) {
    const errors = validation.array();
    data.errors = errors;
    data.title = 'Vandræði með skráningu';

    return res.render('forms', data);
  }

  return next();
}

/**
 * Ósamstilltur route handler sem vistar gögn í gagnagrunn og sendir
 * á þakkarsíðu
 *
 * @param {object} req Request hlutur
 * @param {object} res Response hlutur
 */
async function formPost(req, res) {
  const {
    body: {
      name = '',
      nationalId = '',
      comment = '',
      aLista = '',
    } = {},
  } = req;

  const data = {
    name,
    nationalId,
    comment,
    aLista,
  };

  await insert(data);

  return res.redirect('/thanks');
}

/**
 * Route handler fyrir þakkarsíðu.
 *
 * @param {object} req Request hlutur
 * @param {object} res Response hlutur
 */
function thanks(req, res) {
  return res.render('thanks', { title: 'Takk fyrir skráninguna' });
}

// router.get('/', catchErrors(signatures));
router.get('/', form);
router.get('/thanks', thanks);

router.post(
  '/',
  // Athugar hvort form sé í lagi
  validations,
  // Ef form er ekki í lagi, birtir upplýsingar um það
  showErrors,
  // Öll gögn í lagi, hreinsa þau
  sanitazions,
  // Senda gögn í gagnagrunn
  catchErrors(formPost),
);
