// Presentation and studio organization only. No calculation or backend changes.
window.PromyanStudio = (() => {
  const $ = id => document.getElementById(id);
  let active = false, previous = null, entryButton = null;
  const isGraph = () => !$('graph12-view').hidden;
  const currentView = () => isGraph() ? 'graph12' : mainViewMode;
  function render() {
    const ready = Boolean(currentBoardData);
    document.querySelectorAll('.studio-present').forEach(b => b.disabled = !ready);
    $('studio-empty').hidden = ready;
    if (!active) return;
    $('presentation-title').textContent = $('db-name')?.value.trim() || 'แผนผังเจ้าชะตา';
    const dob = $('db-dob')?.value.trim() || '';
    const age = currentBoardData?.SELECTED_AGE ?? currentBoardData?.BASE_AGE;
    $('presentation-description').textContent = [dob, age > 0 ? `อายุที่พิจารณา ${age} ปี` : 'ยังไม่ได้ระบุอายุ'].filter(Boolean).join(' · ');
    document.querySelectorAll('[data-presentation-view]').forEach(b => b.setAttribute('aria-pressed',String(b.dataset.presentationView === currentView())));
    document.querySelectorAll('#main-board .number-dropdown, #main-board .manual-input').forEach(input => {
      let text = input.parentElement.querySelector('.presentation-value');
      if (!text) { text = document.createElement('span'); text.className = 'presentation-value'; input.parentElement.append(text); }
      text.textContent = input.value; text.style.color = input.style.color || 'inherit';
      text.setAttribute('aria-label', (input.getAttribute('aria-label') || 'ค่า') + ' ' + input.value);
    });
    scheduleLayoutScaleRefresh();
  }
  function enter(event) {
    if (!currentBoardData || active || databaseSaving) return;
    if (document.querySelector('[aria-busy="true"]')) return;
    previous = { view:currentView(), mainMode:mainViewMode, scroll:window.scrollY };
    entryButton = event?.currentTarget || document.querySelector('.studio-present');
    active = true; document.body.classList.add('is-presenting'); $('presentation-header').hidden = false;
    $('skip-to-content').href = '#presentation-title';
    render(); $('presentation-title').focus({preventScroll:true}); window.scrollTo({top:0,behavior:'instant'});
  }
  function choose(view) {
    if (!active || !['combined','seven','graph12'].includes(view)) return;
    if (view === 'graph12') {
      if (!isGraph()) { if (mainViewMode === 'seven') setMainViewMode('combined'); openGraph12View(); }
    } else {
      if (isGraph()) closeGraph12View();
      if (mainViewMode !== view) setMainViewMode(view);
    }
    $('skip-to-content').href = '#presentation-title'; render(); window.scrollTo({top:0,behavior:'instant'});
    document.querySelector(`[data-presentation-view="${view}"]`).focus({preventScroll:true});
  }
  function exit() {
    if (!active) return;
    const restore = previous;
    active = false; document.body.classList.remove('is-presenting'); $('presentation-header').hidden = true;
    if (restore?.view === 'graph12') {
      if (!isGraph()) { if (mainViewMode === 'seven') setMainViewMode('combined'); openGraph12View(); }
    } else {
      if (isGraph()) closeGraph12View();
      if (restore && mainViewMode !== restore.mainMode) setMainViewMode(restore.mainMode);
    }
    $('skip-to-content').href = isGraph() ? '#graph12-title' : '#main-view-title';
    scheduleLayoutScaleRefresh(); entryButton?.focus({preventScroll:true});
    window.scrollTo({top:restore?.scroll || 0,behavior:'instant'}); previous = null;
  }
  document.querySelectorAll('.studio-present').forEach(b => b.addEventListener('click',enter));
  $('presentation-exit').addEventListener('click',exit);
  document.querySelectorAll('[data-presentation-view]').forEach(b => b.addEventListener('click',()=>choose(b.dataset.presentationView)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && active) { e.preventDefault(); exit(); } });
  $('main-board').addEventListener('input',render);
  new MutationObserver(render).observe($('main-board'), {childList:true});
  // Authentication stays authoritative; presentation never sits outside the locked app.
  new MutationObserver(() => {
    if ($('owner-app').hidden) {
      active=false; previous=null; document.body.classList.remove('is-presenting'); $('presentation-header').hidden=true;
    }
  }).observe($('owner-app'), {attributes:true,attributeFilter:['hidden']});
  render();
  return {enter,exit,render};
})();
