import { useState } from 'react';
import axios from 'axios';
import { ClearButton } from './clear-button';
import { LoadingButton } from './loading-button';
import { Undef } from './shared';

const client_id = '8uvMufEXEmPhffnPfOmI5QqIY5fGMrIP';
const scope = 'openid';
const redirect_uri = 'https://thisiszack.com/sp-demo-frontend';

const authUrl = (state, nonce, code_challenge) =>
  `https://api.stg-auth.singpass.gov.sg/auth?` +
  `response_type=code` +
  `&client_id=${client_id}` +
  `&redirect_uri=${redirect_uri}` +
  `&scope=${encodeURIComponent(scope)}` +
  `&code_challenge=${code_challenge}` +
  `&code_challenge_method=S256` +
  `&state=${state}` +
  `&nonce=${nonce}`;

export function App3() {
  const [state, setState] = useState(localStorage.getItem('app3-st'));
  const [nonce, setNonce] = useState(localStorage.getItem('app3-no'));

  const [cv, setCV] = useState(localStorage.getItem('app3-cv'));
  const [cc, setCC] = useState(localStorage.getItem('app3-cc'));

  const [returnedData, setReturnedData] = useState(
    localStorage.getItem('app3-data')
  );

  const code =
    new URLSearchParams(window.location.search).get('code') ?? undefined;

  const generateThings = () => {
    const url =
      'https://lively-melomakarona-f8f6d3.netlify.app/.netlify/functions/generate-code-challenge';
    axios.get(url).then((res) => {
      setCV(res.data.code_verifier);
      setCC(res.data.code_challenge);
      setState(crypto.randomUUID());
      setNonce(crypto.randomUUID());
    });
  };

  const accessAuthorizePage = () => {
    localStorage.setItem('app3-cv', cv);
    localStorage.setItem('app3-cc', cc);
    localStorage.setItem('app3-st', state);
    localStorage.setItem('app3-no', nonce);
    window.location = authUrl(state, nonce, cc);
  };

  const getToken = async () => {
    const url = `https://lively-melomakarona-f8f6d3.netlify.app/.netlify/functions/get-new-auth-token?cv=${cv}&code=${code}`;
    await axios
      .get(url)
      .then(({ data }) => {
        setReturnedData(data);
        localStorage.setItem('app3-data', data);
      })
      .catch((err) => {
        setReturnedData(err);
        localStorage.removeItem('app3-data');
      });
  };

  return (
    <section id="app-1">
      <h2>App 3: New Auth Flow</h2>

      <ClearButton />
      <hr />

      <pre>
        <strong>
          {"1. the RP's BE generates a PKCE code pair, state, and nonce."}
        </strong>
      </pre>
      <button onClick={generateThings}>
        Pretend to be BE and generate them here
      </button>
      <pre>
        {'- code_verifier:  '}
        {cv ?? <Undef />}
      </pre>
      <pre>
        {'- code_challenge: '}
        {cc ?? <Undef />}
      </pre>
      <pre>
        {'- state:          '}
        {state ?? <Undef />}
      </pre>
      <pre>
        {'- nonce:          '}
        {nonce ?? <Undef />}
      </pre>

      <hr />

      <pre>
        <strong>
          {"2. the RP's FE should redirect to the /auth endpoint, with params:"}
        </strong>
      </pre>
      <pre>{`- client_id:             ${client_id}`}</pre>
      <pre>{`- response_type:         code`}</pre>
      <pre>{`- redirect_uri:          ${redirect_uri}`}</pre>
      <pre>{`- scope:                 ${scope}`}</pre>
      <pre>
        {`- state:                 `}
        {state ?? <Undef />}
      </pre>
      <pre>
        {`- nonce:                 `}
        {nonce ?? <Undef />}
      </pre>
      <pre>
        {`- code_challenge:        `}
        {cc ?? <Undef />}
      </pre>
      <pre>{`- code_challenge_method: S256`}</pre>
      <button onClick={accessAuthorizePage}>
        {'Link to https://api.stg-auth.singpass.gov.sg/auth?...'}
      </button>

      <hr />

      <pre>
        <strong>
          {"2. the RP's FE should send the returned code to the RP's BE:"}
        </strong>
      </pre>
      <pre>{'- the code taken from your current search params is: '}</pre>
      <pre>
        {'  '}
        {code ?? <Undef />}
      </pre>

      <hr />

      <pre>
        <strong>{"3. the RP's BE should POST to the /token endpoint:"}</strong>
      </pre>
      <LoadingButton clickHandler={getToken}>
        {'Trigger to get token'}
      </LoadingButton>
      <pre>{'- this will only work once!'}</pre>
      <pre>
        {'- here is the data returned from the /token endpoint to the BE:'}
      </pre>
      <pre>
        {returnedData ? JSON.stringify(returnedData, null, '\t') : <Undef />}
      </pre>
    </section>
  );
}
