<template>
  <!-- ── SIDEBAR OVERLAY (mobile) ── -->
  <div class="sidebar-overlay" v-if="mobileOpen" @click="mobileOpen = false"></div>

  <!-- ── SIDEBAR ── -->
  <aside class="sidebar" :class="{ collapsed: sidebarCollapsed, 'mobile-open': mobileOpen }">
    <div class="sidebar-logo">
      <div v-if="!sidebarCollapsed || mobileOpen" class="logo-content">
        <div class="logo-text">TaskOps</div>
        <div class="logo-sub">Suivi Hebdomadaire</div>
      </div>
      <button class="sidebar-toggle" @click="toggleSidebar" :title="sidebarCollapsed ? 'Déplier' : 'Replier'">
        {{ sidebarCollapsed ? "»" : "«" }}
      </button>
    </div>

    <template v-if="!sidebarCollapsed || mobileOpen">
      <div class="nav-tab-strip">
        <select class="week-select" v-model="currentWeek">
          <option v-for="w in availableWeeks" :key="w" :value="w">{{ w }}</option>
        </select>
        <button class="nav-tab" :class="{ active: currentView === 'sector' }" @click="setView('sector')">🏢 Secteurs</button>
        <button class="nav-tab" :class="{ active: currentView === 'agent' }" @click="setView('agent')">🥷 Agents</button>
        <button class="nav-tab" :class="{ active: currentView === 'config' }" @click="setView('config')">⚙️ Configuration</button>
      </div>

      <nav class="sidebar-nav">
        <template v-if="currentView === 'sector'">
          <div class="site-group" v-for="site in data.sites" :key="site.id">
            <div class="site-header" @click="toggleSite(site.id)">
              <span class="site-chevron" :class="{ open: openSites.has(site.id) }">▶</span>
              <span class="site-name">{{ site.name }}</span>
              <span class="site-badge">{{ site.sectors.length }}</span>
              <button class="site-export-btn" @click.stop="exportSite(site)" title="Export XLSX du site">XLSX</button>
            </div>
            <transition name="slide">
              <div v-if="openSites.has(site.id)">
                <div
                  v-for="sector in site.sectors"
                  :key="sector.id"
                  class="nav-item"
                  :class="{ active: currentSector?.id === sector.id }"
                  @click="selectSector(sector, site)"
                >
                  <div class="nav-completion" :style="{ background: completionColor(sector) }"></div>
                  <span class="nav-item-name">{{ sector.name }}</span>
                  <span class="nav-item-badge">{{ completionCount(sector) }}/{{ sector.tasks.length }}</span>
                </div>
              </div>
            </transition>
          </div>
        </template>
      </nav>

      <div class="sidebar-footer">
        <button class="btn-clean" @click="openCleanModal" title="Nettoyer les semaines passées">🧹 Nettoyer le stockage</button>
        <button class="btn-export-all" @click="exportAll">⬇ EXPORT GLOBAL</button>
      </div>
    </template>
    <template v-else>
      <div class="nav-tab-strip">
        <button class="nav-tab" :class="{ active: currentView === 'sector' }" @click="setView('sector')">🏢</button>
        <button class="nav-tab" :class="{ active: currentView === 'agent' }" @click="setView('agent')">🥷</button>
        <button class="nav-tab" :class="{ active: currentView === 'config' }" @click="setView('config')">⚙️</button>
      </div>
    </template>
  </aside>

  <!-- ── MAIN ── -->
  <main class="main">
    <!-- ══ CONFIG VIEW ══ -->
    <template v-if="currentView === 'config'">
      <div class="config-view">
        <div class="config-header">
          <button class="btn-hamburger" @click="mobileOpen = true">☰</button>
          <div>
            <div class="config-title">Configuration</div>
            <div class="config-subtitle">Gérer les sites, secteurs, tâches et agents</div>
          </div>
          <div class="header-actions">
            <button class="btn-primary" @click="openAddModal('agent')">+ Ajouter un agent</button>
            <button class="btn-primary" @click="openAddModal('sector')">+ Ajouter un secteur</button>
          </div>
        </div>

        <div class="config-table-wrap">
          <table class="config-table">
            <thead>
              <tr>
                <th style="width: 14%">Site</th>
                <th style="width: 16%">Secteur</th>
                <th style="width: 12%">Agent</th>
                <th>Tâches</th>
                <th class="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="site in data.sites" :key="site.id">
                <template v-for="sector in site.sectors" :key="sector.id">
                  <tr class="config-row">
                    <td>
                      <div class="config-cell-site">{{ site.name }}</div>
                    </td>
                    <td>
                      <div class="config-cell-sector">{{ sector.name }}</div>
                      <div style="font-size: 11px; color: var(--text2); margin-top: 2px">{{ sector.description }}</div>
                    </td>
                    <td>
                      <div class="config-cell-agent">{{ getAgent(sector.agent) || "—" }}</div>
                    </td>
                    <td>
                      <div class="cell-chip">
                        <span
                          class="chip"
                          v-for="t in sector.tasks"
                          :key="t.id"
                          @click="
                            currentSector = sector;
                            currentView = 'sector';
                            sidebarTab = 'nav';
                          "
                          >{{ t.title }}</span
                        >
                      </div>
                    </td>
                    <td>
                      <div class="config-row-actions">
                        <button class="btn-icon" @click="openEditModal('sector', { site, sector })" title="Éditer">✎</button>
                        <button class="btn-icon del" @click="deleteSector(site, sector)" title="Supprimer">✕</button>
                      </div>
                    </td>
                  </tr>
                </template>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <template v-if="currentView === 'agent'">
      <div class="config-view">
        <div class="config-header">
          <button class="btn-hamburger" @click="mobileOpen = true">☰</button>
          <div>
            <div class="config-title">Agents</div>
            <div class="config-subtitle">Gérer les agents</div>
          </div>
          <div class="header-actions">
            <button class="btn-primary" @click="openAddModal('agent')">+ Ajouter un agent</button>
          </div>
        </div>
        <div class="config-table-wrap">
          <table class="config-table">
            <thead>
              <tr>
                <th style="width: 30%">Nom</th>
                <th style="width: 30%">Prénom</th>
                <th style="width: 30%">Secteurs</th>
                <th class="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="agent in data.agents" :key="agent.id">
                <tr class="config-row">
                  <td>
                    <div class="config-cell-site">{{ agent.lastname }}</div>
                  </td>
                  <td>
                    <div class="config-cell-sector">{{ agent.firstname }}</div>
                  </td>
                  <td>
                    <div class="sector-cell">
                      <span
                        class="chip"
                        v-for="sector in agentsSectors(agent)"
                        :key="sector.id"
                        @click="
                          currentSector = sector;
                          currentView = 'sector';
                          sidebarTab = 'nav';
                        "
                        >{{ sector.name }}</span
                      >
                    </div>
                  </td>
                  <td>
                    <div class="config-row-actions">
                      <button class="btn-icon" @click="openEditModal('agent', { agent })" title="Éditer">✎</button>
                      <button class="btn-icon del" @click="deleteAgent(agent)" title="Supprimer">✕</button>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- ══ SECTOR VIEW ══ -->
    <template v-if="currentView === 'sector'">
      <template v-if="currentSector">
        <header class="main-header">
          <div style="display: flex; align-items: center; gap: 10px; min-width: 0">
            <button class="btn-hamburger" @click="mobileOpen = true">☰</button>
            <div style="min-width: 0">
              <div class="main-breadcrumb">
                <span class="bc-site">{{ currentSite?.name }}</span> / {{ currentSector.name }}
              </div>
              <div class="main-week">
                <div>
                  <div class="main-title">{{ currentSector.name }}</div>
                  <div class="main-subtitle">{{ currentSector.description }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="header-actions">
            <button class="btn" @click="exportSectorDirect('csv')">CSV</button>
            <button class="btn" @click="exportSectorDirect('xlsx')">XLSX</button>
            <UserMenu />
          </div>
        </header>

        <div class="stats-strip">
          <div class="stat-card">
            <div class="stat-value">{{ currentSector.tasks.length }}</div>
            <div class="stat-label">Total</div>
          </div>
          <div class="stat-card stat-ok">
            <div class="stat-value">{{ ratingCount("ok") }}</div>
            <div class="stat-label">OK</div>
          </div>
          <div class="stat-card stat-ko">
            <div class="stat-value">{{ ratingCount("ko") }}</div>
            <div class="stat-label">KO</div>
          </div>
          <div class="stat-card stat-warn">
            <div class="stat-value">{{ ratingCount("warn") }}</div>
            <div class="stat-label">WARN</div>
          </div>
          <div class="stat-card stat-na">
            <div class="stat-value">{{ ratingCount("na") }}</div>
            <div class="stat-label">N/A</div>
          </div>
        </div>

        <div class="table-wrap">
          <table class="task-table">
            <thead>
              <tr>
                <th class="col-task">Tâche</th>
                <th class="col-agent">Agent</th>
                <th class="col-rating">Statut</th>
                <th class="col-comment">Commentaire</th>
                <th class="col-quotient">Quotient</th>
                <th class="col-photo">Photo</th>
                <th class="col-history">Historique</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="task in currentSector.tasks" :key="task.id">
                <tr class="task-row">
                  <!-- TÂCHE -->
                  <td>
                    <div class="task-intitule">{{ task.title }}</div>
                    <div class="task-desc-short">{{ task.shortDesc }}</div>
                    <button class="task-desc-long-btn" @click="toggleLongDesc(task.id)">
                      {{ expandedDesc.has(task.id) ? "▲ moins" : "▼ détails" }}
                    </button>
                    <transition name="fade">
                      <div v-if="expandedDesc.has(task.id)" class="task-desc-long">{{ task.longDesc }}</div>
                    </transition>
                  </td>
                  <!-- AGENT -->
                  <td>
                    <div style="font-size: 12px; color: var(--text2)">{{ getAgent(currentSector.agent) || "—" }}</div>
                  </td>
                  <!-- RATING -->
                  <td>
                    <div class="rating-group">
                      <button
                        v-for="r in ['ok', 'ko', 'warn', 'na']"
                        :key="r"
                        class="rating-btn"
                        :class="[r, { active: getEntry(task.id).rating === r }]"
                        @click="setRating(task.id, r)"
                      >
                        {{ r.toUpperCase() }}
                      </button>
                    </div>
                  </td>
                  <!-- COMMENT -->
                  <td>
                    <textarea
                      class="comment-input"
                      placeholder="Commentaire"
                      :value="getEntry(task.id).comment"
                      @input="setComment(task.id, $event.target.value)"
                      rows="1"
                    ></textarea>
                  </td>
                  <!-- QUOTIENT -->
                  <td>
                    <div class="quotient-cell">
                      <div class="quotient-value">
                        <span :style="{ color: quotientColor(getQuotient(task.id)) }"> {{ (getQuotient(task.id) * 100).toFixed(0) }}% </span>
                        <span :class="trendClass(task.id)">{{ trendIcon(task.id) }}</span>
                      </div>
                      <div class="quotient-bar-bg">
                        <div
                          class="quotient-bar"
                          :style="{
                            width: getQuotient(task.id) * 100 + '%',
                            background: quotientColor(getQuotient(task.id)),
                          }"
                        ></div>
                      </div>
                    </div>
                  </td>
                  <!-- PHOTO -->
                  <td>
                    <div class="photo-cell">
                      <img
                        v-if="getEntry(task.id).photo"
                        :src="getEntry(task.id).photo"
                        class="photo-thumb"
                        @click="lightboxSrc = getEntry(task.id).photo"
                        title="Agrandir"
                      />
                      <div class="photo-actions">
                        <button class="btn-photo" @click="triggerCamera(task.id)" title="Caméra">📷</button>
                        <button class="btn-photo" @click="triggerFileInput(task.id)" title="Fichier">📁</button>
                        <button v-if="getEntry(task.id).photo" class="btn-photo btn-photo-del" @click="removePhoto(task.id)">✕</button>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        :ref="
                          (el) => {
                            if (el) fileInputs[task.id] = el;
                          }
                        "
                        style="display: none"
                        @change="onFileChange(task.id, $event)"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        :ref="
                          (el) => {
                            if (el) cameraInputs[task.id] = el;
                          }
                        "
                        style="display: none"
                        @change="onFileChange(task.id, $event)"
                      />
                    </div>
                  </td>
                  <!-- HISTORY -->
                  <td>
                    <button class="history-toggle" @click="toggleHistory(task.id)">
                      {{ expandedHistory.has(task.id) ? "▲" : "▼" }} {{ historyFor(task.id).filter((e) => e.week !== "_snapshot").length }}
                      entrée(s)
                    </button>
                    <transition name="fade">
                      <div v-if="expandedHistory.has(task.id)" class="history-panel">
                        <div class="history-title">Historique</div>
                        <div v-if="!historyFor(task.id).length" style="font-size: 11px; color: var(--text2)">Aucun historique</div>
                        <div class="history-entries">
                          <div v-for="entry in historyFor(task.id)" :key="entry.week" class="history-entry">
                            <template v-if="entry.week !== '_snapshot'">
                              <span class="history-week">{{ entry.week }}</span>
                              <span class="history-rating" :class="entry.rating">{{ entry.rating.toUpperCase() }}</span>
                              <span class="history-comment">{{ entry.comment || "—" }}</span>
                            </template>
                          </div>
                        </div>
                      </div>
                    </transition>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </template>
      <template v-else>
        <div style="display: flex; align-items: center; gap: 10px; padding: 14px 20px; border-bottom: 1px solid var(--border)">
          <button class="btn-hamburger" @click="mobileOpen = true">☰</button>
        </div>
        <div class="empty-state">
          <div class="empty-icon">⬡</div>
          <div>Sélectionnez un secteur</div>
        </div>
      </template>
    </template>
  </main>

  <!-- ════════════════════ LIGHTBOX ════════════════════ -->
  <transition name="fade">
    <div v-if="lightboxSrc" class="modal-overlay lightbox" @click="lightboxSrc = null">
      <button class="lightbox-close" @click.stop="lightboxSrc = null">✕ FERMER</button>
      <img :src="lightboxSrc" @click.stop />
    </div>
  </transition>

  <!-- ════════════════════ SECTOR EDITOR MODAL ════════════════════ -->
  <transition name="fade">
    <div v-if="showSectorModal" class="modal-overlay" @click.self="showSectorModal = false">
      <div class="modal-box-lg">
        <div class="modal-title" style="color: var(--accent)">{{ editingId ? "✎ Éditer le secteur" : "+ Nouveau secteur" }}</div>
        <div class="modal-grid">
          <div class="modal-field">
            <label class="modal-label">Site</label>
            <input class="modal-input" v-model="sectorForm.siteName" placeholder="Nom du site" />
          </div>
          <div class="modal-field">
            <label class="modal-label">Secteur</label>
            <input class="modal-input" v-model="sectorForm.sectorName" placeholder="Nom du secteur" />
          </div>
          <div class="modal-field">
            <label class="modal-label">Agent</label>
            <select class="modal-input" v-model="sectorForm.agent" placeholder="Nom de l'agent">
              <option v-for="agent in data.agents" :value="agent.id">{{ agent.firstname }} {{ agent.lastname }}</option>
            </select>
          </div>
          <div class="modal-field">
            <label class="modal-label">Description du secteur</label>
            <input class="modal-input" v-model="sectorForm.description" placeholder="Description courte" />
          </div>
        </div>

        <div class="modal-field full" style="margin-bottom: 12px">
          <label class="modal-label">Tâches</label>
          <div class="tasks-editor">
            <div class="task-editor-row" v-for="(task, idx) in sectorForm.tasks" :key="idx">
              <div class="task-num">{{ idx + 1 }}</div>
              <div class="task-editor-fields">
                <input v-model="task.title" placeholder="Intitulé de la tâche *" />
                <input v-model="task.shortDesc" placeholder="Description courte" />
                <textarea v-model="task.longDesc" placeholder="Description longue" rows="2"></textarea>
              </div>
              <button class="btn-icon del" @click="sectorForm.tasks.splice(idx, 1)" style="flex-shrink: 0; margin-top: 2px">✕</button>
            </div>
            <button class="btn-add-task" @click="sectorForm.tasks.push({ title: '', shortDesc: '', longDesc: '' })">+ Ajouter une tâche</button>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn" @click="showSectorModal = false">Annuler</button>
          <button class="btn-primary" @click="saveSectorModal">{{ editingId ? "Enregistrer" : "Créer" }}</button>
        </div>
      </div>
    </div>
  </transition>

  <!-- ════════════════════ AGENT EDITOR MODAL ════════════════════ -->
  <transition name="fade">
    <div v-if="showAgentModal" class="modal-overlay" @click.self="showAgentModal = false">
      <div class="modal-box-lg">
        <div class="modal-title" style="color: var(--accent)">{{ editingId ? "✎ Éditer l'agent" : "+ Nouvel agent" }}</div>
        <div class="modal-grid">
          <div class="modal-field">
            <label class="modal-label">Prénom</label>
            <input class="modal-input" v-model="agentForm.firstname" placeholder="Prénom" />
          </div>
          <div class="modal-field">
            <label class="modal-label">Nom</label>
            <input class="modal-input" v-model="agentForm.lastname" placeholder="Nom" />
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn" @click="showAgentModal = false">Annuler</button>
          <button class="btn-primary" @click="saveAgentModal">{{ editingId ? "Enregistrer" : "Créer" }}</button>
        </div>
      </div>
    </div>
  </transition>

  <!-- ════════════════════ CLEAN MODAL ════════════════════ -->
  <transition name="fade">
    <div v-if="showCleanModal" class="modal-overlay" @click.self="showCleanModal = false">
      <div class="modal-box">
        <div class="modal-title">🧹 Nettoyage du stockage</div>
        <div class="modal-body">
          <p>
            Cette opération va <strong>supprimer les données des semaines passées</strong> (commentaires, photos, ratings) tout en
            <strong>préservant le quotient</strong> de chaque tâche sous la forme d'une entrée synthétique.
          </p>
          <div class="clean-stats">
            <div class="clean-stat-row">
              <span class="clean-stat-label">Entrées totales</span>
              <span class="clean-stat-val">{{ cleanStats.total }}</span>
            </div>
            <div class="clean-stat-row">
              <span class="clean-stat-label">Semaines passées à supprimer</span>
              <span class="clean-stat-val red">{{ cleanStats.toDelete }}</span>
            </div>
            <div class="clean-stat-row">
              <span class="clean-stat-label">Semaine courante (conservée)</span>
              <span class="clean-stat-val green">{{ cleanStats.toKeep }}</span>
            </div>
            <div class="clean-stat-row">
              <span class="clean-stat-label">Photos supprimées</span>
              <span class="clean-stat-val red">{{ cleanStats.photos }}</span>
            </div>
            <div class="clean-stat-row">
              <span class="clean-stat-label">Espace libéré (estimé)</span>
              <span class="clean-stat-val">~ {{ cleanStats.savedKB }} KB</span>
            </div>
          </div>
          <p style="margin-top: 8px; font-size: 12px">
            Pour chaque tâche avec un historique, une entrée synthétique <strong>« _snapshot »</strong> sera créée pour maintenir la continuité du
            quotient.
          </p>
        </div>
        <div class="modal-actions">
          <button class="btn" @click="showCleanModal = false">Annuler</button>
          <button class="btn-danger" @click="runClean">Nettoyer</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from "vue";
import { supabase, getUser } from "@/lib/supabase";
import UserMenu from "@/components/UserMenu.vue";

const DEFAULT_DATA = {
  sites: [],
  agents: [],
};

const WEIGHTS = { ok: 1, ko: -1, warn: -0.5, na: 0 };

const data = ref({ sites: [], agents: [] });
const currentSector = ref(null);
const currentSite = ref(null);
const lightboxSrc = ref(null);
const expandedDesc = reactive(new Set());
const expandedHistory = reactive(new Set());
const openSites = reactive(new Set());
const sidebarCollapsed = ref(false);
const mobileOpen = ref(false);
const sidebarTab = ref("nav"); // 'nav' | 'config'
const currentView = ref("sector"); // 'sector' | 'config' | 'agent'
const showCleanModal = ref(false);
const showSectorModal = ref(false);
const showAgentModal = ref(false);
const editingId = ref(null); // sectorId en cours d'édition, null = création
const sectorForm = reactive({ siteName: "", sectorName: "", description: "", agent: "", tasks: [] });
const agentForm = reactive({ firstname: "", lastname: "" });
const cleanStats = ref({ total: 0, toDelete: 0, toKeep: 0, photos: 0, savedKB: 0 });
const fileInputs = {};
const cameraInputs = {};
const userId = ref(null);
const storageKey = computed(() => `${userId.value}-history`);
const configKey = computed(() => `${userId.value}`); // Clé séparée — jamais nettoyée

// ── CONFIG (localStorage séparé, jamais nettoyé) ─────────────────────
async function loadConfig() {
  try {
    const { data: server } = await supabase.from("app_data").select("*").eq("user", userId.value).single();
    localStorage.setItem(configKey.value, JSON.stringify(server.data));
    return server.data;
  } catch {}
  return null;
}

async function saveConfig(cfg) {
  localStorage.setItem(configKey.value, JSON.stringify(cfg));

  await supabase
    .from("app_data")
    .upsert({
      data: data.value,
      last_modified_at: Date.now(),
      user: userId.value,
    })
    .eq("user", userId.value);
}

window.addEventListener("online", saveConfig);

// ── SEMAINES ──────────────────────────────────────────────────────────
function getISOWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const w1 = new Date(d.getFullYear(), 0, 4);
  const w = 1 + Math.round(((d - w1) / 86400000 - 3 + ((w1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${String(w).padStart(2, "0")}`;
}

const availableWeeks = computed(() => {
  const weeks = [];
  const now = new Date();
  for (let i = 0; i < 16; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    weeks.push(getISOWeek(d));
  }
  return weeks;
});

const currentWeek = ref(availableWeeks.value[0]);

// ── STORAGE ───────────────────────────────────────────────────────────
async function loadStorage() {
  try {
    const { data: server } = await supabase.from("app_rating").select("*").eq("user", userId.value).single();
    localStorage.setItem(storageKey.value, JSON.stringify(server.data));
  } catch {}
  return null;
}

function getStorage() {
  try {
    //const { data: server } = await supabase.from("app_rating").select("*").eq("user", userId.value).single();
    //localStorage.setItem(storageKey.value, JSON.stringify(server.data));
    //return server.data;
    return JSON.parse(localStorage.getItem(storageKey.value));
  } catch {}
  return null;
}

async function saveStorage(cfg) {
  localStorage.setItem(storageKey.value, JSON.stringify(cfg));

  await supabase
    .from("app_rating")
    .upsert({
      data: cfg,
      last_modified_at: Date.now(),
      user: userId.value,
    })
    .eq("user", userId.value);
}

function entryKey(taskId, week) {
  return `${taskId}::${week}`;
}

function getEntry(taskId) {
  return getStorage()[entryKey(taskId, currentWeek.value)] || { rating: null, comment: "" };
}

function setRating(taskId, rating) {
  const store = getStorage();
  const key = entryKey(taskId, currentWeek.value);
  if (!store[key]) store[key] = { rating: null, comment: "" };
  store[key].rating = store[key].rating === rating ? null : rating;
  saveStorage(store);
  currentSector.value = { ...currentSector.value };
}

function setComment(taskId, comment) {
  const store = getStorage();
  const key = entryKey(taskId, currentWeek.value);
  if (!store[key]) store[key] = { rating: null, comment: "" };
  store[key].comment = comment;
  saveStorage(store);
}

// ── HISTORY / QUOTIENT ────────────────────────────────────────────────
function historyFor(taskId) {
  const store = getStorage();
  return Object.entries(store)
    .filter(([k, v]) => k.startsWith(taskId + "::") && v.rating)
    .map(([k, v]) => ({ week: k.split("::")[1], rating: v.rating, comment: v.comment || "" }))
    .sort((a, b) => b.week.localeCompare(a.week));
}

function getQuotient(taskId) {
  const history = historyFor(taskId).filter((e) => e.rating !== "na");
  if (!history.length) return 0;
  let score = 0,
    max = 0;
  history.forEach((e, i) => {
    const w = 1 / (i + 1);
    score += (WEIGHTS[e.rating] || 0) * w;
    max += w;
  });
  return Math.max(0, Math.min(1, (score / max + 1) / 2));
}

function getTrend(taskId) {
  const h = historyFor(taskId).filter((e) => e.rating !== "na");
  if (h.length < 2) return "neutral";
  const a = WEIGHTS[h[0].rating] || 0,
    b = WEIGHTS[h[1].rating] || 0;
  return a > b ? "up" : a < b ? "down" : "neutral";
}

function trendIcon(taskId) {
  const t = getTrend(taskId);
  return t === "up" ? "↑" : t === "down" ? "↓" : "—";
}
function trendClass(taskId) {
  return `trend-${getTrend(taskId)}`;
}
function quotientColor(q) {
  return q >= 0.7 ? "var(--ok)" : q >= 0.4 ? "var(--warn)" : "var(--ko)";
}

// ── NAV ───────────────────────────────────────────────────────────────
function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value;
}
function toggleSite(id) {
  openSites.has(id) ? openSites.delete(id) : openSites.add(id);
}

function selectSector(sector, site) {
  currentSector.value = sector;
  currentSite.value = site;
  currentView.value = "sector";
  sidebarTab.value = "nav";
  mobileOpen.value = false;
}

function toggleLongDesc(id) {
  expandedDesc.has(id) ? expandedDesc.delete(id) : expandedDesc.add(id);
}
function toggleHistory(id) {
  expandedHistory.has(id) ? expandedHistory.delete(id) : expandedHistory.add(id);
}

// ── STATS ─────────────────────────────────────────────────────────────
function ratingCount(r) {
  if (!currentSector.value) return 0;
  return currentSector.value.tasks.filter((t) => getEntry(t.id).rating === r).length;
}

function completionCount(sector) {
  return sector.tasks.filter((t) => getEntry(t.id).rating !== null).length;
}

function completionColor(sector) {
  const done = completionCount(sector),
    total = sector.tasks.length;
  if (!done) return "var(--border)";
  if (done === total) return "var(--ok)";
  if (done >= total / 2) return "var(--warn)";
  return "var(--ko)";
}

// ── PHOTO ─────────────────────────────────────────────────────────────
function triggerFileInput(id) {
  fileInputs[id]?.click();
}
function triggerCamera(id) {
  cameraInputs[id]?.click();
}

function onFileChange(taskId, event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const MAX = 800;
      const r = Math.min(1, MAX / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = img.width * r;
      c.height = img.height * r;
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      const b64 = c.toDataURL("image/jpeg", 0.82);
      const store = getStorage();
      const key = entryKey(taskId, currentWeek.value);
      if (!store[key]) store[key] = { rating: null, comment: "" };
      store[key].photo = b64;
      saveStorage(store);
      currentSector.value = { ...currentSector.value };
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
  event.target.value = "";
}

function removePhoto(taskId) {
  const store = getStorage();
  const key = entryKey(taskId, currentWeek.value);
  if (store[key]) {
    delete store[key].photo;
    saveStorage(store);
    currentSector.value = { ...currentSector.value };
  }
}

// ── CLEAN STORAGE ─────────────────────────────────────────────────────
// Stratégie :
// 1. On collecte tous les taskId connus depuis le JSON de données.
// 2. Pour chaque task, on calcule le quotient AVANT nettoyage.
// 3. On supprime toutes les entrées des semaines != semaine courante.
// 4. On injecte une entrée synthétique "_snapshot" sur la semaine la plus
//    récente supprimée, avec un rating fictif encodant le quotient, pour
//    que le calcul futur parte d'une base cohérente.
//
// Encodage du snapshot : on stocke directement le quotient pré-calculé
// dans un champ { _snapshot: true, quotient: 0.xx } que getQuotient()
// sait lire et utiliser comme point de départ.

function getAllTaskIds() {
  const ids = [];
  data.value.sites.forEach((site) => site.sectors.forEach((sector) => sector.tasks.forEach((t) => ids.push(t.id))));
  return ids;
}

function computeCleanStats() {
  const store = getStorage();
  const week = currentWeek.value;
  let total = 0,
    toDelete = 0,
    toKeep = 0,
    photos = 0,
    savedBytes = 0;

  for (const [k, v] of Object.entries(store)) {
    total++;
    const entryWeek = k.split("::")[1];
    if (entryWeek !== week) {
      toDelete++;
      const str = JSON.stringify(v);
      savedBytes += str.length;
      if (v.photo) photos++;
    } else {
      toKeep++;
    }
  }

  cleanStats.value = {
    total,
    toDelete,
    toKeep,
    photos,
    savedKB: Math.round(savedBytes / 1024),
  };
}

function openCleanModal() {
  computeCleanStats();
  showCleanModal.value = true;
}

function runClean() {
  const store = getStorage();
  const week = currentWeek.value;
  const taskIds = getAllTaskIds();
  const newStore = {};

  // Conserver la semaine courante telle quelle
  for (const [k, v] of Object.entries(store)) {
    const entryWeek = k.split("::")[1];
    if (entryWeek === week) newStore[k] = v;
  }

  // Pour chaque tâche connue : si elle avait un historique dans les semaines
  // passées (hors snapshot), créer/mettre à jour une entrée snapshot
  taskIds.forEach((taskId) => {
    const history = historyFor(taskId).filter((e) => e.rating !== "na" && !e._snapshot);
    if (!history.length) return;

    // Calculer le quotient AVANT suppression (histoire complète)
    const q = getQuotient(taskId);

    // La clé snapshot utilise une semaine virtuelle antérieure à toutes
    // pour qu'elle soit toujours en fin d'historique dans les futurs calculs
    const snapKey = `${taskId}::_snapshot`;
    newStore[snapKey] = {
      _snapshot: true,
      quotient: q,
      // On encode le quotient comme rating pondéré neutre
      // pour que getQuotient() l'intègre directement
      rating: q >= 0.7 ? "ok" : q >= 0.4 ? "warn" : "ko",
      comment: `[Snapshot quotient: ${(q * 100).toFixed(0)}%]`,
    };
  });

  saveStorage(newStore);
  showCleanModal.value = false;
  // Forcer recalcul Vue
  currentSector.value = { ...currentSector.value };
}

// ── EXPORT ────────────────────────────────────────────────────────────
function buildSectorData(site, sector, week) {
  const store = getStorage();
  return sector.tasks.map((task) => {
    const entry = store[entryKey(task.id, week)] || { rating: null, comment: "" };
    const q = getQuotient(task.id);
    const trend = getTrend(task.id);
    return {
      photo: entry.photo || null,
      taskId: task.id,
      row: {
        Site: site.name,
        Secteur: sector.name,
        Semaine: week,
        Tâche: task.title,
        Agent: getAgent(sector.agent),
        "Description courte": task.shortDesc,
        "Description longue": task.longDesc,
        Statut: entry.rating ? entry.rating.toUpperCase() : "",
        Commentaire: entry.comment || "",
        Photo: entry.photo ? "(photo jointe)" : "—",
        "Quotient (%)": (q * 100).toFixed(0),
        Tendance: trend === "up" ? "↑" : trend === "down" ? "↓" : "—",
      },
    };
  });
}

function makeXlsxSheet(rows) {
  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [
    { wch: 14 },
    { wch: 16 },
    { wch: 10 },
    { wch: 22 },
    { wch: 24 },
    { wch: 36 },
    { wch: 8 },
    { wch: 28 },
    { wch: 18 },
    { wch: 10 },
    { wch: 8 },
  ];
  return ws;
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Export XLSX avec feuille de photos séparée (pas de ZIP = pas de blocage Windows)
// Les photos sont encodées en base64 dans une feuille dédiée "Photos"
function buildXlsxWithPhotos(entries, filename) {
  const wb = XLSX.utils.book_new();

  // Feuilles de données
  for (const { site, sector, week } of entries) {
    const sectorData = buildSectorData(site, sector, week);
    const rows = sectorData.map((d) => ({ ...d.row }));
    const sheetName = `${site.name} - ${sector.name}`.substring(0, 31);
    XLSX.utils.book_append_sheet(wb, makeXlsxSheet(rows), sheetName);
  }

  // Feuille "Photos" : une ligne par photo avec référence Site/Secteur/Tâche et data URI
  const photoRows = [];
  for (const { site, sector, week } of entries) {
    const sectorData = buildSectorData(site, sector, week);
    sectorData.forEach((d) => {
      if (!d.photo) return;
      // Trouver le titre de la tâche
      const task = sector.tasks.find((t) => t.id === d.taskId);
      photoRows.push({
        Site: site.name,
        Secteur: sector.name,
        Tâche: task?.title || d.taskId,
        Agent: getAgent(sector.agent),
        Semaine: week,
        "Image (base64)": d.photo, // data URI complet — ouvrable dans un navigateur
      });
    });
  }

  /*if (photoRows.length) {
        const wsPhotos = XLSX.utils.json_to_sheet(photoRows);
        wsPhotos['!cols'] = [{wch:14},{wch:16},{wch:22},{wch:10},{wch:80}];
        XLSX.utils.book_append_sheet(wb, wsPhotos, 'Photos');
      }*/

  XLSX.writeFile(wb, filename);
}

function exportSectorDirect(format) {
  if (!currentSector.value || !currentSite.value) return;
  const site = currentSite.value;
  const sector = currentSector.value;
  const week = currentWeek.value;
  const slug = `${site.id}_${sector.id}_${week}`;

  if (format === "csv") {
    const rows = buildSectorData(site, sector, week).map((d) => ({
      ...d.row,
      Photo: d.photo ? d.photo : "—", // data URI dans le CSV
    }));
    downloadCSV(rows, `${slug}.csv`);
  } else if (format === "xlsx") {
    buildXlsxWithPhotos([{ site, sector, week }], `${slug}.xlsx`);
  }
}

function exportSite(site) {
  const week = currentWeek.value;
  const entries = site.sectors.map((sector) => ({ site, sector, week }));
  buildXlsxWithPhotos(entries, `${site.id}_${week}.xlsx`);
}

function exportAll() {
  const week = currentWeek.value;
  const entries = [];
  data.value.sites.forEach((site) => site.sectors.forEach((sector) => entries.push({ site, sector, week })));
  buildXlsxWithPhotos(entries, `rapport_global_${week}.xlsx`);
}

function downloadCSV(rows, filename) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(";")];
  rows.forEach((row) => {
    lines.push(headers.map((h) => `"${(row[h] || "").toString().replace(/"/g, '""')}"`).join(";"));
  });
  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, filename);
}

// ── CONFIG FUNCTIONS ──────────────────────────────────────────────────
function setView(v) {
  currentView.value = v;
  sidebarTab.value = v;
  if (mobileOpen.value) sidebarCollapsed.value = true;
}

function persistConfig() {
  saveConfig({ sites: data.value.sites, agents: data.value.agents });
}

function genId(prefix) {
  const random = Math.floor(Math.random() * 1e6).toString(36);
  return `${prefix}-${Date.now().toString(36)}-${random}`;
}

function openAddModal(type) {
  editingId.value = null;

  if (type === "sector") {
    sectorForm.siteName = "";
    sectorForm.sectorName = "";
    sectorForm.description = "";
    sectorForm.agent = "";
    sectorForm.tasks = [{ title: "", shortDesc: "", longDesc: "" }];
    showSectorModal.value = true;
  } else if (type === "agent") {
    agentForm.firstname = "";
    agentForm.lastname = "";
    showAgentModal.value = true;
  }
}

function openEditModal(type, { site, sector, agent }) {
  if (type === "sector") {
    editingId.value = sector.id;
    sectorForm.siteName = site.name;
    sectorForm.sectorName = sector.name;
    sectorForm.description = sector.description || "";
    sectorForm.agent = sector.agent || "";
    sectorForm.tasks = sector.tasks.map((t) => ({ ...t }));
    showSectorModal.value = true;
  } else if (type === "agent") {
    editingId.value = agent.id;
    agentForm.firstname = agent.firstname || "";
    agentForm.lastname = agent.lastname || "";
    showAgentModal.value = true;
  }
}

function saveSectorModal() {
  const siteName = sectorForm.siteName.trim();
  const sectorName = sectorForm.sectorName.trim();
  if (!siteName || !sectorName) return alert("Site et Secteur sont obligatoires.");
  const validTasks = sectorForm.tasks.filter((t) => t.title.trim());
  if (!validTasks.length) return alert("Au moins une tâche est requise.");

  if (editingId.value) {
    // Édition
    for (const site of data.value.sites) {
      const idx = site.sectors.findIndex((s) => s.id === editingId.value);
      if (idx !== -1) {
        // Renommer le site si besoin
        site.name = siteName;
        const sec = site.sectors[idx];
        sec.name = sectorName;
        sec.description = sectorForm.description;
        sec.agent = sectorForm.agent;
        // Merge des tâches : conserver les ids existants quand possible
        sec.tasks = validTasks.map((t, i) => ({
          id: t.id || genId(`${sec.id}-t`),
          title: t.title.trim(),
          shortDesc: t.shortDesc || "",
          longDesc: t.longDesc || "",
        }));
        break;
      }
    }
  } else {
    // Création : trouver ou créer le site
    let site = data.value.sites.find((s) => s.name.toLowerCase() === siteName.toLowerCase());
    if (!site) {
      site = { id: genId("site"), name: siteName, sectors: [] };
      data.value.sites.push(site);
    }
    const sectorId = genId("sector");
    site.sectors.push({
      id: sectorId,
      name: sectorName,
      description: sectorForm.description,
      agent: sectorForm.agent,
      tasks: validTasks.map((t) => ({
        id: genId(sectorId),
        title: t.title.trim(),
        shortDesc: t.shortDesc || "",
        longDesc: t.longDesc || "",
      })),
    });
  }

  persistConfig();
  showSectorModal.value = false;
  // Ouvrir le site dans la nav
  const updatedSite = data.value.sites.find((s) => s.name.toLowerCase() === siteName.toLowerCase());
  if (updatedSite) openSites.add(updatedSite.id);
}

function saveAgentModal() {
  const agentFirstname = agentForm.firstname.trim();
  const agentLastname = agentForm.lastname.trim();
  if (!agentFirstname || !agentLastname) return alert("Nom et Prénom sont obligatoires.");

  if (editingId.value) {
    const idx = data.value.agents.findIndex((a) => a.id === editingId.value);
    const agt = data.value.agents[idx];
    agt.firstname = agentFirstname;
    agt.lastname = agentLastname;
  } else {
    const agentId = genId("agent");
    data.value.agents.push({
      id: agentId,
      firstname: agentForm.firstname,
      lastname: agentForm.lastname,
    });
  }

  persistConfig();
  showAgentModal.value = false;
}

function deleteSector(site, sector) {
  if (!confirm(`Supprimer le secteur "${sector.name}" et ses ${sector.tasks.length} tâche(s) ?`)) return;
  site.sectors = site.sectors.filter((s) => s.id !== sector.id);
  // Nettoyer le site si vide
  if (!site.sectors.length) {
    const idx = data.value.sites.findIndex((s) => s.id === site.id);
    if (idx !== -1) data.value.sites.splice(idx, 1);
  }
  persistConfig();
  // Si le secteur supprimé était sélectionné, reset
  if (currentSector.value?.id === sector.id) {
    currentSector.value = null;
    currentSite.value = null;
  }
}

function deleteAgent(agent) {
  if (!confirm(`Supprimer l'agent "${agent.firstname} ${agent.lastname}" ?`)) return;
  const idx = data.value.agents.findIndex((a) => a.id === agent.id);
  if (idx !== -1) data.value.agents.splice(idx, 1);
  persistConfig();
}

function getAgent(agent) {
  const agt = data.value.agents.find((e) => agent === e.id);
  if (agt) return `${agt.firstname} ${agt.lastname}`;
  return null;
}

function agentsSectors(agent) {
  return data.value.sites.reduce((acc, e) => {
    acc.push(...e.sectors.filter((s) => s.agent === agent.id));
    return acc;
  }, []);
}

// ── INIT ──────────────────────────────────────────────────────────────
onMounted(async () => {
  userId.value = (await getUser())?.id;

  await loadStorage();

  // Charger la config depuis localStorage, ou utiliser DEFAULT_DATA
  const saved = await loadConfig();
  data.value = saved?.sites ? saved : JSON.parse(JSON.stringify(DEFAULT_DATA));

  //TMP:
  if (!data.value.agents) {
    data.value.agents = [];
  }

  // Ouvrir tous les sites dans la sidebar
  data.value.sites.forEach((s) => openSites.add(s.id));

  // Sélectionner le premier secteur disponible
  if (data.value.sites.length && data.value.sites[0].sectors.length) {
    currentSite.value = data.value.sites[0];
    currentSector.value = data.value.sites[0].sectors[0];
  }
});
</script>

<style scoped>
/* ════════════════════ SIDEBAR ════════════════════ */
.sidebar {
  width: var(--sidebar-w);
  min-width: var(--sidebar-w);
  background: var(--bg2);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  height: 100vh;
  transition: width var(--sidebar-transition), min-width var(--sidebar-transition);
  overflow: hidden;
  position: relative;
  z-index: 20;
}

.sidebar.collapsed {
  width: var(--sidebar-collapsed-w);
  min-width: var(--sidebar-collapsed-w);
}

/* Logo zone + toggle button */
.sidebar-logo {
  padding: 12px 0 12px 12px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 56px;
}

.logo-content {
  overflow: hidden;
  white-space: nowrap;
  padding-left: 12px;
  transition: opacity var(--sidebar-transition);
}
.sidebar.collapsed .logo-content {
  opacity: 0;
  pointer-events: none;
}

.logo-text {
  font-family: var(--mono);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--accent);
  text-transform: uppercase;
}

.logo-sub {
  font-size: 10px;
  color: var(--text2);
  margin-top: 2px;
  letter-spacing: 0.04em;
}

.sidebar-toggle {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--bg3);
  color: var(--text2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.15s;
  line-height: 1;
  margin-right: 12px;
}

@media (max-width: 900px) {
  .sidebar-toggle {
    display: none;
  }
}

.sidebar-toggle:hover {
  border-color: var(--accent);
  color: var(--accent);
}

/* Week select — hidden when collapsed */
.sidebar-week {
  padding: 10px 14px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  overflow: hidden;
  transition: opacity var(--sidebar-transition);
}

.sidebar.collapsed .sidebar-week {
  opacity: 0;
  pointer-events: none;
}

.week-label {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--text2);
  letter-spacing: 0.06em;
  white-space: nowrap;
}

.week-select {
  background: var(--bg3);
  border: 1px solid var(--border);
  color: var(--text);
  font-family: var(--mono);
  font-size: 1rem;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  flex: 1;
  min-width: 0;
}

.week-select:focus {
  outline: none;
  border-color: var(--accent);
}

/* Nav */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 6px 0 4px;
}

.sidebar.collapsed .sidebar-nav {
  overflow-y: hidden;
}

/* SITE GROUP */
.site-group {
  margin-bottom: 2px;
}

.site-header {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 14px 7px;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}

.site-header:hover .site-name {
  color: var(--text);
}

.site-chevron {
  font-size: 9px;
  color: var(--text2);
  transition: transform 0.2s;
  flex-shrink: 0;
}
.site-chevron.open {
  transform: rotate(90deg);
}

.site-name {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.1em;
  color: var(--text2);
  text-transform: uppercase;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.15s;
}

.site-badge {
  font-family: var(--mono);
  font-size: 9px;
  padding: 1px 5px;
  border-radius: 8px;
  background: var(--bg3);
  color: var(--text2);
}

.site-export-btn {
  font-family: var(--mono);
  font-size: 9px;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid var(--border);
  background: none;
  color: var(--text2);
  cursor: pointer;
  letter-spacing: 0.04em;
  transition: all 0.15s;
}

.site-export-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 14px 9px 28px;
  cursor: pointer;
  transition: background 0.15s;
  border-left: 2px solid transparent;
  white-space: nowrap;
}

.nav-item:hover {
  background: var(--bg3);
}
.nav-item.active {
  background: rgba(79, 140, 255, 0.08);
  border-left-color: var(--accent);
}

.nav-item-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}
.nav-item.active .nav-item-name {
  color: var(--accent);
}

.nav-item-badge {
  font-family: var(--mono);
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  background: var(--bg3);
  color: var(--text2);
}

.nav-completion {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Footer */
.sidebar-footer {
  padding: 10px 14px;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow: hidden;
  transition: opacity var(--sidebar-transition);
  margin-top: auto;
}

.sidebar.collapsed .sidebar-footer {
  opacity: 0;
  pointer-events: none;
}

.btn-clean {
  background: none;
  border: 1px solid var(--border);
  color: var(--text2);
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.04em;
  padding: 7px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  width: 100%;
  text-align: center;
  white-space: nowrap;
}

.btn-clean:hover {
  border-color: var(--warn);
  color: var(--warn);
}

.btn-export-all {
  background: linear-gradient(135deg, var(--accent2), var(--accent));
  border: none;
  color: var(--text);
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  padding: 9px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: opacity 0.2s;
  text-align: center;
  width: 100%;
  white-space: nowrap;
}

.btn-export-all:hover {
  opacity: 0.85;
}

/* ════════════════════ OVERLAY (mobile) ════════════════════ */
.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 15;
}

/* ════════════════════ MAIN ════════════════════ */
.main {
  flex: 1;
  min-width: 0;
  height: 100vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.main-header {
  padding: 16px 12px 12px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  position: sticky;
  top: 0;
  background: var(--bg);
  z-index: 10;
  flex-shrink: 0;
}

.main-week {
  display: flex;
  justify-content: space-between;
  gap: 100%;
}

/* Hamburger visible only on mobile */
.btn-hamburger {
  display: none;
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--bg2);
  color: var(--text2);
  cursor: pointer;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.btn-hamburger:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.main-breadcrumb {
  font-size: 11px;
  color: var(--text2);
  margin-bottom: 3px;
  font-family: var(--mono);
  letter-spacing: 0.06em;
}
.main-breadcrumb .bc-site {
  color: var(--accent);
}

.main-title {
  font-family: var(--mono);
  font-size: 17px;
  font-weight: 700;
}
.main-subtitle {
  font-size: 12px;
  color: var(--text2);
  margin-top: 2px;
}

.header-actions {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.btn {
  border: 1px solid var(--border);
  background: var(--bg2);
  color: var(--text);
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

/* STATS */
.stats-strip {
  display: flex;
  gap: 6px;
  padding: 12px 24px;
  background: var(--bg2);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  flex-wrap: wrap;
}

.stat-card {
  flex: 1;
  min-width: 60px;
  padding: 10px 12px;
  background: var(--bg3);
  border-radius: 8px;
}
.stat-value {
  font-family: var(--mono);
  font-size: 18px;
  font-weight: 700;
}
.stat-label {
  font-size: 10px;
  color: var(--text2);
  margin-top: 2px;
  letter-spacing: 0.04em;
}
.stat-card:first-child .stat-value {
  color: var(--text);
}
.stat-ok .stat-value {
  color: var(--ok);
}
.stat-ko .stat-value {
  color: var(--ko);
}
.stat-warn .stat-value {
  color: var(--warn);
}
.stat-na .stat-value {
  color: var(--na);
}

/* TABLE */
.table-wrap {
  padding: 16px 24px;
  flex: 1;
  overflow-x: auto;
}

.task-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;
}

.task-table th {
  text-align: left;
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.1em;
  color: var(--text2);
  padding: 8px 10px;
  border-bottom: 1px solid var(--border);
  text-transform: uppercase;
  white-space: nowrap;
}

.task-row {
  border-bottom: 1px solid var(--border);
  transition: background 0.1s;
}
.task-row:hover {
  background: rgba(255, 255, 255, 0.02);
}
.task-row td {
  padding: 11px 10px;
  vertical-align: top;
}

.task-intitule {
  font-weight: 600;
  font-size: 13px;
}
.task-desc-short {
  font-size: 12px;
  color: var(--text2);
  margin-top: 3px;
}

.task-desc-long-btn {
  font-family: var(--mono);
  font-size: 10px;
  color: var(--accent);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-top: 4px;
}
.task-desc-long-btn:hover {
  text-decoration: underline;
}

.task-desc-long {
  font-size: 12px;
  color: var(--text2);
  margin-top: 6px;
  padding: 10px;
  background: var(--bg3);
  border-radius: 6px;
  line-height: 1.6;
  border-left: 2px solid var(--accent2);
}

/* RATING */
.rating-group {
  display: flex;
  gap: 4px;
}

.rating-btn {
  font-family: var(--mono);
  font-size: 10px;
  font-weight: 700;
  padding: 5px 8px;
  border-radius: 5px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s;
  background: var(--bg3);
  color: var(--text2);
}

.rating-btn:hover {
  opacity: 0.8;
}
.rating-btn.ok {
  border-color: var(--ok);
  color: var(--ok);
}
.rating-btn.ko {
  border-color: var(--ko);
  color: var(--ko);
}
.rating-btn.warn {
  border-color: var(--warn);
  color: var(--warn);
}
.rating-btn.na {
  border-color: var(--na);
  color: var(--na);
}
.rating-btn.ok.active {
  background: var(--ok);
  color: var(--text);
}
.rating-btn.ko.active {
  background: var(--ko);
  color: var(--text);
}
.rating-btn.warn.active {
  background: var(--warn);
  color: var(--bg);
}
.rating-btn.na.active {
  background: var(--na);
  color: var(--bg);
}

/* COMMENT */
.comment-input {
  background: var(--bg3);
  border: 1px solid var(--border);
  color: var(--text);
  font-family: var(--sans);
  font-size: 12px;
  padding: 7px 10px;
  border-radius: 6px;
  width: 100%;
  resize: none;
  min-height: 32px;
  max-height: 80px;
  transition: border-color 0.2s;
}
.comment-input:focus {
  outline: none;
  border-color: var(--accent);
}

/* QUOTIENT */
.quotient-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 82px;
}
.quotient-bar-bg {
  background: var(--bg3);
  border-radius: 3px;
  height: 5px;
  overflow: hidden;
}
.quotient-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.4s ease;
}
.quotient-value {
  font-family: var(--mono);
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.trend-up {
  color: var(--ok);
}
.trend-down {
  color: var(--ko);
}
.trend-neutral {
  color: var(--text2);
}

/* PHOTO */
.photo-cell {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 80px;
}

.photo-thumb {
  width: 68px;
  height: 50px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: opacity 0.2s;
}
.photo-thumb:hover {
  opacity: 0.75;
}

.photo-actions {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.btn-photo {
  font-family: var(--mono);
  font-size: 10px;
  padding: 4px 7px;
  border-radius: 5px;
  border: 1px solid var(--border);
  background: var(--bg3);
  color: var(--text2);
  cursor: pointer;
  transition: all 0.15s;
}
.btn-photo:hover {
  border-color: var(--accent);
  color: var(--accent);
}
.btn-photo-del {
  border-color: transparent;
  color: var(--ko);
}
.btn-photo-del:hover {
  border-color: var(--ko);
  background: rgba(255, 79, 106, 0.08);
}

/* HISTORY */
.history-toggle {
  font-family: var(--mono);
  font-size: 10px;
  color: var(--accent);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.history-toggle:hover {
  text-decoration: underline;
}

.history-panel {
  margin-top: 8px;
  background: var(--bg3);
  border-radius: 6px;
  padding: 10px;
  border: 1px solid var(--border);
}
.history-title {
  font-family: var(--mono);
  font-size: 10px;
  color: var(--text2);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 8px;
}
.history-entries {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.history-entry {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 11px;
}
.history-week {
  font-family: var(--mono);
  font-size: 10px;
  color: var(--text2);
  min-width: 70px;
}
.history-rating {
  font-family: var(--mono);
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 3px;
}
.history-rating.ok {
  background: rgba(34, 201, 122, 0.15);
  color: var(--ok);
}
.history-rating.ko {
  background: rgba(255, 79, 106, 0.15);
  color: var(--ko);
}
.history-rating.warn {
  background: rgba(255, 185, 68, 0.15);
  color: var(--warn);
}
.history-rating.na {
  background: rgba(136, 144, 168, 0.15);
  color: var(--na);
}
.history-comment {
  color: var(--text2);
  font-style: italic;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 160px;
}

/* ════════════════════ MODALS ════════════════════ */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  backdrop-filter: blur(4px);
  padding: 16px;
}

/* LIGHTBOX */
.lightbox {
  cursor: zoom-out;
}

.lightbox img {
  max-width: 90vw;
  max-height: 85vh;
  border-radius: 8px;
  box-shadow: 0 0 60px rgba(0, 0, 0, 0.8);
}

.lightbox-close {
  position: absolute;
  top: 20px;
  right: 24px;
  font-family: var(--mono);
  font-size: 13px;
  color: var(--text2);
  background: none;
  border: none;
  cursor: pointer;
}

/* CLEAN MODAL */
.modal-box {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 28px;
  max-width: 460px;
  width: 100%;
}

.modal-title {
  font-family: var(--mono);
  font-size: 13px;
  letter-spacing: 0.08em;
  color: var(--warn);
  margin-bottom: 14px;
  text-transform: uppercase;
}

.modal-body {
  font-size: 13px;
  color: var(--text2);
  line-height: 1.7;
}

.modal-body strong {
  color: var(--text);
}

.clean-stats {
  margin: 14px 0;
  padding: 12px 14px;
  background: var(--bg3);
  border-radius: 8px;
  border: 1px solid var(--border);
  font-family: var(--mono);
  font-size: 11px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.clean-stat-row {
  display: flex;
  justify-content: space-between;
}
.clean-stat-label {
  color: var(--text2);
}
.clean-stat-val {
  color: var(--text);
}
.clean-stat-val.red {
  color: var(--ko);
}
.clean-stat-val.green {
  color: var(--ok);
}

.modal-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 20px;
  flex-wrap: wrap;
}

.btn-danger {
  border: 1px solid var(--ko);
  background: rgba(255, 79, 106, 0.1);
  color: var(--ko);
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.btn-danger:hover {
  background: rgba(255, 79, 106, 0.2);
}

/* ════════════════════ CONFIG VIEW ════════════════════ */
.config-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.config-header {
  padding: 16px 24px 12px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  position: sticky;
  top: 0;
  background: var(--bg);
  z-index: 10;
  flex-shrink: 0;
}

.config-title {
  font-family: var(--mono);
  font-size: 17px;
  font-weight: 700;
}
.config-subtitle {
  font-size: 12px;
  color: var(--text2);
  margin-top: 2px;
}

.config-table-wrap {
  flex: 1;
  overflow: auto;
  padding: 16px 24px;
}

.config-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;
}

.config-table th {
  text-align: left;
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.1em;
  color: var(--text2);
  padding: 8px 10px;
  border-bottom: 1px solid var(--border);
  text-transform: uppercase;
  white-space: nowrap;
}

.config-table th.th-actions {
  width: 80px;
  text-align: right;
}

.config-row {
  border-bottom: 1px solid var(--border);
  transition: background 0.1s;
}
.config-row:hover {
  background: rgba(255, 255, 255, 0.02);
}
.config-row td {
  padding: 9px 10px;
  vertical-align: middle;
  font-size: 13px;
}
.config-row.editing {
  background: rgba(79, 140, 255, 0.05);
}

.config-cell-site {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--accent);
  letter-spacing: 0.04em;
}
.config-cell-sector {
  font-weight: 500;
}
.config-cell-task {
  font-size: 12px;
  color: var(--text);
}
.config-cell-agent {
  font-size: 12px;
  color: var(--text2);
}

.config-row-actions {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
}

.btn-icon {
  width: 26px;
  height: 26px;
  border-radius: 5px;
  border: 1px solid var(--border);
  background: var(--bg3);
  color: var(--text2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.15s;
}
.btn-icon:hover {
  border-color: var(--accent);
  color: var(--accent);
}
.btn-icon.del:hover {
  border-color: var(--ko);
  color: var(--ko);
  background: rgba(255, 79, 106, 0.08);
}

.config-input {
  background: var(--bg3);
  border: 1px solid var(--accent);
  color: var(--text);
  font-family: var(--sans);
  font-size: 12px;
  padding: 5px 8px;
  border-radius: 5px;
  width: 100%;
  outline: none;
}
.config-input:focus {
  border-color: var(--accent2);
}

.config-add-section {
  padding: 14px 24px 20px;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}
.config-add-title {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.1em;
  color: var(--text2);
  text-transform: uppercase;
  margin-bottom: 10px;
}
.config-add-form {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: flex-end;
}
.config-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 120px;
}
.config-field-label {
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.08em;
  color: var(--text2);
  text-transform: uppercase;
}
.config-add-form .config-input {
  border-color: var(--border);
}
.config-add-form .config-input:focus {
  border-color: var(--accent);
}

.cell-chip {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.chip {
  font-size: 11px;
  color: var(--text2);
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}
.chip::before {
  content: "·";
  color: var(--accent);
  font-weight: 700;
}

/* Sidebar tabs */
.nav-tab-strip {
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.nav-tab {
  flex: 1;
  padding: 9px 0;
  font-family: var(--mono);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  text-align: center;
  color: var(--text2);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.15s;
  background: none;
  border-top: none;
  border-left: none;
  border-right: none;
  white-space: nowrap;
}
.nav-tab:hover {
  color: var(--text);
}
.nav-tab.active {
  color: var(--text);
  background: var(--accent);
}

/* Sector/Task editor modal */
.modal-box-lg {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 28px;
  max-width: 640px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}
.modal-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.modal-field.full {
  grid-column: 1 / -1;
}
.modal-label {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  color: var(--text2);
  text-transform: uppercase;
}

.modal-input {
  background: var(--bg3);
  border: 1px solid var(--border);
  color: var(--text);
  font-family: var(--sans);
  font-size: 13px;
  padding: 8px 10px;
  border-radius: 6px;
  outline: none;
  width: 100%;
  transition: border-color 0.15s;
}
.modal-input:focus {
  border-color: var(--accent);
}
textarea.modal-input {
  resize: vertical;
  min-height: 70px;
}

.tasks-editor {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 4px;
}

.task-editor-row {
  display: flex;
  gap: 6px;
  align-items: flex-start;
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px;
}
.task-editor-row .task-num {
  font-family: var(--mono);
  font-size: 10px;
  color: var(--text2);
  min-width: 18px;
  padding-top: 6px;
}
.task-editor-fields {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.task-editor-fields input,
.task-editor-fields textarea {
  background: var(--bg2);
  border: 1px solid var(--border);
  color: var(--text);
  font-family: var(--sans);
  font-size: 12px;
  padding: 5px 8px;
  border-radius: 5px;
  outline: none;
  width: 100%;
}
.task-editor-fields input:focus,
.task-editor-fields textarea:focus {
  border-color: var(--accent);
}
.task-editor-fields textarea {
  resize: vertical;
  min-height: 50px;
}

.btn-add-task {
  background: none;
  border: 1px dashed var(--border);
  color: var(--text2);
  font-family: var(--mono);
  font-size: 11px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  width: 100%;
  text-align: center;
  letter-spacing: 0.04em;
}
.btn-add-task:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.btn-primary {
  background: var(--accent);
  border: 1px solid var(--accent);
  color: var(--text);
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  padding: 8px 18px;
  border-radius: 6px;
  cursor: pointer;
  transition: opacity 0.15s;
  white-space: nowrap;
}
.btn-primary:hover {
  opacity: 0.85;
}

/* EMPTY */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  gap: 12px;
  color: var(--text2);
  font-family: var(--mono);
  font-size: 13px;
}
.empty-icon {
  font-size: 40px;
  opacity: 0.3;
}

/* SCROLLBAR */
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 2px;
}

/* ANIMATIONS */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
}
.slide-enter-to,
.slide-leave-from {
  max-height: 600px;
}

.col-task {
  width: 20%;
}
.col-agent {
  width: 10%;
}
.col-rating {
  width: 10%;
}
.col-comment {
  width: 20%;
}
.col-quotient {
  width: 10%;
}
.col-photo {
  width: 10%;
}
.col-history {
  width: 20%;
}

/* ════════════════════ RESPONSIVE ════════════════════ */
@media (max-width: 900px) {
  /* Sur mobile/tablette : sidebar devient un drawer overlay */
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 30;
    transform: translateX(-100%);
    transition: transform var(--sidebar-transition), width var(--sidebar-transition);
    width: var(--sidebar-w) !important;
    min-width: var(--sidebar-w) !important;
  }

  .sidebar.mobile-open {
    transform: translateX(0);
  }

  .sidebar-overlay {
    display: block;
  }

  .btn-hamburger {
    display: flex;
  }

  /* On mobile, collapsed class has no effect — drawer is controlled by mobile-open */
  .sidebar.collapsed {
    width: var(--sidebar-w) !important;
    min-width: var(--sidebar-w) !important;
  }
  .sidebar.collapsed .logo-content,
  .sidebar.collapsed .sidebar-week,
  .sidebar.collapsed .sidebar-footer {
    opacity: 1;
    pointer-events: auto;
  }
  .sidebar.collapsed .sidebar-nav {
    overflow-y: auto;
  }

  .main-header {
    padding: 12px 16px 10px;
  }
  .table-wrap {
    padding: 12px 16px;
  }
  .stats-strip {
    padding: 10px 16px;
    gap: 5px;
  }
  .stat-card {
    padding: 8px 10px;
  }
  .stat-value {
    font-size: 16px;
  }
  .header-actions {
    flex-direction: column;
  }
  .header-actions .btn-primary {
    width: 100%;
  }
  .rating-group {
    flex-direction: column;
  }
}

@media (max-width: 600px) {
  .header-actions .btn:not(:first-child) {
    display: none;
  }
  .main-title {
    font-size: 14px;
  }
  .task-table th,
  .task-table td {
    padding: 8px 6px;
  }
}
</style>
