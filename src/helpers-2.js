import * as crypto from 'node:crypto';
import * as jose from 'node-jose';
import * as jose2 from 'jose';
import * as axios from 'axios';

const TOKEN_URL = 'https://sit.api.myinfo.gov.sg/com/v4/token';
const PERSON_URL = 'https://sit.api.myinfo.gov.sg/com/v4/person';

// Helpers

const getNow = () => Math.floor(Date.now() / 1000);

const generateJwkThumbprint = async (pemString) => {
  const key = await jose.JWK.asKey(pemString, 'pem');
  const buffer = await key.thumbprint('SHA-256');
  return jose.util.base64url.encode(buffer, 'utf8');
};

const generateClientAssertion = async ({
  clientId,
  signingPrivateKey,
  ephemeralPublicKey,
}) => {
  const now = getNow();

  const payload = {
    jti: 'client-assertion-jti-' + now,
    iat: now,
    exp: now + 300,
    sub: clientId,
    aud: TOKEN_URL,
    iss: clientId,
    cnf: { jkt: await generateJwkThumbprint(ephemeralPublicKey) },
  };

  const privateKeyForSigning = await jose.JWK.asKey(signingPrivateKey);

  return await jose.JWS.createSign(
    { format: 'compact', fields: { typ: 'JWT' } },
    privateKeyForSigning
  )
    .update(JSON.stringify(payload))
    .final();
};

const generateAth = (accessToken) => {
  const sha256AccessToken = crypto
    .createHash('sha256')
    .update(accessToken)
    .digest();
  const base64URLEncodedHash = sha256AccessToken
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  return base64URLEncodedHash;
};

const generateDpop = async (props) => {
  const now = getNow();

  const { forToken, ephemeralKeys } = props;

  const payload = {
    jti: forToken ? 'dpop-for-token-jti-' + now : 'dpop-for-person-jti-' + now,
    iat: now,
    exp: now + 120,
    htu: forToken ? TOKEN_URL : `${PERSON_URL}/${props.personUuid}`,
    htm: forToken ? 'POST' : 'GET',
    ath: forToken ? undefined : generateAth(props.accessToken),
  };

  const tempPrivateKeyForSigning = await jose.JWK.asKey(
    ephemeralKeys.privateKey,
    'pem'
  );

  const tempPublicKeyToSend = {
    ...(await jose.JWK.asKey(ephemeralKeys.publicKey, 'pem')).toJSON(),
    use: 'sig',
    alg: 'ES256',
  };

  return await jose.JWS.createSign(
    {
      format: 'compact',
      fields: { typ: 'DPOP+JWT', jwk: tempPublicKeyToSend },
    },
    {
      key: tempPrivateKeyForSigning,
      reference: false, // prevents KID from appearing in header
    }
  )
    .update(JSON.stringify(payload))
    .final();
};

// Exports

function generateEphemeralKeys() {
  return crypto.generateKeyPairSync('ec', {
    namedCurve: 'P-256',
    // Todo: understand `type` field
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'sec1', format: 'pem' },
  });
}

async function getAccessToken({
  ephemeralKeys,
  signingPrivateKey,
  clientId,
  redirectUri,
  codeVerifier,
  authorizationCode,
}) {
  const clientAssertion = await generateClientAssertion({
    clientId,
    signingPrivateKey,
    ephemeralPublicKey: ephemeralKeys.publicKey,
  });

  const dpop = await generateDpop({
    forToken: true,
    ephemeralKeys,
  });

  const body = {
    grant_type: 'authorization_code',
    client_assertion_type:
      'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
    redirect_uri: redirectUri,
    code: authorizationCode,
    client_id: clientId,
    code_verifier: codeVerifier,
    client_assertion: clientAssertion,
  };

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Cache-Control': 'no-cache',
    DPoP: dpop,
  };

  const { data } = await axios
    .post(TOKEN_URL, body, { headers })
    .catch((err) => {
      console.log('Error when hitting token endpoint');
      console.log(err);
      console.log(err.response.data.message);
    });

  return data.access_token;
}

async function getPersonInfo({
  ephemeralKeys,
  encryptionPrivateKey,
  accessToken,
  scope,
}) {
  const personUuid = jose2.decodeJwt(accessToken).sub;
  const getUrl = PERSON_URL + '/' + personUuid;
  const getUrlWParams = getUrl + '?scope=' + encodeURIComponent(scope);

  const headers = {
    'Cache-Control': 'no-cache',
    Authorization: 'DPoP ' + accessToken,
    dpop: await generateDpop({
      forToken: false,
      ephemeralKeys,
      accessToken,
      personUuid,
    }),
  };

  const { data } = await axios.get(getUrlWParams, { headers }).catch((err) => {
    console.log('Error when hitting person endpoint');
    console.log(err);
    console.log(err.response.data.message);
  });

  // Decrypt returned data
  const decrypted = await jose.JWE.createDecrypt(
    await jose.JWK.asKey(encryptionPrivateKey)
  ).decrypt(data);

  return decrypted.payload.toString();
}

module.exports = {
  generateEphemeralKeys,
  getAccessToken,
  getPersonInfo,
};
