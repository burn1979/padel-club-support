export function summaryRows(data) {
  const rows = new Map(data.players.map(p=>[p.id,{id:p.id,name:p.name,points:0,played:0,wins:0,draws:0,losses:0,rank:0}]));
  if(data.totals)for(const total of data.totals){const row=rows.get(total.id);if(row)Object.assign(row,total);}
  else for(const m of data.matches){if(!m.included)continue;for(const [team,score,against] of [[m.a,m.scoreA,m.scoreB],[m.b,m.scoreB,m.scoreA]])for(const id of team){const r=rows.get(id);if(!r)continue;r.played++;r.points+=score;if(score>against)r.wins++;else if(score===against)r.draws++;else r.losses++;}}
  const sorted=[...rows.values()].sort((a,b)=>b.points-a.points||b.wins-a.wins||a.name.localeCompare(b.name));
  sorted.forEach((r,i)=>{r.rank=i&&r.points===sorted[i-1].points&&r.wins===sorted[i-1].wins?sorted[i-1].rank:i+1;});return sorted;
}
