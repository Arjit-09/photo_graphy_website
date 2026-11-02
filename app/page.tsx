'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ArrowDown, ArrowRight, ArrowLeft, Aperture, Play, Pause, X, Menu, Plus, Minus, Mail, Phone } from 'lucide-react';

const photos = [
  { src: 'intimate-wedding', title: 'The art of together', category: 'Weddings', label: 'A day, a thousand little stories' },
  { src: 'love', title: 'Just the two of us', category: 'Couples', label: 'Somewhere between now & forever' },
  { src: 'portrait', title: 'In your own light', category: 'Portraits', label: 'Honest faces. Unscripted moments.' },
  { src: 'couple-editorial.webp', title: 'A golden kind of love', category: 'Weddings', label: 'The warmth that stays with you' },
  { src: 'landscape', title: 'Where we find ourselves', category: 'Travel', label: 'A little further from the everyday' },
  { src: 'photographer-editorial.webp', title: 'Chasing the light', category: 'Travel', label: 'The stories behind the photograph' },
];
const media = (name: string) => `/media/${name.includes('.') ? name : name + '.jpg'}`;
const films = [
 {title:'The beginning of always',src:'wedding-film',poster:'couple-editorial.webp',tag:'A LOVE LETTER IN MOTION'},
 {title:'A walk into forever',src:'garden-film',poster:'love',tag:'THE BEAUTY OF THE IN-BETWEEN'},
 {title:'Nothing else matters',src:'together-film',poster:'intimate-wedding',tag:'TWO PEOPLE. ONE WHOLE WORLD.'},
 {title:'Every little detail',src:'details-film',poster:'wedding',tag:'THE THINGS YOU NEVER WANT TO FORGET'},
];
const chapters = ['The moment', 'The perspective', 'The memory', 'The forever'];
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const range = (v: number, a: number, b: number) => clamp((v - a) / (b - a));

export default function Home() {
  const story = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [chapter, setChapter] = useState(0);
  const [filter, setFilter] = useState('All stories');
  const [modal, setModal] = useState<{kind: 'photo' | 'film' | 'enquiry'; index: number} | null>(null);
  const [menu, setMenu] = useState(false);
  const [album, setAlbum] = useState(0);
  const albumPage = useRef<HTMLDivElement>(null);
  const [turning, setTurning] = useState(false);
  const [filmPreview, setFilmPreview] = useState<string | null>(null);
  const [motion, setMotion] = useState(true);
  const [compact, setCompact] = useState(false);
  const [faq, setFaq] = useState<number | null>(null);
  const [draft, setDraft] = useState('');
  const trigger = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setMotion(!preference.matches);
    sync(); preference.addEventListener('change',sync);
    return () => preference.removeEventListener('change',sync);
  }, []);
  useEffect(() => {
    const breakpoint = window.matchMedia('(max-width: 700px)');
    const sync = () => setCompact(breakpoint.matches);
    sync(); breakpoint.addEventListener('change', sync);
    return () => breakpoint.removeEventListener('change', sync);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.motion = motion ? 'on' : 'off';
    if (!motion) document.querySelectorAll<HTMLVideoElement>('main video').forEach(v=>v.pause());
    const reveals = document.querySelectorAll('.section-heading, .photo-card, .about-image, .about-copy, .faq, .film-card, .cta');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {entry.target.classList.add('revealed'); observer.unobserve(entry.target);}
    }), {threshold:.08});
    reveals.forEach(el => {el.classList.add('reveal'); observer.observe(el);});
    const videos = document.querySelectorAll<HTMLVideoElement>('[data-ambient]');
    const videoObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      const video = entry.target as HTMLVideoElement;
      if (entry.isIntersecting && motion && !document.hidden) video.play().catch(()=>{}); else video.pause();
    }), {threshold:.2});
    videos.forEach(video => videoObserver.observe(video));
    const syncVideoVisibility = () => videos.forEach(video => {
      if (document.hidden || !motion) { video.pause(); return; }
      const rect = video.getBoundingClientRect();
      if (rect.top < window.innerHeight * .8 && rect.bottom > window.innerHeight * .2) video.play().catch(()=>{});
      else video.pause();
    });
    document.addEventListener('visibilitychange',syncVideoVisibility);
    return () => {observer.disconnect(); videoObserver.disconnect();document.removeEventListener('visibilitychange',syncVideoVisibility);videos.forEach(v=>v.pause());};
  }, [motion, filter, compact]);
  useEffect(() => {
    if (!compact) return;
    const cards = Array.from(document.querySelectorAll<HTMLButtonElement>('.photo-card'));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.classList.toggle('touch-active', entry.isIntersecting && entry.intersectionRatio >= .45));
    }, { threshold: [.15, .45, .7] });
    cards.forEach(card => observer.observe(card));
    return () => { observer.disconnect(); cards.forEach(card => card.classList.remove('touch-active')); };
  }, [compact, filter]);
  useEffect(() => {
    if (!compact || !motion || modal?.kind) return;
    const cards = Array.from(document.querySelectorAll<HTMLButtonElement>('.film-card'));
    const visibility = new Map<HTMLButtonElement, number>(cards.map(card => [card, 0] as const));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => visibility.set(entry.target as HTMLButtonElement, entry.isIntersecting ? entry.intersectionRatio : 0));
      let active: HTMLButtonElement | null = null;
      let activeRatio = 0;
      visibility.forEach((ratio, card) => {
        if (ratio > activeRatio) { active = card; activeRatio = ratio; }
      });
      if (!active || activeRatio < .12 || document.hidden) {
        cards.forEach(card => card.querySelector('video')?.pause());
        setFilmPreview(null);
        return;
      }
      const activeCard = active as HTMLButtonElement;
      cards.forEach(card => {
        const video = card.querySelector('video');
        if (card === activeCard) video?.play().catch(() => {});
        else video?.pause();
      });
      setFilmPreview(activeCard.dataset.film ?? null);
    }, { threshold: [.12, .25, .5, .75] });
    cards.forEach(card => observer.observe(card));
    return () => { observer.disconnect(); cards.forEach(card => card.querySelector('video')?.pause()); };
  }, [compact, motion, modal?.kind]);
  useEffect(() => {
    let raf = 0, displayed = -1, lastTime = 0, lastChapter = -1;
    const update = (time = performance.now()) => {
      raf = 0;
      if (!story.current || !stage.current) return;
      const rect = story.current.getBoundingClientRect();
      const target = clamp(-rect.top / (rect.height - window.innerHeight));
      const dt = Math.min(48, time - lastTime || 16); lastTime = time;
      if (compact || displayed < 0 || !motion) displayed = target;
      else displayed += (target - displayed) * (1 - Math.exp(-dt / 75));
      if (Math.abs(target - displayed) < .0001) displayed = target;
      const p = displayed;
      const s = stage.current.style;
      s.setProperty('--hero-opacity', String(1 - range(p, .09, .20)));
      s.setProperty('--hero-scale', String(1 + range(p, 0, .2) * .12));
      s.setProperty('--photographer-opacity', String(range(p, .12, .22) * (1 - range(p, .31, .39))));
      s.setProperty('--photographer-y', `${(1 - range(p, .14, .28)) * 8}%`);
      s.setProperty('--camera-opacity', String(range(p, .31, .40) * (1 - range(p, .53, .58))));
      s.setProperty('--camera-scale', String(1 + range(p, .38, .53) * (compact ? .38 : 1.35)));
      s.setProperty('--lens-reveal', String(range(p, .41, .49)));
      s.setProperty('--print-x', `${-range(p, .70, .83) * (compact ? 12 : 26)}vw`);
      s.setProperty('--hero-text-y', `${-range(p, 0, .2) * 60}px`);
      s.setProperty('--flash', String(motion ? Math.max(0, 1 - Math.abs(p - .535) / .022) * .85 : 0));
      s.setProperty('--frame-opacity', String(range(p, .53, .59) * (1 - range(p, .73, .82))));
      s.setProperty('--frame-scale', String(1 - range(p, .62, .82) * (compact ? .15 : .35)));
      s.setProperty('--frame-rotate', `${-5 + range(p, .54, .72) * 5}deg`);
      s.setProperty('--album-opacity', String(range(p, .76, .86)));
      s.setProperty('--album-rotate', `${-75 + range(p, .76, .94) * 75}deg`);
      s.setProperty('--progress', `${p * 100}%`);
      const current = p < .2 ? 0 : p < .54 ? 1 : p < .79 ? 2 : 3;
      if (current !== lastChapter) { lastChapter = current; setChapter(current); }
      if (displayed !== target) raf = requestAnimationFrame(update);
    };
    const request = () => { if (!raf) raf = requestAnimationFrame(update); };
    update(); window.addEventListener('scroll', request, {passive:true}); window.addEventListener('resize', request);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', request); window.removeEventListener('resize', request); };
  }, [motion, compact]);
  useEffect(() => {
    if (modal) { trigger.current = document.activeElement as HTMLElement; dialog.current?.showModal(); document.body.style.overflow = 'hidden'; }
    else { dialog.current?.close(); document.body.style.overflow = ''; trigger.current?.focus(); }
    return () => { document.body.style.overflow = ''; };
  }, [modal?.kind]);
  const goChapter = (index: number) => {
    if (!story.current) return;
    const offsets = [0, .27, .65, .94];
    window.scrollTo({top: story.current.offsetTop + (story.current.offsetHeight - innerHeight) * offsets[index], behavior: motion ? 'smooth' : 'instant'});
  };
  const close = () => { setModal(null); setDraft(''); };
  const turnPage = async () => {
    if (turning) return;
    if (!motion || !albumPage.current) { setAlbum(a => (a + 1) % 2); return; }
    setTurning(true);
    try {
      await albumPage.current.animate([{transform:'rotateY(0deg)'},{transform:'rotateY(-85deg)'}], {duration:220,easing:'ease-in',fill:'forwards'}).finished;
      setAlbum(a => (a + 1) % 2);
      await albumPage.current.animate([{transform:'rotateY(-85deg)'},{transform:'rotateY(0deg)'}], {duration:300,easing:'ease-out',fill:'forwards'}).finished;
    } finally { setTurning(false); }
  };
  const enquire = () => { setMenu(false); setModal({kind:'enquiry',index:0}); };

  return <>
    <a className="skip-link" href="#work">Skip to photography</a>
    <header className="header">
      <a className="wordmark" href="#" aria-label="Beast Click home"><img src="/media/beast-click-logo.svg" alt="" width="52" height="52"/><span>Beast <i>Click</i><small>WEDDINGS · PORTRAITS · FILMS</small></span></a>
      <nav className={menu ? 'nav open' : 'nav'} aria-label="Main navigation">
        <a href="#story" onClick={()=>setMenu(false)}>The experience</a><a href="#work" onClick={()=>setMenu(false)}>Selected work</a><a href="#about" onClick={()=>setMenu(false)}>Our approach</a><a className="mobile-contact" href="mailto:bcphotographer19@gmail.com" onClick={()=>setMenu(false)}>bcphotographer19@gmail.com</a><a className="mobile-contact" href="tel:+918287545122" onClick={()=>setMenu(false)}>+91 82875 45122</a>
      </nav>
      <div className="header-contact-details" aria-label="Direct contact"><a href="mailto:bcphotographer19@gmail.com" aria-label="Email Beast Click" title="Email Beast Click"><Mail size={17}/></a><a href="tel:+918287545122" aria-label="Call Beast Click at +91 82875 45122" title="Call +91 82875 45122"><Phone size={17}/></a></div>
      <button className="contact-link" onClick={enquire} aria-label="Open a photography enquiry"><span className="contact-label">Let’s make memories</span><ArrowUpRight className="contact-desktop-icon" size={17}/><Mail className="contact-mobile-icon" size={17}/></button>
      <button className="menu-toggle" onClick={()=>setMenu(!menu)} aria-label={menu?'Close menu':'Open menu'} aria-expanded={menu}>{menu?<X/>:<Menu/>}</button>
    </header>

    <main>
      <section className={'story ' + (!motion?'gentle':'')} id="story" ref={story} aria-label="From a moment to a memory: an interactive four-chapter story">
        <div className="story-stage" ref={stage}>
          <div className="hero scene" inert={chapter!==0} aria-hidden={chapter!==0}>
            <img className="hero-image" src="/media/couple-editorial.webp" alt="An illustrative bride and groom on a Mediterranean cliff at sunset" fetchPriority="high"/>
            <div className="hero-shade"/>
            <div className="hero-top"><span>FOR THE MOMENTS THAT MEAN EVERYTHING.</span><span className="edition">EST. IN THE PRESENT · MADE FOR FOREVER</span></div>
            <div className="hero-copy"><p className="eyebrow"><span className="little-line"/> YOUR LIFE. BEAUTIFULLY REMEMBERED.</p><h1>Some moments.<br/><em>Forever</em> stories.</h1><div className="hero-bottom-copy"><p>Not just how it looked.<br/>How it felt to be there.</p><button className="round-link" onClick={()=>setModal({kind:'film',index:0})} tabIndex={chapter===0?0:-1}><span className="play-ring"><Play size={15} fill="currentColor"/></span><span>PLAY THE FILM<small>A little glimpse of forever</small></span></button></div></div>
            <button className="hero-scroll" tabIndex={chapter===0?0:-1} onClick={()=>goChapter(1)}><ArrowDown size={15}/> SCROLL TO BEGIN THE STORY</button><div className="side-note">LOVE, IN ITS MOST HONEST FORM.</div>
          </div>

          <div className="photographer scene" inert={chapter!==1} aria-hidden={chapter!==1}>
            <img src="/media/behind-the-lens.webp" alt="A male photographer aiming his camera at the couple on the coastal cliff" loading={compact?'lazy':'eager'}/>
            <div className="scene-copy"><p className="eyebrow">02 / A DIFFERENT WAY OF SEEING</p><h2>Your moment.<br/><em>Through our eyes.</em></h2><p>A quiet glance. A hand held a little tighter.<br/>The real story is always in the in-between.</p></div>
          </div>
          <div className="camera-scene scene" aria-hidden="true">
            <div className="operator-portrait"><img src="/media/photographer-editorial.webp" alt="" loading={compact?'lazy':'eager'}/><div className="real-lens"><img src="/media/couple-editorial.webp" alt="" loading={compact?'lazy':'eager'}/><span className="focus-mark"/></div></div>
            <div className="viewfinder"><i/><i/><i/><i/><span className="recording"><b/> LIVE VIEW</span><span className="focus-caption">A MOMENT WORTH KEEPING.</span><span className="camera-settings">1/250 &nbsp; · &nbsp; ƒ / 1.4 &nbsp; · &nbsp; ISO 200</span></div>
          </div>
          <div className="frame-scene scene" inert={chapter!==2} aria-hidden={chapter!==2}><div className="scene-copy"><p className="eyebrow">03 / A MOMENT, MADE TANGIBLE</p><h2>And just like that,<br/><em>it’s yours forever.</em></h2></div><div className="print"><img src="/media/couple-editorial.webp" alt="The captured couple photograph presented as a fine art print" loading={compact?'lazy':'eager'}/><div><span>the beginning of always</span><small>FRAME NO. 001</small></div></div></div>
          <div className="album-scene scene" inert={chapter!==3} aria-hidden={chapter!==3}>
            <div className="album-heading"><p className="eyebrow">04 / A STORY YOU CAN HOLD</p><h2>A moment becomes<br/><em>a whole world of memories.</em></h2></div>
            <div className="album"><div className="album-page album-left"><img src={media(album===0?'couple-editorial.webp':'love')} alt="A full-page wedding photograph in the album" loading={compact?'lazy':'eager'}/><span>the days we’ll always come back to.</span></div><div className="album-page album-right" ref={albumPage}><img src={`/media/${album===0?'wedding':'landscape'}.jpg`} alt="A photograph on the right album page" loading={compact?'lazy':'eager'}/><img src={media(album===0?'love':'couple-editorial.webp')} alt="Another memory in the wedding album" loading={compact?'lazy':'eager'}/><span>OUR LITTLE FOREVER <small>0{album+1}</small></span></div></div>
            <button className="album-next" tabIndex={chapter===3?0:-1} onClick={turnPage} disabled={turning}>Turn the page <ArrowRight size={17}/></button>
          </div>
          <div className="flash" aria-hidden="true"/>
          <div className="story-controls"><button className="scroll-hint" onClick={()=>goChapter((chapter+1)%4)}><ArrowDown size={16}/><span>SCROLL TO FEEL THE STORY</span></button><div className="chapters">{chapters.map((name,i)=><button key={name} className={chapter===i?'active':''} onClick={()=>goChapter(i)} aria-label={`Go to chapter ${i+1}: ${name}`} aria-current={chapter===i?'step':undefined}><span>0{i+1}</span><span>{name}</span></button>)}</div><button className="motion-toggle" onClick={()=>setMotion(!motion)}>{motion?'Motion on':'Gentle mode'}</button></div>
          <div className="story-progress"/>
        </div>
      </section>

      <div className="manifesto"><span className="eyebrow">A MOMENT PASSES. A PHOTOGRAPH STAYS.</span><p>For the beautifully imperfect.<br/>The wildly in love. <em>The wonderfully you.</em></p><Aperture size={30} strokeWidth={1}/></div>

      <div className="moving-gallery" aria-label="A moving collection of photographs"><div className="moving-track">{[0,1].map(copy=><div className="moving-set" key={copy} aria-hidden={copy===1}>{['couple-editorial.webp','intimate-wedding','love','portrait','landscape'].map((src,i)=><figure key={src}><img src={media(src)} alt={copy===0?['A coastal love story','An intimate wedding','An embrace','An editorial portrait','A wild landscape'][i]:''} loading="lazy"/><figcaption>0{i+1} / {['THE FEELING','THE PROMISE','THE IN-BETWEEN','THE INDIVIDUAL','THE ADVENTURE'][i]}</figcaption></figure>)}</div>)}</div></div>

      <section className="work section" id="work"><div className="section-heading"><div><p className="eyebrow">01 / SELECTED STORIES</p><h2>Life happens.<br/><em>We keep the feeling.</em></h2></div><p>A collection of honest moments,<br/>told in light, colour, and a little magic.</p></div><div className="work-toolbar"><div className="filters" aria-label="Filter photography">{['All stories','Weddings','Couples','Portraits','Travel'].map(f=><button key={f} onClick={()=>setFilter(f)} aria-pressed={filter===f} className={filter===f?'selected':''}>{f}{f==='All stories'&&<sup>06</sup>}</button>)}</div><span className="collection-note">THE STILL COLLECTION ↙</span></div><div className="photo-grid">{photos.map((p,i)=>(filter==='All stories'||filter===p.category)&&<button className={'photo-card photo-'+i} key={p.src} onClick={()=>setModal({kind:'photo',index:i})}><div className="photo-wrap"><img src={media(p.src)} alt={p.title} loading="lazy"/><span className="photo-open"><ArrowUpRight/></span><span className="photo-category">{p.category}</span></div><div className="photo-caption"><div><h3>{p.title}</h3><p>{p.label}</p></div><span>0{i+1}</span></div></button>)}</div><p className="demo-note">An editorial moodboard · Original AI concept imagery & stock photography.</p></section>

      <section className="cinema-interlude" aria-label="Wedding film preview"><video data-ambient muted loop playsInline preload="none" poster="/media/love.jpg" src="/media/garden-film.mp4"/><div className="cinema-shade"/><div className="cinema-copy"><p className="eyebrow">NOT A POSE. A PULSE.</p><h2>Life doesn’t<br/><em>stand still.</em></h2><button className="round-link" onClick={()=>setModal({kind:'film',index:1})}><span className="play-ring"><Play size={16}/></span>NEITHER DO OUR STORIES</button></div><span className="cinema-edge">THE MOTION COLLECTION / 2026</span><button className="ambient-toggle" onClick={()=>setMotion(!motion)}>{motion?'Pause motion':'Play motion'}</button></section>
      <section className="films section" id="films"><div className="section-heading"><div><p className="eyebrow">02 / STORIES IN MOTION</p><h2>Some feelings<br/><em>need more than a frame.</em></h2></div><span>{compact?'TAP TO PREVIEW. TAP AGAIN TO OPEN.':'HOVER TO FEEL IT. PRESS PLAY TO STAY.'}</span></div><div className="film-grid">{films.map((film,i)=><button className={`film-card${filmPreview===film.src?' previewing':''}`} key={film.src} data-film={film.src} aria-label={`${filmPreview===film.src?'Open':'Preview'} ${film.title}`} onClick={e=>{const video=e.currentTarget.querySelector('video');if(compact&&motion&&filmPreview!==film.src){document.querySelectorAll<HTMLVideoElement>('.film-card video').forEach(other=>{if(other!==video)other.pause();});setFilmPreview(film.src);video?.play().catch(()=>{setFilmPreview(null);setModal({kind:'film',index:i});});return;}video?.pause();setFilmPreview(null);setModal({kind:'film',index:i});}} onMouseEnter={e=>{if(motion&&window.matchMedia('(hover: hover)').matches){const v=e.currentTarget.querySelector('video');v?.play().catch(()=>{});}}} onMouseLeave={e=>{if(window.matchMedia('(hover: hover)').matches)e.currentTarget.querySelector('video')?.pause();}}><img src={media(film.poster)} alt="" loading="lazy"/><video muted loop playsInline preload="none" src={`/media/${film.src}.mp4`} aria-hidden="true"/><span className="film-tint"/><span className="film-play">{filmPreview===film.src?<Pause size={23} strokeWidth={1} fill="currentColor"/>:<Play size={23} strokeWidth={1} fill="currentColor"/>}</span><span className="film-details"><span><small>{compact?(filmPreview===film.src?'TAP TO OPEN FULL FILM':'TAP TO PREVIEW')+' · ':''}{film.tag} · 0{i+1}</small><strong>{film.title}</strong></span><ArrowUpRight/></span></button>)}</div><p className="demo-note">Sample films · Stock footage for this concept</p></section>

      <section className="about section" id="about"><div className="about-image"><img src="/media/photographer-editorial.webp" alt="A male photographer looking through his camera at golden hour" loading="lazy"/><span>ALWAYS CHASING THE FEELING.</span></div><div className="about-copy"><p className="eyebrow">03 / THE PEOPLE BEHIND THE LENS</p><h2>Less posing.<br/>More <em>being.</em></h2><p>We believe the most beautiful photographs happen when you forget there’s a camera. When you’re lost in a laugh, wrapped in a hug, or simply being yourself.</p><p>Our approach is simple: give you space to live the moment, and make something beautiful to remember it by.</p><button className="text-link" onClick={enquire}>Let’s tell your story <ArrowUpRight size={20}/></button><div className="values"><span>HONEST MOMENTS</span><span>THOUGHTFUL DETAILS</span><span>TIMELESS FEELING</span></div></div></section>

      <section className="questions section"><p className="eyebrow">A FEW THINGS YOU MIGHT BE WONDERING</p>{[{q:'What kind of stories can we create?',a:'Weddings, couple sessions, portraits, and travel stories. Share the moment you have in mind, and we can shape the photography and film around it.'},{q:'Can we include a printed album?',a:'The album is part of the vision: a thoughtfully sequenced collection of your favourite photographs. Sizes, materials, and delivery options can be agreed with your photographer.'},{q:'How do we start?',a:'Use “Let’s make memories” to prepare an enquiry with your date, location, and ideas. It opens a prefilled email for you to review and send.'}].map((f,i)=><div className="faq" key={f.q}><button aria-expanded={faq===i} aria-controls={`answer-${i}`} onClick={()=>setFaq(faq===i?null:i)}>{f.q}{faq===i?<Minus size={20}/>:<Plus size={20}/>}</button><p id={`answer-${i}`} hidden={faq!==i}>{f.a}</p></div>)}</section>

      <section className="cta"><p className="eyebrow">YOUR NEXT CHAPTER STARTS HERE.</p><h2>Let’s make<br/><em>something</em> timeless.</h2><button onClick={enquire}>Tell us your story <ArrowUpRight size={21}/></button><span>PHOTOGRAPHS TO KEEP. FEELINGS TO COME BACK TO.</span><div className="cta-contact"><a href="mailto:bcphotographer19@gmail.com"><Mail size={16}/>bcphotographer19@gmail.com</a><a href="tel:+918287545122"><Phone size={16}/>+91 82875 45122</a></div></section>
    </main>
    <footer><a className="wordmark" href="#"><img src="/media/beast-click-logo.svg" alt="" width="48" height="48"/><span>Beast <i>Click</i><small>WEDDINGS · PORTRAITS · FILMS</small></span></a><p>Made with feeling. Remembered forever.</p><div className="footer-contact"><a href="mailto:bcphotographer19@gmail.com"><Mail size={16}/>bcphotographer19@gmail.com</a><a href="tel:+918287545122"><Phone size={16}/>+91 82875 45122</a></div><a href="#story">Back to the beginning ↑</a><div className="footer-bottom"><span>© {new Date().getFullYear()} Beast Click</span><span>PHOTOGRAPHY & FILMS</span></div></footer>

    <dialog ref={dialog} className={'modal '+(modal?.kind==='enquiry'?'enquiry-modal':'')} onCancel={close} onClick={e=>{if(e.target===e.currentTarget)close();}} aria-label={modal?.kind==='enquiry'?'Prepare your photography enquiry':modal?.kind==='film'?'Wedding film player':'Photograph viewer'}><button className="close-modal" onClick={close} aria-label="Close dialog"><X/></button>{modal?.kind==='photo'&&<div className="lightbox"><img src={media(photos[modal.index].src)} alt={photos[modal.index].title}/><div><button aria-label="Previous photograph" onClick={()=>setModal({...modal,index:(modal.index+photos.length-1)%photos.length})}><ArrowLeft/></button><span>{photos[modal.index].title}<small>{modal.index+1} / {photos.length}</small></span><button aria-label="Next photograph" onClick={()=>setModal({...modal,index:(modal.index+1)%photos.length})}><ArrowRight/></button></div></div>}{modal?.kind==='film'&&<div className="video-modal"><video key={modal.index} controls autoPlay muted={compact} playsInline preload="metadata" poster={media(films[modal.index].poster)}><source src={`/media/${films[modal.index].src}.mp4`} type="video/mp4"/>Your browser does not support HTML video.</video><p>{films[modal.index].title} <span>Concept film · Stock footage</span></p></div>}{modal?.kind==='enquiry'&&<div className="enquiry"><p className="eyebrow">LET’S BEGIN SOMETHING BEAUTIFUL</p><h2>Your story,<br/><em>starts here.</em></h2>{draft?<div className="draft-confirm" role="status"><h3>Your brief is ready.</h3><p>Review it in your email app, then send it to Beast Click.</p><a className="solid-button" href={`mailto:bcphotographer19@gmail.com?subject=${encodeURIComponent('Beast Click enquiry')}&body=${encodeURIComponent(draft)}`}>Email your brief <ArrowUpRight size={18}/></a><a className="text-link download-brief" href={`data:text/plain;charset=utf-8,${encodeURIComponent(draft)}`} download="beast-click-enquiry.txt">Download a copy <ArrowDown size={16}/></a><button className="text-link" onClick={()=>setDraft('')}>Write another brief</button></div>:<form onSubmit={e=>{e.preventDefault();const data=new FormData(e.currentTarget);setDraft(`PHOTOGRAPHY ENQUIRY\n\nName: ${data.get('name')}\nEmail: ${data.get('email')}\nStory: ${data.get('type')}\nDate: ${data.get('date')||'Flexible'}\nLocation: ${data.get('location')}\n\n${data.get('message')}\n\nPrepared with Beast Click. This is an enquiry brief, not a booking.`);}}><div className="form-row"><label>Your name<input name="name" required autoComplete="name" placeholder="The name behind the story"/></label><label>Email address<input name="email" type="email" required autoComplete="email" placeholder="you@example.com"/></label></div><div className="form-row"><label>The occasion<select name="type"><option>Wedding</option><option>Couple session</option><option>Portraits</option><option>Something else</option></select></label><label>A date in mind<input type="date" name="date"/></label></div><label>Where will your story happen?<input name="location" required placeholder="City, venue, or somewhere you love"/></label><label>A little about your vision<textarea name="message" rows={3} placeholder="Tell us about the feeling you want to remember…"/></label><button className="solid-button" type="submit">Prepare my enquiry <ArrowUpRight size={18}/></button><p className="form-note">Your enquiry opens in your email app. It is sent only when you choose Send.</p></form>}</div>}</dialog>
  </>;
}
