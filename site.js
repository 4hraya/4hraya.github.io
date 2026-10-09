// Video: set data-yt="<YouTube video id>" on a .vsl element to embed it.
// Leave it empty and the video box is removed, so the page works without it.
document.querySelectorAll('.vsl[data-yt]').forEach(function(el){
  var id = el.getAttribute('data-yt').trim();
  if(!id){ el.remove(); return; }
  var f = document.createElement('iframe');
  f.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?rel=0&modestbranding=1';
  f.title = el.getAttribute('aria-label') || 'Video';
  f.allow = 'accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen';
  f.allowFullscreen = true;
  el.innerHTML = '';
  el.appendChild(f);
});

// Contours: generated from a noise field via marching squares. Never hand-drawn.
(function(){
  function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
  function field(seed,gw,gh){var r=mulberry32(seed),g=[],y,x;for(y=0;y<gh;y++){g[y]=[];for(x=0;x<gw;x++)g[y][x]=r()}return g}
  function smooth(t){return t*t*(3-2*t)}
  function sample(g,gw,gh,u,v){
    var fx=u*(gw-1),fy=v*(gh-1),x0=Math.floor(fx),y0=Math.floor(fy);
    var x1=Math.min(x0+1,gw-1),y1=Math.min(y0+1,gh-1);
    var tx=smooth(fx-x0),ty=smooth(fy-y0);
    var a=g[y0][x0]+(g[y0][x1]-g[y0][x0])*tx;
    var b=g[y1][x0]+(g[y1][x1]-g[y1][x0])*tx;
    return a+(b-a)*ty;
  }
  function contours(canvas,seed,res){
    var dpr=window.devicePixelRatio||1,w=canvas.clientWidth,h=canvas.clientHeight;
    if(!w||!h)return;
    canvas.width=w*dpr;canvas.height=h*dpr;
    var ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);ctx.clearRect(0,0,w,h);
    var gw=9,gh=7,base=field(seed,gw,gh),warp=field(seed+991,gw,gh);
    var cols=Math.ceil(w/res),rows=Math.ceil(h/res),vals=[],j,i;
    for(j=0;j<=rows;j++){vals[j]=[];for(i=0;i<=cols;i++){
      var u=i/cols,v=j/rows;
      vals[j][i]=sample(base,gw,gh,u,v)*.72+sample(warp,gw,gh,(u*2.3)%1,(v*2.3)%1)*.28-Math.abs(v-.46)*.30;
    }}
    for(var L=0;L<11;L++){
      var t=.30+L*.032, hi=(L===6);
      ctx.beginPath();
      ctx.strokeStyle=hi?'rgba(166,61,82,0.26)':'rgba(69,55,52,0.5)';
      ctx.lineWidth=hi?1.1:.8;
      for(j=0;j<rows;j++)for(i=0;i<cols;i++){
        var tl=vals[j][i],tr=vals[j][i+1],br=vals[j+1][i+1],bl=vals[j+1][i];
        var idx=(tl>t?8:0)|(tr>t?4:0)|(br>t?2:0)|(bl>t?1:0);
        if(idx===0||idx===15)continue;
        var x=i*res,y=j*res;
        var T=[x+res*(t-tl)/(tr-tl),y], Rr=[x+res,y+res*(t-tr)/(br-tr)];
        var B=[x+res*(t-bl)/(br-bl),y+res], Lf=[x,y+res*(t-tl)/(bl-tl)];
        var s=null;
        if(idx===1||idx===14)s=[Lf,B];
        else if(idx===2||idx===13)s=[B,Rr];
        else if(idx===3||idx===12)s=[Lf,Rr];
        else if(idx===4||idx===11)s=[T,Rr];
        else if(idx===6||idx===9)s=[T,B];
        else if(idx===7||idx===8)s=[Lf,T];
        else if(idx===5)s=[Lf,T];
        else if(idx===10)s=[T,Rr];
        if(s){ctx.moveTo(s[0][0],s[0][1]);ctx.lineTo(s[1][0],s[1][1])}
      }
      ctx.stroke();
    }
  }
  function paint(){
    document.querySelectorAll('canvas.contour').forEach(function(c){
      contours(c, +c.getAttribute('data-seed') || 1, 5);
    });
  }
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(paint);
  paint();
  var rt;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(paint,160)});
})();
