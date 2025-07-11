import { useState } from 'react';
import axios from 'axios';
import { ClearButton } from './clear-button';
import { LoadingButton } from './loading-button';
import { Undef } from './shared';

const clientId = 'STG-R28SM8022K-REGRESSION_MYINFO_17JUL';
const scope = 'uinfin partialuinfin name';
const purposeId = '42e23206';
const redirectUri = 'https://thisiszack.com/sp-demo-frontend';

const authUrl = (codeChallenge) =>
  'https://test.api.myinfo.gov.sg/com/v4/authorize?client_id=' +
  clientId +
  '&scope=' +
  scope +
  '&redirect_uri=' +
  redirectUri +
  '&response_type=code' +
  '&code_challenge=' +
  codeChallenge +
  '&code_challenge_method=S256' +
  '&purpose_id=' +
  purposeId;

export function App2() {
  const [cv, setCV] = useState(localStorage.getItem('cv'));
  const [cc, setCC] = useState(localStorage.getItem('cc'));

  const [publicKey, setPublicKey] = useState(localStorage.getItem('pub'));
  const [privateKey, setPrivateKey] = useState(localStorage.getItem('pri'));

  const [accessToken, setAccessToken] = useState(localStorage.getItem('acc'));

  const [personInfo, setPersonInfo] = useState(localStorage.getItem('inf'));

  const code =
    new URLSearchParams(window.location.search).get('code') ?? undefined;

  const accessAuthorizePage = () => {
    localStorage.setItem('cv', cv);
    localStorage.setItem('cc', cc);
    window.location = authUrl(cc);
  };

  const generateCodeChallenge = () => {
    const url =
      'https://lively-melomakarona-f8f6d3.netlify.app/.netlify/functions/generate-code-challenge';
    axios.get(url).then((res) => {
      setCV(res.data.code_verifier);
      setCC(res.data.code_challenge);
    });
  };

  const generateEphemeralKeys = () => {
    const url =
      'https://lively-melomakarona-f8f6d3.netlify.app/.netlify/functions/generate-ephemeral-keys';
    axios.get(url).then((res) => {
      setPublicKey(res.data.publicKey);
      setPrivateKey(res.data.privateKey);
    });
  };

  const getAccessToken = () => {
    localStorage.setItem('pub', publicKey);
    localStorage.setItem('pri', privateKey);
    const url =
      'https://lively-melomakarona-f8f6d3.netlify.app/.netlify/functions/get-access-token?pub=' +
      encodeURIComponent(publicKey) +
      '&pri=' +
      encodeURIComponent(privateKey) +
      '&cv=' +
      cv +
      '&code=' +
      code;
    axios
      .get(url)
      .then((res) => {
        setAccessToken(res.data);
        localStorage.setItem('acc', res.data);
      })
      .catch(() => {
        setAccessToken('error encountered :(');
        localStorage.removeItem('acc');
      });
  };

  const getPersonInfo = () => {
    const url =
      'https://lively-melomakarona-f8f6d3.netlify.app/.netlify/functions/get-person-info?pub=' +
      encodeURIComponent(publicKey) +
      '&pri=' +
      encodeURIComponent(privateKey) +
      '&acc=' +
      encodeURIComponent(accessToken);
    axios
      .get(url)
      .then((res) => {
        setPersonInfo(res.data);
        localStorage.setItem('inf', res.data);
      })
      .catch(() => {
        setPersonInfo('error encountered :(');
        localStorage.removeItem('inf');
      });
  };

  return (
    <section id="app-2">
      <h2>App 2: Old Info Flow</h2>

      <ClearButton />
      <hr />

      <pre>
        <strong>{"1. the RP's BE generates a PKCE code pair."}</strong>
      </pre>
      <button onClick={generateCodeChallenge}>
        Pretend to be BE and generate code pair here
      </button>
      <pre>
        {'- code_verifier:  '}
        {cv ?? <Undef />}
      </pre>
      <pre>
        {'- code_challenge: '}
        {cc ?? <Undef />}
      </pre>

      <hr />

      <pre>
        <strong>
          {
            "2. the RP's FE should redirect to the MYINFO /authorize endpoint, with params:"
          }
        </strong>
      </pre>
      <pre>{`- client_id:      ${clientId}`}</pre>
      <pre>{`- scope:          ${scope}`}</pre>
      <pre>{`- redirect_uri:   ${redirectUri}`}</pre>
      <pre>
        {'- code_challenge: '}
        {cc ?? <Undef />}
      </pre>
      <pre>{`- purposeId:      ${purposeId}`}</pre>
      <button onClick={accessAuthorizePage}>
        {'Link to https://test.api.myinfo.gov.sg/com/v4/authorize?...'}
      </button>

      <hr />

      <pre>
        <strong>
          {"3. the RP's FE should send the returned code to the RP's BE:"}
        </strong>
      </pre>
      <pre>{'- the code taken from your current search params is: '}</pre>
      <pre>
        {'  '}
        {code ?? <Undef />}
      </pre>

      <hr />

      <pre>
        <strong>{"4. the RP's BE should generate ephemeral keys"}</strong>
      </pre>
      <button onClick={generateEphemeralKeys}>
        Pretend to be BE and generate keys here
      </button>
      <pre>{'- public key:  '}</pre>
      <pre style={{ marginLeft: '2ch' }}>{publicKey ?? <Undef />}</pre>
      <pre>{'- private key: '}</pre>
      <pre style={{ marginLeft: '2ch' }}>{privateKey ?? <Undef />}</pre>

      <hr />

      <pre>
        <strong>
          {"5. the RP's BE should POST to the MYINFO /token endpoint"}
        </strong>
      </pre>
      <pre>{'- this uses:  '}</pre>
      <pre>{'  - the code_verifier way above,'}</pre>
      <pre>{'  - the public and private key directly above, and'}</pre>
      <pre>{'  - the authorization code from your search params'}</pre>
      <LoadingButton clickHandler={getAccessToken}>
        {'Trigger to get access token'}
      </LoadingButton>
      <pre>{`access token:`}</pre>
      <pre class="text-wrap">{accessToken ?? <Undef />}</pre>

      <hr />

      <pre>
        <strong>
          {"6. the RP's BE should GET from the MYINFO /person endpoint"}
        </strong>
      </pre>
      <pre>{'- this uses:  '}</pre>
      <pre>{'  - the access token directly above, and'}</pre>
      <pre>{'  - the public and private key above'}</pre>
      <LoadingButton clickHandler={getPersonInfo}>
        {'Trigger to get person info'}
      </LoadingButton>
      <pre>{`person info:`}</pre>
      <pre class="text-wrap">{personInfo ?? <Undef />}</pre>
    </section>
  );
}
