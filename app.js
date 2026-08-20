/* ============================================================
   MAINSTAY COFFEE
   PURE VANILLA JAVASCRIPT
   POS + CATALOG + MEMBER + LOYALTY + OWNER DASHBOARD
   ============================================================ */

"use strict";


/* ============================================================
   DATABASE
   ============================================================ */

const STORAGE_KEY = "mainstayCoffeeDatabase_v1";


const DEFAULT_DATABASE = {

    settings: {

        name: "Mainstay Coffee",

        tagline:
            "Coffee, Comfort & Good Moments",

        phone:
            "6281234567890",

        broadcast:
            "https://wa.me/6281234567890",

        policy:
            "Terima kasih telah berkunjung ke Mainstay Coffee.",

        announcement:
            "Selamat datang di Mainstay Coffee — Nikmati kopi terbaik hari ini.",

        announcementEnabled:
            true,

        logo:
            "",

        favicon:
            "",

        qris:
            "",

        googleMap:
            "",

        instagram:
            "https://instagram.com/",

        tiktok:
            "https://tiktok.com/",

        whatsapp:
            "https://wa.me/6281234567890"

    },


    loyalty: {

        minimum:
            25000,

        target:
            5,

        expiryValue:
            7,

        expiryUnit:
            "days"

    },


    owner: {

        name:
            "Owner Mainstay",

        pin:
            "9999",

        phone:
            "6281234567890"

    },


    staff: [],


    members: [],


    stamps: [],


    vouchers: [],


    transactions: [],


    products: [

        {
            id: "coffee-americano",
            name: "Americano",
            category: "Coffee",
            price: 18000,
            description:
                "Espresso dengan air dingin atau panas.",
            image: "",
            active: true
        },

        {
            id: "coffee-latte",
            name: "Cafe Latte",
            category: "Coffee",
            price: 24000,
            description:
                "Espresso creamy dengan steamed milk.",
            image: "",
            active: true
        },

        {
            id: "coffee-cappuccino",
            name: "Cappuccino",
            category: "Coffee",
            price: 24000,
            description:
                "Espresso, susu dan foam yang lembut.",
            image: "",
            active: true
        },

        {
            id: "coffee-mocha",
            name: "Cafe Mocha",
            category: "Coffee",
            price: 26000,
            description:
                "Kopi dengan sentuhan cokelat.",
            image: "",
            active: true
        },

        {
            id: "noncoffee-matcha",
            name: "Matcha Latte",
            category: "Non Coffee",
            price: 25000,
            description:
                "Matcha creamy dengan rasa earthy.",
            image: "",
            active: true
        },

        {
            id: "noncoffee-chocolate",
            name: "Chocolate",
            category: "Non Coffee",
            price: 22000,
            description:
                "Cokelat creamy dan nikmat.",
            image: "",
            active: true
        },

        {
            id: "tea-lychee",
            name: "Lychee Tea",
            category: "Tea",
            price: 20000,
            description:
                "Teh segar dengan aroma leci.",
            image: "",
            active: true
        },

        {
            id: "tea-lemon",
            name: "Lemon Tea",
            category: "Tea",
            price: 18000,
            description:
                "Teh segar dengan lemon.",
            image: "",
            active: true
        },

        {
            id: "food-french-fries",
            name: "French Fries",
            category: "Food",
            price: 20000,
            description:
                "Kentang goreng renyah.",
            image: "",
            active: true
        },

        {
            id: "food-chicken",
            name: "Chicken Rice",
            category: "Food",
            price: 28000,
            description:
                "Nasi dengan ayam dan saus spesial.",
            image: "",
            active: true
        }

    ]

};


/* ============================================================
   STATE
   ============================================================ */

let database = loadDatabase();

let cart = [];

let activeCategory = "Semua";

let activePosCategory = "Semua";

let activeVoucher = null;

let editingVoucherId = null;

let editingStaffId = null;

let carouselIndex = 0;

let carouselTimer = null;

let currentSession = null;


/* ============================================================
   DOM HELPER
   ============================================================ */

function $(id) {
    return document.getElementById(id);
}


function $$(
    selector
) {
    return document.querySelectorAll(selector);
}


/* ============================================================
   DATABASE
   ============================================================ */

function deepClone(object) {

    return JSON.parse(
        JSON.stringify(object)
    );

}


function loadDatabase() {

    try {

        const saved =
            localStorage.getItem(
                STORAGE_KEY
            );

        if (!saved) {

            const fresh =
                deepClone(
                    DEFAULT_DATABASE
                );

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(fresh)
            );

            return fresh;
        }

        const parsed =
            JSON.parse(saved);

        return mergeDatabase(
            deepClone(DEFAULT_DATABASE),
            parsed
        );

    } catch (error) {

        console.error(
            "Database gagal dimuat:",
            error
        );

        return deepClone(
            DEFAULT_DATABASE
        );
    }

}


function mergeDatabase(
    base,
    saved
) {

    Object.keys(saved).forEach(
        key => {

            if (
                saved[key] !== null &&
                typeof saved[key] === "object" &&
                !Array.isArray(saved[key])
            ) {

                base[key] = {
                    ...base[key],
                    ...saved[key]
                };

            } else {

                base[key] = saved[key];

            }

        }
    );

    return base;

}


function saveDatabase() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(database)
        );

    } catch (error) {

        console.error(
            "Database gagal disimpan:",
            error
        );

        showToast(
            "Database tidak dapat disimpan. Storage mungkin penuh.",
            "error"
        );

    }

}


/* ============================================================
   FORMAT
   ============================================================ */

function rupiah(
    value
) {

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }
    ).format(
        Number(value) || 0
    );

}


function normalizePhone(
    phone
) {

    let value =
        String(phone || "")
        .trim()
        .replace(
            /[^0-9+]/g,
            ""
        );

    if (
        value.startsWith("+62")
    ) {

        value =
            "62" +
            value.substring(3);

    } else if (
        value.startsWith("08")
    ) {

        value =
            "62" +
            value.substring(1);

    } else if (
        value.startsWith("8")
    ) {

        value =
            "62" +
            value;

    }

    return value;

}


function formatDateTime(
    date = new Date()
) {

    return new Intl.DateTimeFormat(
        "id-ID",
        {
            timeZone:
                "Asia/Jakarta",

            weekday:
                "long",

            day:
                "2-digit",

            month:
                "long",

            year:
                "numeric",

            hour:
                "2-digit",

            minute:
                "2-digit",

            second:
                "2-digit",

            hour12:
                false
        }
    ).format(date);

}


function timestamp() {

    const date =
        new Date();

    const pad =
        number =>
            String(number)
            .padStart(2, "0");

    return (
        date.getFullYear() +
        "-" +
        pad(date.getMonth() + 1) +
        "-" +
        pad(date.getDate()) +
        " " +
        pad(date.getHours()) +
        ":" +
        pad(date.getMinutes()) +
        ":" +
        pad(date.getSeconds())
    );

}


function escapeHTML(
    value
) {

    return String(value ?? "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* ============================================================
   TOAST
   ============================================================ */

function showToast(
    message,
    type = "info"
) {

    const root =
        $("toastRoot");

    if (!root) return;

    const toast =
        document.createElement("div");

    toast.className =
        "toast " + type;

    toast.textContent =
        message;

    root.appendChild(
        toast
    );

    setTimeout(
        () => {

            toast.remove();

        },
        3500
    );

}


/* ============================================================
   CLOCK
   ============================================================ */

function updateClock() {

    const clock =
        $("liveClock");

    if (!clock) return;

    clock.textContent =
        formatDateTime();

}


function startClock() {

    updateClock();

    setInterval(
        updateClock,
        1000
    );

}


/* ============================================================
   STORE STATUS
   ============================================================ */

function updateStoreStatus() {

    const status =
        $("storeStatus");

    const text =
        $("storeStatusText");

    if (!status || !text) return;

    const now =
        new Date();

    const hour =
        Number(
            new Intl.DateTimeFormat(
                "id-ID",
                {
                    timeZone:
                        "Asia/Jakarta",
                    hour:
                        "2-digit",
                    hour12:
                        false
                }
            ).format(now)
        );

    const open =
        hour >= 8 &&
        hour < 23;

    status.classList.toggle(
        "is-open",
        open
    );

    status.classList.toggle(
        "is-closed",
        !open
    );

    text.textContent =
        open
            ? "BUKA"
            : "TUTUP";

}


/* ============================================================
   BRANDING
   ============================================================ */

function renderBranding() {

    const settings =
        database.settings;

    $("brandName").textContent =
        settings.name;

    $("brandTagline").textContent =
        settings.tagline;

    $("footerBrand").textContent =
        settings.name;

    $("footerPolicy").textContent =
        settings.policy;

    document.title =
        settings.name;

    const logo =
        $("brandLogo");

    const fallback =
        $("brandLogoFallback");

    if (settings.logo) {

        logo.src =
            settings.logo;

        logo.classList.add(
            "has-image"
        );

        fallback.style.display =
            "none";

        logo.onerror =
            () => {

                logo.classList.remove(
                    "has-image"
                );

                fallback.style.display =
                    "block";

            };

    } else {

        logo.classList.remove(
            "has-image"
        );

        logo.removeAttribute(
            "src"
        );

        fallback.style.display =
            "block";

    }


    const favicon =
        $("favicon");

    if (settings.favicon) {

        favicon.href =
            settings.favicon;

    } else {

        favicon.removeAttribute(
            "href"
        );

    }


    $("socialInstagram").href =
        settings.instagram ||
        "#";

    $("socialTiktok").href =
        settings.tiktok ||
        "#";

    $("socialWhatsapp").href =
        waLink(
            settings.phone
        );


    renderAnnouncement();

    renderGoogleMap();

}


function renderAnnouncement() {

    const bar =
        $("announcementBar");

    const text =
        $("announcementText");

    if (
        !database.settings.announcementEnabled
    ) {

        bar.classList.add(
            "hidden"
        );

        return;

    }

    bar.classList.remove(
        "hidden"
    );

    text.textContent =
        database.settings.announcement;

}


function renderGoogleMap() {

    const container =
        $("googleMap");

    const map =
        database.settings.googleMap;

    if (!map) {

        container.innerHTML =
            `
            <div class="map-empty">
                Google Maps belum diatur dari Dashboard Owner.
            </div>
            `;

        return;

    }

    container.innerHTML =
        `
        <iframe
            src="${escapeHTML(map)}"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            allowfullscreen
        ></iframe>
        `;

}


/* ============================================================
   CATALOG
   ============================================================ */

function getCategories() {

    const categories =
        database.products
        .filter(
            product =>
                product.active
        )
        .map(
            product =>
                product.category
        );

    return [
        "Semua",
        ...new Set(categories)
    ];

}


function renderCategoryTabs() {

    const categories =
        getCategories();

    const html =
        categories
        .map(
            category =>
                `
                <button
                    type="button"
                    class="category-tab ${
                        category === activeCategory
                            ? "active"
                            : ""
                    }"
                    data-category="${escapeHTML(category)}"
                >
                    ${escapeHTML(category)}
                </button>
                `
        )
        .join("");

    $("categoryTabs").innerHTML =
        html;

}


function renderPosCategoryTabs() {

    const categories =
        getCategories();

    const html =
        categories
        .map(
            category =>
                `
                <button
                    type="button"
                    class="category-tab ${
                        category === activePosCategory
                            ? "active"
                            : ""
                    }"
                    data-pos-category="${escapeHTML(category)}"
                >
                    ${escapeHTML(category)}
                </button>
                `
        )
        .join("");

    $("posCategoryTabs").innerHTML =
        html;

}


function productCard(
    product,
    pos = false
) {

    const buttonText =
        pos
            ? "Tambah"
            : "Tambah ke Keranjang";

    const image =
        product.image
            ?
                `
                <img
                    src="${escapeHTML(product.image)}"
                    alt="${escapeHTML(product.name)}"
                    loading="lazy"
                >
                `
            :
                `
                <div class="product-placeholder">
                    ☕
                </div>
                `;

    return `
        <article class="product-card">

            <div class="product-image">
                ${image}
            </div>

            <div class="product-body">

                <div class="product-category">
                    ${escapeHTML(product.category)}
                </div>

                <h3>
                    ${escapeHTML(product.name)}
                </h3>

                <p>
                    ${escapeHTML(product.description)}
                </p>

                <div class="product-bottom">

                    <strong>
                        ${rupiah(product.price)}
                    </strong>

                    <button
                        type="button"
                        class="btn btn-amber btn-small"
                        data-add-product="${escapeHTML(product.id)}"
                    >
                        ${buttonText}
                    </button>

                </div>

            </div>

        </article>
    `;

}


function renderCatalog() {

    renderCategoryTabs();

    const products =
        database.products
        .filter(
            product =>
                product.active
        )
        .filter(
            product =>
                activeCategory === "Semua" ||
                product.category === activeCategory
        );

    const grid =
        $("catalogGrid");

    if (!products.length) {

        grid.innerHTML =
            `
            <div class="empty-state">
                Belum ada menu.
            </div>
            `;

        return;

    }

    grid.innerHTML =
        products
        .map(
            product =>
                productCard(
                    product,
                    false
                )
        )
        .join("");

}


function renderPosCatalog() {

    renderPosCategoryTabs();

    const products =
        database.products
        .filter(
            product =>
                product.active
        )
        .filter(
            product =>
                activePosCategory === "Semua" ||
                product.category === activePosCategory
        );

    const grid =
        $("posCatalogGrid");

    if (!products.length) {

        grid.innerHTML =
            `
            <div class="empty-state">
                Belum ada menu.
            </div>
            `;

        return;

    }

    grid.innerHTML =
        products
        .map(
            product =>
                productCard(
                    product,
                    true
                )
        )
        .join("");

}


/* ============================================================
   CAROUSEL
   ============================================================ */

function renderCarousel() {

    const slides =
        $("promoSlides");

    const dots =
        $("promoDots");

    const banners = [
        {
            title:
                "Mainstay Coffee",

            text:
                "Kopi, makanan, dan momen terbaik untuk kamu.",

            type:
                "placeholder",

            voucher:
                ""
        }
    ];

    slides.innerHTML =
        banners
        .map(
            (banner, index) =>
                `
                <div
                    class="promo-slide ${
                        index === carouselIndex
                            ? "active"
                            : ""
                    }"
                    data-slide="${index}"
                    data-voucher="${escapeHTML(banner.voucher)}"
                >

                    <div class="banner-placeholder">
                        ☕
                    </div>

                    <div class="promo-overlay">

                        <div>

                            <h3>
                                ${escapeHTML(banner.title)}
                            </h3>

                            <p>
                                ${escapeHTML(banner.text)}
                            </p>

                        </div>

                    </div>

                </div>
                `
        )
        .join("");

    dots.innerHTML =
        banners
        .map(
            (_, index) =>
                `
                <button
                    type="button"
                    class="carousel-dot ${
                        index === carouselIndex
                            ? "active"
                            : ""
                    }"
                    data-slide-dot="${index}"
                    aria-label="Slide ${index + 1}"
                ></button>
                `
        )
        .join("");

}


function goToSlide(
    index
) {

    const slides =
        document.querySelectorAll(
            ".promo-slide"
        );

    const dots =
        document.querySelectorAll(
            ".carousel-dot"
        );

    if (!slides.length) return;

    carouselIndex =
        (
            index +
            slides.length
        ) %
        slides.length;

    slides.forEach(
        (slide, i) => {

            slide.classList.toggle(
                "active",
                i === carouselIndex
            );

        }
    );

    dots.forEach(
        (dot, i) => {

            dot.classList.toggle(
                "active",
                i === carouselIndex
            );

        }
    );

}


function startCarousel() {

    clearInterval(
        carouselTimer
    );

    carouselTimer =
        setInterval(
            () => {

                goToSlide(
                    carouselIndex + 1
                );

            },
            7000
        );

}


/* ============================================================
   CART
   ============================================================ */

function addToCart(
    productId
) {

    const product =
        database.products.find(
            item =>
                item.id === productId
        );

    if (!product) return;

    const existing =
        cart.find(
            item =>
                item.productId === productId
        );

    if (existing) {

        existing.quantity += 1;

    } else {

        cart.push({
            productId:
                product.id,

            name:
                product.name,

            price:
                Number(product.price),

            quantity:
                1
        });

    }

    renderCart();

    showToast(
        `${product.name} ditambahkan.`,
        "success"
    );

}


function changeCartQuantity(
    productId,
    amount
) {

    const item =
        cart.find(
            row =>
                row.productId === productId
        );

    if (!item) return;

    item.quantity += amount;

    if (item.quantity <= 0) {

        cart =
            cart.filter(
                row =>
                    row.productId !== productId
            );

    }

    renderCart();

}


function removeFromCart(
    productId
) {

    cart =
        cart.filter(
            item =>
                item.productId !== productId
        );

    renderCart();

}


function calculateSubtotal() {

    return cart.reduce(
        (
            total,
            item
        ) =>
            total +
            item.price *
            item.quantity,
        0
    );

}


/* ============================================================
   VOUCHER
   ============================================================ */

function findVoucher(
    code,
    phone
) {

    const normalizedCode =
        String(code || "")
        .trim()
        .toUpperCase();

    const normalizedPhone =
        normalizePhone(phone);

    return database.vouchers.find(
        voucher => {

            if (!voucher.active) {
                return false;
            }

            if (
                voucher.code
                .toUpperCase() !==
                normalizedCode
            ) {

                return false;

            }

            if (
                voucher.target ===
                "all"
            ) {

                return true;

            }

            return (
                normalizePhone(
                    voucher.phone
                ) ===
                normalizedPhone
            );

        }
    );

}


function calculateDiscount(
    voucher,
    subtotal
) {

    if (!voucher) return 0;

    if (
        voucher.type ===
        "percent"
    ) {

        return Math.min(
            subtotal,
            Math.round(
                subtotal *
                (
                    Number(
                        voucher.value
                    ) /
                    100
                )
            )
        );

    }

    return Math.min(
        subtotal,
        Number(
            voucher.value
        )
    );

}


function applyVoucher() {

    const code =
        $("voucherCode")
        .value;

    const phone =
        $("customerPhone")
        .value;

    if (!code) {

        showToast(
            "Masukkan kode voucher.",
            "error"
        );

        return;

    }

    const voucher =
        findVoucher(
            code,
            phone
        );

    if (!voucher) {

        activeVoucher =
            null;

        renderCart();

        showToast(
            "Voucher tidak valid atau tidak sesuai pelanggan.",
            "error"
        );

        return;

    }

    activeVoucher =
        voucher;

    renderCart();

    showToast(
        "Voucher berhasil digunakan.",
        "success"
    );

}


function renderActiveVoucher(
    discount
) {

    const container =
        $("activeVoucher");

    if (!activeVoucher) {

        container.classList.add(
            "hidden"
        );

        container.innerHTML =
            "";

        return;

    }

    container.classList.remove(
        "hidden"
    );

    container.innerHTML =
        `
        <span>
            ${escapeHTML(activeVoucher.code)}
            · Hemat ${rupiah(discount)}
        </span>

        <button
            id="removeVoucher"
            class="btn btn-small btn-danger"
            type="button"
        >
            Hapus
        </button>
        `;

}


/* ============================================================
   RENDER CART
   ============================================================ */

function renderCart() {

    const container =
        $("cartItems");

    const count =
        cart.reduce(
            (
                total,
                item
            ) =>
                total +
                item.quantity,
            0
        );

    $("cartCount").textContent =
        `${count} item`;

    if (!cart.length) {

        container.innerHTML =
            `
            <div class="empty-state">
                Keranjang masih kosong.
            </div>
            `;

    } else {

        container.innerHTML =
            cart
            .map(
                item =>
                    `
                    <div class="cart-row">

                        <div>

                            <strong>
                                ${escapeHTML(item.name)}
                            </strong>

                            <small>
                                ${rupiah(item.price)}
                                ×
                                ${item.quantity}
                            </small>

                        </div>

                        <div class="cart-actions">

                            <button
                                class="qty-btn"
                                type="button"
                                data-cart-minus="${escapeHTML(item.productId)}"
                            >
                                −
                            </button>

                            <strong>
                                ${item.quantity}
                            </strong>

                            <button
                                class="qty-btn"
                                type="button"
                                data-cart-plus="${escapeHTML(item.productId)}"
                            >
                                +
                            </button>

                            <button
                                class="remove-btn"
                                type="button"
                                data-cart-remove="${escapeHTML(item.productId)}"
                            >
                                ×
                            </button>

                        </div>

                    </div>
                    `
            )
            .join("");

    }

    const subtotal =
        calculateSubtotal();

    const discount =
        calculateDiscount(
            activeVoucher,
            subtotal
        );

    const total =
        Math.max(
            0,
            subtotal - discount
        );

    $("cartSubtotal").textContent =
        rupiah(subtotal);

    $("cartDiscount").textContent =
        rupiah(discount);

    $("cartTotal").textContent =
        rupiah(total);

    renderActiveVoucher(
        discount
    );

}


/* ============================================================
   MEMBER
   ============================================================ */

function findMember(
    phone
) {

    const normalized =
        normalizePhone(phone);

    return database.members.find(
        member =>
            normalizePhone(
                member.phone
            ) === normalized
    );

}


function registerMember() {

    const name =
        $("memberRegisterName")
        .value
        .trim();

    const phone =
        normalizePhone(
            $("memberRegisterPhone")
            .value
        );

    if (!name || !phone) {

        showToast(
            "Nama dan nomor WhatsApp wajib diisi.",
            "error"
        );

        return;

    }

    const existing =
        findMember(phone);

    if (existing) {

        existing.name =
            name;

    } else {

        database.members.push({

            id:
                crypto.randomUUID
                ? crypto.randomUUID()
                : String(
                    Date.now()
                ),

            name:
                name,

            phone:
                phone,

            createdAt:
                timestamp(),

            stampCount:
                0

        });

    }

    saveDatabase();

    renderDashboardStats();

    const broadcast =
        database.settings.broadcast;

    if (broadcast) {

        window.open(
            broadcast,
            "_blank",
            "noopener"
        );

    } else {

        window.open(
            waLink(
                database.settings.phone
            ),
            "_blank",
            "noopener"
        );

    }

    showToast(
        "Member berhasil didaftarkan.",
        "success"
    );

}


function renderStampCard(
    member
) {

    const target =
        Number(
            database.loyalty.target
        );

    const current =
        Number(
            member.stampCount || 0
        );

    let stamps = "";

    for (
        let i = 1;
        i <= target;
        i++
    ) {

        stamps +=
            `
            <div
                class="stamp ${
                    i <= current
                        ? "active"
                        : ""
                }"
            >
                ${
                    i <= current
                        ? "✓"
                        : i
                }
            </div>
            `;

    }

    const remaining =
        Math.max(
            0,
            target - current
        );

    return `
        <div class="stamp-card">

            <div class="stamp-card-header">

                <strong>
                    ${escapeHTML(member.name)}
                </strong>

                <span class="stamp-count">
                    ${current} / ${target}
                </span>

            </div>

            <div class="stamp-grid">
                ${stamps}
            </div>

            <div class="stamp-card-footer">

                ${
                    remaining > 0
                        ? `Kurang ${remaining} stempel lagi untuk hadiah.`
                        : "Stempel penuh! Voucher hadiah tersedia."
                }

            </div>

        </div>
    `;

}


function checkMember() {

    const phone =
        normalizePhone(
            $("memberCheckPhone")
            .value
        );

    const result =
        $("stampResult");

    if (!phone) {

        result.innerHTML =
            `
            <div class="empty-state">
                Masukkan nomor WhatsApp.
            </div>
            `;

        return;

    }

    const member =
        findMember(phone);

    if (!member) {

        result.innerHTML =
            `
            <div class="empty-state">
                Member tidak ditemukan.
            </div>
            `;

        return;

    }

    result.innerHTML =
        renderStampCard(
            member
        );

}


/* ============================================================
   STAMP ENGINE
   ============================================================ */

function addOfficialStamp(
    phone,
    transactionId,
    total
) {

    const member =
        findMember(phone);

    if (!member) {

        return {
            added: false,
            count: 0,
            reason:
                "Bukan member"
        };

    }

    const minimum =
        Number(
            database.loyalty.minimum
        );

    if (
        Number(total) <
        minimum
    ) {

        return {
            added: false,
            count:
                Number(
                    member.stampCount || 0
                ),
            reason:
                "Belanja belum mencapai minimum"
        };

    }

    member.stampCount =
        Number(
            member.stampCount || 0
        ) + 1;

    const stampRecord = {

        id:
            crypto.randomUUID
            ? crypto.randomUUID()
            : String(
                Date.now()
            ),

        memberId:
            member.id,

        phone:
            member.phone,

        transactionId:
            transactionId,

        stampNumber:
            member.stampCount,

        total:
            Number(total),

        timestamp:
            timestamp()

    };

    database.stamps.push(
        stampRecord
    );

    const target =
        Number(
            database.loyalty.target
        );

    let reward = null;

    if (
        member.stampCount >=
        target
    ) {

        const expiry =
            calculateExpiryDate();

        reward = {

            code:
                "LOYALTY-" +
                Date.now(),

            expiresAt:
                expiry,

            createdAt:
                timestamp()

        };

    }

    return {

        added: true,

        count:
            member.stampCount,

        reward:
            reward

    };

}


function calculateExpiryDate() {

    const now =
        new Date();

    const value =
        Number(
            database.loyalty.expiryValue
        );

    if (
        database.loyalty.expiryUnit ===
        "hours"
    ) {

        now.setHours(
            now.getHours() +
            value
        );

    } else {

        now.setDate(
            now.getDate() +
            value
        );

    }

    return now.toISOString();

}


/* ============================================================
   TRANSACTION
   ============================================================ */

function processPayment() {

    if (!cart.length) {

        showToast(
            "Keranjang masih kosong.",
            "error"
        );

        return;

    }

    const name =
        $("customerName")
        .value
        .trim();

    const phone =
        normalizePhone(
            $("customerPhone")
            .value
        );

    const paymentMethod =
        $("paymentMethod")
        .value;

    const subtotal =
        calculateSubtotal();

    const discount =
        calculateDiscount(
            activeVoucher,
            subtotal
        );

    const total =
        Math.max(
            0,
            subtotal - discount
        );

    const transactionId =
        "MC-" +
        Date.now();

    const transactionTime =
        timestamp();

    let stampResult = {

        added: false,

        count: 0

    };

    if (phone) {

        stampResult =
            addOfficialStamp(
                phone,
                transactionId,
                total
            );

    }

    const transaction = {

        id:
            transactionId,

        timestamp:
            transactionTime,

        customerName:
            name || "Pelanggan",

        customerPhone:
            phone,

        items:
            deepClone(cart),

        subtotal:
            subtotal,

        discount:
            discount,

        total:
            total,

        voucher:
            activeVoucher
                ? activeVoucher.code
                : "",

        paymentMethod:
            paymentMethod,

        stampAdded:
            stampResult.added,

        officialStampCount:
            stampResult.count,

        reward:
            stampResult.reward || null

    };

    database.transactions.push(
        transaction
    );

    saveDatabase();

    renderDashboardStats();

    createReceipt(
        transaction
    );

    cart = [];

    activeVoucher = null;

    $("customerName").value =
        "";

    $("customerPhone").value =
        "";

    $("voucherCode").value =
        "";

    renderCart();

    if (
        stampResult.added
    ) {

        showToast(
            `Transaksi berhasil. Stempel resmi sekarang ${stampResult.count}.`,
            "success"
        );

    } else {

        showToast(
            "Transaksi berhasil.",
            "success"
        );

    }

    openModal(
        "receiptModal"
    );

}


/* ============================================================
   WHATSAPP
   ============================================================ */

function waLink(
    phone,
    message = ""
) {

    const normalized =
        normalizePhone(phone);

    if (!normalized) {

        return "#";

    }

    const base =
        "https://wa.me/" +
        normalized;

    if (!message) {

        return base;

    }

    return (
        base +
        "?text=" +
        encodeURIComponent(
            message
        )
    );

}


function createWhatsappMessage(
    transaction
) {

    const lines = [];

    lines.push(
        `*${database.settings.name}*`
    );

    lines.push(
        "━━━━━━━━━━━━━━━━"
    );

    lines.push(
        `Status: *LUNAS*`
    );

    lines.push(
        `ID: ${transaction.id}`
    );

    lines.push(
        `Tanggal: ${transaction.timestamp}`
    );

    lines.push("");

    transaction.items.forEach(
        item => {

            const itemTotal =
                item.price *
                item.quantity;

            lines.push(
                `${item.name} x${item.quantity} = ${rupiah(itemTotal)}`
            );

        }
    );

    lines.push("");

    lines.push(
        `Subtotal: ${rupiah(transaction.subtotal)}`
    );

    lines.push(
        `Diskon: ${rupiah(transaction.discount)}`
    );

    lines.push(
        `*TOTAL: ${rupiah(transaction.total)}*`
    );

    lines.push(
        `Bayar: ${transaction.paymentMethod}`
    );

    lines.push("");

    lines.push(
        `Stempel Resmi Terakhir: ${transaction.officialStampCount}`
    );

    if (transaction.reward) {

        lines.push("");

        lines.push(
            `🎁 Voucher Loyalty: ${transaction.reward.code}`
        );

        lines.push(
            `Berlaku sampai: ${new Date(transaction.reward.expiresAt).toLocaleString("id-ID")}`
        );

    }

    lines.push("");

    lines.push(
        database.settings.policy
    );

    return lines.join("\n");

}


/* ============================================================
   THERMAL RECEIPT
   ============================================================ */

function createThermalReceipt(
    transaction
) {

    const width = 32;

    const line =
        "-".repeat(width);

    const lines = [];

    lines.push(
        centerText(
            database.settings.name,
            width
        )
    );

    lines.push(
        centerText(
            database.settings.tagline,
            width
        )
    );

    lines.push(line);

    lines.push(
        `ID : ${transaction.id}`
    );

    lines.push(
        `WIB: ${transaction.timestamp}`
    );

    lines.push(line);

    transaction.items.forEach(
        item => {

            lines.push(
                item.name
            );

            lines.push(
                `${item.quantity} x ${rupiah(item.price)}`
            );

        }
    );

    lines.push(line);

    lines.push(
        `SUBTOTAL : ${rupiah(transaction.subtotal)}`
    );

    lines.push(
        `DISKON   : ${rupiah(transaction.discount)}`
    );

    lines.push(
        `TOTAL    : ${rupiah(transaction.total)}`
    );

    lines.push(
        `BAYAR    : ${transaction.paymentMethod}`
    );

    lines.push(line);

    lines.push(
        `STEMPEL RESMI: ${transaction.officialStampCount}`
    );

    if (transaction.reward) {

        lines.push("");

        lines.push(
            "LOYALTY PENUH!"
        );

        lines.push(
            transaction.reward.code
        );

    }

    lines.push("");

    lines.push(
        centerText(
            "TERIMA KASIH",
            width
        )
    );

    return lines.join("\n");

}


function centerText(
    text,
    width
) {

    const value =
        String(text);

    if (
        value.length >=
        width
    ) {

        return value.substring(
            0,
            width
        );

    }

    const left =
        Math.floor(
            (
                width -
                value.length
            ) / 2
        );

    return (
        " ".repeat(left) +
        value
    );

}


function createReceipt(
    transaction
) {

    const message =
        createWhatsappMessage(
            transaction
        );

    $("whatsappReceipt")
        .value =
        message;

    $("openWhatsappReceipt")
        .href =
        waLink(
            transaction.customerPhone ||
            database.settings.phone,
            message
        );

    $("thermalReceipt")
        .textContent =
        createThermalReceipt(
            transaction
        );

}


/* ============================================================
   OWNER LOGIN
   ============================================================ */

function loginInternal() {

    const pin =
        $("loginPin")
        .value
        .trim();

    if (!pin) {

        showToast(
            "Masukkan PIN.",
            "error"
        );

        return;

    }

    if (
        pin ===
        database.owner.pin
    ) {

        currentSession = {

            role:
                "owner",

            name:
                database.owner.name

        };

        closeModal(
            "loginModal"
        );

        $("loginPin").value =
            "";

        showDashboard();

        showToast(
            "Login Owner berhasil.",
            "success"
        );

        return;

    }

    const staff =
        database.staff.find(
            person =>
                person.pin === pin
        );

    if (staff) {

        currentSession = {

            role:
                "staff",

            name:
                staff.name,

            staffId:
                staff.id

        };

        closeModal(
            "loginModal"
        );

        $("loginPin").value =
            "";

        showPos();

        showToast(
            `Selamat datang, ${staff.name}.`,
            "success"
        );

        return;

    }

    showToast(
        "PIN tidak ditemukan.",
        "error"
    );

}


/* ============================================================
   DASHBOARD
   ============================================================ */

function showDashboard() {

    $("dashboardSection")
        .classList.remove(
            "hidden"
        );

    $("posSection")
        .classList.add(
            "hidden"
        );

    $("dashboardSection")
        .scrollIntoView({
            behavior: "smooth"
        });

    fillDashboardForms();

    renderDashboard();

}


function showPos() {

    $("posSection")
        .classList.remove(
            "hidden"
        );

    $("dashboardSection")
        .classList.add(
            "hidden"
        );

    $("posSection")
        .scrollIntoView({
            behavior: "smooth"
        });

}


function closeDashboard() {

    $("dashboardSection")
        .classList.add(
            "hidden"
        );

    $("posSection")
        .classList.add(
            "hidden"
        );

    currentSession =
        null;

}


/* ============================================================
   DASHBOARD FORMS
   ============================================================ */

function fillDashboardForms() {

    const settings =
        database.settings;

    $("settingName").value =
        settings.name;

    $("settingTagline").value =
        settings.tagline;

    $("settingPhone").value =
        settings.phone;

    $("settingBroadcast").value =
        settings.broadcast;

    $("settingPolicy").value =
        settings.policy;

    $("settingAnnouncement").value =
        settings.announcement;

    $("settingAnnouncementEnabled").checked =
        settings.announcementEnabled;

    $("settingLogoUrl").value =
        settings.logo;

    $("settingFaviconUrl").value =
        settings.favicon;

    $("settingQrisUrl").value =
        settings.qris;

    $("settingMap").value =
        settings.googleMap;


    $("loyaltyMinimum").value =
        database.loyalty.minimum;

    $("loyaltyTarget").value =
        database.loyalty.target;

    $("loyaltyExpiryValue").value =
        database.loyalty.expiryValue;

    $("loyaltyExpiryUnit").value =
        database.loyalty.expiryUnit;


    $("ownerName").value =
        database.owner.name;

    $("ownerPin").value =
        database.owner.pin;

    $("ownerPhone").value =
        database.owner.phone;


    resetVoucherForm();

    resetStaffForm();

}


function saveBranding() {

    const settings =
        database.settings;

    settings.name =
        $("settingName")
        .value
        .trim() ||
        "Mainstay Coffee";

    settings.tagline =
        $("settingTagline")
        .value
        .trim();

    settings.phone =
        normalizePhone(
            $("settingPhone")
            .value
        );

    settings.broadcast =
        $("settingBroadcast")
        .value
        .trim();

    settings.policy =
        $("settingPolicy")
        .value
        .trim();

    settings.announcement =
        $("settingAnnouncement")
        .value
        .trim();

    settings.announcementEnabled =
        $("settingAnnouncementEnabled")
        .checked;

    settings.logo =
        $("settingLogoUrl")
        .value
        .trim();

    settings.favicon =
        $("settingFaviconUrl")
        .value
        .trim();

    settings.qris =
        $("settingQrisUrl")
        .value
        .trim();

    settings.googleMap =
        $("settingMap")
        .value
        .trim();

    if (
        !settings.instagram
    ) {

        settings.instagram =
            "https://instagram.com/";

    }

    if (
        !settings.tiktok
    ) {

        settings.tiktok =
            "https://tiktok.com/";

    }

    settings.whatsapp =
        waLink(
            settings.phone
        );

    saveDatabase();

    renderBranding();

    showToast(
        "Branding berhasil disimpan.",
        "success"
    );

}


function saveLoyalty() {

    const minimum =
        Number(
            $("loyaltyMinimum")
            .value
        );

    const target =
        Number(
            $("loyaltyTarget")
            .value
        );

    const expiryValue =
        Number(
            $("loyaltyExpiryValue")
            .value
        );

    const expiryUnit =
        $("loyaltyExpiryUnit")
        .value;

    if (
        minimum < 0 ||
        target < 1 ||
        expiryValue < 1
    ) {

        showToast(
            "Nilai loyalty tidak valid.",
            "error"
        );

        return;

    }

    database.loyalty = {

        minimum:
            minimum,

        target:
            target,

        expiryValue:
            expiryValue,

        expiryUnit:
            expiryUnit

    };

    saveDatabase();

    showToast(
        "Pengaturan loyalty disimpan.",
        "success"
    );

}


/* ============================================================
   OWNER
   ============================================================ */

function saveOwner() {

    const name =
        $("ownerName")
        .value
        .trim();

    const pin =
        $("ownerPin")
        .value
        .trim();

    const phone =
        normalizePhone(
            $("ownerPhone")
            .value
        );

    if (
        !name ||
        !pin
    ) {

        showToast(
            "Nama dan PIN Owner wajib diisi.",
            "error"
        );

        return;

    }

    database.owner = {

        name:
            name,

        pin:
            pin,

        phone:
            phone

    };

    saveDatabase();

    updateOwnerDirectWA();

    showToast(
        "Profil Owner disimpan.",
        "success"
    );

}


function updateOwnerDirectWA() {

    $("ownerDirectWa").href =
        waLink(
            database.owner.phone
        );

}


/* ============================================================
   STAFF
   ============================================================ */

function resetStaffForm() {

    editingStaffId =
        null;

    $("staffName").value =
        "";

    $("staffPin").value =
        "";

    $("staffPhone").value =
        "";

    $("staffSalaryCategory")
        .value =
        "Bulanan";

    $("staffSalary").value =
        "";

    $("saveStaff").textContent =
        "Tambah Staf";

    $("cancelStaffEdit")
        .classList.add(
            "hidden"
        );

}


function saveStaff() {

    const name =
        $("staffName")
        .value
        .trim();

    const pin =
        $("staffPin")
        .value
        .trim();

    const phone =
        normalizePhone(
            $("staffPhone")
            .value
        );

    const salaryCategory =
        $("staffSalaryCategory")
        .value;

    const salary =
        Number(
            $("staffSalary")
            .value
        ) || 0;

    if (
        !name ||
        !pin
    ) {

        showToast(
            "Nama dan PIN staf wajib diisi.",
            "error"
        );

        return;

    }

    if (editingStaffId) {

        const staff =
            database.staff.find(
                person =>
                    person.id ===
                    editingStaffId
            );

        if (staff) {

            staff.name =
                name;

            staff.pin =
                pin;

            staff.phone =
                phone;

            staff.salaryCategory =
                salaryCategory;

            staff.salary =
                salary;

        }

        showToast(
            "Profil staf diperbarui.",
            "success"
        );

    } else {

        database.staff.push({

            id:
                crypto.randomUUID
                ? crypto.randomUUID()
                : String(
                    Date.now()
                ),

            name:
                name,

            pin:
                pin,

            phone:
                phone,

            salaryCategory:
                salaryCategory,

            salary:
                salary,

            createdAt:
                timestamp()

        });

        showToast(
            "Staf berhasil ditambahkan.",
            "success"
        );

    }

    saveDatabase();

    resetStaffForm();

    renderStaffTable();

    renderDashboardStats();

}


function editStaff(
    id
) {

    const staff =
        database.staff.find(
            person =>
                person.id === id
        );

    if (!staff) return;

    editingStaffId =
        id;

    $("staffName").value =
        staff.name;

    $("staffPin").value =
        staff.pin;

    $("staffPhone").value =
        staff.phone;

    $("staffSalaryCategory")
        .value =
        staff.salaryCategory;

    $("staffSalary").value =
        staff.salary;

    $("saveStaff").textContent =
        "Simpan Perubahan";

    $("cancelStaffEdit")
        .classList.remove(
            "hidden"
        );

}


function deleteStaff(
    id
) {

    const staff =
        database.staff.find(
            person =>
                person.id === id
        );

    if (!staff) return;

    const confirmed =
        window.confirm(
            `Hapus staf ${staff.name}?`
        );

    if (!confirmed) return;

    database.staff =
        database.staff.filter(
            person =>
                person.id !== id
        );

    saveDatabase();

    renderStaffTable();

    renderDashboardStats();

    showToast(
        "Staf dihapus.",
        "success"
    );

}


function renderStaffTable() {

    const tbody =
        $("staffTable");

    if (!database.staff.length) {

        tbody.innerHTML =
            `
            <tr>
                <td colspan="4">
                    Belum ada staf.
                </td>
            </tr>
            `;

        return;

    }

    tbody.innerHTML =
        database.staff
        .map(
            staff =>
                `
                <tr>

                    <td>
                        ${escapeHTML(staff.name)}
                    </td>

                    <td>
                        ${escapeHTML(staff.phone || "-")}
                    </td>

                    <td>
                        ${escapeHTML(staff.salaryCategory)}
                        ·
                        ${rupiah(staff.salary)}
                    </td>

                    <td>

                        <div class="table-actions">

                            <button
                                type="button"
                                data-edit-staff="${escapeHTML(staff.id)}"
                            >
                                Edit
                            </button>

                            <button
                                type="button"
                                data-delete-staff="${escapeHTML(staff.id)}"
                            >
                                Hapus
                            </button>

                            <a
                                href="${waLink(staff.phone)}"
                                target="_blank"
                                rel="noopener"
                            >
                                Direct WA
                            </a>

                        </div>

                    </td>

                </tr>
                `
        )
        .join("");

}


/* ============================================================
   VOUCHER ADMIN
   ============================================================ */

function resetVoucherForm() {

    editingVoucherId =
        null;

    $("voucherAdminCode").value =
        "";

    $("voucherAdminType").value =
        "percent";

    $("voucherAdminValue").value =
        "";

    $("voucherAdminTarget").value =
        "all";

    $("voucherAdminPhone").value =
        "";

    $("voucherAdminActive").checked =
        true;

    $("saveVoucher").textContent =
        "Simpan Voucher";

    $("cancelVoucherEdit")
        .classList.add(
            "hidden"
        );

}


function saveVoucherAdmin() {

    const code =
        $("voucherAdminCode")
        .value
        .trim()
        .toUpperCase();

    const type =
        $("voucherAdminType")
        .value;

    const value =
        Number(
            $("voucherAdminValue")
            .value
        );

    const target =
        $("voucherAdminTarget")
        .value;

    const phone =
        normalizePhone(
            $("voucherAdminPhone")
            .value
        );

    const active =
        $("voucherAdminActive")
        .checked;

    if (
        !code ||
        value <= 0
    ) {

        showToast(
            "Kode dan nilai voucher wajib diisi.",
            "error"
        );

        return;

    }

    if (
        target ===
        "specific" &&
        !phone
    ) {

        showToast(
            "Nomor WhatsApp target wajib diisi.",
            "error"
        );

        return;

    }

    const duplicate =
        database.vouchers.find(
            voucher =>
                voucher.code === code &&
                voucher.id !== editingVoucherId
        );

    if (duplicate) {

        showToast(
            "Kode voucher sudah digunakan.",
            "error"
        );

        return;

    }

    if (editingVoucherId) {

        const voucher =
            database.vouchers.find(
                item =>
                    item.id ===
                    editingVoucherId
            );

        if (voucher) {

            voucher.code =
                code;

            voucher.type =
                type;

            voucher.value =
                value;

            voucher.target =
                target;

            voucher.phone =
                phone;

            voucher.active =
                active;

        }

        showToast(
            "Voucher diperbarui.",
            "success"
        );

    } else {

        database.vouchers.push({

            id:
                crypto.randomUUID
                ? crypto.randomUUID()
                : String(
                    Date.now()
                ),

            code:
                code,

            type:
                type,

            value:
                value,

            target:
                target,

            phone:
                phone,

            active:
                active,

            createdAt:
                timestamp()

        });

        showToast(
            "Voucher berhasil ditambahkan.",
            "success"
        );

    }

    saveDatabase();

    resetVoucherForm();

    renderVoucherTable();

}


function editVoucher(
    id
) {

    const voucher =
        database.vouchers.find(
            item =>
                item.id === id
        );

    if (!voucher) return;

    editingVoucherId =
        id;

    $("voucherAdminCode").value =
        voucher.code;

    $("voucherAdminType").value =
        voucher.type;

    $("voucherAdminValue").value =
        voucher.value;

    $("voucherAdminTarget").value =
        voucher.target;

    $("voucherAdminPhone").value =
        voucher.phone || "";

    $("voucherAdminActive").checked =
        voucher.active;

    $("saveVoucher").textContent =
        "Simpan Perubahan";

    $("cancelVoucherEdit")
        .classList.remove(
            "hidden"
        );

}


function deleteVoucher(
    id
) {

    database.vouchers =
        database.vouchers.filter(
            voucher =>
                voucher.id !== id
        );

    if (
        activeVoucher &&
        activeVoucher.id === id
    ) {

        activeVoucher =
            null;

        renderCart();

    }

    saveDatabase();

    renderVoucherTable();

    showToast(
        "Voucher dihapus.",
        "success"
    );

}


function renderVoucherTable() {

    const tbody =
        $("voucherTable");

    if (!database.vouchers.length) {

        tbody.innerHTML =
            `
            <tr>
                <td colspan="5">
                    Belum ada voucher.
                </td>
            </tr>
            `;

        return;

    }

    tbody.innerHTML =
        database.vouchers
        .map(
            voucher => {

                const discount =
                    voucher.type ===
                    "percent"
                        ? `${voucher.value}%`
                        : rupiah(voucher.value);

                const target =
                    voucher.target ===
                    "all"
                        ? "Semua"
                        : voucher.phone;

                return `
                    <tr>

                        <td>
                            <strong>
                                ${escapeHTML(voucher.code)}
                            </strong>
                        </td>

                        <td>
                            ${discount}
                        </td>

                        <td>
                            ${escapeHTML(target)}
                        </td>

                        <td>
                            ${
                                voucher.active
                                    ? "Aktif"
                                    : "Nonaktif"
                            }
                        </td>

                        <td>

                            <div class="table-actions">

                                <button
                                    type="button"
                                    data-edit-voucher="${escapeHTML(voucher.id)}"
                                >
                                    Edit
                                </button>

                                <button
                                    type="button"
                                    data-delete-voucher="${escapeHTML(voucher.id)}"
                                >
                                    Hapus
                                </button>

                            </div>

                        </td>

                    </tr>
                `;

            }
        )
        .join("");

}


/* ============================================================
   DASHBOARD STATS
   ============================================================ */

function renderDashboardStats() {

    $("statTransactions").textContent =
        database.transactions.length;

    $("statMembers").textContent =
        database.members.length;

    $("statStamps").textContent =
        database.stamps.length;

    $("statStaff").textContent =
        database.staff.length;

}


function renderDashboard() {

    renderDashboardStats();

    renderVoucherTable();

    renderStaffTable();

    updateOwnerDirectWA();

}


/* ============================================================
   MASTER DATA
   ============================================================ */

function openMasterData() {

    const tbody =
        $("masterDataTable");

    tbody.innerHTML =
        `
        <tr>
            <td>Transaksi</td>
            <td>${database.transactions.length}</td>
        </tr>

        <tr>
            <td>Member</td>
            <td>${database.members.length}</td>
        </tr>

        <tr>
            <td>Stempel</td>
            <td>${database.stamps.length}</td>
        </tr>

        <tr>
            <td>Profil Staf</td>
            <td>${database.staff.length}</td>
        </tr>

        <tr>
            <td>Voucher</td>
            <td>${database.vouchers.length}</td>
        </tr>

        <tr>
            <td>Produk / Menu</td>
            <td>${database.products.length}</td>
        </tr>
        `;

    openModal(
        "masterDataModal"
    );

}


/* ============================================================
   BACKUP
   ============================================================ */

function downloadBackup() {

    const backup = {

        application:
            "Mainstay Coffee",

        version:
            "1.0.0",

        exportedAt:
            timestamp(),

        database:
            database

    };

    const json =
        JSON.stringify(
            backup,
            null,
            2
        );

    const blob =
        new Blob(
            [json],
            {
                type:
                    "application/json"
            }
        );

    const url =
        URL.createObjectURL(
            blob
        );

    const link =
        document.createElement(
            "a"
        );

    link.href =
        url;

    link.download =
        `mainstay-coffee-backup-${Date.now()}.json`;

    document.body.appendChild(
        link
    );

    link.click();

    link.remove();

    URL.revokeObjectURL(
        url
    );

    showToast(
        "Backup JSON berhasil dibuat.",
        "success"
    );

}


function restoreBackup(
    file
) {

    if (!file) return;

    const reader =
        new FileReader();

    reader.onload =
        event => {

            try {

                const parsed =
                    JSON.parse(
                        event.target.result
                    );

                const restored =
                    parsed.database ||
                    parsed;

                if (
                    !restored.settings ||
                    !restored.products ||
                    !restored.transactions
                ) {

                    throw new Error(
                        "Format backup tidak valid."
                    );

                }

                const confirmed =
                    window.confirm(
                        "Restore akan mengganti database saat ini. Lanjutkan?"
                    );

                if (!confirmed) {

                    $("restoreBackup")
                        .value =
                        "";

                    return;

                }

                database =
                    mergeDatabase(
                        deepClone(
                            DEFAULT_DATABASE
                        ),
                        restored
                    );

                saveDatabase();

                cart = [];

                activeVoucher =
                    null;

                renderAll();

                fillDashboardForms();

                renderDashboard();

                showToast(
                    "Backup berhasil dipulihkan.",
                    "success"
                );

            } catch (error) {

                console.error(
                    error
                );

                showToast(
                    "File backup tidak valid.",
                    "error"
                );

            }

            $("restoreBackup")
                .value =
                "";

        };

    reader.readAsText(
        file
    );

}


/* ============================================================
   FILE UPLOAD
   ============================================================ */

function readImageFile(
    input,
    callback
) {

    const file =
        input.files &&
        input.files[0];

    if (!file) {

        callback(
            null
        );

        return;

    }

    const reader =
        new FileReader();

    reader.onload =
        event => {

            callback(
                event.target.result
            );

        };

    reader.readAsDataURL(
        file
    );

}


/* ============================================================
   MODAL
   ============================================================ */

function openModal(
    id
) {

    const modal =
        $(id);

    if (!modal) return;

    modal.classList.remove(
        "hidden"
    );

}


function closeModal(
    id
) {

    const modal =
        $(id);

    if (!modal) return;

    modal.classList.add(
        "hidden"
    );

}


/* ============================================================
   RENDER ALL
   ============================================================ */

function renderAll() {

    renderBranding();

    renderCatalog();

    renderPosCatalog();

    renderCarousel();

    renderCart();

    updateStoreStatus();

}


/* ============================================================
   EVENT DELEGATION
   ============================================================ */

document.addEventListener(
    "click",
    event => {

        const addButton =
            event.target.closest(
                "[data-add-product]"
            );

        if (addButton) {

            addToCart(
                addButton
                .dataset
                .addProduct
            );

            return;

        }


        const categoryButton =
            event.target.closest(
                "[data-category]"
            );

        if (categoryButton) {

            activeCategory =
                categoryButton
                .dataset
                .category;

            renderCatalog();

            return;

        }


        const posCategoryButton =
            event.target.closest(
                "[data-pos-category]"
            );

        if (posCategoryButton) {

            activePosCategory =
                posCategoryButton
                .dataset
                .posCategory;

            renderPosCatalog();

            return;

        }


        const plus =
            event.target.closest(
                "[data-cart-plus]"
            );

        if (plus) {

            changeCartQuantity(
                plus.dataset.cartPlus,
                1
            );

            return;

        }


        const minus =
            event.target.closest(
                "[data-cart-minus]"
            );

        if (minus) {

            changeCartQuantity(
                minus.dataset.cartMinus,
                -1
            );

            return;

        }


        const remove =
            event.target.closest(
                "[data-cart-remove]"
            );

        if (remove) {

            removeFromCart(
                remove.dataset.cartRemove
            );

            return;

        }


        const editStaffButton =
            event.target.closest(
                "[data-edit-staff]"
            );

        if (editStaffButton) {

            editStaff(
                editStaffButton
                .dataset
                .editStaff
            );

            return;

        }


        const deleteStaffButton =
            event.target.closest(
                "[data-delete-staff]"
            );

        if (deleteStaffButton) {

            deleteStaff(
                deleteStaffButton
                .dataset
                .deleteStaff
            );

            return;

        }


        const editVoucherButton =
            event.target.closest(
                "[data-edit-voucher]"
            );

        if (editVoucherButton) {

            editVoucher(
                editVoucherButton
                .dataset
                .editVoucher
            );

            return;

        }


        const deleteVoucherButton =
            event.target.closest(
                "[data-delete-voucher]"
            );

        if (deleteVoucherButton) {

            deleteVoucher(
                deleteVoucherButton
                .dataset
                .deleteVoucher
            );

            return;

        }


        const closeButton =
            event.target.closest(
                "[data-close]"
            );

        if (closeButton) {

            closeModal(
                closeButton
                .dataset
                .close
            );

            return;

        }


        const dot =
            event.target.closest(
                "[data-slide-dot]"
            );

        if (dot) {

            goToSlide(
                Number(
                    dot.dataset.slideDot
                )
            );

            startCarousel();

            return;

        }


        if (
            event.target.id ===
            "promoPrev"
        ) {

            goToSlide(
                carouselIndex - 1
            );

            startCarousel();

            return;

        }


        if (
            event.target.id ===
            "promoNext"
        ) {

            goToSlide(
                carouselIndex + 1
            );

            startCarousel();

            return;

        }


        if (
            event.target.id ===
            "removeVoucher"
        ) {

            activeVoucher =
                null;

            $("voucherCode")
                .value =
                "";

            renderCart();

            return;

        }

    }
);


/* ============================================================
   BASIC EVENTS
   ============================================================ */

$("btnMember")
    .addEventListener(
        "click",
        () => {

            openModal(
                "memberModal"
            );

        }
    );


$("btnInternal")
    .addEventListener(
        "click",
        () => {

            openModal(
                "loginModal"
            );

        }
    );


$("loginSubmit")
    .addEventListener(
        "click",
        loginInternal
    );


$("loginPin")
    .addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                loginInternal();

            }

        }
    );


$("registerMember")
    .addEventListener(
        "click",
        registerMember
    );


$("checkMember")
    .addEventListener(
        "click",
        checkMember
    );


$("applyVoucher")
    .addEventListener(
        "click",
        applyVoucher
    );


$("processPayment")
    .addEventListener(
        "click",
        processPayment
    );


$("clearCart")
    .addEventListener(
        "click",
        () => {

            if (!cart.length) return;

            const confirmed =
                window.confirm(
                    "Kosongkan seluruh keranjang?"
                );

            if (confirmed) {

                cart = [];

                activeVoucher =
                    null;

                $("voucherCode")
                    .value =
                    "";

                renderCart();

            }

        }
    );


$("closeDashboard")
    .addEventListener(
        "click",
        closeDashboard
    );


/* ============================================================
   DASHBOARD TABS
   ============================================================ */

$$(
    ".dashboard-tab"
).forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                const tab =
                    button.dataset.tab;

                $$(".dashboard-tab")
                    .forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );

                $$(".dashboard-tab-content")
                    .forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );

                button.classList.add(
                    "active"
                );

                const target =
                    $(
                        "tab-" +
                        tab
                    );

                if (target) {

                    target.classList.add(
                        "active"
                    );

                }

            }
        );

    }
);


/* ============================================================
   BRANDING EVENTS
   ============================================================ */

$("saveBranding")
    .addEventListener(
        "click",
        saveBranding
    );


$("settingLogoFile")
    .addEventListener(
        "change",
        () => {

            readImageFile(
                $("settingLogoFile"),
                data => {

                    if (data) {

                        database.settings.logo =
                            data;

                        $("settingLogoUrl")
                            .value =
                            data;

                        showToast(
                            "Logo file siap disimpan.",
                            "info"
                        );

                    }

                }
            );

        }
    );


$("settingFaviconFile")
    .addEventListener(
        "change",
        () => {

            readImageFile(
                $("settingFaviconFile"),
                data => {

                    if (data) {

                        database.settings.favicon =
                            data;

                        $("settingFaviconUrl")
                            .value =
                            data;

                        showToast(
                            "Favicon file siap disimpan.",
                            "info"
                        );

                    }

                }
            );

        }
    );


$("settingQrisFile")
    .addEventListener(
        "change",
        () => {

            readImageFile(
                $("settingQrisFile"),
                data => {

                    if (data) {

                        database.settings.qris =
                            data;

                        $("settingQrisUrl")
                            .value =
                            data;

                        showToast(
                            "QRIS file siap disimpan.",
                            "info"
                        );

                    }

                }
            );

        }
    );


/* ============================================================
   LOYALTY
   ============================================================ */

$("saveLoyalty")
    .addEventListener(
        "click",
        saveLoyalty
    );


/* ============================================================
   OWNER
   ============================================================ */

$("saveOwner")
    .addEventListener(
        "click",
        saveOwner
    );


$("ownerDirectWa")
    .addEventListener(
        "click",
        event => {

            if (
                !database.owner.phone
            ) {

                event.preventDefault();

                showToast(
                    "Nomor WA Owner belum diatur.",
                    "error"
                );

            }

        }
    );


/* ============================================================
   STAFF
   ============================================================ */

$("saveStaff")
    .addEventListener(
        "click",
        saveStaff
    );


$("cancelStaffEdit")
    .addEventListener(
        "click",
        resetStaffForm
    );


/* ============================================================
   VOUCHER
   ============================================================ */

$("saveVoucher")
    .addEventListener(
        "click",
        saveVoucherAdmin
    );


$("cancelVoucherEdit")
    .addEventListener(
        "click",
        resetVoucherForm
    );


/* ============================================================
   MASTER DATA
   ============================================================ */

$("openMasterData")
    .addEventListener(
        "click",
        openMasterData
    );


$("downloadBackup")
    .addEventListener(
        "click",
        downloadBackup
    );


$("restoreBackup")
    .addEventListener(
        "change",
        event => {

            restoreBackup(
                event.target.files[0]
            );

        }
    );


/* ============================================================
   RECEIPT
   ============================================================ */

$("copyWhatsappReceipt")
    .addEventListener(
        "click",
        async () => {

            const text =
                $("whatsappReceipt")
                .value;

            try {

                await navigator
                    .clipboard
                    .writeText(
                        text
                    );

                showToast(
                    "Pesan berhasil disalin.",
                    "success"
                );

            } catch (error) {

                $("whatsappReceipt")
                    .select();

                document.execCommand(
                    "copy"
                );

                showToast(
                    "Pesan berhasil disalin.",
                    "success"
                );

            }

        }
    );


$("printReceipt")
    .addEventListener(
        "click",
        () => {

            window.print();

        }
    );


/* ============================================================
   ESC CLOSE MODAL
   ============================================================ */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !==
            "Escape"
        ) {

            return;

        }

        $$(".modal")
            .forEach(
                modal => {

                    modal.classList.add(
                        "hidden"
                    );

                }
            );

    }
);


/* ============================================================
   CLICK OUTSIDE MODAL
   ============================================================ */

$$(
    ".modal"
).forEach(
    modal => {

        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    modal
                ) {

                    modal.classList.add(
                        "hidden"
                    );

                }

            }
        );

    }
);


/* ============================================================
   INITIALIZATION
   ============================================================ */

function initialize() {

    renderAll();

    renderDashboard();

    startClock();

    updateStoreStatus();

    setInterval(
        updateStoreStatus,
        60000
    );

    startCarousel();

    $("footerYear")
        .textContent =
        new Date()
        .getFullYear();

}


/* ============================================================
   START APPLICATION
   ============================================================ */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initialize
    );

} else {

    initialize();

}
