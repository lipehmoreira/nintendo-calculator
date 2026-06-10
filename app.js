// Configurações do Algolia da Nintendo eShop (US region)
const ALGOLIA_APP_ID = 'U3B6GR4UA3';
const ALGOLIA_API_KEY = 'a29c6927638bfd8cee23993e51e721c9';
const ALGOLIA_INDEX = 'store_game_en_us_release_des';

// Dicionário de Traduções
const translations = {
  pt: {
    title: "Calculadora de Valor Nintendo",
    subtitle: "Calcule quanto vale sua conta com preços oficiais da eShop (Switch 1 & Switch 2)",
    placeholder: "Digite o nome do jogo (ex: Zelda, Mario, Metroid...)",
    filterAll: "Todos",
    filterSwitch1: "Switch 1",
    filterSwitch2: "Switch 2",
    myAccount: "Minha Conta",
    clearAll: "Limpar tudo",
    gamerTier: "Tier da Conta",
    totalGames: "Total de Jogos:",
    totalCalculated: "Total Calculado:",
    shareSummary: "Compartilhar Resumo",
    modalTitle: "Salvar Resumo",
    graphicTitle: "Minha Biblioteca Vale Muito!",
    graphicTotalGames: "Total de Jogos",
    graphicPlatforms: "Plataformas",
    graphicValue: "Valor Estimado",
    graphicTier: "Categoria de Jogador",
    graphicFooterDate: "Calculado em Junho de 2026",
    downloadBtn: "Baixar Card de Resumo",
    confirmClear: "Deseja realmente limpar toda a sua lista de jogos?",
    emptyCart: "Nenhum jogo selecionado.<br>Busque e adicione acima!",
    loading: "Consultando banco de dados da Nintendo eShop...",
    noResults: "Nenhum jogo encontrado.",
    errorConnection: "Erro de conexão ao buscar jogos da eShop.",
    free: "Grátis",
    soon: "Em breve",
    emptyAccount: "Conta Vazia",
    alertAdd: "Adicione pelo menos um jogo para gerar seu resumo!",
    generating: "Gerando imagem...",
    itemPriceRegular: "Padrão",
    itemPricePromo: "Promo",
    itemPriceCustom: "Customizado",
    
    // Tiers
    tierEmpty: "Conta Vazia",
    tierCasual: "Jogador Casual",
    tierFan: "Fã do Switch",
    tierCollector: "Colecionador de Elite",
    tierFanatic: "Nintendista Fanático",

    // Badges de Tipo de Produto (Encurtados para evitar sobreposição)
    badgeDLC: "DLC",
    badgeUpgrade: "Upgrade",
    badgeBundle: "Pacote"
  },
  en: {
    title: "Nintendo Worth Calculator",
    subtitle: "Calculate how much your account is worth with official eShop prices (Switch 1 & Switch 2)",
    placeholder: "Type the game name (e.g. Zelda, Mario, Metroid...)",
    filterAll: "All",
    filterSwitch1: "Switch 1",
    filterSwitch2: "Switch 2",
    myAccount: "My Account",
    clearAll: "Clear all",
    gamerTier: "Account Tier",
    totalGames: "Total Games:",
    totalCalculated: "Total Calculated:",
    shareSummary: "Share Summary",
    modalTitle: "Save Summary",
    graphicTitle: "My Library is Worth a Lot!",
    graphicTotalGames: "Total Games",
    graphicPlatforms: "Platforms",
    graphicValue: "Estimated Value",
    graphicTier: "Player Category",
    graphicFooterDate: "Calculated in June 2026",
    downloadBtn: "Download Summary Card",
    confirmClear: "Are you sure you want to clear your game list?",
    emptyCart: "No games selected.<br>Search and add above!",
    loading: "Querying Nintendo eShop database...",
    noResults: "No games found.",
    errorConnection: "Connection error fetching eShop games.",
    free: "Free",
    soon: "Coming soon",
    emptyAccount: "Empty Account",
    alertAdd: "Add at least one game to generate your summary!",
    generating: "Generating image...",
    itemPriceRegular: "Regular",
    itemPricePromo: "Sale",
    itemPriceCustom: "Custom",
    
    // Tiers
    tierEmpty: "Empty Account",
    tierCasual: "Casual Player",
    tierFan: "Switch Fan",
    tierCollector: "Elite Collector",
    tierFanatic: "Fanatical Nintendist",

    // Badges de Tipo de Produto
    badgeDLC: "DLC",
    badgeUpgrade: "Upgrade",
    badgeBundle: "Bundle"
  }
};

// Tabela oficial de preços da Nintendo Brasil para cópias digitais (Atualizada em Abril de 2026)
const NINTENDO_BRL_TIERS = {
  119.99: 664.90,
  79.99: 439.90,
  69.99: 389.90,
  59.99: 329.90,
  49.99: 279.90,
  39.99: 219.90,
  29.99: 164.90,
  19.99: 109.90,
  9.99: 54.90,
  4.99: 26.90,
  0: 0
};

// Estado global do aplicativo
let state = {
  searchResults: [],
  selectedGames: [], // Itens: { id, title, platform, price, originalPrice, currency, mode, customPrice, image }
  currency: 'BRL', // 'USD' ou 'BRL'
  language: 'pt', // 'pt' ou 'en'
  exchangeRate: 5.40, // Taxa de conversão padrão USD -> BRL
  currentPlatformFilter: 'all', // 'all', 'switch1', 'switch2'
  searchQuery: ''
};

// Elementos do DOM
const searchInput = document.getElementById('search-input');
const gamesGrid = document.getElementById('games-grid');
const selectedList = document.getElementById('selected-list');
const totalValueUSD = document.getElementById('total-value-usd');
const totalValueBRL = document.getElementById('total-value-brl');
const totalGamesCount = document.getElementById('total-games-count');
const countSwitch1 = document.getElementById('count-switch1');
const countSwitch2 = document.getElementById('count-switch2');
const clearAllBtn = document.getElementById('clear-all-btn');
const shareBtn = document.getElementById('share-btn');
const currencyBtns = document.querySelectorAll('.currency-btn');
const langBtns = document.querySelectorAll('.lang-btn');
const filterBtns = document.querySelectorAll('.filter-btn');
const gamerTierBadge = document.getElementById('gamer-tier-badge');

// Elementos do Modal de Compartilhamento
const modalOverlay = document.getElementById('modal-overlay');
const closeModalBtn = document.getElementById('close-modal-btn');
const downloadImageBtn = document.getElementById('download-image-btn');
const graphicTotalGames = document.getElementById('graphic-total-games');
const graphicSwitch1Count = document.getElementById('graphic-switch1-count');
const graphicSwitch2Count = document.getElementById('graphic-switch2-count');
const graphicTotalValue = document.getElementById('graphic-total-value');
const graphicTierBadge = document.getElementById('graphic-tier-badge');

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Carregar idioma e configurações salvas ou padrão
  const savedLang = localStorage.getItem('nintendo_worth_lang');
  if (savedLang && (savedLang === 'pt' || savedLang === 'en')) {
    state.language = savedLang;
  } else {
    const navLang = navigator.language || navigator.userLanguage;
    state.language = navLang.startsWith('pt') ? 'pt' : 'en';
  }
  updateLangButtonsUI();

  // 2. Carregar cotação do dólar atualizada
  await fetchExchangeRate();

  // 3. Carregar dados salvos no localStorage
  loadFromLocalStorage();

  // 4. Aplicar Traduções e renderizar estáticos
  applyTranslations();

  // 5. Fazer busca inicial
  performSearch('');

  // 6. Configurar Listeners
  setupEventListeners();
});

// Busca da taxa de câmbio USD -> BRL
async function fetchExchangeRate() {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    const data = await res.json();
    if (data && data.rates && data.rates.BRL) {
      state.exchangeRate = data.rates.BRL;
      console.log(`Taxa de câmbio atualizada: 1 USD = ${state.exchangeRate.toFixed(2)} BRL`);
    }
  } catch (err) {
    console.warn('Falha ao buscar taxa de câmbio, usando valor padrão de R$ 5.40.', err);
  }
}

// Converte preços em dólar para a tabela real brasileira (Tabela eShop Brasil Abril 2026)
function convertUSDtoBRL(usdValue, regularUSD = null) {
  const val = usdValue === null || usdValue === undefined ? 0 : usdValue;
  
  // Se for um valor promocional, calcula o BRL proporcional à redução do dólar
  // Exemplo: se o jogo base é $59.99 (R$329.90) e está por $39.99 (redução de 33%), o preço local será R$329.90 * (39.99/59.99) = R$ 219.90
  if (regularUSD && regularUSD > 0 && Math.abs(val - regularUSD) > 0.01) {
    const regularBRL = convertUSDtoBRL(regularUSD);
    return regularBRL * (val / regularUSD);
  }
  
  // Correspondência exata na tabela oficial
  const keys = Object.keys(NINTENDO_BRL_TIERS);
  for (let i = 0; i < keys.length; i++) {
    const keyVal = parseFloat(keys[i]);
    if (Math.abs(val - keyVal) < 0.05) { // tolerância de 5 centavos
      return NINTENDO_BRL_TIERS[keys[i]];
    }
  }
  
  // Caso não esteja em nenhum tier padrão (preços quebrados/customizados), converte pela cotação do dólar
  return val * state.exchangeRate;
}

// Formatar valor numérico de forma segura e inteligente (usando tabelas oficiais da Nintendo)
function formatCurrency(usdValue, regularUSD = null) {
  if (usdValue === null || usdValue === undefined) return '';
  if (state.currency === 'BRL') {
    const brlValue = convertUSDtoBRL(usdValue, regularUSD);
    return `R$ ${brlValue.toFixed(2)}`;
  }
  return `$${usdValue.toFixed(2)}`;
}

// Atualiza a UI dos botões de Idioma
function updateLangButtonsUI() {
  langBtns.forEach(btn => {
    if (btn.dataset.lang === state.language) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// Aplica as traduções com base em data-i18n
function applyTranslations() {
  const lang = state.language;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (translations[lang][key]) {
      if (el.tagName === 'INPUT') {
        el.placeholder = translations[lang][key];
      } else {
        el.innerHTML = translations[lang][key];
      }
    }
  });
}

// Configuração dos Event Listeners
function setupEventListeners() {
  // Input de Busca com Debounce
  let debounceTimer;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    state.searchQuery = e.target.value;
    debounceTimer = setTimeout(() => {
      performSearch(state.searchQuery);
    }, 450);
  });

  // Filtros de Plataforma
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.currentPlatformFilter = btn.dataset.platform;
      renderGamesGrid();
    });
  });

  // Seletor de Moeda Principal
  currencyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currencyBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.currency = btn.dataset.currency;
      updateCalculations();
      renderSelectedGames();
      renderGamesGrid();
    });
  });

  // Seletor de Idioma
  langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      state.language = btn.dataset.lang;
      localStorage.setItem('nintendo_worth_lang', state.language);
      updateLangButtonsUI();
      applyTranslations();
      updateCalculations();
      renderSelectedGames();
      renderGamesGrid();
    });
  });

  // Limpar Conta
  clearAllBtn.addEventListener('click', () => {
    if (confirm(translations[state.language].confirmClear)) {
      state.selectedGames = [];
      saveToLocalStorage();
      updateCalculations();
      renderSelectedGames();
      renderGamesGrid();
    }
  });

  // Abrir Modal de Compartilhamento
  shareBtn.addEventListener('click', openShareModal);

  // Fechar Modal
  closeModalBtn.addEventListener('click', () => modalOverlay.classList.remove('active'));
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) modalOverlay.classList.remove('active');
  });

  // Baixar imagem do resumo usando html2canvas
  downloadImageBtn.addEventListener('click', downloadSummaryCard);
}

// Busca na API do Algolia usando GET (evita problemas de CORS no protocolo file://)
async function performSearch(query) {
  renderLoading();
  
  const hitsPerPage = 40;
  const facetFiltersEncoded = encodeURIComponent('[["topLevelCategory:Games"]]');
  const url = `https://${ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/${ALGOLIA_INDEX}`
            + `?query=${encodeURIComponent(query)}`
            + `&hitsPerPage=${hitsPerPage}`
            + `&facetFilters=${facetFiltersEncoded}`
            + `&x-algolia-application-id=${ALGOLIA_APP_ID}`
            + `&x-algolia-api-key=${ALGOLIA_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.hits && data.hits.length > 0) {
      state.searchResults = data.hits.map(hit => {
        let platformName = 'Nintendo Switch';
        
        // Verifica se é Switch 2 por metadados
        if (hit.platform === 'Nintendo Switch 2' || 
            (hit.corePlatforms && hit.corePlatforms.includes('Nintendo Switch 2')) || 
            (hit.titleKey && hit.titleKey.includes('switch-2'))) {
          platformName = 'Nintendo Switch 2';
        }

        // Verifica se é lançamento futuro ou não disponível comercialmente ainda
        let isSoon = false;
        const releaseDateStr = hit.releaseDate;
        if (releaseDateStr) {
          const releaseDate = new Date(releaseDateStr);
          const now = new Date();
          if (releaseDate > now) {
            isSoon = true;
          }
        }
        
        let isPurchasable = hit.eshopDetails ? hit.eshopDetails.isPurchasable : true;
        let isPreorderable = hit.eshopDetails ? hit.eshopDetails.isPreorderable : false;
        if (!isPurchasable && !isPreorderable) {
          isSoon = true;
        }

        // Recupera preço de forma segura (fallbacks para null/0)
        let regPrice = null;
        if (!isSoon) {
          if (hit.eshopDetails && hit.eshopDetails.regularPrice !== null) {
            regPrice = hit.eshopDetails.regularPrice;
          } else if (hit.msrp !== null && hit.msrp !== undefined) {
            regPrice = hit.msrp;
          } else {
            regPrice = 0;
          }
        }
        
        let discPrice = (hit.eshopDetails && hit.eshopDetails.discountPrice !== null && !isSoon) ? hit.eshopDetails.discountPrice : null;

        // Limpa título de marcas registradas
        let cleanTitle = hit.title
          .replace(/[\u00ae\u2122\u00a9]/g, '') // Remove ® ™ ©
          .replace(/:\s+/g, ': ')
          .replace(/\s+/g, ' ')
          .trim();

        // Identifica o tipo de item (DLC, Upgrade, Jogo Base)
        let itemType = 'TITLE'; 
        if (hit.eshopDetails && hit.eshopDetails.productType === 'ADD_ON_CONTENT') {
          itemType = 'DLC';
        } else if (hit.isUpgrade) {
          itemType = 'UPGRADE';
        } else if (hit.eshopDetails && hit.eshopDetails.productType === 'BUNDLE') {
          itemType = 'BUNDLE';
        }

        // Imagem de capa
        let imageUrl = hit.productImageSquare || '';
        if (!imageUrl && hit.productImage) {
          imageUrl = `https://assets.nintendo.com/image/upload/f_auto/q_auto/dpr_auto,w_400/${hit.productImage}`;
        }
        if (!imageUrl) {
          imageUrl = 'https://assets.nintendo.com/image/upload/f_auto/q_auto/dpr_auto,w_400/ncom/en_US/games/switch/p/placeholder-switch-game';
        }

        return {
          id: hit.objectID || hit.sku,
          title: cleanTitle,
          platform: platformName,
          regularPrice: regPrice,
          discountPrice: discPrice,
          imageUrl: imageUrl,
          nsuid: hit.nsuid,
          itemType: itemType,
          isSoon: isSoon
        };
      });
      
      renderGamesGrid();
    } else {
      renderEmptyState(translations[state.language].noResults);
    }
  } catch (error) {
    console.error('Erro na chamada da API:', error);
    renderEmptyState(translations[state.language].errorConnection);
  }
}

// Renderizar indicador de carregamento
function renderLoading() {
  gamesGrid.innerHTML = `
    <div class="loading-spinner">
      <div class="spinner"></div>
      <p>${translations[state.language].loading}</p>
    </div>
  `;
}

// Renderizar estado vazio
function renderEmptyState(message) {
  gamesGrid.innerHTML = `
    <div class="empty-state">
      <i class="fas fa-gamepad"></i>
      <h3>Ops!</h3>
      <p>${message}</p>
    </div>
  `;
}

// Renderizar o Grid de Jogos com base na busca e filtros
function renderGamesGrid() {
  if (state.searchResults.length === 0) {
    renderEmptyState(translations[state.language].noResults);
    return;
  }

  // Filtragem
  const filtered = state.searchResults.filter(game => {
    if (state.currentPlatformFilter === 'all') return true;
    if (state.currentPlatformFilter === 'switch1') return game.platform === 'Nintendo Switch';
    if (state.currentPlatformFilter === 'switch2') return game.platform === 'Nintendo Switch 2';
    return true;
  });

  if (filtered.length === 0) {
    gamesGrid.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-filter"></i>
        <h3>${translations[state.language].noResults}</h3>
      </div>
    `;
    return;
  }

  gamesGrid.innerHTML = '';
  const lang = state.language;

  filtered.forEach(game => {
    const isSelected = state.selectedGames.some(g => g.id === game.id);
    const card = document.createElement('div');
    
    // Classes de plataforma para bordas coloridas neon
    const platformClass = game.platform === 'Nintendo Switch 2' ? 'switch2' : 'switch1';
    card.className = `game-card ${platformClass} ${isSelected ? 'selected' : ''}`;
    card.dataset.id = game.id;

    // Formata o preço
    let priceHTML = '';
    const hasDiscount = game.discountPrice !== null && game.discountPrice !== undefined;
    
    if (game.isSoon) {
      priceHTML = `<span class="card-price" style="color: var(--text-secondary); font-size: 0.9rem; font-weight:500;">${translations[lang].soon}</span>`;
    } else if (game.regularPrice === 0) {
      priceHTML = `<span class="card-price">${translations[lang].free}</span>`;
    } else {
      const regularFormatted = formatCurrency(game.regularPrice);
      const discountFormatted = hasDiscount ? formatCurrency(game.discountPrice, game.regularPrice) : '';
      
      if (hasDiscount) {
        priceHTML = `
          <span class="card-price discounted">
            <span class="original-price-strike">${regularFormatted}</span>
            ${discountFormatted}
          </span>
        `;
      } else {
        priceHTML = `<span class="card-price">${regularFormatted}</span>`;
      }
    }

    // Badge do Tipo de Produto (DLC, Upgrade, Bundle)
    let typeBadgeHTML = '';
    if (game.itemType === 'DLC') {
      typeBadgeHTML = `<span class="type-badge badge-dlc">${translations[lang].badgeDLC}</span>`;
    } else if (game.itemType === 'UPGRADE') {
      typeBadgeHTML = `<span class="type-badge badge-upgrade">${translations[lang].badgeUpgrade}</span>`;
    } else if (game.itemType === 'BUNDLE') {
      typeBadgeHTML = `<span class="type-badge badge-bundle">${translations[lang].badgeBundle}</span>`;
    }

    const platformBadgeText = game.platform === 'Nintendo Switch 2' ? 'Switch 2' : 'Switch 1';
    const badgeClass = game.platform === 'Nintendo Switch 2' ? 'badge-switch2' : 'badge-switch1';

    card.innerHTML = `
      <div class="card-image-container">
        <!-- Contêiner de badges agrupado para alinhar esquerda/direita flexivelmente sem sobrepor -->
        <div class="card-badges">
          ${typeBadgeHTML}
          <span class="platform-badge ${badgeClass}">${platformBadgeText}</span>
        </div>
        <img src="${game.imageUrl}" alt="${game.title}" loading="lazy">
      </div>
      <div class="card-content">
        <h3 class="card-title" title="${game.title}">${game.title}</h3>
        <div class="card-footer">
          ${priceHTML}
          <button class="add-btn" aria-label="Adicionar">
            <i class="fas ${isSelected ? 'fa-check' : 'fa-plus'}"></i>
          </button>
        </div>
      </div>
    `;

    card.addEventListener('click', (e) => {
      toggleSelectGame(game);
    });

    gamesGrid.appendChild(card);
  });
}

// Adiciona ou remove jogo da lista
function toggleSelectGame(game) {
  const index = state.selectedGames.findIndex(g => g.id === game.id);
  
  if (index >= 0) {
    state.selectedGames.splice(index, 1);
  } else {
    state.selectedGames.push({
      id: game.id,
      title: game.title,
      platform: game.platform,
      price: game.regularPrice, // preço base USD (pode ser null se "Em breve")
      discountPrice: game.discountPrice,
      originalPrice: game.regularPrice,
      mode: game.regularPrice === null ? 'custom' : 'regular', // se for lançamento futuro, já inicia em modo custom para o usuário pôr o preço
      customPrice: 0,
      imageUrl: game.imageUrl,
      itemType: game.itemType,
      isSoon: game.isSoon
    });
  }

  saveToLocalStorage();
  updateCalculations();
  renderSelectedGames();
  renderGamesGrid();
}

// Renderiza a lista de jogos selecionados na sidebar
function renderSelectedGames() {
  if (state.selectedGames.length === 0) {
    selectedList.innerHTML = `
      <div style="text-align: center; padding: 2rem 0; color: var(--text-secondary); font-size: 0.95rem;">
        <i class="fas fa-shopping-cart" style="font-size: 1.5rem; margin-bottom: 0.5rem; display:block; opacity:0.5;"></i>
        ${translations[state.language].emptyCart}
      </div>
    `;
    return;
  }

  selectedList.innerHTML = '';
  const lang = state.language;

  state.selectedGames.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'selected-item';
    
    const isS2 = item.platform === 'Nintendo Switch 2';
    const platLabel = isS2 ? 'S2' : 'S1';
    const platClass = isS2 ? 's2' : 's1';

    // Determinar preço atual
    let currentPriceValue = item.price;
    if (item.mode === 'discount' && item.discountPrice !== null) {
      currentPriceValue = item.discountPrice;
    } else if (item.mode === 'custom') {
      currentPriceValue = item.customPrice;
    }

    // Converter preço para exibição
    let displayPrice = '';
    if (item.mode === 'custom') {
      displayPrice = `${state.currency === 'BRL' ? 'R$' : '$'} ${(item.customPrice || 0).toFixed(2)}`;
    } else {
      if (item.isSoon) {
        displayPrice = translations[lang].soon;
      } else if (item.originalPrice === 0) {
        displayPrice = translations[lang].free;
      } else {
        displayPrice = formatCurrency(currentPriceValue, item.mode === 'discount' ? item.originalPrice : null);
      }
    }

    const labelRegular = item.isSoon ? translations[lang].soon : `${translations[lang].itemPriceRegular} (${formatCurrency(item.originalPrice)})`;
    const labelPromo = item.discountPrice !== null && item.discountPrice !== undefined ? `${translations[lang].itemPricePromo} (${formatCurrency(item.discountPrice, item.originalPrice)})` : '';
    const labelCustom = translations[lang].itemPriceCustom;

    // Badge do Tipo
    let miniTypeBadge = '';
    if (item.itemType === 'DLC') {
      miniTypeBadge = `<span style="font-size: 0.65rem; color: #f1c40f; font-weight:700; margin-right:5px;">DLC</span>`;
    } else if (item.itemType === 'UPGRADE') {
      miniTypeBadge = `<span style="font-size: 0.65rem; color: #9b59b6; font-weight:700; margin-right:5px;">UPGRADE</span>`;
    } else if (item.itemType === 'BUNDLE') {
      miniTypeBadge = `<span style="font-size: 0.65rem; color: #e67e22; font-weight:700; margin-right:5px;">BUNDLE</span>`;
    }

    div.innerHTML = `
      <img src="${item.imageUrl}" alt="${item.title}" class="selected-item-img">
      <div class="selected-item-info">
        <div class="selected-item-title" title="${item.title}">${item.title}</div>
        <div style="display: flex; gap: 0.6rem; align-items: center; margin-top: 0.2rem;">
          <span class="selected-item-platform ${platClass}">${platLabel}</span>
          ${miniTypeBadge}
          <select class="price-mode-select" data-index="${index}">
            ${!item.isSoon ? `<option value="regular" ${item.mode === 'regular' ? 'selected' : ''}>${labelRegular}</option>` : ''}
            ${item.discountPrice !== null && item.discountPrice !== undefined ? `<option value="discount" ${item.mode === 'discount' ? 'selected' : ''}>${labelPromo}</option>` : ''}
            <option value="custom" ${item.mode === 'custom' ? 'selected' : ''}>${labelCustom}</option>
          </select>
        </div>
      </div>
      <div class="selected-item-price-wrapper">
        ${item.mode === 'custom' ? `
          <div style="display:flex; align-items:center; gap:2px;">
            <span style="font-size:0.75rem; color:var(--text-secondary);">${state.currency === 'BRL' ? 'R$' : '$'}</span>
            <input type="number" class="custom-price-input" data-index="${index}" value="${item.customPrice || 0}" step="any" min="0">
          </div>
        ` : `
          <span class="selected-item-price">${displayPrice}</span>
        `}
        <button class="remove-item-btn" data-index="${index}" aria-label="Remover">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    `;

    // Event Listeners
    const modeSelect = div.querySelector('.price-mode-select');
    modeSelect.addEventListener('change', (e) => {
      const idx = parseInt(e.target.dataset.index);
      state.selectedGames[idx].mode = e.target.value;
      
      if (e.target.value === 'custom' && state.selectedGames[idx].customPrice === 0) {
        const baseUSD = state.selectedGames[idx].price || 0;
        state.selectedGames[idx].customPrice = state.currency === 'BRL' ? parseFloat(convertUSDtoBRL(baseUSD).toFixed(2)) : parseFloat(baseUSD.toFixed(2));
      }
      
      saveToLocalStorage();
      updateCalculations();
      renderSelectedGames();
    });

    const customInput = div.querySelector('.custom-price-input');
    if (customInput) {
      customInput.addEventListener('change', (e) => {
        const idx = parseInt(e.target.dataset.index);
        let val = parseFloat(e.target.value);
        if (isNaN(val) || val < 0) val = 0;
        state.selectedGames[idx].customPrice = val;
        saveToLocalStorage();
        updateCalculations();
      });
      customInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') e.target.blur();
      });
    }

    const removeBtn = div.querySelector('.remove-item-btn');
    removeBtn.addEventListener('click', (e) => {
      toggleSelectGame(state.selectedGames[index]);
    });

    selectedList.appendChild(div);
  });
}

// Atualizar cálculos matemáticos e renderizar totais
function updateCalculations() {
  let totalUSD = 0;
  let totalBRL = 0;
  let countS1 = 0;
  let countS2 = 0;

  state.selectedGames.forEach(item => {
    if (item.platform === 'Nintendo Switch 2') {
      countS2++;
    } else {
      countS1++;
    }

    let itemPriceVal = item.price || 0;
    if (item.mode === 'discount' && item.discountPrice !== null && item.discountPrice !== undefined) {
      itemPriceVal = item.discountPrice;
    }

    const customVal = item.customPrice || 0;

    if (item.mode === 'custom') {
      if (state.currency === 'BRL') {
        totalBRL += customVal;
        totalUSD += customVal / state.exchangeRate;
      } else {
        totalUSD += customVal;
        totalBRL += customVal * state.exchangeRate;
      }
    } else {
      totalUSD += itemPriceVal;
      totalBRL += convertUSDtoBRL(itemPriceVal, item.mode === 'discount' ? item.originalPrice : null);
    }
  });

  // Atualizar DOM
  totalGamesCount.textContent = state.selectedGames.length;
  countSwitch1.textContent = countS1;
  countSwitch2.textContent = countS2;

  // Formata os totais
  totalValueUSD.textContent = `($ ${totalUSD.toFixed(2)} USD)`;
  totalValueBRL.textContent = `R$ ${totalBRL.toFixed(2)} BRL`;

  // Atualizar Nível de Jogador (Tier)
  const tier = calculateGamerTier(totalUSD);
  gamerTierBadge.textContent = tier.name;
  gamerTierBadge.style.background = tier.color;
  gamerTierBadge.style.webkitBackgroundClip = 'text';
  gamerTierBadge.style.webkitTextFillColor = 'transparent';
}

// Determina o Tier do Jogador com base no valor total
function calculateGamerTier(totalUSD) {
  const lang = state.language;
  const value = totalUSD || 0;
  if (value === 0) {
    return { name: translations[lang].tierEmpty, color: 'linear-gradient(90deg, #c5c6c7, #c5c6c7)' };
  }
  if (value < 150) {
    return { name: translations[lang].tierCasual, color: 'linear-gradient(90deg, #a8ff78, #78ffd6)' };
  }
  if (value < 600) {
    return { name: translations[lang].tierFan, color: 'linear-gradient(90deg, #00c6ff, #0072ff)' };
  }
  if (value < 1500) {
    return { name: translations[lang].tierCollector, color: 'linear-gradient(90deg, #f857a6, #ff5858)' };
  }
  return { name: translations[lang].tierFanatic, color: 'linear-gradient(90deg, #f12711, #f5af19)' };
}

// Persistência em LocalStorage
function saveToLocalStorage() {
  localStorage.setItem('nintendo_selected_games', JSON.stringify(state.selectedGames));
}

function loadFromLocalStorage() {
  const data = localStorage.getItem('nintendo_selected_games');
  if (data) {
    try {
      state.selectedGames = JSON.parse(data);
      updateCalculations();
      renderSelectedGames();
    } catch (e) {
      console.error('Erro ao ler do localStorage:', e);
      state.selectedGames = [];
    }
  }
}

// Compartilhamento e Geração do Card
function openShareModal() {
  if (state.selectedGames.length === 0) {
    alert(translations[state.language].alertAdd);
    return;
  }

  graphicTotalGames.textContent = state.selectedGames.length;
  graphicSwitch1Count.textContent = countSwitch1.textContent;
  graphicSwitch2Count.textContent = countSwitch2.textContent;
  
  if (state.currency === 'BRL') {
    graphicTotalValue.innerHTML = `<span class="total-value-brl">${totalValueBRL.textContent}</span>`;
  } else {
    graphicTotalValue.innerHTML = `<span class="total-value">${totalValueUSD.textContent}</span>`;
  }

  graphicTierBadge.textContent = gamerTierBadge.textContent;
  graphicTierBadge.style.backgroundImage = gamerTierBadge.style.background;
  graphicTierBadge.style.backgroundClip = 'text';
  graphicTierBadge.style.webkitBackgroundClip = 'text';
  graphicTierBadge.style.webkitTextFillColor = 'transparent';

  modalOverlay.classList.add('active');
}

// Baixar o card usando html2canvas
function downloadSummaryCard() {
  const cardElement = document.getElementById('summary-graphic-card');
  const lang = state.language;
  
  const options = {
    useCORS: true,
    scale: 2, 
    backgroundColor: '#0b0c10',
    logging: false
  };

  downloadImageBtn.textContent = translations[lang].generating;
  downloadImageBtn.disabled = true;

  html2canvas(cardElement, options)
    .then(canvas => {
      const link = document.createElement('a');
      link.download = 'valor_conta_nintendo.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      downloadImageBtn.textContent = translations[lang].downloadBtn;
      downloadImageBtn.disabled = false;
    })
    .catch(err => {
      console.error('Erro ao gerar imagem:', err);
      alert('Error generating image. Take a screenshot to share instead!');
      downloadImageBtn.textContent = translations[lang].downloadBtn;
      downloadImageBtn.disabled = false;
    });
}
