const Run = require("gdn-run-sdk");

Run.plugins.WhatsOnChain.prototype.spends = async (txid, vout) => {
  const res = await fetch(`https://api.whatsonchain.com/v1/bsv/main/tx/${txid}/${vout}/spent`,
      {
        headers: {
          "Apikey": "mainnet_6c81a97a917bdab017bb02cd0d98f794",
        },
      },
  );
  if (res.status !== 200) {
    return null;
  }
  const json = await res.json();
  return json.txid;
};
