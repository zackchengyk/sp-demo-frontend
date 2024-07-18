import React, { useEffect, useState } from "react";
import axios from "axios";
function Callback() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");
  const [NRIC, setNRIC] = useState("");
  const [UUID, setUUID] = useState("");
  useEffect(() => {
    const getIDToken= async () => {
      const url = `https://singpassdemoappserver.netlify.app/.netlify/functions/api?code=${code}`;
      const { data } = await axios.get(url);
      setNRIC(data.data);
      setUUID(data.UUID);
    };

    getIDToken();
  }, [code]);
return <div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
   <h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">Congratulation, you have successfully integrated with Singpass</h2>
  <div class="px-4 sm:px-0">
    <h3 class="text-base font-semibold leading-7 text-gray-900">Login Information</h3>
    <p class="mt-1 max-w-2xl text-sm leading-6 text-gray-500">Login user's NRIC/UUID.</p>
  </div>
  <div class="mt-6 border-t border-gray-100">
    <dl class="divide-y divide-gray-100">
      <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
        <dt class="text-sm font-medium leading-6 text-gray-900">NRIC</dt>
        <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{NRIC}</dd>
      </div>
      <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
        <dt class="text-sm font-medium leading-6 text-gray-900">UUID</dt>
        <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{UUID}</dd>
      </div>
      </dl>
  </div>
</div>;
}

export default Callback;
