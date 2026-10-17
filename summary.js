import {summaryRows} from './summary-data.js';
import {url,key} from './summary-config.js';
const text=(id,value)=>document.getElementById(id).textContent=value;
const el=(tag,value,className)=>{const n=document.createElement(tag);if(value!==undefined)n.textContent=value;if(className)n.className=className;return n;};
try{
  const token=location.hash.slice(1);
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token))throw new Error('This summary link is incomplete. Ask the organizer for the full link.');
  const response=await fetch(`${url}/rest/v1/rpc/read_event_summary`,{method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:JSON.stringify({link_token:token}),signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw new Error('Could not load this summary. Check your connection and reload.');
  const data=await response.json();if(!data)throw new Error('This link is unavailable or sharing has been stopped.');
  if(data.version!==1||!Array.isArray(data.players)||!Array.isArray(data.matches))throw new Error('This summary cannot be displayed.');
  text('title',data.name);document.title=`${data.name} · Americano summary`;
  const date=new Date(`${data.date}T12:00:00`);text('details',`${Number.isNaN(date.valueOf())?data.date:date.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric',year:'numeric'})}${data.time?` · ${data.time}`:''} · ${data.players.length} players · ${data.points} points`);
  text('mode',data.ranked?'Ranked':'Unranked');
  const names=new Map(data.players.map(p=>[p.id,p.name]));
  for(const row of summaryRows(data)){const tr=el('tr',undefined,row.rank===1?'winner':undefined);for(const v of [row.rank,row.name,row.played,`${row.wins}–${row.draws}–${row.losses}`,row.points])tr.append(el('td',String(v)));document.getElementById('standings').append(tr);}
  document.getElementById('summary-note').hidden=!data.totals;
  document.getElementById('matches').hidden=!!data.totals;
  for(const [index,m] of [...data.matches].sort((a,b)=>a.round-b.round||a.court-b.court).entries()){const card=el('article',undefined,'match');card.append(el('small',m.round?`Round ${m.round}${m.court?` · Court ${m.court}`:''}`:`Match ${index+1}`));const score=el('div',undefined,'score');score.append(el('div',m.a.map(id=>names.get(id)||'Unknown player').join(' + ')),el('strong',`${m.scoreA}–${m.scoreB}`,'points'),el('div',m.b.map(id=>names.get(id)||'Unknown player').join(' + ')));card.append(score);if(!m.included)card.append(el('small','Recorded score excluded from standings.'));document.getElementById('rounds').append(card);}
  text('published',`Summary shared ${new Date(data.publishedAt).toLocaleString()}`);text('status','');document.getElementById('content').hidden=false;
}catch(error){text('status',error.name==='TimeoutError'?'The connection timed out. Reload to try again.':error.message);document.getElementById('status').id='error';}
