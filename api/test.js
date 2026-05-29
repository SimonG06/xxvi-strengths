module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const keyPresent = !!process.env.ANTHROPIC_API_KEY;
  const keyPrefix = process.env.ANTHROPIC_API_KEY ? process.env.ANTHROPIC_API_KEY.substring(0,10)+'...' : 'NOT SET';

  // Try a minimal Anthropic API call
  let apiResult = 'not tested';
  if(keyPresent){
    try{
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version':'2023-06-01'
        },
        body: JSON.stringify({
          model:'claude-sonnet-4-20250514',
          max_tokens:20,
          messages:[{role:'user',content:'Say OK'}]
        })
      });
      const d = await r.json();
      apiResult = r.ok ? ('SUCCESS: ' + (d.content?.[0]?.text||'no text')) : ('FAIL '+r.status+': '+JSON.stringify(d));
    }catch(e){
      apiResult = 'ERROR: '+e.message;
    }
  }

  res.status(200).json({
    status:'ok',
    keyPresent,
    keyPrefix,
    apiResult,
    nodeVersion: process.version
  });
};
