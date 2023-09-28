const { faker } = require('@faker-js/faker');
const express = require('express');
const bodyParser = require('body-parser');

const basicAuth = require('basic-auth');
const jwt = require('jsonwebtoken');
const OAuth2Server = require('oauth2-server');


const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const SECRET_KEY = "mys3cr3tk3y"
const USERNAME = "usuario"
const PASSWORD = "s3cr3t"
const SIMPLE_TOKEN = "ffd25a96d536a91666233351fcdecebc"

const SIGLAS_VARIAVEIS = [
  "NACE", "NDE", "NAVS", "NAPS", "NTE", "OAE", "OTI", "NTS", "NAPP", "NPPB", 
  "NAPPP", "NTAAA", "NCL", "NC", "TAFPPI", "PC", "PA", "DI", "C", "PTLT", "TPTI",
  "NSPP", "NS", "NL", "NA", "OCC", "OGM", "NTATT", "NPPA", "M", "NAr", "TC", "NEGAPI", 
  "NEAAPI", "NEGHI", "NEE", "NAPI", "NHI", "NAE", "NTEA", "NTAFPP", "NTCTT", "NEAHI", "NACCA", 
]

function __get_response() {
  const items = {};
  
  SIGLAS_VARIAVEIS.map(sigla => {
    items[sigla] = faker.number.int({ max: 1000})
    return sigla
  });

  return items;
}

// Rota de Teste
app.get('/', (req, res) => {
  res.send({ message: 'Olá, mundo!' });
});


// Sem Autenticação
app.get('/sem_autenticacao/', (req, res) => {
  res.send(__get_response());
});

// HTTP Basic

const auth_via_http_basic = (req, res, next) => {
  const user = basicAuth(req);
  console.log(user);

  if (user.name !== USERNAME && user.pass !== PASSWORD) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    res.sendStatus(401);
    return;
  }

  next();
};

app.get('/http_basic/', auth_via_http_basic, (req, res) => {
  res.send(__get_response());
});

// Token Simples

const auth_via_simple_token = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || authHeader !== `Bearer ${SIMPLE_TOKEN}`) {
    res.sendStatus(401);
    return;
  }

  next();
};

app.get('/token_simples/', auth_via_simple_token, (req, res) => {
  res.send(__get_response());
});

// JWT

const auth_via_jwt = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.sendStatus(401);
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.sendStatus(401);
  }
};

app.post('/auth/jwt/', (req, res) => {
  console.log(req.body);

  const { username, password } = req.body;

  // Verifica as credenciais do usuário
  if (username === USERNAME && password === PASSWORD) {
    // Gera um token JWT válido
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.sendStatus(401);
  }
});

app.get('/jwt', auth_via_jwt, (req, res) => {
  res.send(__get_response());
});

// OAuth2
// TODO: Implementar o fluxo do OAuth2 - Client Credentials

app.listen(3000, '0.0.0.0', () => {
  console.log('Servidor iniciado na porta 3000');
});