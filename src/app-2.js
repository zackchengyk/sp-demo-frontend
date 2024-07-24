import { useEffect, useState } from 'react';
import axios from 'axios';

const client_id = 'STG-R28SM8022K-REGRESSION_MYINFO_17JUL';
const scope = 'uinfin partialuinfin name';
const purposeId = '42e23206';
const redirect_uri = 'https://thisiszack.com/sp-demo-frontend';

const authUrl = (code_challenge) =>
  'https://sit.api.myinfo.gov.sg/com/v4/authorize?client_id=' +
  client_id +
  '&scope=' +
  encodeURIComponent(scope) +
  '&redirect_uri=' +
  redirect_uri +
  '&response_type=code' +
  '&code_challenge=' +
  code_challenge +
  '&code_challenge_method=S256' +
  '&purpose_id=' +
  purposeId;

export function App2() {
  const [code_challenge, setCC] = useState('');
  const [code_verifier, setCV] = useState('');

  const code =
    new URLSearchParams(window.location.search).get('code') ?? undefined;

  useEffect(() => {
    const url = `https://lively-melomakarona-f8f6d3.netlify.app/.netlify/functions/api2-code-challenge`;
    axios.get(url).then((res) => {
      setCC(res.data.code_challenge);
      setCV(res.data.code_verifier);
    });
  }, []);

  return (
    <section id="app-2">
      <h2>App 2: MyInfo Flow</h2>

      <pre>
        <strong>{`1. the RP's BE generates a PKCE code pair.`}</strong>
      </pre>
      <pre>{`- code_verifier:  ${code_verifier}`}</pre>
      <pre>{`- code_challenge: ${code_challenge}`}</pre>

      <hr />

      <pre>
        <strong>{`2. the RP's FE should redirect to the MYINFO /authorize endpoint, with params:`}</strong>
      </pre>
      <pre>{`- client_id:      ${client_id}`}</pre>
      <pre>{`- scope:          ${scope}`}</pre>
      <pre>{`- redirect_uri:   ${redirect_uri}`}</pre>
      <pre>{`- code_challenge: ${code_challenge}`}</pre>
      <pre>{`- purposeId:      ${purposeId}`}</pre>
      <a
        href={authUrl(code_challenge)}
      >{`https://sit.api.myinfo.gov.sg/com/v4/authorize?...`}</a>

      <hr />

      <pre>
        <strong>{`3. the RP's FE should send the returned code to the RP's BE:`}</strong>
      </pre>
      <pre>{`- the code taken from your current search params is: `}</pre>
      <pre>
        {`  `}
        {code ?? <em>undefined</em>}
      </pre>

      <hr />

      <pre>
        <strong>{`4. the RP's BE should generate an ephemeral keypair`}</strong>
      </pre>

      <hr />

      <pre>
        <strong>{`5. the RP's BE should POST to the MYINFO /token endpoint`}</strong>
      </pre>

      <hr />

      <pre>
        <strong>{`6. the RP's BE should GET from the MYINFO /person endpoint`}</strong>
      </pre>
    </section>
  );
}
