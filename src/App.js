import "./App.css";

function App() {
  const authurl = "https://stg-id.singpass.gov.sg/auth?";
  const scope = "openid";
  const response_type = "code";
  const client_id = "tLRDBkf1CNy5Rsi34mEKuOD5EpQAwjIq";
  const redirect_uri = "https://singpassdemoapp.netlify.app/callback";
  const nonce = crypto.randomUUID();
  const state = crypto.randomUUID();
  const url =
    authurl +
    "scope=" +
    scope +
    "&state=" +
    state +
    "&response_type=" +
    response_type +
    "&redirect_uri=" +
    redirect_uri +
    "&client_id=" +
    client_id +
    "&nonce=" +
    nonce;
  return (
    <div className="App">
      <div style={{ float: "left", margin: "10px" }}>
        <img
          src="/images/singpass-icon-red.svg"
          alt="logo"
          width="200x"
          height="25px"
        />
      </div>
      <div style={{ float: "right", margin: "10px" }}>
        <img
          src="/images/sing-gov.svg"
          alt="govtlogo"
          width="200px"
          height="30px"
        />
      </div>
      <div style={{ clear: "both", textAlign: "center" }}>
        <div
          class="max-w-xl lg:max-w-lg"
          style={{ margin: "auto", textAlign: "center" }}
        >
          <h2 class="text-3xl font-bold text-black sm:text-4xl">
            Transforming Singapore through technology
          </h2>
          <p class="mt-4 text-lg leading-8 text-gray-900">
            Integrate with our suite of Singpass APIs to save time and money on
            customer acquisition.
          </p>
          <div
            style={{ clear: "both", textAlign: "center", marginTop: "20px" }}
          >
            <button
              type="submit"
              class="flex-none rounded-md bg-gray-300 px-3.5 py-2.5 text-sm font-semibold text-black shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              onClick={() => (window.location.href = url)}
            >
              Login with{" "}
              <img
                src="/images/Singpass-logo.png"
                alt="logo"
                width="105px"
                height="20px"
                paddingLeft="5px"
                paddingTop="3px"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
