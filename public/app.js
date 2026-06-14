const loginScreen = document.getElementById("login-screen");
const dashboardScreen = document.getElementById("dashboard-screen");
const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");
const dashboardMessage = document.getElementById("dashboard-message");
const sessionAuthEl = document.getElementById("session-auth");
const sessionPostsCountEl = document.getElementById("session-posts-count");
const headerUserName = document.getElementById("header-user-name");
const headerUserRole = document.getElementById("header-user-role");
const userAvatarEl = document.getElementById("user-avatar");
const postsList = document.getElementById("posts-list");
const sectionDashboard = document.getElementById("section-dashboard");
const sectionComments = document.getElementById("section-comments");
const sectionSettings = document.getElementById("section-settings");
const routeCockpitBtn = document.getElementById("route-cockpit");
const routePostsBtn = document.getElementById("route-posts");
const routeCommentsBtn = document.getElementById("route-comments");
const routeSettingsNavBtn = document.getElementById("route-settings-nav");
const routeUsersBtn = document.getElementById("route-users");
const routeReportsBtn = document.getElementById("route-reports");
const shellPageTitle = document.getElementById("shell-page-title");
const commentsBellBtn = document.getElementById("comments-bell");
const commentsBellBadge = document.getElementById("comments-bell-badge");
const dashboardKpis = document.getElementById("dashboard-kpis");
const dashboardTopViewed = document.getElementById("dashboard-top-viewed");
const dashboardNextScheduled = document.getElementById("dashboard-next-scheduled");
const dashboardRecentUpdated = document.getElementById("dashboard-recent-updated");
const commentsRefreshBtn = document.getElementById("comments-refresh");
const commentsStatusFilter = document.getElementById("comments-status-filter");
const commentsList = document.getElementById("comments-list");
const userForm = document.getElementById("user-form");
const userIdInput = document.getElementById("user-id");
const userUsernameInput = document.getElementById("user-username");
const userEmailInput = document.getElementById("user-email");
const userRoleInput = document.getElementById("user-role");
const userPasswordInput = document.getElementById("user-password");
const userResetBtn = document.getElementById("user-reset");
const usersList = document.getElementById("users-list");
const refreshBtn = document.getElementById("refresh-posts");
const importBtn = document.getElementById("import-posts");
const logoutBtn = document.getElementById("logout");
const sessionLogoutBtn = document.getElementById("session-logout");
const menuToggle = document.getElementById("menu-toggle");
const sidebarScrim = document.getElementById("sidebar-scrim");
const newPostBtn = document.getElementById("new-post");
const editorPanel = document.getElementById("editor-panel");
const closeEditorBtn = document.getElementById("close-editor");
const editorTitle = document.getElementById("editor-title");
const postEditorForm = document.getElementById("post-editor-form");
const slugFromTitleBtn = document.getElementById("slug-from-title");
const featuredFileInput = document.getElementById("post-featured-file");
const contentImageFileInput = document.getElementById("post-content-image-file");
const contentInput = document.getElementById("post-content");
const contentEditor = document.getElementById("post-content-editor");
const contentRaw = document.getElementById("post-content-raw");
const contentToolbar = document.getElementById("post-content-toolbar");
const seoSuggestBtn = document.getElementById("seo-suggest-btn");
const seoSuggestHint = document.getElementById("seo-suggest-hint");
const instagramPrepareBtn = document.getElementById("instagram-prepare-btn");
const instagramPrepareHint = document.getElementById("instagram-prepare-hint");
const instagramPackPanel = document.getElementById("instagram-pack-panel");
const instagramPackPreview = document.getElementById("instagram-pack-preview");
const instagramPackCaption = document.getElementById("instagram-pack-caption");
const instagramPackHashtags = document.getElementById("instagram-pack-hashtags");
const instagramPackBlogUrl = document.getElementById("instagram-pack-blog-url");
const instagramCopyFullBtn = document.getElementById("instagram-copy-full");
const instagramCopyHashtagsBtn = document.getElementById("instagram-copy-hashtags");
const instagramDownloadImage = document.getElementById("instagram-download-image");
let rawMode = false;
let currentUser = null;
let instagramDraft = null;
let postsLoadedCount = 0;

const KPI_ICONS = [
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>`,
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>`,
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`,
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>`,
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg>`,
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
];

const EMPTY_CALENDAR_SVG = `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>`;

function roleLabelPt(role) {
  const r = String(role || "").toLowerCase();
  if (r === "admin") return "Administrador";
  if (r === "editor") return "Editor";
  if (r === "author") return "Autor";
  return role || "Usuário";
}

function applyUserChrome(user) {
  const u = user?.username || "Admin";
  const role = roleLabelPt(user?.role);
  const initials = u
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "A";
  if (sessionAuthEl) sessionAuthEl.textContent = `Autenticado como: ${u}`;
  if (headerUserName) headerUserName.textContent = u.charAt(0).toUpperCase() + u.slice(1);
  if (headerUserRole) headerUserRole.textContent = role;
  if (userAvatarEl) userAvatarEl.textContent = initials;
}

function setPostsLoadedCount(n) {
  postsLoadedCount = Number(n) || 0;
  if (sessionPostsCountEl) {
    sessionPostsCountEl.textContent = `${postsLoadedCount} posts carregados.`;
  }
}

function closeMobileSidebar() {
  document.body.classList.remove("sidebar-open");
  if (sidebarScrim) sidebarScrim.hidden = true;
}

function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function currentRoute() {
  const raw = String(window.location.hash || "#cockpit")
    .toLowerCase()
    .replace(/^#/, "");
  if (raw === "comentarios" || raw === "comments") return "comments";
  if (raw === "configuracoes" || raw === "settings") return "settings";
  if (raw === "usuarios" || raw === "users") return "users";
  if (raw === "posts") return "posts";
  if (raw === "relatorios" || raw === "relatórios") return "reports";
  if (raw === "dashboard") return "cockpit";
  return "cockpit";
}

function setRoute(route) {
  const r = route || "cockpit";
  const dash = r === "cockpit" || r === "posts" || r === "reports";
  sectionDashboard.classList.toggle("hidden", !dash);
  sectionComments.classList.toggle("hidden", r !== "comments");
  sectionSettings.classList.toggle("hidden", r !== "settings" && r !== "users");

  routeCockpitBtn.classList.toggle("is-active", r === "cockpit" || r === "reports");
  routePostsBtn.classList.toggle("is-active", r === "posts");
  routeCommentsBtn.classList.toggle("is-active", r === "comments");
  routeSettingsNavBtn.classList.toggle("is-active", r === "settings");
  routeUsersBtn.classList.toggle("is-active", r === "users");
  routeReportsBtn.classList.toggle("is-active", r === "reports");

  const titles = {
    cockpit: "Cockpit de Posts",
    posts: "Cockpit de Posts",
    reports: "Cockpit de Posts",
    comments: "Comentários",
    settings: "Configurações",
    users: "Configurações",
  };
  if (shellPageTitle) {
    shellPageTitle.textContent = titles[r] || "Cockpit de Posts";
  }

  const after = () => {
    if (r === "posts") scrollToId("posts-section");
    else if (r === "reports" || r === "cockpit") scrollToId("overview-section");
    else if (r === "users" || r === "settings") scrollToId("users-panel");
  };
  window.requestAnimationFrame(() => window.requestAnimationFrame(after));
  closeMobileSidebar();
}

function setMessage(target, message, isError = false) {
  target.textContent = message;
  if (!message) {
    target.style.color = "";
    return;
  }
  target.style.color = isError ? "hsl(0 75% 62%)" : "hsl(46 90% 65%)";
}

function showDashboard(show) {
  loginScreen.classList.toggle("hidden", show);
  dashboardScreen.classList.toggle("hidden", !show);
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function toDatetimeLocalValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function publishedAtFromInput(localVal) {
  if (!localVal || !String(localVal).trim()) return null;
  const d = new Date(localVal);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const parts = [data.detail, data.hint].filter(Boolean);
    const msg = parts.length ? parts.join(" ") : data.error || "Erro na requisicao";
    throw new Error(msg);
  }
  return data;
}

function showEditor(show) {
  editorPanel.classList.toggle("hidden", !show);
}

function syncEditorToInput() {
  if (rawMode) {
    contentInput.value = contentRaw.value.trim();
  } else {
    contentInput.value = contentEditor.innerHTML.trim();
  }
}

function setEditorHtml(html) {
  contentEditor.innerHTML = html || "";
  contentRaw.value = html || "";
  syncEditorToInput();
}

function restoreEditorSelection() {
  contentEditor.focus();
}

function setRawMode(enabled) {
  rawMode = enabled;
  if (enabled) {
    contentRaw.value = contentEditor.innerHTML.trim();
    contentEditor.classList.add("hidden");
    contentRaw.classList.remove("hidden");
  } else {
    contentEditor.innerHTML = contentRaw.value;
    contentRaw.classList.add("hidden");
    contentEditor.classList.remove("hidden");
  }
  syncEditorToInput();
}

function normalizeUrl(raw) {
  const value = String(raw || "").trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

function insertLinkWithOptions(rawUrl, openInNewTab) {
  const url = normalizeUrl(rawUrl);
  if (!url) return;
  restoreEditorSelection();
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    document.execCommand(
      "insertHTML",
      false,
      `<a href="${escapeHtml(url)}"${openInNewTab ? ' target="_blank" rel="noopener noreferrer"' : ""}>${escapeHtml(
        url,
      )}</a>`,
    );
    syncEditorToInput();
    return;
  }

  const range = selection.getRangeAt(0);
  const selectedText = selection.toString().trim();
  const linkText = selectedText || url;
  const html = `<a href="${escapeHtml(url)}"${openInNewTab ? ' target="_blank" rel="noopener noreferrer"' : ""}>${escapeHtml(
    linkText,
  )}</a>`;
  range.deleteContents();
  const fragment = range.createContextualFragment(html);
  range.insertNode(fragment);
  selection.removeAllRanges();
  syncEditorToInput();
}

async function pasteAsPlainText() {
  restoreEditorSelection();
  let text = "";
  try {
    if (navigator.clipboard?.readText) {
      text = await navigator.clipboard.readText();
    }
  } catch {
    // ignora e cai no prompt
  }
  if (!text) {
    text = window.prompt("Cole o texto limpo:", "") || "";
  }
  if (!text) return;
  const html = escapeHtml(text).replace(/\n/g, "<br>");
  document.execCommand("insertHTML", false, html);
  syncEditorToInput();
}

function resetEditor() {
  postEditorForm.reset();
  document.getElementById("post-id").value = "";
  seoSuggestHint.textContent = "";
  instagramPrepareHint.textContent = "";
  instagramDraft = null;
  hideInstagramPack();
  setEditorHtml("");
  setRawMode(false);
}

function hideInstagramPack() {
  instagramPackPanel.classList.add("hidden");
  instagramPackPreview.removeAttribute("src");
  instagramPackCaption.value = "";
  instagramPackHashtags.value = "";
  instagramPackBlogUrl.textContent = "";
  instagramDownloadImage.removeAttribute("href");
}

function applyInstagramDraftToUI(draft, imageBase64, imageMime) {
  if (!draft) {
    hideInstagramPack();
    return;
  }
  instagramDraft = draft;
  instagramPackCaption.value = draft.caption || "";
  instagramPackHashtags.value = draft.hashtags || "";
  instagramPackBlogUrl.textContent = draft.blog_url
    ? `Artigo: ${draft.blog_url} (use link na bio ou adesivo no story)`
    : "";
  if (imageBase64) {
    const mime = imageMime || "image/jpeg";
    const dataUrl = `data:${mime};base64,${imageBase64}`;
    instagramPackPreview.src = dataUrl;
    instagramDownloadImage.href = dataUrl;
    const slug = document.getElementById("post-slug").value.trim() || "post";
    instagramDownloadImage.download = `instagram-${slug}.jpg`;
  }
  instagramPackPanel.classList.remove("hidden");
}

async function generateInstagramPack({ silent = false } = {}) {
  instagramPrepareHint.textContent = "";
  const title = document.getElementById("post-title").value.trim();
  const featured = document.getElementById("post-featured").value.trim();
  if (!title) {
    instagramPrepareHint.textContent = "Preencha o titulo.";
    return false;
  }
  if (!featured) {
    instagramPrepareHint.textContent = "Envie a imagem destacada antes.";
    return false;
  }
  if (!silent) {
    setMessage(dashboardMessage, "Gerando pacote Instagram...");
  }
  try {
    const res = await request("api/instagram-prepare", {
      method: "POST",
      body: JSON.stringify({
        title,
        slug: document.getElementById("post-slug").value.trim(),
        excerpt: document.getElementById("post-excerpt").value,
        content: contentInput.value,
        featured_image: featured,
        format: document.getElementById("post-instagram-format").value,
        tags: document
          .getElementById("post-tags")
          .value.split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        categories: document
          .getElementById("post-categories")
          .value.split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      }),
    });
    applyInstagramDraftToUI(res.draft, res.image_base64, res.image_mime);
    if (!silent) {
      setMessage(dashboardMessage, res.hint || "Pacote Instagram gerado.");
    }
    instagramPrepareHint.textContent = "Revise antes de publicar no Instagram.";
    return true;
  } catch (e) {
    const msg = e.message || "Erro ao gerar pacote Instagram";
    if (!silent) {
      setMessage(dashboardMessage, msg, true);
    }
    instagramPrepareHint.textContent = msg;
    return false;
  }
}

function openNewPost() {
  resetEditor();
  editorTitle.textContent = "Novo post";
  showEditor(true);
  window.scrollTo({ top: editorPanel.offsetTop - 20, behavior: "smooth" });
}

async function openEditPost(id) {
  setMessage(dashboardMessage, "Carregando post...");
  try {
    const res = await request(`api/cms-post?id=${encodeURIComponent(id)}`);
    const p = res.post;
    editorTitle.textContent = "Editar post";
    document.getElementById("post-id").value = String(p.id);
    document.getElementById("post-title").value = p.title ?? "";
    document.getElementById("post-slug").value = p.slug ?? "";
    document.getElementById("post-excerpt").value = p.excerpt ?? "";
    setEditorHtml(p.content ?? "");
    document.getElementById("post-featured").value = p.featured_image ?? "";
    document.getElementById("post-tags").value = Array.isArray(p.tags) ? p.tags.join(", ") : "";
    document.getElementById("post-categories").value = Array.isArray(p.categories) ? p.categories.join(", ") : "";
    document.getElementById("post-author").value = p.author_name ?? "";
    document.getElementById("post-status").value = p.status ?? "draft";
    document.getElementById("post-published-at").value = toDatetimeLocalValue(p.published_at);
    document.getElementById("post-source").value = p.source ?? "";
    document.getElementById("post-source-url").value = p.source_url ?? "";
    document.getElementById("post-meta-title").value = p.meta_title ?? "";
    document.getElementById("post-meta-desc").value = p.meta_description ?? "";
    document.getElementById("post-focus-kw").value = p.focus_keyword ?? "";
    document.getElementById("post-seo-report").value = p.seo_ai_report ?? "";
    document.getElementById("post-instagram-prepare").checked = Boolean(p.instagram_prepare);
    const draft = p.instagram_draft && typeof p.instagram_draft === "object" ? p.instagram_draft : null;
    if (draft?.format) {
      document.getElementById("post-instagram-format").value = draft.format === "story" ? "story" : "feed";
    }
    applyInstagramDraftToUI(draft, null, null);
    if (draft) {
      instagramPackPanel.classList.remove("hidden");
    }
    setMessage(dashboardMessage, "");
    showEditor(true);
    window.scrollTo({ top: editorPanel.offsetTop - 20, behavior: "smooth" });
  } catch (e) {
    setMessage(dashboardMessage, e.message, true);
  }
}

function renderPosts(items) {
  if (!Array.isArray(items) || items.length === 0) {
    postsList.innerHTML = "<p class='muted'>Nenhum post encontrado.</p>";
    return;
  }

  postsList.innerHTML = items
    .map((post) => {
      const status = post.status || "sem-status";
      const date = post.published_at || post.created_at || "-";
      const views = post.view_count != null ? ` | views: ${post.view_count}` : "";
      return `
        <article class="post-item" data-id="${post.id}">
          <div class="post-meta">
            <strong>${escapeHtml(post.title || "(sem titulo)")}</strong>
            <span class="muted">slug: ${escapeHtml(post.slug || "-")}</span><br />
            <span class="muted">status: ${escapeHtml(status)} | data: ${escapeHtml(String(date))}${escapeHtml(views)}</span>
          </div>
          <div class="post-actions">
            <button type="button" class="ghost edit-post" data-id="${post.id}">Editar</button>
          </div>
        </article>
      `;
    })
    .join("");

  postsList.querySelectorAll(".edit-post").forEach((btn) => {
    btn.addEventListener("click", () => openEditPost(btn.getAttribute("data-id")));
  });
}

function formatDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString("pt-BR");
}

function miniThumbHtml(url) {
  if (url && String(url).trim()) {
    return `<img class="mini-thumb" src="${escapeHtml(url)}" alt="" loading="lazy" />`;
  }
  return `<div class="mini-thumb mini-thumb-placeholder" aria-hidden="true"></div>`;
}

function renderMiniList(target, items, formatter) {
  if (!Array.isArray(items) || items.length === 0) {
    target.innerHTML = "<p class='muted'>Sem dados.</p>";
    return;
  }
  target.innerHTML = items.map((item) => `<div class="mini-item">${formatter(item)}</div>`).join("");
}

function renderScheduledColumn(target, items) {
  if (!Array.isArray(items) || items.length === 0) {
    target.innerHTML = `<div class="list-empty"><div class="list-empty-icon">${EMPTY_CALENDAR_SVG}</div><p class="muted">Sem dados.</p></div>`;
    return;
  }
  target.innerHTML = items
    .map((p) => {
      const thumb = miniThumbHtml(p.featured_image);
      const body = `<div class="mini-item-body"><strong>${escapeHtml(p.title || "(sem título)")}</strong><span class="mini-slug">${formatDate(
        p.published_at,
      )}</span></div>`;
      return `<div class="mini-item mini-item-media">${thumb}${body}</div>`;
    })
    .join("");
}

function renderDashboard(data) {
  const t = data?.totals ?? {};
  const kpis = [
    ["Total de posts", t.totalPosts ?? 0],
    ["Publicados no ar", t.published ?? 0],
    ["Rascunhos", t.drafts ?? 0],
    ["Agendados", t.scheduled ?? 0],
    ["Pendentes SEO", t.seoPending ?? 0],
    ["Visitas totais", t.totalViews ?? 0],
  ];
  dashboardKpis.innerHTML = kpis
    .map(
      ([label, value], i) => `
        <div class="kpi-card">
          <div class="kpi-card-inner">
            <div class="kpi-label">${escapeHtml(label)}</div>
            <div class="kpi-value">${escapeHtml(String(value))}</div>
          </div>
          <div class="kpi-icon-wrap">${KPI_ICONS[i] || KPI_ICONS[0]}</div>
        </div>
      `,
    )
    .join("");

  const pending = Number(t.pendingComments ?? 0);
  commentsBellBadge.textContent = String(pending);
  commentsBellBadge.classList.toggle("hidden", pending <= 0);

  if (Array.isArray(data.topViewed) && data.topViewed.length) {
    dashboardTopViewed.innerHTML = data.topViewed
      .map((p) => {
        const thumb = miniThumbHtml(p.featured_image);
        const body = `<div class="mini-item-body"><strong>${escapeHtml(p.title || "(sem título)")}</strong><span class="mini-slug">/${escapeHtml(
          p.slug || "-",
        )}</span><span class="mini-views">${Number(p.view_count ?? 0)} views</span></div>`;
        return `<div class="mini-item mini-item-media">${thumb}${body}</div>`;
      })
      .join("");
  } else {
    renderMiniList(dashboardTopViewed, [], () => "");
  }

  renderScheduledColumn(dashboardNextScheduled, data.nextScheduled);

  if (Array.isArray(data.recentUpdated) && data.recentUpdated.length) {
    dashboardRecentUpdated.innerHTML = data.recentUpdated
      .map((p) => {
        const thumb = miniThumbHtml(p.featured_image);
        const body = `<div class="mini-item-body"><strong>${escapeHtml(p.title || "(sem título)")}</strong><span class="mini-slug">${formatDate(
          p.updated_at,
        )}</span></div>`;
        return `<div class="mini-item mini-item-media">${thumb}${body}</div>`;
      })
      .join("");
  } else {
    renderMiniList(dashboardRecentUpdated, [], () => "");
  }
}

async function loadDashboard() {
  try {
    const data = await request("api/dashboard");
    renderDashboard(data);
  } catch (error) {
    dashboardKpis.innerHTML = `<p class="muted">${escapeHtml(error.message || "Falha ao carregar dashboard.")}</p>`;
  }
}

function resetUserForm() {
  userIdInput.value = "";
  userUsernameInput.value = "";
  userEmailInput.value = "";
  userRoleInput.value = "editor";
  userPasswordInput.value = "";
}

function renderUsers(items) {
  if (!Array.isArray(items) || items.length === 0) {
    usersList.innerHTML = "<p class='muted'>Nenhum usuário.</p>";
    return;
  }
  usersList.innerHTML = items
    .map(
      (u) => `
      <div class="mini-item" data-user-id="${u.id}">
        <strong>${escapeHtml(u.username)}</strong>
        <div class="muted">${escapeHtml(u.email)} • role: ${escapeHtml(u.role)} • ${
          u.is_active ? "ativo" : "inativo"
        }</div>
        <div class="mini-actions">
          <button type="button" class="ghost user-edit" data-id="${u.id}">Editar</button>
          <button type="button" class="ghost user-toggle" data-id="${u.id}" data-active="${u.is_active ? "1" : "0"}">
            ${u.is_active ? "Desativar" : "Ativar"}
          </button>
          <button type="button" class="danger user-delete" data-id="${u.id}">Excluir</button>
        </div>
      </div>
    `,
    )
    .join("");

  usersList.querySelectorAll(".user-edit").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const item = items.find((u) => String(u.id) === String(id));
      if (!item) return;
      userIdInput.value = String(item.id);
      userUsernameInput.value = item.username || "";
      userEmailInput.value = item.email || "";
      userRoleInput.value = item.role || "editor";
      userPasswordInput.value = "";
      window.scrollTo({ top: userForm.offsetTop - 20, behavior: "smooth" });
    });
  });

  usersList.querySelectorAll(".user-toggle").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      const isActive = btn.getAttribute("data-active") === "1";
      try {
        await request("api/settings/users", {
          method: "PATCH",
          body: JSON.stringify({ id, is_active: !isActive }),
        });
        await loadUsers();
      } catch (e) {
        setMessage(dashboardMessage, e.message, true);
      }
    });
  });

  usersList.querySelectorAll(".user-delete").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      if (!window.confirm("Excluir usuário?")) return;
      try {
        await request(`api/settings/users?id=${encodeURIComponent(id)}`, { method: "DELETE", body: JSON.stringify({}) });
        await loadUsers();
      } catch (e) {
        setMessage(dashboardMessage, e.message, true);
      }
    });
  });
}

async function loadUsers() {
  if (!currentUser || currentUser.role !== "admin") {
    usersList.innerHTML = "<p class='muted'>Somente admin pode gerenciar usuários.</p>";
    return;
  }
  try {
    const res = await request("api/settings/users");
    renderUsers(res.items || []);
  } catch (e) {
    usersList.innerHTML = `<p class='muted'>${escapeHtml(e.message || "Falha ao carregar usuários.")}</p>`;
  }
}

function renderComments(items) {
  if (!Array.isArray(items) || items.length === 0) {
    commentsList.innerHTML = "<p class='muted'>Sem comentários.</p>";
    return;
  }
  commentsList.innerHTML = items
    .map(
      (c) => `
      <div class="mini-item">
        <strong>${escapeHtml(c.name || "(sem nome)")}</strong>
        <div class="muted">${escapeHtml(c.email || "-")} • ${formatDate(c.created_at)}</div>
        <p>${escapeHtml(c.comment || "")}</p>
        <div class="mini-actions">
          <button type="button" class="ghost comment-approve" data-id="${c.id}">Aprovar</button>
          <button type="button" class="ghost comment-reject" data-id="${c.id}">Rejeitar</button>
          <button type="button" class="danger comment-delete" data-id="${c.id}">Excluir</button>
        </div>
      </div>
    `,
    )
    .join("");

  commentsList.querySelectorAll(".comment-approve").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await request("api/comments/moderation", {
          method: "PATCH",
          body: JSON.stringify({ id: Number(btn.getAttribute("data-id")), status: "approved" }),
        });
        await loadComments();
      } catch (e) {
        setMessage(dashboardMessage, e.message, true);
      }
    });
  });
  commentsList.querySelectorAll(".comment-reject").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await request("api/comments/moderation", {
          method: "PATCH",
          body: JSON.stringify({ id: Number(btn.getAttribute("data-id")), status: "rejected" }),
        });
        await loadComments();
      } catch (e) {
        setMessage(dashboardMessage, e.message, true);
      }
    });
  });
  commentsList.querySelectorAll(".comment-delete").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!window.confirm("Excluir comentário?")) return;
      try {
        await request(`api/comments/moderation?id=${encodeURIComponent(btn.getAttribute("data-id"))}`, {
          method: "DELETE",
          body: JSON.stringify({}),
        });
        await loadComments();
      } catch (e) {
        setMessage(dashboardMessage, e.message, true);
      }
    });
  });
}

async function loadComments() {
  const status = commentsStatusFilter.value || "pending";
  try {
    const res = await request(`api/comments/moderation?status=${encodeURIComponent(status)}`);
    renderComments(res.items || []);
  } catch (e) {
    commentsList.innerHTML = `<p class='muted'>${escapeHtml(e.message || "Falha ao carregar comentários.")}</p>`;
  }
}

async function loadPosts() {
  setMessage(dashboardMessage, "Carregando posts...");
  try {
    const result = await request("api/posts?limit=500");
    renderPosts(result.items);
    setPostsLoadedCount(result.count ?? result.items?.length ?? 0);
    setMessage(dashboardMessage, "");
  } catch (error) {
    setMessage(dashboardMessage, error.message, true);
  }
}

function collectPayload() {
  syncEditorToInput();
  const idRaw = document.getElementById("post-id").value.trim();
  const tags = document
    .getElementById("post-tags")
    .value.split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const categories = document
    .getElementById("post-categories")
    .value.split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const payload = {
    title: document.getElementById("post-title").value.trim(),
    slug: document.getElementById("post-slug").value.trim(),
    excerpt: document.getElementById("post-excerpt").value.trim() || null,
    content: contentInput.value,
    featured_image: document.getElementById("post-featured").value.trim() || null,
    tags,
    categories,
    author_name: document.getElementById("post-author").value.trim() || null,
    status: document.getElementById("post-status").value,
    published_at: publishedAtFromInput(document.getElementById("post-published-at").value),
    source: document.getElementById("post-source").value.trim() || null,
    source_url: document.getElementById("post-source-url").value.trim() || null,
    meta_title: document.getElementById("post-meta-title").value.trim() || null,
    meta_description: document.getElementById("post-meta-desc").value.trim() || null,
    focus_keyword: document.getElementById("post-focus-kw").value.trim() || null,
    seo_ai_report: document.getElementById("post-seo-report").value.trim() || null,
    instagram_prepare: document.getElementById("post-instagram-prepare").checked,
    instagram_draft: instagramDraft,
  };

  if (idRaw) {
    payload.id = Number(idRaw);
  }
  return payload;
}

async function initSession() {
  try {
    const result = await request("api/auth/me");
    if (!result.ok || !result.user) {
      currentUser = null;
      showDashboard(false);
      setRoute("cockpit");
      return;
    }
    currentUser = result.user;
    applyUserChrome(currentUser);
    showDashboard(true);
    await loadDashboard();
    await loadComments();
    await loadUsers();
    await loadPosts();
    setRoute(currentRoute());
  } catch {
    currentUser = null;
    showDashboard(false);
    setRoute("cockpit");
  }
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const payload = {
    username: String(formData.get("username") || ""),
    password: String(formData.get("password") || ""),
  };

  setMessage(loginMessage, "Validando acesso...");
  try {
    const result = await request("api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    currentUser = result.user ?? null;
    applyUserChrome(currentUser);
    setMessage(loginMessage, "");
    showDashboard(true);
    await loadDashboard();
    await loadComments();
    await loadUsers();
    await loadPosts();
    setRoute(currentRoute());
  } catch (error) {
    setMessage(loginMessage, error.message, true);
  }
});

refreshBtn.addEventListener("click", async () => {
  await loadDashboard();
  await loadComments();
  await loadUsers();
  await loadPosts();
});

function bindRoute(btn, hash, route, loader) {
  if (!btn) return;
  btn.addEventListener("click", async () => {
    window.location.hash = hash;
    setRoute(route);
    if (typeof loader === "function") await loader();
  });
}

bindRoute(routeCockpitBtn, "cockpit", "cockpit");
bindRoute(routePostsBtn, "posts", "posts");
bindRoute(routeReportsBtn, "relatorios", "reports");
bindRoute(routeCommentsBtn, "comentarios", "comments", loadComments);
bindRoute(routeSettingsNavBtn, "configuracoes", "settings", loadUsers);
bindRoute(routeUsersBtn, "usuarios", "users", loadUsers);

commentsBellBtn.addEventListener("click", async () => {
  window.location.hash = "comentarios";
  setRoute("comments");
  commentsStatusFilter.value = "pending";
  await loadComments();
});
window.addEventListener("hashchange", () => setRoute(currentRoute()));

menuToggle?.addEventListener("click", () => {
  const next = !document.body.classList.contains("sidebar-open");
  document.body.classList.toggle("sidebar-open", next);
  if (sidebarScrim) sidebarScrim.hidden = !next;
});

sidebarScrim?.addEventListener("click", closeMobileSidebar);

document.querySelectorAll(".see-all[data-scroll-target]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const id = btn.getAttribute("data-scroll-target");
    window.location.hash = "posts";
    setRoute("posts");
    window.requestAnimationFrame(() => scrollToId(id));
  });
});

commentsRefreshBtn.addEventListener("click", async () => {
  await loadComments();
});

commentsStatusFilter.addEventListener("change", async () => {
  await loadComments();
});

newPostBtn.addEventListener("click", () => openNewPost());

closeEditorBtn.addEventListener("click", () => {
  showEditor(false);
});

slugFromTitleBtn.addEventListener("click", () => {
  const t = document.getElementById("post-title").value;
  document.getElementById("post-slug").value = slugify(t);
});

contentToolbar.addEventListener("click", (event) => {
  const target = event.target.closest("button");
  if (!target) return;
  const cmd = target.getAttribute("data-cmd");
  const action = target.getAttribute("data-action");
  const value = target.getAttribute("data-value") || undefined;

  if (rawMode && action !== "toggle-html") {
    if (cmd || action === "insert-link" || action === "paste-plain" || action === "clear-format") {
      setMessage(dashboardMessage, "Saia do modo <> para usar os atalhos visuais.");
      return;
    }
  }

  restoreEditorSelection();

  if (cmd) {
    document.execCommand(cmd, false, value);
    syncEditorToInput();
    return;
  }
  if (action === "insert-link") {
    const url = window.prompt("URL do link (https://...):", "https://");
    if (!url) return;
    const external = window.confirm("Abrir em nova aba? (OK = sim / Cancelar = não)");
    insertLinkWithOptions(url, external);
    syncEditorToInput();
    return;
  }
  if (action === "clear-format") {
    document.execCommand("removeFormat", false);
    syncEditorToInput();
    return;
  }
  if (action === "toggle-html") {
    setRawMode(!rawMode);
    return;
  }
  if (action === "paste-plain") {
    void pasteAsPlainText();
  }
});

contentEditor.addEventListener("input", syncEditorToInput);
contentRaw.addEventListener("input", syncEditorToInput);

featuredFileInput.addEventListener("change", async () => {
  const file = featuredFileInput.files?.[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    setMessage(dashboardMessage, "Imagem muito grande (max ~5MB).", true);
    return;
  }
  setMessage(dashboardMessage, "Enviando imagem...");
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const base64 = String(reader.result || "");
      const res = await request("api/upload-media", {
        method: "POST",
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          base64,
        }),
      });
      document.getElementById("post-featured").value = res.publicUrl;
      setMessage(dashboardMessage, "Imagem enviada.");
    } catch (e) {
      setMessage(dashboardMessage, e.message, true);
    } finally {
      featuredFileInput.value = "";
    }
  };
  reader.readAsDataURL(file);
});

contentImageFileInput.addEventListener("change", async () => {
  const file = contentImageFileInput.files?.[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    setMessage(dashboardMessage, "Imagem muito grande (max ~5MB).", true);
    return;
  }
  setMessage(dashboardMessage, "Enviando imagem para o conteúdo...");
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const base64 = String(reader.result || "");
      const res = await request("api/upload-media", {
        method: "POST",
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          base64,
        }),
      });
      restoreEditorSelection();
      document.execCommand("insertHTML", false, `<img src="${res.publicUrl}" alt="" />`);
      syncEditorToInput();
      setMessage(dashboardMessage, "Imagem inserida no conteúdo.");
    } catch (e) {
      setMessage(dashboardMessage, e.message, true);
    } finally {
      contentImageFileInput.value = "";
    }
  };
  reader.readAsDataURL(file);
});

seoSuggestBtn.addEventListener("click", async () => {
  seoSuggestHint.textContent = "";
  const title = document.getElementById("post-title").value.trim();
  if (!title) {
    seoSuggestHint.textContent = "Preencha o titulo.";
    return;
  }
  setMessage(dashboardMessage, "Gerando sugestoes de SEO...");
  try {
    const res = await request("api/seo-suggest", {
      method: "POST",
      body: JSON.stringify({
        title,
        excerpt: document.getElementById("post-excerpt").value,
        content: contentInput.value,
        focus_keyword: document.getElementById("post-focus-kw").value,
      }),
    });
    document.getElementById("post-seo-report").value = res.report || "";
    const p = res.parsed;
    if (p && typeof p === "object") {
      if (typeof p.meta_title === "string" && p.meta_title.trim()) {
        document.getElementById("post-meta-title").value = p.meta_title.trim();
      }
      if (typeof p.meta_description === "string" && p.meta_description.trim()) {
        document.getElementById("post-meta-desc").value = p.meta_description.trim();
      }
      if (typeof p.focus_keyword_suggestion === "string" && p.focus_keyword_suggestion.trim()) {
        document.getElementById("post-focus-kw").value = p.focus_keyword_suggestion.trim();
      }
    }
    setMessage(dashboardMessage, res.disclaimer || "Sugestao gerada.");
    seoSuggestHint.textContent = "";
  } catch (e) {
    const msg = e.message || "Erro ao gerar SEO";
    setMessage(dashboardMessage, msg, true);
    seoSuggestHint.textContent = msg;
  }
});

instagramPrepareBtn.addEventListener("click", () => {
  void generateInstagramPack();
});

instagramCopyFullBtn.addEventListener("click", async () => {
  const caption = instagramPackCaption.value.trim();
  const hashtags = instagramPackHashtags.value.trim();
  const blog = instagramDraft?.blog_url ? `\n\n🔗 ${instagramDraft.blog_url}` : "";
  const full = [caption, hashtags].filter(Boolean).join("\n\n") + blog;
  try {
    await navigator.clipboard.writeText(full.trim());
    instagramPrepareHint.textContent = "Legenda completa copiada.";
  } catch {
    window.prompt("Copie a legenda:", full.trim());
  }
});

instagramCopyHashtagsBtn.addEventListener("click", async () => {
  const hashtags = instagramPackHashtags.value.trim();
  if (!hashtags) return;
  try {
    await navigator.clipboard.writeText(hashtags);
    instagramPrepareHint.textContent = "Hashtags copiadas.";
  } catch {
    window.prompt("Copie as hashtags:", hashtags);
  }
});

instagramPackCaption.addEventListener("input", () => {
  if (instagramDraft) instagramDraft.caption = instagramPackCaption.value;
});
instagramPackHashtags.addEventListener("input", () => {
  if (instagramDraft) instagramDraft.hashtags = instagramPackHashtags.value;
});

postEditorForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  syncEditorToInput();
  const payload = collectPayload();
  const isUpdate = Boolean(payload.id);
  setMessage(dashboardMessage, "Salvando...");
  try {
    let savedRes;
    if (isUpdate) {
      savedRes = await request("api/cms-post", { method: "PATCH", body: JSON.stringify(payload) });
    } else {
      savedRes = await request("api/cms-post", { method: "POST", body: JSON.stringify(payload) });
      if (savedRes.post?.id) {
        document.getElementById("post-id").value = String(savedRes.post.id);
      }
    }

    const shouldPrepare =
      document.getElementById("post-instagram-prepare").checked &&
      document.getElementById("post-featured").value.trim();
    if (shouldPrepare) {
      const ok = await generateInstagramPack({ silent: true });
      if (ok) {
        const refreshPayload = collectPayload();
        if (refreshPayload.id) {
          await request("api/cms-post", {
            method: "PATCH",
            body: JSON.stringify(refreshPayload),
          });
        }
        setMessage(dashboardMessage, "Salvo. Pacote Instagram gerado — revise no editor.");
        await loadDashboard();
        await loadPosts();
        return;
      }
      setMessage(dashboardMessage, "Salvo, mas falhou gerar Instagram. Use o botao Gerar pacote.", true);
    } else {
      setMessage(dashboardMessage, "Salvo com sucesso.");
    }
    showEditor(false);
    await loadDashboard();
    await loadPosts();
  } catch (e) {
    setMessage(dashboardMessage, e.message, true);
  }
});

userForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!currentUser || currentUser.role !== "admin") {
    setMessage(dashboardMessage, "Somente admin pode gerenciar usuários.", true);
    return;
  }
  const id = userIdInput.value.trim();
  const payload = {
    id: id || undefined,
    username: userUsernameInput.value.trim(),
    email: userEmailInput.value.trim(),
    role: userRoleInput.value,
    password: userPasswordInput.value.trim() || undefined,
  };
  if (!payload.username || !payload.email || (!id && !payload.password)) {
    setMessage(dashboardMessage, "Preencha username, email e senha (ao criar).", true);
    return;
  }
  try {
    if (id) {
      await request("api/settings/users", { method: "PATCH", body: JSON.stringify(payload) });
    } else {
      await request("api/settings/users", { method: "POST", body: JSON.stringify(payload) });
    }
    setMessage(dashboardMessage, "Usuário salvo.");
    resetUserForm();
    await loadUsers();
  } catch (e) {
    setMessage(dashboardMessage, e.message, true);
  }
});

userResetBtn.addEventListener("click", () => resetUserForm());

importBtn.addEventListener("click", async () => {
  setMessage(dashboardMessage, "Executando importacao...");
  try {
    const result = await request("api/import-posts", {
      method: "POST",
      body: JSON.stringify({}),
    });
    setMessage(
      dashboardMessage,
      `Importacao concluida: ${result.totalImported} de ${result.totalFetched} posts.`,
    );
    await loadDashboard();
    await loadPosts();
  } catch (error) {
    setMessage(dashboardMessage, error.message, true);
  }
});

async function performLogout() {
  try {
    await request("api/auth/logout", { method: "POST", body: JSON.stringify({}) });
  } finally {
    showDashboard(false);
    showEditor(false);
    currentUser = null;
    loginForm.reset();
    postsList.innerHTML = "";
    commentsList.innerHTML = "";
    usersList.innerHTML = "";
    resetEditor();
    resetUserForm();
    setPostsLoadedCount(0);
    if (sessionAuthEl) sessionAuthEl.textContent = "Autenticado como: —";
    closeMobileSidebar();
  }
}

logoutBtn.addEventListener("click", () => void performLogout());
sessionLogoutBtn?.addEventListener("click", () => void performLogout());

initSession();
