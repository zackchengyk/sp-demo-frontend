import { useEffect, useState } from 'react';
import axios from 'axios';

const client_id = 'dRqW0Zz2DzC7ibKG3vtV9t1T9UpJfkeT';
const scope = 'openid';
const redirect_uri = 'https://thisiszack.com/sp-demo-frontend';

const authUrl = (state, nonce) =>
  'https://stg-id.singpass.gov.sg/auth?client_id=' +
  client_id +
  '&scope=' +
  encodeURIComponent(scope) +
  '&redirect_uri=' +
  redirect_uri +
  '&response_type=code' +
  '&state=' +
  state +
  '&nonce=' +
  nonce;

export function App1() {
  const nonce = crypto.randomUUID();
  const state = crypto.randomUUID();

  const code =
    new URLSearchParams(window.location.search).get('code') ?? undefined;

  const [returnedData, setReturnedData] = useState({});

  useEffect(() => {
    if (code === undefined) {
      setReturnedData({});
      return;
    }
    const url = `https://lively-melomakarona-f8f6d3.netlify.app/.netlify/functions/api1?code=${code}`;
    axios
      .get(url)
      .then(({ data }) => setReturnedData(data))
      .catch((err) => setReturnedData(err));
  }, [code]);

  return (
    <section id="app-1">
      <h2>App 1: Login Flow</h2>

      <pre>
        <strong>{`1. the RP's FE should redirect to the LOGIN /auth endpoint, with params:`}</strong>
      </pre>
      <pre>{`- client_id:     ${client_id}`}</pre>
      <pre>{`- scope:         ${scope}`}</pre>
      <pre>{`- redirect_uri:  ${redirect_uri}`}</pre>
      <pre>{`- response_type: code`}</pre>
      <pre>{`- state:         ${state}`}</pre>
      <pre>{`- nonce:         ${nonce}`}</pre>
      <a
        href={authUrl(state, nonce)}
      >{`https://stg-id.singpass.gov.sg/auth?...`}</a>

      <hr />

      <pre>
        <strong>{`2. the RP's FE should send the returned code to the RP's BE:`}</strong>
      </pre>
      <pre>{`- the code taken from your current search params is: `}</pre>
      <pre>
        {`  `}
        {code ?? <em>undefined</em>}
      </pre>

      <hr />

      <pre>
        <strong>{`3. the RP's BE should POST to the LOGIN /token endpoint:`}</strong>
      </pre>
      <pre>{`- this will only work once!`}</pre>
      <pre>{`- here is the data returned from the /token endpoint to the BE:`}</pre>
      <pre>{JSON.stringify(returnedData, null, '\t')}</pre>
    </section>
  );
}
