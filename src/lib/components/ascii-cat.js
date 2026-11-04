// @ts-nocheck
/** Dependency-free 3D -> ASCII renderer. Coordinates: +Y up, +Z toward viewer. */
const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const unit = ([x, y, z]) => { const d = Math.hypot(x, y, z) || 1; return [x/d, y/d, z/d]; };
const cross = (a,b) => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const sub = (a,b) => a.map((v,i)=>v-b[i]);

function makeCat() {
  const vertices = [], faces = [], lines = [];
  function vertex(p,n) { vertices.push({p,n}); return vertices.length-1; }
  function triangle(a,b,c,albedo=1) { faces.push({ids:[a,b,c],albedo}); }
  function flat(a,b,c,albedo=1) {
    const n=unit(cross(sub(b,a),sub(c,a)));
    triangle(vertex(a,n),vertex(b,n),vertex(c,n),albedo);
  }
  function ellipsoid(center,radius,albedo=1,lat=18,lon=28) {
    const start=vertices.length;
    for(let i=0;i<=lat;i++) {
      const v=Math.PI*i/lat;
      for(let j=0;j<=lon;j++) {
        const u=TAU*j/lon, s=[Math.sin(v)*Math.cos(u),Math.cos(v),Math.sin(v)*Math.sin(u)];
        vertex(s.map((q,k)=>center[k]+q*radius[k]),unit(s.map((q,k)=>q/radius[k])));
      }
    }
    for(let i=0;i<lat;i++) for(let j=0;j<lon;j++) {
      const a=start+i*(lon+1)+j,b=a+lon+1;
      triangle(a,b,a+1,albedo); triangle(a+1,b,b+1,albedo);
    }
  }
  function line(a,b,char) { lines.push({a,b,char}); }
  function capsule(a,b,r,albedo=1) {
    const tangent=unit(sub(b,a)),u=unit(cross(tangent,[0,0,1])),v=cross(tangent,u);
    const start=vertices.length,sides=20;
    for(const p of [a,b]) for(let j=0;j<=sides;j++) {
      const angle=TAU*j/sides,n=u.map((q,k)=>q*Math.cos(angle)+v[k]*Math.sin(angle));
      vertex(p.map((q,k)=>q+r*n[k]),n);
    }
    for(let j=0;j<sides;j++) {
      const a=start+j,b=a+sides+1;
      triangle(a,b,a+1,albedo);triangle(a+1,b,b+1,albedo);
    }
    ellipsoid(a,[r,r,r],albedo,12,18);ellipsoid(b,[r,r,r],albedo,12,18);
  }
  // Sitting cat with one resting paw and one raised humanlike thumbs-up.
  ellipsoid([0,-.60,-.13],[.72,1.03,.61]);
  for(const s of [-1,1]) {
    ellipsoid([s*.53,-1.19,-.06],[.42,.46,.49],.85);
    if(s===-1) {
      ellipsoid([s*.29,-1.04,.45],[.19,.65,.22]);
      ellipsoid([s*.30,-1.61,.59],[.25,.18,.34]);
    }
  }
  // Foreshortened arm: the fist reaches toward the camera (+Z), like the reference.
  capsule([.50,-.43,.20],[.77,-.81,.78],.23);
  capsule([.77,-.81,.78],[.86,-.40,1.57],.24);
  ellipsoid([.88,-.08,1.72],[.36,.38,.28],1.05,18,24);
  // Curled fingers face the viewer; thumb rises on the outer edge of the fist.
  for(let i=0;i<4;i++) ellipsoid([.84,-.30+i*.17,1.94],[.315,.095,.13],1.12,12,20);
  capsule([1.12,.12,1.73],[1.20,.82,1.74],.155,1.12);
  for(let i=0;i<3;i++) line([.59,-.215+i*.17,2.064],[1.08,-.215+i*.17,2.064],'-');
  ellipsoid([0,.88,.13],[.91,.76,.70],1,24,36);
  // Each ear is a closed triangular wedge, with a smaller inner triangle.
  for(const s of [-1,1]) {
    const a=[s*.28,1.35,.40],b=[s*.89,1.28,.27],c=[s*.76,2.12,.10];
    const d=[s*.29,1.35,-.13],e=[s*.87,1.28,-.18],f=[s*.76,2.12,-.10];
    const front=s===1?[a,b,c]:[b,a,c];
    flat(...front); flat(d,f,e,.8); flat(a,c,f,.85); flat(a,f,d,.85);
    flat(b,e,f,.8); flat(b,f,c,.8); flat(a,d,e); flat(a,e,b);
    const inner=[[s*.43,1.48,.355],[s*.78,1.43,.285],[s*.745,1.91,.17]];
    flat(...(s===1?inner:[inner[1],inner[0],inner[2]]),.42);
  }
  // Small black eye lenses, with a luminous glint on their front surface.
  for(const s of [-1,1]) {
    ellipsoid([s*.35,1.02,.768],[.135,.18,.065],.04,12,18);
    ellipsoid([s*.35-.033,1.075,.828],[.032,.045,.016],1.4,8,10);
    ellipsoid([s*.18,.64,.775],[.25,.19,.13],1.1,12,20);
  }
  flat([-.115,.76,.91],[0,.64,.95],[.115,.76,.91],.16);
  // A broad, cheek-to-cheek grin with a dark rim and a curved row of teeth.
  ellipsoid([0,.43,.79],[.43,.205,.145],.035,16,30);
  const mouthStart=vertices.length,mouthSteps=24,mouthRows=10;
  for(let i=0;i<=mouthSteps;i++) {
    const x=-.37+.74*i/mouthSteps,t=x/.37;
    for(let j=0;j<=mouthRows;j++) {
      const y=.285+.145*t*t+.205*j/mouthRows;
      const q=Math.max(.015,1-(x/.43)**2-((y-.43)/.205)**2);
      const z=.79+.145*Math.sqrt(q)+.006;
      vertex([x,y,z],unit([x/.43**2,(y-.43)/.205**2,(z-.79)/.145**2]));
    }
  }
  for(let i=0;i<mouthSteps;i++) for(let j=0;j<mouthRows;j++) {
    const a=mouthStart+i*(mouthRows+1)+j,b=a+mouthRows+1;
    triangle(a,a+1,b,1.8);triangle(b,a+1,b+1,1.8);
  }
  for(const x of [-.24,-.12,0,.12,.24]) {
    const t=x/.37,top=.49+.145*t*t,bottom=.285+.145*t*t;
    const points=[];
    for(let i=0;i<=6;i++) {
      const y=bottom+(top-bottom)*i/6;
      const z=.79+.145*Math.sqrt(Math.max(.015,1-(x/.43)**2-((y-.43)/.205)**2))+.013;
      points.push([x,y,z]);
    }
    for(let i=0;i<6;i++)line(points[i],points[i+1],'|');
  }
  for(const s of [-1,1]) {
    for(let i=-1;i<=1;i++) line([s*.48,.66+i*.055,.79],[s*1.47,.66+i*.23,.73],'-');
    if(s===-1) for(const x of [-.07,.07]) line([s*.30+x,-1.60,.905],[s*.30+x,-1.72,.84],'|');
  }
  // A curved tube: cubic Bezier centerline, circular cross-sections.
  const controls=[[.48,-1.30,-.37],[1.96,-1.78,-.55],[2.12,.31,-.42],[1.39,.05,-.31]];
  const bezier=t=>controls[0].map((_,k)=>(1-t)**3*controls[0][k]+3*(1-t)**2*t*controls[1][k]+3*(1-t)*t*t*controls[2][k]+t**3*controls[3][k]);
  const start=vertices.length, rings=42,sides=12;
  for(let i=0;i<=rings;i++) {
    const t=i/rings,p=bezier(t), tangent=unit(sub(bezier(Math.min(1,t+.001)),bezier(Math.max(0,t-.001))));
    const u=unit(cross(tangent,[0,0,1])),v=cross(tangent,u),r=.13-.045*t;
    for(let j=0;j<=sides;j++) {
      const a=TAU*j/sides,n=u.map((q,k)=>q*Math.cos(a)+v[k]*Math.sin(a));
      vertex(p.map((q,k)=>q+r*n[k]),n);
    }
  }
  for(let i=0;i<rings;i++) for(let j=0;j<sides;j++) {
    const a=start+i*(sides+1)+j,b=a+sides+1;
    triangle(a,b,a+1,.85); triangle(a+1,b,b+1,.85);
  }
  ellipsoid(controls[3],[.085,.085,.085],.85,8,12);
  return {vertices,faces,lines};
}

/** Pure renderer: safe to import in SSR/Node; angle and pitch are radians. */
export function createCatRenderer({columns=108,rows=64,cellAspect=.5}={}) {
  columns=clamp(Math.round(Number(columns)||108),40,220);
  rows=clamp(Math.round(Number(rows)||64),24,120);
  cellAspect=clamp(Number(cellAspect)||.5,.25,1);
  const model=makeCat(), depth=new Float32Array(columns*rows),chars=new Array(columns*rows);
  const ramp=' .:-=+*#%@',light=unit([-.55,.8,1]);
  // Fit both dimensions; focal length measured in character rows.
  const focal=Math.min(rows*1.49,columns*cellAspect*1.50),distance=8;
  function render(angle=0,pitch=.10) {
    angle=Number.isFinite(angle)?((angle%TAU)+TAU)%TAU:0; pitch=Number.isFinite(pitch)?pitch:.10;
    depth.fill(0); chars.fill(' ');
    const c=Math.cos(angle),s=Math.sin(angle),cp=Math.cos(pitch),sp=Math.sin(pitch);
    function rotate([x,y,z]) { const X=c*x+s*z,Z=-s*x+c*z;return [X,cp*y-sp*Z,sp*y+cp*Z]; }
    function project(p) {
      const [x,y,z]=rotate(p),q=1/(distance-z);
      return [columns/2+x*focal*q/cellAspect,rows*.51-(y-.13)*focal*q,q];
    }
    const projected=model.vertices.map(({p,n})=> {
      const normal=rotate(n),l=.19+.81*Math.max(0,normal.reduce((v,q,k)=>v+q*light[k],0));
      return [...project(p),l];
    });
    for(const {ids,albedo} of model.faces) {
      const [a,b,c]=ids.map(i=>projected[i]);
      const det=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);
      if(Math.abs(det)<1e-8) continue;
      const x0=Math.max(0,Math.floor(Math.min(a[0],b[0],c[0]))),x1=Math.min(columns-1,Math.ceil(Math.max(a[0],b[0],c[0])));
      const y0=Math.max(0,Math.floor(Math.min(a[1],b[1],c[1]))),y1=Math.min(rows-1,Math.ceil(Math.max(a[1],b[1],c[1])));
      for(let y=y0;y<=y1;y++) for(let x=x0;x<=x1;x++) {
        const px=x+.5,py=y+.5;
        const u=((b[1]-c[1])*(px-c[0])+(c[0]-b[0])*(py-c[1]))/det;
        const v=((c[1]-a[1])*(px-c[0])+(a[0]-c[0])*(py-c[1]))/det,w=1-u-v;
        if(u<-.00001||v<-.00001||w<-.00001) continue;
        const q=u*a[2]+v*b[2]+w*c[2],i=y*columns+x;
        if(q<=depth[i]) continue;
        depth[i]=q;
        // Perspective-correct interpolation of vertex lighting.
        const l=(u*a[3]*a[2]+v*b[3]*b[2]+w*c[3]*c[2])/q*albedo;
        chars[i]=ramp[clamp(Math.round(l*(ramp.length-1)),0,ramp.length-1)];
      }
    }
    for(const line of model.lines) {
      const a=project(line.a),b=project(line.b),dx=b[0]-a[0],dy=b[1]-a[1],steps=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))*2));
      const glyph=line.char==='-'?(Math.abs(dy)<Math.abs(dx)*.28?'-':dx*dy>0?'\\':'/'):line.char;
      for(let k=0;k<=steps;k++) {
        const t=k/steps,x=Math.floor(a[0]+dx*t),y=Math.floor(a[1]+dy*t),q=a[2]+(b[2]-a[2])*t;
        if(x<0||y<0||x>=columns||y>=rows) continue;
        const i=y*columns+x;
        if(q>=depth[i]-.00008) { chars[i]=glyph;depth[i]=q; }
      }
    }
    const output=[];
    for(let y=0;y<rows;y++) output.push(chars.slice(y*columns,(y+1)*columns).join(''));
    return output.join('\n');
  }
  return {render,columns,rows};
}

/** Mount into a dedicated <pre>; call destroy() on unmount. Browser only. */
export function mountAsciiCat(element,options={}) {
  const renderer=createCatRenderer(options);
  const number=(v,fallback)=>Number.isFinite(Number(v))?Number(v):fallback;
  let speed=clamp(number(options.speed,.55),-4,4),fps=clamp(number(options.fps,30),1,60);
  let angle=number(options.angle,-.25),pitch=.10,playing=options.playing!==false;
  let raf=0,last=0,drawAt=0,destroyed=false,visible=true,dragging=false,startX=0,startAngle=0;
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  let reduced=motion.matches;
  const draw=()=>{element.textContent=renderer.render(angle,pitch);};
  const active=()=>!destroyed&&playing&&!reduced&&!document.hidden&&visible&&!dragging&&speed!==0;
  function tick(now) {
    raf=0;if(!active()) return;
    if(last) angle=(angle+(now-last)*.001*speed)%TAU;
    last=now;
    if(now-drawAt>=1000/fps) {draw();drawAt=now;}
    raf=requestAnimationFrame(tick);
  }
  function sync() {cancelAnimationFrame(raf);raf=0;last=0;if(active())raf=requestAnimationFrame(tick);}
  const motionChange=()=>{reduced=motion.matches;sync();};
  const down=e=>{
    if(e.button!==0) return;
    dragging=true;startX=e.clientX;startAngle=angle;element.setPointerCapture(e.pointerId);sync();
  };
  const move=e=>{if(dragging){angle=startAngle+(e.clientX-startX)*.012;draw();}};
  const up=()=>{if(dragging){dragging=false;sync();}};
  document.addEventListener('visibilitychange',sync);motion.addEventListener('change',motionChange);
  if(options.interactive!==false) {
    element.addEventListener('pointerdown',down);element.addEventListener('pointermove',move);
    element.addEventListener('pointerup',up);element.addEventListener('pointercancel',up);element.addEventListener('lostpointercapture',up);
  }
  const observer=typeof IntersectionObserver!=='undefined'?new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();}):null;
  observer?.observe(element);draw();sync();
  return {
    setOptions(next={}) {if('speed' in next)speed=clamp(number(next.speed,.55),-4,4);if('playing' in next)playing=Boolean(next.playing);if('fps' in next)fps=clamp(number(next.fps,30),1,60);sync();},
    setAngle(value) {angle=number(value,angle);draw();},
    destroy() {
      destroyed=true;cancelAnimationFrame(raf);observer?.disconnect();
      document.removeEventListener('visibilitychange',sync);motion.removeEventListener('change',motionChange);
      element.removeEventListener('pointerdown',down);element.removeEventListener('pointermove',move);
      element.removeEventListener('pointerup',up);element.removeEventListener('pointercancel',up);element.removeEventListener('lostpointercapture',up);
    }
  };
}
