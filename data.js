/* ============================================================================
 * Asana Care & Mental Wellness — shared data layer
 * ----------------------------------------------------------------------------
 * Powers the blog, live comments, appointments inbox and marketing kit.
 *
 * LIVE mode  : set SUPABASE_URL + SUPABASE_ANON_KEY below. Data is then real and
 *              shared across ALL visitors (comments appear for everyone,
 *              bookings reach the admin console, blog edits go live).
 * DEMO mode  : if those are blank, everything works in THIS browser via
 *              localStorage — perfect for previewing the mock.
 *
 * Booking + new-comment notifications also email the office in real time via
 * Web3Forms (independent of Supabase). Get a free key at web3forms.com using
 * info@asanacarementalwellness.com, then paste it below.
 *
 * Supabase setup (one-time, ~3 min): create a free project, then run the SQL in
 * README-asanacare.txt to create the blog_posts / comments / appointments
 * tables, and paste the Project URL + anon public key here.
 * ==========================================================================*/
(function () {
  var SUPABASE_URL = '';                       // e.g. https://xxxx.supabase.co
  var SUPABASE_ANON_KEY = '';                  // anon public key
  var WEB3FORMS_KEY = 'YOUR_WEB3FORMS_ACCESS_KEY';
  var OFFICE_EMAIL = 'info@asanacarementalwellness.com';

  var LIVE = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

  /* ---- Supabase REST helpers ---- */
  function sb(path, opts) {
    opts = opts || {};
    opts.headers = Object.assign({
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    }, opts.headers || {});
    return fetch(SUPABASE_URL + '/rest/v1/' + path, opts).then(function (r) {
      if (!r.ok) throw new Error('supabase ' + r.status);
      return r.status === 204 ? null : r.json();
    });
  }

  /* ---- localStorage helpers (demo mode) ---- */
  function lsGet(k, d) { try { return JSON.parse(localStorage.getItem('asana_' + k)) || d; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem('asana_' + k, JSON.stringify(v)); } catch (e) {} }
  function uid() { return 'id' + Math.random().toString(36).slice(2, 10) + (window.__aseq = (window.__aseq || 0) + 1); }
  function nowISO() { return new Date().toISOString(); }

  /* ---- Seed blog posts (the 10 shareable questions) ---- */
  var SEED_POSTS = [
    { slug: 'telepsychiatry-effective', q: 'Is telepsychiatry as effective as in-person psychiatric care?', cat: 'Telehealth',
      excerpt: 'Research consistently shows telepsychiatry can be just as effective as in-person care for most conditions — with the added benefits of convenience, comfort, and access.',
      body: 'For the vast majority of psychiatric conditions — anxiety, depression, ADHD, and more — telepsychiatry has been shown to be just as effective as seeing a provider in person. You get the same evidence-based evaluation and medication management, from the privacy of home. For many patients across Texas, that means no long drives, no waiting rooms, and easier follow-up. Telehealth also makes it simpler to keep appointments consistently, which is one of the biggest predictors of getting better.' },
    { slug: 'need-medication-anxiety-depression', q: 'How do I know if I need medication for anxiety or depression?', cat: 'Medication',
      excerpt: 'Medication is one tool among many. Here are the signs it may be worth a psychiatric evaluation — and why it works best alongside therapy.',
      body: 'If your anxiety or low mood has lasted more than a couple of weeks, is interfering with work, relationships, or sleep, or therapy alone has not been enough, a psychiatric evaluation can help you understand your options. Medication is never automatic — it is a shared decision. When it is the right fit, it often works best combined with therapy, so you are treating both the biology and the patterns. A comprehensive evaluation looks at your history, goals, and preferences before anything is prescribed.' },
    { slug: 'adult-adhd', q: 'Adult ADHD: could this be why I’ve struggled for years?', cat: 'ADHD',
      excerpt: 'Many adults are diagnosed with ADHD for the first time in their 30s or 40s. Chronic overwhelm, procrastination and lost focus can have a name — and a treatment.',
      body: 'ADHD is not just a childhood condition. Many adults have quietly struggled with focus, time management, forgetfulness, and follow-through for years without knowing why. A proper evaluation can distinguish ADHD from anxiety, depression, or burnout — which often look similar. When ADHD is identified, a combination of medication management, skills, and support can be genuinely life-changing. If this sounds like you, it is worth asking about.' },
    { slug: 'first-evaluation', q: 'What should I expect at my first psychiatric evaluation?', cat: 'Getting Started',
      excerpt: 'Your first visit is a conversation, not a test. Here is what happens and how to prepare so you get the most from it.',
      body: 'A first psychiatric evaluation is a relaxed, thorough conversation about what brings you in, your history, your goals, and how symptoms affect your day-to-day life. There are no trick questions. It helps to jot down your main concerns, any past treatments or medications, and what you hope to change. By the end, you will leave with an understanding of what is going on and a collaborative plan — which may include medication, coordination with your therapist, or further evaluation.' },
    { slug: 'medication-plus-therapy', q: 'How does medication management work alongside therapy?', cat: 'Collaborative Care',
      excerpt: 'Medication and therapy are partners, not competitors. Coordinated care between your prescriber and therapist leads to the best outcomes.',
      body: 'Therapy helps you build insight, skills, and lasting change; medication can steady the biology so that work is possible. When your psychiatric provider and therapist communicate (with your consent), your care is more coordinated and you are less likely to fall through the cracks. At Asana Care, medication management is designed to complement — never replace — the therapy relationship you value.' },
    { slug: 'teen-mental-health', q: 'When is it time to seek help for my teen’s mental health?', cat: 'Adolescents',
      excerpt: 'Withdrawal, mood swings, sleep changes and slipping grades can be more than "just a phase." Here is when to reach out.',
      body: 'Adolescence brings ups and downs, but some signs deserve attention: persistent sadness or irritability, withdrawal from friends and activities, big changes in sleep or appetite, falling grades, or any talk of hopelessness or self-harm. Seeking help early is a sign of strength, not overreaction. A telepsychiatry evaluation can clarify what is happening and, with your family, build a supportive plan. If your teen is in crisis, call or text 988 right away.' },
    { slug: 'rural-texas-access', q: 'Can I get psychiatric care online if I live in a rural part of Texas?', cat: 'Access',
      excerpt: 'Yes. Telepsychiatry brings board-certified psychiatric care to every corner of Texas — no long drives required.',
      body: 'One of the biggest barriers to mental health care in Texas is distance. Telepsychiatry removes it. As long as you are located in Texas (or California), you can be seen securely from home — whether you are near Houston and Dallas or in a small rural town hours from the nearest provider. All you need is a private space and an internet connection. Care is 100% telehealth: convenient, confidential, and accessible statewide.' },
    { slug: 'psychiatrist-vs-pmhnp', q: 'What’s the difference between a psychiatrist and a psychiatric nurse practitioner (PMHNP)?', cat: 'Getting Started',
      excerpt: 'Both diagnose and prescribe. A board-certified PMHNP offers expert, individualized psychiatric care — often with more availability and a collaborative style.',
      body: 'A Psychiatric Mental Health Nurse Practitioner (PMHNP-BC) is an advanced-practice provider who is licensed to evaluate, diagnose, and prescribe for mental health conditions, just like a psychiatrist. PMHNPs bring a whole-person, collaborative approach and often have shorter wait times. The most important thing is finding a board-certified provider you trust and who coordinates well with the rest of your care team.' },
    { slug: 'talk-to-therapist-referral', q: 'How do I talk to my therapist about adding a psychiatric provider?', cat: 'Collaborative Care',
      excerpt: 'It is a normal, positive step. Most therapists welcome collaboration with a psychiatric provider — here is how to bring it up.',
      body: 'If therapy alone has plateaued, it is completely appropriate to ask your therapist whether adding a psychiatric evaluation might help. Most therapists welcome this — collaborative, team-based care leads to better outcomes. You might simply say, "I have been wondering whether medication could help alongside our work — would you be open to coordinating with a psychiatric provider?" With your consent, Asana Care communicates treatment updates back to your therapist so everyone stays aligned.' },
    { slug: 'womens-mental-health-hormones', q: 'Women’s mental health: how do hormones affect mood, anxiety, and sleep?', cat: "Women's Health",
      excerpt: 'Hormonal shifts across the menstrual cycle, pregnancy, postpartum and perimenopause can profoundly affect mood — and they deserve real attention.',
      body: 'Mood, anxiety, and sleep are closely tied to hormonal changes across a woman’s life — from the menstrual cycle to pregnancy, postpartum, and perimenopause. Symptoms that seem to come and go with your cycle, or that began during a major hormonal transition, are real and treatable. A thoughtful psychiatric evaluation considers these factors and builds a plan that fits your body and your life, coordinating with your other providers when helpful.' }
  ];

  function seedPosts() {
    return SEED_POSTS.map(function (p, i) {
      return { id: 'seed-' + p.slug, slug: p.slug, question: p.q, category: p.cat, excerpt: p.excerpt, body: p.body, published: true, created_at: new Date(Date.now() - (SEED_POSTS.length - i) * 86400000).toISOString() };
    });
  }

  /* ---- Optional email notification (real-time) ---- */
  function notify(subject, fields) {
    if (!WEB3FORMS_KEY || WEB3FORMS_KEY.indexOf('YOUR_') === 0) return Promise.resolve(false);
    var body = Object.assign({ access_key: WEB3FORMS_KEY, subject: subject, from_name: 'Asana Care Website' }, fields);
    return fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json(); }).then(function (j) { return !!j.success; }).catch(function () { return false; });
  }

  /* ======================= Public API ======================= */
  var API = {
    live: LIVE,
    officeEmail: OFFICE_EMAIL,

    /* ---------- Blog posts ---------- */
    getPosts: function (opts) {
      opts = opts || {};
      if (LIVE) {
        var q = 'blog_posts?order=created_at.desc';
        if (opts.publishedOnly) q += '&published=eq.true';
        return sb(q);
      }
      var posts = lsGet('posts', null);
      if (!posts) { posts = seedPosts(); lsSet('posts', posts); }
      posts = posts.slice().sort(function (a, b) { return (b.created_at || '').localeCompare(a.created_at || ''); });
      return Promise.resolve(opts.publishedOnly ? posts.filter(function (p) { return p.published; }) : posts);
    },
    getPost: function (slug) {
      return API.getPosts().then(function (posts) { return posts.filter(function (p) { return p.slug === slug; })[0] || null; });
    },
    savePost: function (post) {
      if (LIVE) {
        if (post.id) return sb('blog_posts?id=eq.' + post.id, { method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify(post) });
        return sb('blog_posts', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(post) });
      }
      var posts = lsGet('posts', null) || seedPosts();
      if (post.id) { posts = posts.map(function (p) { return p.id === post.id ? Object.assign({}, p, post) : p; }); }
      else { post.id = uid(); post.created_at = nowISO(); posts.unshift(post); }
      lsSet('posts', posts); return Promise.resolve(post);
    },
    deletePost: function (id) {
      if (LIVE) return sb('blog_posts?id=eq.' + id, { method: 'DELETE' });
      var posts = (lsGet('posts', null) || seedPosts()).filter(function (p) { return p.id !== id; });
      lsSet('posts', posts); return Promise.resolve(true);
    },

    /* ---------- Comments (live) ---------- */
    getComments: function (postSlug, opts) {
      opts = opts || {};
      if (LIVE) {
        var q = 'comments?post_slug=eq.' + encodeURIComponent(postSlug) + '&order=created_at.asc';
        if (opts.approvedOnly) q += '&status=eq.approved';
        return sb(q);
      }
      var all = lsGet('comments', []).filter(function (c) { return c.post_slug === postSlug; });
      if (opts.approvedOnly) all = all.filter(function (c) { return c.status === 'approved'; });
      return Promise.resolve(all);
    },
    getAllComments: function () {
      if (LIVE) return sb('comments?order=created_at.desc');
      return Promise.resolve(lsGet('comments', []).slice().reverse());
    },
    addComment: function (c) {
      c = { post_slug: c.post_slug, name: c.name, body: c.body, status: 'approved', created_at: nowISO() };
      notify('New blog comment — ' + c.post_slug, { 'Comment on': c.post_slug, 'Name': c.name, 'Comment': c.body });
      if (LIVE) return sb('comments', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(c) });
      var all = lsGet('comments', []); c.id = uid(); all.push(c); lsSet('comments', all); return Promise.resolve(c);
    },
    setCommentStatus: function (id, status) {
      if (LIVE) return sb('comments?id=eq.' + id, { method: 'PATCH', body: JSON.stringify({ status: status }) });
      var all = lsGet('comments', []).map(function (c) { return c.id === id ? Object.assign({}, c, { status: status }) : c; });
      lsSet('comments', all); return Promise.resolve(true);
    },
    deleteComment: function (id) {
      if (LIVE) return sb('comments?id=eq.' + id, { method: 'DELETE' });
      lsSet('comments', lsGet('comments', []).filter(function (c) { return c.id !== id; })); return Promise.resolve(true);
    },

    /* ---------- Appointments ---------- */
    addAppointment: function (a) {
      a = Object.assign({ status: 'new', created_at: nowISO() }, a);
      if (LIVE) return sb('appointments', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(a) });
      var all = lsGet('appointments', []); a.id = uid(); all.unshift(a); lsSet('appointments', all); return Promise.resolve(a);
    },
    getAppointments: function () {
      if (LIVE) return sb('appointments?order=created_at.desc');
      return Promise.resolve(lsGet('appointments', []));
    },
    updateAppointment: function (id, patch) {
      if (LIVE) return sb('appointments?id=eq.' + id, { method: 'PATCH', body: JSON.stringify(patch) });
      var all = lsGet('appointments', []).map(function (a) { return a.id === id ? Object.assign({}, a, patch) : a; });
      lsSet('appointments', all); return Promise.resolve(true);
    },
    deleteAppointment: function (id) {
      if (LIVE) return sb('appointments?id=eq.' + id, { method: 'DELETE' });
      lsSet('appointments', lsGet('appointments', []).filter(function (a) { return a.id !== id; })); return Promise.resolve(true);
    },

    /* ---------- Marketing kit (5 flyers + 5 videos) ---------- */
    getKit: function () {
      var kit = lsGet('kit', null);
      if (!kit) { kit = SEED_KIT.map(function (k) { return Object.assign({}, k); }); lsSet('kit', kit); }
      return Promise.resolve(kit);
    },
    saveKit: function (kit) { lsSet('kit', kit); return Promise.resolve(true); },
    resetKit: function () { var k = SEED_KIT.map(function (x) { return Object.assign({}, x); }); lsSet('kit', k); return Promise.resolve(k); },

    notify: notify
  };

  /* Seed marketing-kit content (editable in the Kit Manager) */
  var SEED_KIT = [
    { id: 'flyer1', type: 'flyer', theme: 'violet', tag: 'Now Accepting New Patients', title: 'Now Accepting New Patients', headline: 'Compassionate telepsychiatry for Texas & California', sub: 'Board-certified psychiatric care for adolescents & adults — 100% telehealth. Book online today.' },
    { id: 'flyer2', type: 'flyer', theme: 'green', tag: 'Telehealth', title: 'Telepsychiatry Across Texas', headline: 'Care that comes to you — anywhere in the state', sub: 'From Houston to El Paso, get evaluations & medication management from home. Convenient. Confidential. Accessible.' },
    { id: 'flyer3', type: 'flyer', theme: 'violet', tag: 'For Therapists', title: 'Refer With Confidence', headline: 'A psychiatric partner for your practice', sub: 'Collaborative, consent-based care that complements therapy. Patients contacted within 24–48 hours. Easy referrals by phone, fax or email.' },
    { id: 'flyer4', type: 'flyer', theme: 'green', tag: 'Conditions Treated', title: 'Specialized, Evidence-Based Care', headline: 'ADHD · Anxiety · Depression · Bipolar · OCD · PTSD', sub: 'Panic disorder, insomnia, women’s mental health & mood disorders — for adolescents and adults.' },
    { id: 'flyer5', type: 'flyer', theme: 'violet', tag: 'Meet Your Provider', title: 'Asana Aruna, PMHNP-BC', headline: 'Psychiatric Mental Health Nurse Practitioner', sub: 'Board-certified, warm, and collaborative — providing telepsychiatry across Texas & California.' },
    { id: 'video1', type: 'video', theme: 'green', tag: '0:45 · Explainer', title: 'What is Telepsychiatry?', headline: 'Psychiatric care from the comfort of home', sub: 'A 45-second intro to how online psychiatric visits work and who they help.' },
    { id: 'video2', type: 'video', theme: 'violet', tag: '0:60 · Guide', title: 'Your First Appointment', headline: 'What to expect at your evaluation', sub: 'Walking new patients through their first visit — relaxed, thorough, judgment-free.' },
    { id: 'video3', type: 'video', theme: 'green', tag: '0:50 · Education', title: 'Medication + Therapy, Together', headline: 'Why collaborative care works best', sub: 'How medication management complements the therapy you already value.' },
    { id: 'video4', type: 'video', theme: 'violet', tag: '0:55 · Awareness', title: 'Adult ADHD: You’re Not Alone', headline: 'Recognizing ADHD later in life', sub: 'Focus, overwhelm, and follow-through struggles can have a name — and a treatment.' },
    { id: 'video5', type: 'video', theme: 'green', tag: '0:30 · Promo', title: 'Now Accepting New Patients', headline: 'Book your telepsychiatry visit today', sub: 'Serving adolescents & adults across Texas and California. Same-week appointments when available.' }
  ];

  window.ASANA = API;
})();
