import { useEffect, useRef, useState } from 'react';
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

export default function App2() {
  const [code_challenge, setCC] = useState('');
  const [code_verifier, setCV] = useState('');
  const cvRef = useRef(null);
  const cdRef = useRef(null);
  const [data1, setData1] = useState();
  const [data2, setData2] = useState();

  useEffect(() => {
    const url = `https://lively-melomakarona-f8f6d3.netlify.app/.netlify/functions/api2-code-challenge`;
    axios.get(url).then((res) => {
      setCC(res.data.code_challenge);
      setCV(res.data.code_verifier);
    });
  }, []);

  const loginWithSingpass = () => {
    window.sessionStorage.setItem('cv', code_verifier);
    window.location.href = authUrl(code_challenge);
  };

  const getData1 = () => {
    const url =
      `https://lively-melomakarona-f8f6d3.netlify.app/.netlify/functions/api2-theirs-background?code=` +
      (cdRef.current?.value ?? '') +
      '&code_verifier=' +
      (cvRef.current?.value ?? '') +
      '&client_id=' +
      client_id;
    axios.get(url).then((res) => setData1(res.data));
  };

  const getData2 = () => {
    const url = `https://lively-melomakarona-f8f6d3.netlify.app/.netlify/functions/api2-theirs2`;
    axios
      .post(url, { ...data1 }, { 'Content-Type': 'application/json' })
      .then((res) => setData2(res.data));
  };

  return (
    <div style={{ padding: '2rem 4rem' }}>
      <h1>App 2</h1>

      <pre>code_verifier: {code_verifier}</pre>
      <pre>code_challenge: {code_challenge}</pre>

      <button onClick={loginWithSingpass}>Login with Singpass</button>

      <hr />

      <pre>
        submit this code_verifier:{' '}
        <input ref={cvRef} defaultValue={window.sessionStorage.getItem('cv')} />
      </pre>
      <pre>
        submit this code: <input ref={cdRef} />
      </pre>

      <button onClick={getData1}>Submit</button>

      {/* <pre>{JSON.stringify(data1, null, '  ')}</pre>

      <hr />

      <button onClick={getData2}>Get data</button>

      <pre>{JSON.stringify(data2, null, '  ')}</pre> */}
    </div>
  );
}
