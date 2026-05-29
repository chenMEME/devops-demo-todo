(() => {
/* ===== 数据层 (store) ===== */
const SB = window.supabase.createClient(APP_CONFIG.supabaseUrl, APP_CONFIG.supabaseAnonKey);
let allTodos = [];

function saveLocal(todos) { try { localStorage.setItem('todos_cache', JSON.stringify(todos)); } catch(e) {} }
function loadLocal() { try { const d = localStorage.getItem('todos_cache'); return d ? JSON.parse(d) : null; } catch(e) { return null; } }

async function fetchTodos() {
  const { data, error } = await SB.from('todos').select('*').order('created_at', { ascending: false });
  if (error) {
    if (error.code === 'PGRST116') { allTodos = []; return []; } // 表不存在
    console.warn('Supabase 离线:', error.message);
    return loadLocal() || [];
  }
  allTodos = data;
  saveLocal(data);
  return data;
}

async function addTodo(text, category, due_date) {
  const todo = { text, category: category || null, due_date: due_date || null };
  const { data, error } = await SB.from('todos').insert(todo).select().single();
  if (error) {
    const local = { ...todo, id: 'local_' + Date.now(), completed: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    allTodos.unshift(local);
    saveLocal(allTodos);
    return local;
  }
  allTodos.unshift(data);
  saveLocal(allTodos);
  return data;
}

async function toggleTodo(id, completed) {
  await SB.from('todos').update({ completed, updated_at: new Date().toISOString() }).eq('id', id);
  const t = allTodos.find(t => t.id === id);
  if (t) { t.completed = completed; saveLocal(allTodos); }
}

async function deleteTodo(id) {
  await SB.from('todos').delete().eq('id', id);
  allTodos = allTodos.filter(t => t.id !== id);
  saveLocal(allTodos);
}

async function editTodoText(id, text) {
  await SB.from('todos').update({ text, updated_at: new Date().toISOString() }).eq('id', id);
  const t = allTodos.find(t => t.id === id);
  if (t) { t.text = text; saveLocal(allTodos); }
}

/* ===== UI 层 (render) ===== */
let currentFilter = '';

function esc(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }
function fmtDate(d) {
  const n = new Date(), t = new Date(d);
  const diff = Math.floor((t - new Date(n.getFullYear(), n.getMonth(), n.getDate())) / 86400000);
  if (diff === 0) return '今天';
  if (diff === 1) return '明天';
  if (diff === -1) return '昨天';
  return `${t.getMonth()+1}月${t.getDate()}日`;
}

function renderList(todos) {
  const list = document.getElementById('todoList');
  const empty = document.getElementById('empty');
  const stats = document.getElementById('stats');
  list.innerHTML = '';
  const filtered = currentFilter ? todos.filter(t => t.category === currentFilter) : todos;
  if (!filtered.length) { empty.style.display = 'block'; stats.textContent = ''; return; }
  empty.style.display = 'none';
  filtered.forEach(t => renderTodoItem(t));
  const done = todos.filter(t => t.completed).length;
  stats.textContent = `✅ 已完成 ${done} / ${todos.length}`;
}

function renderTodoItem(todo) {
  const li = document.createElement('li');
  li.className = 'todo-item' + (todo.completed ? ' completed' : '');
  li.dataset.id = todo.id;
  const cat = todo.category || '其他';
  const dateStr = todo.due_date ? fmtDate(todo.due_date) : '';
  const overdue = todo.due_date && new Date(todo.due_date) < new Date() && !todo.completed;
  li.innerHTML = `
    <input type="checkbox" class="todo-check" ${todo.completed ? 'checked' : ''}>
    <span class="todo-text">${esc(todo.text)}</span>
    <span class="todo-cat cat-${cat}" onclick="window.filterByCat('${cat}')" title="按此分类筛选">${cat}</span>
    <span class="todo-date${overdue ? ' overdue' : ''}">${dateStr ? '📅 ' + dateStr : ''}</span>
    <div class="todo-actions">
      <button class="btn-edit" title="编辑">✏</button>
      <button class="btn-del" title="删除">✕</button>
    </div>
  `;
  li.querySelector('.todo-check').onchange = e => { const c = e.target.checked; toggleTodo(todo.id, c); li.classList.toggle('completed', c); };
  li.querySelector('.btn-edit').onclick = () => editInline(li, todo);
  li.querySelector('.btn-del').onclick = async () => { await deleteTodo(todo.id); li.remove(); refreshStats(); };
  document.getElementById('todoList').appendChild(li);
}

function editInline(li, todo) {
  const span = li.querySelector('.todo-text');
  const inp = document.createElement('input');
  inp.type = 'text'; inp.value = todo.text;
  inp.style.cssText = 'flex:1;padding:4px 6px;border:2px solid #667eea;border-radius:6px;font-size:0.88rem;outline:none;font-family:inherit';
  span.replaceWith(inp);
  const save = async () => {
    const t = inp.value.trim();
    if (t && t !== todo.text) { await editTodoText(todo.id, t); }
    const ns = document.createElement('span'); ns.className = 'todo-text'; ns.textContent = t || todo.text;
    inp.replaceWith(ns);
  };
  inp.onblur = save;
  inp.onkeydown = e => { if (e.key === 'Enter') inp.blur(); if (e.key === 'Escape') { inp.value = todo.text; inp.blur(); } };
}

function refreshStats() {
  const done = allTodos.filter(t => t.completed).length;
  document.getElementById('stats').textContent = allTodos.length ? `✅ 已完成 ${done} / ${allTodos.length}` : '';
  document.getElementById('empty').style.display = allTodos.length ? 'none' : 'block';
}

/* ===== 搜索 ===== */
function setupSearch() {
  const input = document.getElementById('todoInput');
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { renderList(allTodos); return; }
    const results = allTodos.filter(t => t.text.toLowerCase().includes(q));
    renderList(results);
  });
}

/* ===== 批量操作 ===== */
function deleteCompleted() {
  const ids = allTodos.filter(t => t.completed).map(t => t.id);
  if (!ids.length) return;
  ids.forEach(id => { SB.from('todos').delete().eq('id', id); });
  allTodos = allTodos.filter(t => !t.completed);
  saveLocal(allTodos);
  renderList(allTodos);
}

/* ===== 导出 ===== */
function exportTodos() {
  const data = JSON.stringify(allTodos, null, 2);
  // Tauri 环境用系统对话框；普通环境用 download
  const blob = new Blob([data], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `todos_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
}

/* ===== 初始化 ===== */
window.filterByCat = (cat) => {
  currentFilter = cat;
  document.querySelectorAll('.filter-tag').forEach(el => el.classList.toggle('active', el.dataset.cat === cat));
  renderList(allTodos);
};

window.setupApp = () => {
  document.querySelectorAll('.filter-tag').forEach(el => el.onclick = () => window.filterByCat(el.dataset.cat));
  document.getElementById('addBtn').onclick = async () => {
    const text = document.getElementById('todoInput').value.trim();
    if (!text) return;
    const cat = document.getElementById('catSelect').value;
    const due = document.getElementById('dueInput').value || null;
    await addTodo(text, cat, due);
    renderList(allTodos);
    document.getElementById('todoInput').value = '';
    document.getElementById('catSelect').value = '';
    document.getElementById('dueInput').value = '';
    document.getElementById('todoInput').focus();
  };
  document.getElementById('todoInput').onkeydown = e => { if (e.key === 'Enter') document.getElementById('addBtn').click(); };
  document.getElementById('syncStatus').innerHTML = '<span class="sync-dot">●</span> 已同步';
  setupSearch();

  fetchTodos().then(() => {
    renderList(allTodos);
    document.getElementById('syncStatus').innerHTML = '<span class="sync-dot">●</span> 已同步';
  }).catch(() => {
    document.getElementById('syncStatus').innerHTML = '<span class="sync-dot offline">●</span> 离线模式';
  });
};
})();
