"use strict";

// ==========================================
// KONFIGURASI
// ==========================================

const WHATSAPP_NUMBER = "6283897625416";

// ==========================================
// DATA LAYANAN
// ==========================================

const services = [
    {
        id: 1,
        name: "Blox Fruits",
        category: "adventure",
        price: 2000,
        image: "./images/blox.png",
        description: "Joki Exp, Level, Dan Event di Blox Fruit"
    },
    {
        id: 3,
        name: "Violence District",
        category: "bertahan hidup",
        price: 5000,
        image: "./images/vd.png",
        description: "Joki Screws, Emblems, Level di Violence District."
    },
    {
        id: 4,
        name: "Driving Empire",
        category: "simulator",
        price: 4000,
        image: "./images/driving.png",
        description: "Joki money di Driving Empire."
    },
    {
        id: 5,
        name: "Game Lainnya",
        category: "other",
        price: 0,
        image: "./images/lainya.png",
        description: "Layanan game Roblox lainnya. Hubungi admin untuk informasi lebih lanjut."
    }
];

// ==========================================
// STATE WEBSITE
// ==========================================

let activeFilter = "all";
let searchQuery = "";
let sortMode = "default";
let selectedService = null;
let isSavingOrder = false;

// ==========================================
// FORMAT HARGA
// ==========================================

function formatRupiah(price) {
    if (price === 0) {
        return "Konfirmasi harga";
    }

    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(price);
}

// ==========================================
// KATEGORI
// ==========================================

function namaKategori(category) {
    const categories = {
        adventure: "Adventure",
        simulator: "Simulator",
        other: "Lainnya",
        "bertahan hidup": "Bertahan Hidup"
    };

    return categories[category] || "Game";
}

// ==========================================
// PLACEHOLDER GAMBAR
// ==========================================

function buatPlaceholderGame(nama) {
    const inisial = nama
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(kata => kata[0])
        .join("")
        .toUpperCase();

    // Escape karakter khusus agar aman di dalam SVG.
    const namaAman = nama.replace(/[&<>"']/g, karakter => {
        const karakterMap = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&apos;"
        };

        return karakterMap[karakter];
    });

    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg"
             width="512"
             height="512"
             viewBox="0 0 512 512">

            <defs>
                <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#30205f"/>
                    <stop offset="100%" stop-color="#102b50"/>
                </linearGradient>

                <radialGradient id="glow">
                    <stop offset="0%" stop-color="#a78bfa" stop-opacity=".5"/>
                    <stop offset="100%" stop-color="#a78bfa" stop-opacity="0"/>
                </radialGradient>
            </defs>

            <rect width="512" height="512" fill="url(#bg)"/>

            <circle cx="256" cy="220" r="190" fill="url(#glow)"/>

            <circle cx="256"
                    cy="220"
                    r="130"
                    fill="none"
                    stroke="#a78bfa"
                    stroke-opacity=".25"
                    stroke-width="2"/>

            <text x="256"
                  y="275"
                  font-family="Arial"
                  font-size="110"
                  font-weight="bold"
                  text-anchor="middle"
                  fill="#ffffff">${inisial}</text>

            <text x="256"
                  y="390"
                  font-family="Arial"
                  font-size="25"
                  text-anchor="middle"
                  fill="#c4b5fd">${namaAman}</text>
        </svg>
    `;

    return "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(svg);
}

// ==========================================
// MEMUAT GAMBAR MANUAL
// ==========================================

function muatGambarKartu(image, service) {
    const placeholder = buatPlaceholderGame(service.name);

    image.onerror = function() {
        this.onerror = null;
        this.src = placeholder;
    };

    image.src = service.image || placeholder;
}

// ==========================================
// STYLE MODAL DAN PESANAN
// ==========================================

function pasangStylePesanan() {
    if (document.getElementById("orderPageStyles")) {
        return;
    }

    const style = document.createElement("style");
    style.id = "orderPageStyles";

    style.textContent = `
        .order-modal[hidden],
        .order-history[hidden] {
            display: none !important;
        }

        .order-modal {
            position: fixed;
            inset: 0;
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 18px;
            background: rgba(5, 8, 25, .82);
            backdrop-filter: blur(8px);
            overflow-y: auto;
        }

        .order-box {
            box-sizing: border-box;
            width: 100%;
            max-width: 520px;
            max-height: 92vh;
            overflow-y: auto;
            position: relative;
            padding: 28px;
            border: 1px solid rgba(139, 92, 246, .4);
            border-radius: 20px;
            background: #11142b;
            color: #fff;
            box-shadow: 0 20px 70px rgba(0, 0, 0, .4);
        }

        .order-box h2 {
            margin: 0 36px 8px 0;
            font-size: 25px;
        }

        .order-subtitle {
            margin-bottom: 22px;
            color: #b9bfd7;
            line-height: 1.6;
        }

        .order-close {
            position: absolute;
            top: 15px;
            right: 16px;
            border: 0;
            background: transparent;
            color: #fff;
            font-size: 28px;
            cursor: pointer;
        }

        .order-form label {
            display: block;
            margin: 15px 0 7px;
            font-weight: 600;
        }

        .order-form input,
        .order-form textarea {
            box-sizing: border-box;
            width: 100%;
            padding: 12px 14px;
            border: 1px solid #34395d;
            border-radius: 10px;
            background: #191d3b;
            color: #fff;
            font: inherit;
        }

        .order-form textarea {
            min-height: 100px;
            resize: vertical;
        }

        .order-form input:focus,
        .order-form textarea:focus {
            outline: 2px solid #8b5cf6;
        }

        .order-summary {
            margin: 18px 0;
            padding: 15px;
            border-radius: 12px;
            background: #1b2042;
            line-height: 1.8;
        }

        .order-submit,
        .order-history-toggle {
            display: inline-flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            margin-top: 12px;
            padding: 13px 16px;
            border: 0;
            border-radius: 10px;
            background: #7854ed;
            color: white;
            font: inherit;
            font-weight: 700;
            cursor: pointer;
            transition: background .2s ease, transform .2s ease;
        }

        .order-submit:hover,
        .order-history-toggle:hover {
            background: #6842df;
            transform: translateY(-2px);
        }

        .order-submit:disabled {
            opacity: .6;
            cursor: wait;
        }

        .order-message {
            margin-top: 14px;
            line-height: 1.6;
            overflow-wrap: anywhere;
        }

        .order-history {
            margin: 32px auto;
            width: min(1100px, calc(100% - 32px));
            color: #fff;
            scroll-margin-top: 30px;
        }

        .order-history-intro {
            color: #b9bfd7;
            line-height: 1.6;
        }

        .order-list {
            display: grid;
            gap: 14px;
            margin-top: 20px;
        }

        .order-empty {
            padding: 18px;
            border: 1px dashed #454b70;
            border-radius: 12px;
            color: #c6cbe0;
        }

        .service-order {
            cursor: pointer;
        }

        .hero-particles {
            position: absolute;
            inset: 0;
            overflow: hidden;
            pointer-events: none;
            z-index: 0;
        }

        .hero-particle {
            position: absolute;
            width: 4px;
            height: 4px;
            border-radius: 50%;
            background: #a78bfa;
            opacity: .6;
            box-shadow: 0 0 12px #a78bfa;
            animation: vanParticleFloat var(--duration) ease-in-out infinite;
            animation-delay: var(--delay);
        }

        @keyframes vanParticleFloat {
            0%, 100% {
                transform: translate3d(0, 0, 0);
                opacity: .2;
            }

            50% {
                transform: translate3d(var(--drift), -35px, 0);
                opacity: .9;
            }
        }

        @media (max-width: 480px) {
            .order-box {
                padding: 22px 18px;
            }
        }

        @media (prefers-reduced-motion: reduce) {
            .hero-particle {
                animation: none;
            }
        }
    `;

    document.head.appendChild(style);
}

// ==========================================
// MODAL PEMESANAN
// ==========================================

function buatModalPesanan() {
    if (document.getElementById("orderModal")) {
        return;
    }

    const modal = document.createElement("div");
    modal.id = "orderModal";
    modal.className = "order-modal";
    modal.hidden = true;

    modal.innerHTML = `
        <div
            class="order-box"
            role="dialog"
            aria-modal="true"
            aria-labelledby="orderTitle"
        >
            <button
                type="button"
                class="order-close"
                id="orderClose"
                aria-label="Tutup formulir"
            >
                &times;
            </button>

            <h2 id="orderTitle">Buat Pesanan</h2>

            <p class="order-subtitle">
                Isi data pesanan dan lanjutkan melalui WhatsApp.
            </p>

            <div id="orderSummary" class="order-summary"></div>

            <form id="orderForm" class="order-form">
                <label for="robloxUsername">
                    Username Roblox
                </label>

                <input
                    id="robloxUsername"
                    name="robloxUsername"
                    type="text"
                    minlength="3"
                    maxlength="50"
                    autocomplete="off"
                    placeholder="Masukkan username Roblox"
                    required
                >

                <label for="orderDetails">
                    Detail Pesanan
                </label>

                <textarea
                    id="orderDetails"
                    name="orderDetails"
                    maxlength="1500"
                    placeholder="Jelaskan layanan yang kamu butuhkan"
                    required
                ></textarea>

                <button
                    id="orderSubmit"
                    class="order-submit"
                    type="submit"
                >
                    Lanjutkan ke WhatsApp
                </button>

                <p
                    id="orderMessage"
                    class="order-message"
                    role="status"
                    aria-live="polite"
                ></p>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById("orderClose").addEventListener(
        "click",
        tutupModalPesanan
    );

    modal.addEventListener("click", function(event) {
        if (event.target === modal) {
            tutupModalPesanan();
        }
    });

    document.addEventListener("keydown", function(event) {
        if (event.key === "Escape" && !modal.hidden) {
            tutupModalPesanan();
        }
    });

    document.getElementById("orderForm").addEventListener(
        "submit",
        simpanPesanan
    );
}

// ==========================================
// BUKA MODAL PESANAN
// ==========================================

function bukaModalPesanan(service) {
    selectedService = service;

    const modal = document.getElementById("orderModal");
    const summary = document.getElementById("orderSummary");

    if (!modal || !summary) {
        return;
    }

    summary.replaceChildren();

    const game = document.createElement("div");
    game.textContent = "Game: " + service.name;

    const kategori = document.createElement("div");
    kategori.textContent =
        "Kategori: " + namaKategori(service.category);

    const harga = document.createElement("div");
    harga.textContent =
        "Harga: " + formatRupiah(service.price);

    summary.append(game, kategori, harga);

    document.getElementById("orderMessage").textContent = "";
    document.getElementById("orderDetails").value = "";
    document.getElementById("robloxUsername").value = "";
    document.getElementById("orderSubmit").disabled = false;

    modal.hidden = false;

    document.getElementById("robloxUsername").focus();
}

// ==========================================
// TUTUP MODAL
// ==========================================

function tutupModalPesanan() {
    const modal = document.getElementById("orderModal");

    if (modal) {
        modal.hidden = true;
    }

    selectedService = null;
}

// ==========================================
// PESAN LAYANAN
// ==========================================

function pesanLayanan(service) {
    bukaModalPesanan(service);
}

// ==========================================
// PROSES PESANAN WHATSAPP
// ==========================================

function simpanPesanan(event) {
    event.preventDefault();

    if (isSavingOrder || !selectedService) {
        return;
    }

    const username = document
        .getElementById("robloxUsername")
        .value
        .trim();

    const details = document
        .getElementById("orderDetails")
        .value
        .trim();

    const message = document.getElementById("orderMessage");
    const submit = document.getElementById("orderSubmit");

    if (username.length < 3 || username.length > 50) {
        message.textContent =
            "Username Roblox harus berisi 3 sampai 50 karakter.";
        return;
    }

    if (!details) {
        message.textContent = "Silakan isi detail pesanan.";
        return;
    }

    const harga = selectedService.price === 0
        ? "Perlu konfirmasi admin"
        : formatRupiah(selectedService.price);

    const teksPesanan = [
        "Halo admin VanJoki, saya ingin memesan layanan.",
        "",
        "DETAIL PESANAN VANJOKI",
        "Game: " + selectedService.name,
        "Username Roblox: " + username,
        "Kategori: " + namaKategori(selectedService.category),
        "Harga: " + harga,
        "Detail pesanan: " + details,
        "",
        "Mohon konfirmasi pesanan saya. Terima kasih."
    ].join("\n");

    const urlWhatsApp =
        "https://wa.me/" +
        WHATSAPP_NUMBER +
        "?text=" +
        encodeURIComponent(teksPesanan);

    isSavingOrder = true;
    submit.disabled = true;
    submit.textContent = "Membuka WhatsApp...";

    const whatsappWindow = window.open(urlWhatsApp, "_blank");

    if (whatsappWindow) {
        message.textContent =
            "Periksa tab WhatsApp yang terbuka, lalu tekan Kirim untuk mengirim pesanan.";
    } else {
        message.textContent =
            "WhatsApp tidak terbuka otomatis. Izinkan pop-up browser, lalu coba lagi.";
    }

    submit.disabled = false;
    submit.textContent = "Lanjutkan ke WhatsApp";
    isSavingOrder = false;
}

// ==========================================
// BAGIAN PESANAN SAYA
// ==========================================

function buatBagianPesanan() {
    if (document.getElementById("orderHistory")) {
        return;
    }

    const section = document.createElement("section");
    section.id = "orderHistory";
    section.className = "order-history";
    section.hidden = true;

    section.innerHTML = `
        <h2>Pesanan Saya</h2>

        <p class="order-history-intro">
            Pesanan diproses melalui WhatsApp. Periksa percakapan
            WhatsApp untuk mengetahui konfirmasi dari admin.
        </p>

        <button
            type="button"
            id="contactAdminButton"
            class="order-history-toggle"
        >
            Hubungi Admin WhatsApp
        </button>

        <div id="myOrderList" class="order-list"></div>
    `;

    const footer = document.querySelector("footer");

    if (footer) {
        document.body.insertBefore(section, footer);
    } else {
        document.body.appendChild(section);
    }

    document.getElementById("contactAdminButton").addEventListener(
        "click",
        bukaWhatsAppAdmin
    );
}

function bukaBagianPesanan() {
    const section = document.getElementById("orderHistory");

    if (!section) {
        return;
    }

    section.hidden = false;

    section.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    muatPesananSaya();
}

function muatPesananSaya() {
    const list = document.getElementById("myOrderList");

    if (!list) {
        return;
    }

    list.replaceChildren();

    const empty = document.createElement("p");
    empty.className = "order-empty";
    empty.textContent =
        "Riwayat pesanan tidak disimpan di website. Silakan periksa percakapan WhatsApp dengan admin.";

    list.appendChild(empty);
}

// ==========================================
// HUBUNGI ADMIN
// ==========================================

function bukaWhatsAppAdmin() {
    const teks =
        "Halo admin VanJoki, saya ingin menanyakan layanan.";

    const url =
        "https://wa.me/" +
        WHATSAPP_NUMBER +
        "?text=" +
        encodeURIComponent(teks);

    window.open(url, "_blank");
}

// ==========================================
// MEMBUAT KARTU LAYANAN
// ==========================================

function buatKartuLayanan(service) {
    const card = document.createElement("article");
    card.className = "service-card";

    const cover = document.createElement("div");
    cover.className = "game-cover";

    const image = document.createElement("img");
    image.alt = "Thumbnail " + service.name;
    image.loading = "lazy";
    image.decoding = "async";
    image.src = buatPlaceholderGame(service.name);

    cover.appendChild(image);

    // Memuat gambar manual dari folder images.
    muatGambarKartu(image, service);

    const body = document.createElement("div");
    body.className = "service-card-body";

    const category = document.createElement("span");
    category.className = "service-category";
    category.textContent = namaKategori(service.category);

    const title = document.createElement("h3");
    title.textContent = service.name;

    const description = document.createElement("p");
    description.className = "service-description";
    description.textContent = service.description;

    const divider = document.createElement("hr");
    divider.className = "service-divider";

    const bottom = document.createElement("div");
    bottom.className = "service-bottom";

    const priceWrapper = document.createElement("div");

    const priceLabel = document.createElement("div");
    priceLabel.className = "price-label";
    priceLabel.textContent =
        service.price === 0
            ? "Informasi harga"
            : "Harga mulai dari";

    const price = document.createElement("div");
    price.className = "service-price";
    price.textContent = formatRupiah(service.price);

    priceWrapper.append(priceLabel, price);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "service-order";
    button.textContent = "Pesan Sekarang";

    button.addEventListener("click", function() {
        pesanLayanan(service);
    });

    bottom.append(priceWrapper, button);

    body.append(
        category,
        title,
        description,
        divider,
        bottom
    );

    card.append(cover, body);

    return card;
}

// ==========================================
// FILTER, PENCARIAN, DAN SORTING
// ==========================================

function renderServices() {
    const grid = document.getElementById("serviceGrid");
    const emptyMessage = document.getElementById("emptyMessage");
    const serviceCount = document.getElementById("serviceCount");

    if (!grid) {
        console.error("Elemen serviceGrid tidak ditemukan.");
        return;
    }

    let filtered = services.filter(function(service) {
        const matchesCategory =
            activeFilter === "all" ||
            service.category === activeFilter;

        const text = (
            service.name + " " +
            service.description + " " +
            namaKategori(service.category)
        ).toLowerCase();

        return matchesCategory && text.includes(searchQuery);
    });

    if (sortMode === "low") {
        filtered.sort(function(a, b) {
            if (a.price === 0) return 1;
            if (b.price === 0) return -1;

            return a.price - b.price;
        });
    }

    if (sortMode === "high") {
        filtered.sort(function(a, b) {
            if (a.price === 0) return 1;
            if (b.price === 0) return -1;

            return b.price - a.price;
        });
    }

    if (sortMode === "name") {
        filtered.sort(function(a, b) {
            return a.name.localeCompare(b.name, "id");
        });
    }

    // Game Lainnya selalu berada di urutan paling akhir.
    filtered.sort(function(a, b) {
        if (a.name === "Game Lainnya") return 1;
        if (b.name === "Game Lainnya") return -1;

        return 0;
    });

    grid.replaceChildren();

    if (serviceCount) {
        serviceCount.textContent = filtered.length;
    }

    if (emptyMessage) {
        emptyMessage.hidden = filtered.length !== 0;
    }

    filtered.forEach(function(service) {
        grid.appendChild(buatKartuLayanan(service));
    });
}

// ==========================================
// PENCARIAN
// ==========================================

function setupSearch() {
    const input = document.getElementById("searchInput");

    if (!input) {
        return;
    }

    input.addEventListener("input", function() {
        searchQuery = input.value.trim().toLowerCase();
        renderServices();
    });
}

// ==========================================
// FILTER KATEGORI
// ==========================================

function setupFilters() {
    const sidebar = document.querySelector(".filter-sidebar");

    // Tambahkan filter Bertahan Hidup jika belum ada di HTML.
    if (
        sidebar &&
        !sidebar.querySelector('[data-filter="bertahan hidup"]')
    ) {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "filter-btn";
        button.dataset.filter = "bertahan hidup";
        button.textContent = "Bertahan Hidup";
        button.setAttribute("aria-pressed", "false");

        sidebar.appendChild(button);
    }

    const buttons = document.querySelectorAll(".filter-btn");

    buttons.forEach(function(button) {
        button.addEventListener("click", function() {
            activeFilter = button.dataset.filter || "all";

            buttons.forEach(function(item) {
                const active = item === button;

                item.classList.toggle("active", active);
                item.setAttribute("aria-pressed", String(active));
            });

            renderServices();
        });

        button.setAttribute(
            "aria-pressed",
            String(button.dataset.filter === activeFilter)
        );
    });
}

// ==========================================
// PENGURUTAN HARGA
// ==========================================

function setupSort() {
    const select = document.getElementById("sortSelect");

    if (!select) {
        return;
    }

    select.addEventListener("change", function() {
        sortMode = select.value;
        renderServices();
    });
}

// ==========================================
// RESET PENCARIAN
// ==========================================

function setupResetSearch() {
    const button = document.getElementById("resetSearch");
    const input = document.getElementById("searchInput");

    if (!button || !input) {
        return;
    }

    button.addEventListener("click", function() {
        input.value = "";
        searchQuery = "";
        activeFilter = "all";
        sortMode = "default";

        const select = document.getElementById("sortSelect");

        if (select) {
            select.value = "default";
        }

        document.querySelectorAll(".filter-btn").forEach(function(item) {
            const active = item.dataset.filter === "all";

            item.classList.toggle("active", active);
            item.setAttribute("aria-pressed", String(active));
        });

        renderServices();
    });
}

// ==========================================
// MENU MOBILE
// ==========================================

function setupMobileMenu() {
    const toggle = document.getElementById("menuToggle");
    const menu = document.getElementById("navMenu");

    if (!toggle || !menu) {
        return;
    }

    toggle.addEventListener("click", function() {
        const opened = menu.classList.toggle("active");

        toggle.setAttribute("aria-expanded", String(opened));
        toggle.setAttribute(
            "aria-label",
            opened ? "Tutup menu" : "Buka menu"
        );
    });

    menu.querySelectorAll("a").forEach(function(link) {
        link.addEventListener("click", function() {
            menu.classList.remove("active");

            toggle.setAttribute("aria-expanded", "false");
            toggle.setAttribute("aria-label", "Buka menu");
        });
    });
}

// ==========================================
// TAHUN FOOTER
// ==========================================

function setupFooterYear() {
    const year = document.getElementById("year");

    if (year) {
        year.textContent = new Date().getFullYear();
    }
}

// ==========================================
// TOMBOL PESANAN SAYA DI NAVBAR
// ==========================================

function setupTombolPesananSaya() {
    const nav = document.getElementById("navMenu");

    if (!nav || document.getElementById("myOrdersNavButton")) {
        return;
    }

    const button = document.createElement("button");

    button.id = "myOrdersNavButton";
    button.type = "button";
    button.className = "service-order";
    button.textContent = "Pesanan Saya";

    button.addEventListener("click", function() {
        bukaBagianPesanan();

        nav.classList.remove("active");

        const toggle = document.getElementById("menuToggle");

        if (toggle) {
            toggle.setAttribute("aria-expanded", "false");
            toggle.setAttribute("aria-label", "Buka menu");
        }
    });

    nav.appendChild(button);
}

// ==========================================
// TAUTAN PESANAN SAYA
// ==========================================

function setupTautanPesanan() {
    document.querySelectorAll('a[href="#orderHistory"]').forEach(
        function(link) {
            link.addEventListener("click", function(event) {
                event.preventDefault();
                bukaBagianPesanan();
            });
        }
    );
}

// ==========================================
// EFEK 3D HERO
// ==========================================

function setupHero3D() {
    const visual = document.querySelector(".hero-visual");
    const card = document.querySelector(".hero-game-panel");

    if (!visual || !card) {
        return;
    }

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    const supportsHover = window.matchMedia(
        "(hover: hover) and (pointer: fine)"
    ).matches;

    // 3D MOUSE TILT
    if (supportsHover && !reducedMotion) {
        visual.addEventListener("mousemove", function(event) {
            const rect = card.getBoundingClientRect();

            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const rotateY = (
                (event.clientX - centerX) / (rect.width / 2)
            ) * 8;

            const rotateX = (
                (centerY - event.clientY) / (rect.height / 2)
            ) * 8;

            card.style.animation = "none";

            card.style.transform =
                `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        visual.addEventListener("mouseleave", function() {
            card.style.transform = "";
            card.style.animation = "";
        });
    }

    // FLOATING PARTICLES
    if (
        !reducedMotion &&
        !visual.querySelector(".hero-particles")
    ) {
        const particleContainer = document.createElement("div");

        particleContainer.className = "hero-particles";
        particleContainer.setAttribute("aria-hidden", "true");

        for (let i = 0; i < 22; i++) {
            const particle = document.createElement("span");

            particle.className = "hero-particle";

            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${30 + Math.random() * 70}%`;

            particle.style.setProperty(
                "--duration",
                `${5 + Math.random() * 7}s`
            );

            particle.style.setProperty(
                "--delay",
                `${Math.random() * -10}s`
            );

            particle.style.setProperty(
                "--drift",
                `${Math.random() * 100 - 50}px`
            );

            particleContainer.appendChild(particle);
        }

        visual.prepend(particleContainer);
    }
}

// ==========================================
// INISIALISASI WEBSITE
// ==========================================

document.addEventListener("DOMContentLoaded", function() {
    pasangStylePesanan();

    buatModalPesanan();
    buatBagianPesanan();

    setupSearch();
    setupFilters();
    setupSort();
    setupResetSearch();

    setupMobileMenu();
    setupFooterYear();

    setupTombolPesananSaya();
    setupTautanPesanan();

    setupHero3D();

    renderServices();

    console.log("VanJoki berhasil dijalankan.");
});
