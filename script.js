// =====================================================
// WAREHOUSE INVENTORY
// MAIN JAVASCRIPT
// =====================================================


// =====================================================
// SUPABASE CONNECTION
// =====================================================

const SUPABASE_URL = "https://pdimzqvbpkveamakzcqe.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_snnK5c2-d4BtTVr_-IiLkw_H-OgTKOT";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


// =====================================================
// GLOBAL VARIABLES
// =====================================================

let masterItems = [];
let selectedItem = null;

let pendingInventory = [];
let currentInventoryData = [];
let currentUserRole = "admin";


// =====================================================
// DOM ELEMENTS
// =====================================================

const loginSection = document.getElementById("loginSection");
const appSection = document.getElementById("appSection");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

const loginMessage = document.getElementById("loginMessage");
const userEmail = document.getElementById("userEmail");
const userRoleBadge = document.getElementById("userRoleBadge");

// Edit Inventory
const editInventoryModal = document.getElementById("editInventoryModal");
const editInventoryId = document.getElementById("editInventoryId");
const editItemCode = document.getElementById("editItemCode");
const editItemDescription = document.getElementById("editItemDescription");
const editWarehouse = document.getElementById("editWarehouse");
const editBin = document.getElementById("editBin");
const editExpiry = document.getElementById("editExpiry");
const editQuantity = document.getElementById("editQuantity");
const editInventoryMessage = document.getElementById("editInventoryMessage");
const saveEditInventoryBtn = document.getElementById("saveEditInventoryBtn");
const closeEditModalBtn = document.getElementById("closeEditModalBtn");


// Beginning Inventory
const itemSearch = document.getElementById("itemSearch");
const itemSuggestions = document.getElementById("itemSuggestions");

const itemCode = document.getElementById("itemCode");
const itemDescription = document.getElementById("itemDescription");
const category = document.getElementById("category");

const warehouse = document.getElementById("warehouse");

const binLocation = document.getElementById("binLocation");
const binSuggestions = document.getElementById("binSuggestions");

const expiryDate = document.getElementById("expiryDate");
const quantity = document.getElementById("quantity");

const addInventoryRowBtn =
    document.getElementById("addInventoryRowBtn");

const saveInventoryBtn =
    document.getElementById("saveInventoryBtn");

const clearFormBtn =
    document.getElementById("clearFormBtn");

const inventoryMessage =
    document.getElementById("inventoryMessage");

const pendingInventoryTableBody =
    document.getElementById("pendingInventoryTableBody");


// Masterlist
const masterlistFile =
    document.getElementById("masterlistFile");

const uploadMasterlistBtn =
    document.getElementById("uploadMasterlistBtn");

const masterlistMessage =
    document.getElementById("masterlistMessage");

const masterlistTableBody =
    document.getElementById("masterlistTableBody");


// Current Inventory
const inventoryTableBody =
    document.getElementById("inventoryTableBody");

const refreshInventoryBtn =
    document.getElementById("refreshInventoryBtn");

const downloadInventoryBtn =
    document.getElementById("downloadInventoryBtn");

const inventoryLocationFilter =
    document.getElementById("inventoryLocationFilter");

const inventorySearch =
    document.getElementById("inventorySearch");

const inventoryFilterMessage =
    document.getElementById("inventoryFilterMessage");

const resetInventoryBtn =
    document.getElementById("resetInventoryBtn");


// Summary
const summaryTableBody =
    document.getElementById("summaryTableBody");

const summaryWarehouse =
    document.getElementById("summaryWarehouse");

const refreshSummaryBtn =
    document.getElementById("refreshSummaryBtn");

const resetSummaryBtn =
    document.getElementById("resetSummaryBtn");


// Outbound Upload

const outboundFile =
    document.getElementById("outboundFile");

const previewOutboundBtn =
    document.getElementById("previewOutboundBtn");

const outboundTableBody =
    document.getElementById("outboundTableBody");

const processOutboundBtn =
    document.getElementById("processOutboundBtn");
    const cancelOutboundBtn =
    document.getElementById("cancelOutboundBtn");

const outboundMessage =
    document.getElementById("outboundMessage");

// Inbound Upload
const inboundFile = document.getElementById("inboundFile");
const previewInboundBtn = document.getElementById("previewInboundBtn");
const inboundTableBody = document.getElementById("inboundTableBody");
const processInboundBtn = document.getElementById("processInboundBtn");
const inboundMessage = document.getElementById("inboundMessage");
let pendingInbound = [];
let inboundUploadInitialized = false;
  

    let pendingOutbound = [];

    let outboundUploadInitialized = false;

// Stock Transfer
let transferInventory = [];
const transferFromWarehouse = document.getElementById("transferFromWarehouse");
const transferFromBin = document.getElementById("transferFromBin");
const transferFromBinSuggestions = document.getElementById("transferFromBinSuggestions");
const transferItemSearch = document.getElementById("transferItemSearch");
const transferItemSuggestions = document.getElementById("transferItemSuggestions");
const transferItemCode = document.getElementById("transferItemCode");
const transferItemDescription = document.getElementById("transferItemDescription");
const transferExpiry = document.getElementById("transferExpiry");
const transferAvailable = document.getElementById("transferAvailable");
const transferToWarehouse = document.getElementById("transferToWarehouse");
const transferToBin = document.getElementById("transferToBin");
const transferToBinSuggestions = document.getElementById("transferToBinSuggestions");
const transferQuantity = document.getElementById("transferQuantity");
const transferReference = document.getElementById("transferReference");
const transferStockBtn = document.getElementById("transferStockBtn");
const transferMessage = document.getElementById("transferMessage");
const transferResult = document.getElementById("transferResult");


// =====================================================
// HYBRID PREMIUM THEME (LIGHT / DARK)
// =====================================================

function setupThemeToggle() {
    const root = document.documentElement;
    const button = document.getElementById("themeToggleBtn");
    if (!button) return;

    let savedTheme = "light";
    try {
        savedTheme = localStorage.getItem("warehouseTheme") || "light";
    } catch (error) {
        // The theme toggle still works if browser storage is unavailable.
    }

    function applyTheme(theme, save = false) {
        const dark = theme === "dark";
        root.setAttribute("data-theme", dark ? "dark" : "light");
        button.textContent = dark ? "☀️ Light Mode" : "🌙 Dark Mode";
        button.setAttribute("aria-pressed", String(dark));
        button.setAttribute("aria-label", dark ? "Switch to Light Mode" : "Switch to Dark Mode");

        if (save) {
            try {
                localStorage.setItem("warehouseTheme", dark ? "dark" : "light");
            } catch (error) {
                // Ignore storage restrictions; theme is applied for this session.
            }
        }
    }

    applyTheme(savedTheme === "dark" ? "dark" : "light");
    button.addEventListener("click", () => {
        const nextTheme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        applyTheme(nextTheme, true);
    });
}


// =====================================================
// INITIALIZATION
// =====================================================

document.addEventListener("DOMContentLoaded", async () => {

    setupThemeToggle();
    setupMenu();

    setupLogin();

    setupMasterlist();

    setupBeginningInventory();

    setupBinSearch();

    setupSummary();
    setupTransfer();
    fillTransferWarehouses();

    await checkLogin();

});


// =====================================================
// USER ROLE
// =====================================================

async function loadUserRole(userId) {
    currentUserRole = "admin";

    try {
        const { data, error } = await supabaseClient
            .from("user_roles")
            .select("role")
            .eq("user_id", userId)
            .maybeSingle();

        if (!error && data && (data.role === "viewer" || data.role === "admin")) {
            currentUserRole = data.role;
        }
    } catch (error) {
        console.warn("Role lookup unavailable; defaulting to admin UI:", error);
    }

    if (userRoleBadge) {
        userRoleBadge.textContent = currentUserRole;
        userRoleBadge.classList.remove("hidden", "admin", "viewer");
        userRoleBadge.classList.add(currentUserRole);
    }
}

function isAdmin() {
    return currentUserRole === "admin";
}

function applyRolePermissions() {
    const adminElements = document.querySelectorAll(".admin-only");
    adminElements.forEach(el => el.classList.toggle("hidden", !isAdmin()));

    const adminMenuSections = [
    "inventorySection",
    "transferSection",
    "outboundSection"
];

    if (masterlistFile) masterlistFile.classList.toggle("hidden", !isAdmin());
    if (uploadMasterlistBtn) uploadMasterlistBtn.classList.toggle("hidden", !isAdmin());
    if (resetInventoryBtn) resetInventoryBtn.classList.toggle("hidden", !isAdmin());
    if (resetSummaryBtn) resetSummaryBtn.classList.toggle("hidden", !isAdmin());
}

// =====================================================
// MENU
// =====================================================

function setupMenu() {

    // Collapsible, overlay-style sidebar (Facebook-like).
    const appRoot = document.getElementById("appSection");
    const sidebarToggleBtn = document.getElementById("sidebarToggleBtn");
    const sidebarBackdrop = document.getElementById("sidebarBackdrop");
    const closeSidebar = () => {
        if (!appRoot) return;
        appRoot.classList.remove("sidebar-open");
        if (sidebarToggleBtn) {
            sidebarToggleBtn.setAttribute("aria-expanded", "false");
            sidebarToggleBtn.setAttribute("aria-label", "Open navigation menu");
            sidebarToggleBtn.textContent = "☰";
        }
    };
    if (sidebarToggleBtn && appRoot) {
        sidebarToggleBtn.addEventListener("click", () => {
            const willOpen = !appRoot.classList.contains("sidebar-open");
            appRoot.classList.toggle("sidebar-open", willOpen);
            sidebarToggleBtn.setAttribute("aria-expanded", String(willOpen));
            sidebarToggleBtn.setAttribute("aria-label", willOpen ? "Close navigation menu" : "Open navigation menu");
            sidebarToggleBtn.textContent = willOpen ? "✕" : "☰";
        });
    }
    if (sidebarBackdrop) sidebarBackdrop.addEventListener("click", closeSidebar);
    document.addEventListener("keydown", event => {
        if (event.key === "Escape") closeSidebar();
    });

    const menuButtons =
        document.querySelectorAll(".menu-btn");

    const sections =
        document.querySelectorAll(".system-section");


    menuButtons.forEach(button => {

        button.addEventListener("click", async () => {

            const targetSection =
                button.dataset.section;
            if (appRoot) appRoot.classList.remove("sidebar-open");
            if (sidebarToggleBtn) {
                sidebarToggleBtn.setAttribute("aria-expanded", "false");
                sidebarToggleBtn.setAttribute("aria-label", "Open navigation menu");
                sidebarToggleBtn.textContent = "☰";
            }


            // Remove active
            menuButtons.forEach(btn => {
                btn.classList.remove("active");
            });


            // Hide sections
            sections.forEach(section => {
                section.classList.add("hidden");
            });


            // Activate selected button
            button.classList.add("active");


            // Show selected section
            const target =
                document.getElementById(targetSection);

            if (target) {
                target.classList.remove("hidden");
            }


            // Load data when opening sections

            if (targetSection === "masterlistSection") {
                await loadMasterlist();
            }


            if (targetSection === "currentStockSection") {
                await loadInventory();
            }

            if (targetSection === "outboundSection") {
                 setupOutboundUpload();
            } 

            if (targetSection === "inboundSection") {
                setupInboundUpload();
            }

            if (targetSection === "summarySection") {
                await loadInventorySummary();
            }

            if (targetSection === "transferSection" && isAdmin()) {
                await prepareTransferSection();
            }

        
             });
        });
    }

// =====================================================
// BIN INPUT
// =====================================================

function setupBinInput(input, suggestionsBox) {
    // function setupBinInput(input, suggestionsBox) {
    if (!input || !suggestionsBox) return;

    input.addEventListener("input", () => {
        const typed = input.value.trim().toUpperCase();

        suggestionsBox.innerHTML = "";
        suggestionsBox.classList.add("hidden");

        if (!typed) return;

        const matches = ALL_BINS.filter(bin =>
            bin.toUpperCase().includes(typed)
        ).slice(0, 20);

        if (matches.length === 0) return;

        matches.forEach(bin => {
            const option = document.createElement("div");
            option.textContent = bin;
            option.className = "suggestion-item";

            option.addEventListener("click", () => {
                input.value = bin;
                suggestionsBox.innerHTML = "";
                suggestionsBox.classList.add("hidden");

                input.dispatchEvent(new Event("change"));
            });

            suggestionsBox.appendChild(option);
        });

        suggestionsBox.classList.remove("hidden");
    });

    input.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            event.preventDefault();

            const typed = input.value.trim().toUpperCase();

            if (ALL_BINS.includes(typed)) {
                input.value = typed;
                suggestionsBox.innerHTML = "";
                suggestionsBox.classList.add("hidden");

                input.dispatchEvent(new Event("change"));
            }
        }

        if (event.key === "Escape") {
            suggestionsBox.innerHTML = "";
            suggestionsBox.classList.add("hidden");
        }
    });

    document.addEventListener("click", event => {
        if (
            event.target !== input &&
            !suggestionsBox.contains(event.target)
        ) {
            suggestionsBox.innerHTML = "";
            suggestionsBox.classList.add("hidden");
        }
    });
}

// =====================================================
// STOCK TRANSFER
// =====================================================

function fillTransferWarehouses() {
    [transferFromWarehouse, transferToWarehouse].forEach(select => {
        if (!select) return;
        select.innerHTML = '<option value="">Select Warehouse</option>';
        ["WMECOM", "WMLAZ", "WMSHOP", "WMAIN", "WMBBD", "OTHER"].forEach(w => {
            select.insertAdjacentHTML("beforeend", `<option value="${escapeHtml(w)}">${escapeHtml(w)}</option>`);
        })
    }); 
}

function setupTransfer() {
    if (!transferStockBtn) return;
    setupBinInput(transferFromBin, transferFromBinSuggestions);
    setupBinInput(transferToBin, transferToBinSuggestions);
    transferFromWarehouse.addEventListener("change", refreshTransferSource);
    transferFromBin.addEventListener("change", refreshTransferSource);
    transferItemSearch.addEventListener("input", () => showItemSuggestions(transferItemSearch, transferItemSuggestions, selectTransferItem));
    transferItemSearch.addEventListener("keydown", e => { if (e.key === "Enter") selectItemByText(e, transferItemSearch, selectTransferItem); });
    transferStockBtn.addEventListener("click", executeStockTransfer);
    document.getElementById("clearTransferBtn")?.addEventListener("click", clearTransferForm);
}

function selectTransferItem(item) {
    transferItemSearch.value = item.item_code || "";
    transferItemCode.value = item.item_code || "";
    transferItemDescription.value = item.item_description || "";
    hideSuggestions(transferItemSuggestions);
    refreshTransferSource();
}

async function prepareTransferSection() {
    if (!isAdmin()) return;
    await loadTransferInventory();
    refreshTransferSource();
}

async function loadTransferInventory() {
    const { data, error } = await supabaseClient.from("inventory").select(`id,warehouse_location,bin_location,expiry_date,quantity,item_id,master_items(item_code,item_description,category)`).order("created_at", { ascending: false });
    if (error) { console.error("Transfer inventory load error:", error); transferInventory = []; return; }
    transferInventory = data || [];
}

function refreshTransferSource() {
    if (!transferFromWarehouse || !transferItemCode) return;
    const wh = transferFromWarehouse.value;
    const bin = transferFromBin.value.trim().toUpperCase();
    const code = transferItemCode.value.trim().toLowerCase();
    if (!wh || !code) { transferAvailable.textContent = "0"; transferExpiry.value = ""; return; }
    const rows = transferInventory.filter(r => (r.warehouse_location || "") === wh && (!bin || r.bin_location === bin) && ((r.master_items?.item_code || "").toLowerCase() === code));
    const total = rows.reduce((sum, r) => sum + Number(r.quantity || 0), 0);
    transferAvailable.textContent = total.toLocaleString();
    const expiries = [...new Set(rows.map(r => r.expiry_date).filter(Boolean))];
    transferExpiry.value = expiries.length === 1 ? expiries[0] : "";
    if (expiries.length > 1) showMessage(transferMessage, "Multiple expiry dates exist for this item/source. Select the item/bin more specifically.", "error");
    else clearMessage(transferMessage);
}

async function executeStockTransfer() {
    if (!isAdmin()) return;
    clearMessage(transferMessage);
    transferResult.classList.add("hidden");
    const fromWh = transferFromWarehouse.value;
    const fromBin = transferFromBin.value.trim().toUpperCase();
    const toWh = transferToWarehouse.value;
    const toBin = transferToBin.value.trim().toUpperCase();
    const itemCodeValue = transferItemCode.value.trim();
    const qty = Number(transferQuantity.value);
    const ref = transferReference.value.trim();

    if (!fromWh || !fromBin || !toWh || !toBin || !itemCodeValue || !transferExpiry.value || !ref || !qty || qty <= 0) { showMessage(transferMessage, "Please complete FROM, TO, Item, Expiry, Transfer Quantity, and Reference No.", "error"); return; }
    if (!ALL_BINS.includes(fromBin) || !ALL_BINS.includes(toBin)) { showMessage(transferMessage, "Invalid Bin Location. Valid range is A1-001 to I5-027.", "error"); return; }
    if (fromWh === toWh && fromBin === toBin) { showMessage(transferMessage, "FROM and TO cannot be the same warehouse/bin.", "error"); return; }

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { showMessage(transferMessage, "Your session has expired. Please login again.", "error"); return; }

    transferStockBtn.disabled = true; transferStockBtn.textContent = "TRANSFERRING...";
    try {
        await loadTransferInventory();
        const sourceRows = transferInventory.filter(r => (r.warehouse_location || "") === fromWh && r.bin_location === fromBin && (r.master_items?.item_code || "").toLowerCase() === itemCodeValue.toLowerCase() && r.expiry_date === transferExpiry.value && Number(r.quantity || 0) > 0);
        const available = sourceRows.reduce((sum, r) => sum + Number(r.quantity || 0), 0);
        if (available < qty) throw new Error(`Insufficient stock. Available: ${available.toLocaleString()}.`);
        let remaining = qty;
        for (const row of sourceRows) {
            if (remaining <= 0) break;
            const take = Math.min(Number(row.quantity || 0), remaining);
            const { error } = await supabaseClient.from("inventory").update({ quantity: Number(row.quantity || 0) - take }).eq("id", row.id);
            if (error) throw error;
            remaining -= take;
        }
        const destination = transferInventory.find(r => (r.warehouse_location || "") === toWh && r.bin_location === toBin && r.item_id === sourceRows[0].item_id && r.expiry_date === transferExpiry.value);
        if (destination) {
            const { error } = await supabaseClient.from("inventory").update({ quantity: Number(destination.quantity || 0) + qty }).eq("id", destination.id);
            if (error) throw error;
        } else {
            const { error } = await supabaseClient.from("inventory").insert({ item_id: sourceRows[0].item_id, warehouse_location: toWh, bin_location: toBin, expiry_date: transferExpiry.value, quantity: qty, created_by: user.id });
            if (error) throw error;
        }
        const { error: txError } = await supabaseClient.from("inventory_transactions").insert([
            { item_id: sourceRows[0].item_id, transaction_type: "TRANSFER_OUT", warehouse_location: fromWh, bin_location: fromBin, expiry_date: transferExpiry.value, quantity_change: -qty, reference_no: ref, created_by: user.id },
            { item_id: sourceRows[0].item_id, transaction_type: "TRANSFER_IN", warehouse_location: toWh, bin_location: toBin, expiry_date: transferExpiry.value, quantity_change: qty, reference_no: ref, created_by: user.id }
        ]);
        if (txError) throw txError;
        showMessage(transferMessage, "Stock transfer completed successfully.", "success");
        transferResult.textContent = `${qty.toLocaleString()} unit(s) transferred: ${fromWh} / ${fromBin} → ${toWh} / ${toBin} | Ref: ${ref}`;
        transferResult.classList.remove("hidden");
        await loadInventory(); await loadInventorySummary(); await loadTransferInventory(); refreshTransferSource();
        transferQuantity.value = "";
    } catch (error) {
        console.error("Stock transfer error:", error);
        showMessage(transferMessage, "Transfer failed: " + (error.message || "Unknown error"), "error");
    } finally {
        transferStockBtn.disabled = false; transferStockBtn.textContent = "🔄 TRANSFER STOCK";
    }
}

function clearTransferForm() {
    transferFromWarehouse.value = ""; transferFromBin.value = ""; transferItemSearch.value = ""; transferItemCode.value = ""; transferItemDescription.value = ""; transferExpiry.value = ""; transferAvailable.textContent = "0"; transferToWarehouse.value = ""; transferToBin.value = ""; transferQuantity.value = ""; transferReference.value = ""; clearMessage(transferMessage); transferResult.classList.add("hidden");
}

// =====================================================
// LOGIN
// =====================================================

function setupLogin() {

    if (!loginBtn) return;

    loginBtn.addEventListener("click", login);


    passwordInput.addEventListener("keydown", event => {

        if (event.key === "Enter") {
            login();
        }

    });


    emailInput.addEventListener("keydown", event => {

        if (event.key === "Enter") {
            passwordInput.focus();
        }

    });


    logoutBtn.addEventListener("click", logout);

}


async function login() {

    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;


    if (!email || !password) {

        showMessage(
            loginMessage,
            "Please enter email and password.",
            "error"
        );

        return;
    }


    loginBtn.disabled = true;

    loginBtn.textContent = "LOGGING IN...";


    const { data, error } =
        await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });


    loginBtn.disabled = false;

    loginBtn.textContent = "LOGIN";


    if (error) {

        showMessage(
            loginMessage,
            error.message,
            "error"
        );

        return;
    }


    if (data.user) {

        showApplication(data.user);

    }

}


async function logout() {

    await supabaseClient.auth.signOut();

    appSection.classList.add("hidden");
    loginSection.classList.remove("hidden");

    userEmail.textContent = "Not logged in";
    currentUserRole = "admin";
    if (userRoleBadge) { userRoleBadge.textContent = ""; userRoleBadge.classList.add("hidden"); userRoleBadge.classList.remove("admin", "viewer"); }

    emailInput.value = "";
    passwordInput.value = "";

}


async function checkLogin() {

    const {
        data: { session }
    } = await supabaseClient.auth.getSession();


    if (session && session.user) {

        showApplication(session.user);

    } else {

        loginSection.classList.remove("hidden");
        appSection.classList.add("hidden");

    }

}


async function showApplication(user) {

    loginSection.classList.add("hidden");
    appSection.classList.remove("hidden");

    userEmail.textContent =
        user.email || "Logged in";

    await loadUserRole(user.id);
    applyRolePermissions();


    loadMasterlist();
    loadInventory();

}


supabaseClient.auth.onAuthStateChange(
    (event, session) => {

        if (session && session.user) {

            showApplication(session.user);

        } else {

            loginSection.classList.remove("hidden");
            appSection.classList.add("hidden");

        }

    }
);


// =====================================================
// BEGINNING INVENTORY
// =====================================================

function setupBeginningInventory() {

    if (!itemSearch) return;


    // ITEM SEARCH
    itemSearch.addEventListener(
        "input",
        handleItemSearch
    );


    itemSearch.addEventListener(
        "keydown",
        handleItemSearchKeyboard
    );


    // ADD TO TABLE
    addInventoryRowBtn.addEventListener(
        "click",
        addInventoryToPendingTable
    );


    // SAVE ALL
    saveInventoryBtn.addEventListener(
        "click",
        saveAllInventory
    );


    // CLEAR
    clearFormBtn.addEventListener(
        "click",
        clearInventoryForm
    );


    // Warehouse keyboard convenience
    warehouse.addEventListener("change", () => {

        binLocation.focus();

    });

}


// =====================================================
// LOAD MASTERLIST FROM SUPABASE
// =====================================================

async function loadMasterlist() {

    try {

        let allItems = [];
        let from = 0;
        const batchSize = 1000;

        while (true) {

            const {
                data,
                error
            } = await supabaseClient
                .from("master_items")
                .select("*")
                .order("item_code", {
                    ascending: true
                })
                .range(
                    from,
                    from + batchSize - 1
                );

            if (error) {
                throw error;
            }

            if (!data || data.length === 0) {
                break;
            }

            allItems.push(...data);

            if (data.length < batchSize) {
                break;
            }

            from += batchSize;
        }

        masterItems = allItems;

        console.log(
            "TOTAL MASTERLIST LOADED:",
            masterItems.length
        );

        console.log(
            "TOTAL ITNES:",
            masterItems.filter(item =>
                String(item.item_code || "")
                    .toUpperCase()
                    .startsWith("ITNES")
            ).length
        );

        renderMasterlistTable();

    } catch (error) {

        console.error(
            "Masterlist load error:",
            error
        );

    }

}

// =====================================================
// MASTERLIST TABLE
// =====================================================

function renderMasterlistTable() {

    masterlistTableBody.innerHTML = "";


    masterItems.forEach(item => {

        const row =
            document.createElement("tr");


        row.innerHTML = `
            <td>${escapeHtml(item.item_code)}</td>

            <td>${escapeHtml(
                item.item_description || ""
            )}</td>

            <td>${escapeHtml(
                item.category || ""
            )}</td>
        `;


        masterlistTableBody.appendChild(row);

    });

}


// =====================================================
// ITEM SEARCH
// =====================================================

function handleItemSearch() {

    const search =
        itemSearch.value.trim().toLowerCase();


    itemSuggestions.innerHTML = "";


    if (!search) {

        itemSuggestions.style.display = "none";

        return;
    }


    const matches =
        masterItems
            .filter(item => {

                const code =
                    (item.item_code || "")
                    .toLowerCase();

                const description =
                    (item.item_description || "")
                    .toLowerCase();

                return (
                    code.includes(search) ||
                    description.includes(search)
                );

            })
            .slice(0, 15);


    if (matches.length === 0) {

        itemSuggestions.style.display = "none";

        return;
    }


    matches.forEach(item => {

        const div =
            document.createElement("div");

        div.className = "suggestion-item";


        div.innerHTML = `
            <strong>
                ${escapeHtml(item.item_code)}
            </strong>
            <br>
            <small>
                ${escapeHtml(
                    item.item_description || ""
                )}
            </small>
        `;


        div.addEventListener(
            "click",
            () => {

                selectItem(item);

            }
        );


        itemSuggestions.appendChild(div);

    });


    itemSuggestions.style.display = "block";

}


function handleItemSearchKeyboard(event) {

    if (event.key !== "Enter") {
        return;
    }


    const search =
        itemSearch.value.trim().toLowerCase();


    if (!search) return;


    const match =
        masterItems.find(item => {

            const code =
                (item.item_code || "")
                .toLowerCase();

            const description =
                (item.item_description || "")
                .toLowerCase();


            return (
                code === search ||
                description === search
            );

        });


    if (match) {

        event.preventDefault();

        selectItem(match);

        binLocation.focus();

    }

}


function selectItem(item) {

    selectedItem = item;


    itemCode.value =
        item.item_code || "";


    itemDescription.value =
        item.item_description || "";


    category.value =
        item.category || "";


    itemSearch.value =
        item.item_code || "";


    itemSuggestions.innerHTML = "";

    itemSuggestions.style.display = "none";


    binLocation.focus();

}


// =====================================================
// BIN GENERATOR
//
// A1-001 to A5-027
// B1-001 to B5-027
// ...
// I1-001 to I5-027
//
// TOTAL = 1,215 BINS
// =====================================================

function generateBinLocations() {

    const bins = [];


    for (
        let rackLetter = 65;
        rackLetter <= 73;
        rackLetter++
    ) {

        const letter =
            String.fromCharCode(rackLetter);


        for (
            let section = 1;
            section <= 5;
            section++
        ) {

            for (
                let number = 1;
                number <= 27;
                number++
            ) {

                const formattedNumber =
                    String(number).padStart(3, "0");


                bins.push(
                    `${letter}${section}-${formattedNumber}`
                );

            }

        }

    }


       for (let rackLetter = 65; rackLetter <= 71; rackLetter++) {
        const letter = String.fromCharCode(rackLetter);
        bins.push(`${letter}1-OVERFLOW`);
    }

    return bins;

}


const ALL_BINS =
    generateBinLocations();


// =====================================================
// BIN SEARCH
// =====================================================

function setupBinSearch() {

    if (!binLocation) return;


    binLocation.addEventListener(
        "input",
        showBinSuggestions
    );


    binLocation.addEventListener(
        "keydown",
        handleBinKeyboard
    );


    // Close suggestion when clicking outside
    document.addEventListener(
        "click",
        event => {

            if (
                !event.target.closest(
                    "#binLocation"
                ) &&
                !event.target.closest(
                    "#binSuggestions"
                )
            ) {

                binSuggestions.innerHTML = "";

                binSuggestions.style.display =
                    "none";

            }

        }
    );

}


function showBinSuggestions() {

    let search =
        binLocation.value
            .trim()
            .toUpperCase();


    binSuggestions.innerHTML = "";


    if (!search) {

        binSuggestions.style.display =
            "none";

        return;
    }


    const matches =
        ALL_BINS
            .filter(bin =>
                bin.startsWith(search)
            )
            .slice(0, 15);


    if (matches.length === 0) {

        binSuggestions.style.display =
            "none";

        return;
    }


    matches.forEach(bin => {

        const div =
            document.createElement("div");

        div.className =
            "suggestion-item";


        div.textContent = bin;


        div.addEventListener(
            "click",
            () => {

                selectBin(bin);

            }
        );


        binSuggestions.appendChild(div);

    });


    binSuggestions.style.display =
        "block";

}


function handleBinKeyboard(event) {

    if (event.key !== "Enter") {
        return;
    }


    const typed =
        binLocation.value
            .trim()
            .toUpperCase();


    if (!typed) return;


    // Exact match
    if (ALL_BINS.includes(typed)) {

        event.preventDefault();

        selectBin(typed);

        expiryDate.focus();

        return;
    }


    // If there is only one matching suggestion
    const matches =
        ALL_BINS.filter(bin =>
            bin.startsWith(typed)
        );


    if (matches.length === 1) {

        event.preventDefault();

        selectBin(matches[0]);

        expiryDate.focus();

        return;
    }


    showMessage(
        inventoryMessage,
        "Invalid Bin Location. Valid range is A1-001 to I5-027.",
        "error"
    );

}


function selectBin(bin) {

    binLocation.value = bin;

    binSuggestions.innerHTML = "";

    binSuggestions.style.display =
        "none";

}


// =====================================================
// ADD INVENTORY TO PENDING TABLE
// =====================================================

function addInventoryToPendingTable() {

    clearMessage(inventoryMessage);


    // Check warehouse
    if (!warehouse.value) {

        showMessage(
            inventoryMessage,
            "Please select a Warehouse Location.",
            "error"
        );

        warehouse.focus();

        return;
    }


    // Check item
    if (!selectedItem) {

        showMessage(
            inventoryMessage,
            "Please select an item from the Masterlist.",
            "error"
        );

        itemSearch.focus();

        return;
    }


    // Check bin
    const bin =
        binLocation.value
            .trim()
            .toUpperCase();


    if (!ALL_BINS.includes(bin)) {

        showMessage(
            inventoryMessage,
            "Invalid Bin Location. Example: A1-001.",
            "error"
        );

        binLocation.focus();

        return;
    }


    // Check expiry
    if (!expiryDate.value) {

        showMessage(
            inventoryMessage,
            "Please enter Expiry Date.",
            "error"
        );

        expiryDate.focus();

        return;
    }


    // Check quantity
    const qty =
        Number(quantity.value);


    if (
        !quantity.value ||
        isNaN(qty) ||
        qty <= 0
    ) {

        showMessage(
            inventoryMessage,
            "Please enter a valid quantity greater than 0.",
            "error"
        );

        quantity.focus();

        return;
    }


    // Create pending row
    const row = {

        item_id: selectedItem.id,

        item_code:
            selectedItem.item_code,

        item_description:
            selectedItem.item_description,

        category:
            selectedItem.category || "",

        warehouse_location:
            warehouse.value,

        bin_location:
            bin,

        expiry_date:
            expiryDate.value,

        quantity:
            qty

    };


    pendingInventory.push(row);


    renderPendingInventory();

    clearItemFieldsOnly();


    showMessage(
        inventoryMessage,
        "Item added to the table.",
        "success"
    );


    // Focus search for next item
    itemSearch.focus();

}


// =====================================================
// RENDER PENDING INVENTORY
// =====================================================


function renderPendingInventory() {
    if (!pendingInventoryTableBody) return;

    pendingInventoryTableBody.innerHTML = "";

    pendingInventory.forEach((item, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHtml(item.item_code || "")}</td>
            <td>${escapeHtml(item.item_description || "")}</td>
            <td>
                <input type="text"
                    class="pending-edit-warehouse"
                    value="${escapeHtml(item.warehouse_location || "")}"
                    aria-label="Warehouse"
                    style="width:110px">
            </td>
            <td>
                <input type="text"
                    class="pending-edit-bin"
                    value="${escapeHtml(item.bin_location || "")}"
                    aria-label="Bin"
                    style="width:110px">
            </td>
            <td>
                <input type="date"
                    class="pending-edit-expiry"
                    value="${escapeHtml(item.expiry_date || "")}"
                    aria-label="Expiry date">
            </td>
            <td>
                <input type="number"
                    class="pending-edit-quantity"
                    value="${Number(item.quantity || 0)}"
                    min="1"
                    step="1"
                    aria-label="Quantity"
                    style="width:90px">
            </td>
            <td>
                <div class="action-buttons">
                    <button type="button"
                        class="primary-btn"
                        onclick="updatePendingInventory(${index})">
                        UPDATE
                    </button>
                    <button type="button"
                        class="secondary-btn"
                        onclick="removePendingInventory(${index})">
                        REMOVE
                    </button>
                </div>
            </td>
        `;

        pendingInventoryTableBody.appendChild(row);
    });
}



// =====================================================
// REMOVE PENDING ITEM
// =====================================================


function updatePendingInventory(index) {
    const row = pendingInventoryTableBody.querySelectorAll("tr")[index];

    if (!row || !pendingInventory[index]) return;

    const warehouseInput = row.querySelector(".pending-edit-warehouse");
    const binInput = row.querySelector(".pending-edit-bin");
    const expiryInput = row.querySelector(".pending-edit-expiry");
    const quantityInput = row.querySelector(".pending-edit-quantity");

    const newWarehouse = warehouseInput.value.trim();
    const newBin = binInput.value.trim().toUpperCase();
    const newExpiry = expiryInput.value;
    const newQuantity = Number(quantityInput.value);

    if (!newWarehouse) {
        alert("Please enter a Warehouse.");
        warehouseInput.focus();
        return;
    }

    if (!ALL_BINS.includes(newBin)) {
        alert("Invalid Bin Location. Please select a valid bin.");
        binInput.focus();
        return;
    }

    if (!newExpiry) {
        alert("Please enter an Expiry Date.");
        expiryInput.focus();
        return;
    }

    if (!quantityInput.value || !Number.isFinite(newQuantity) ||
        !Number.isInteger(newQuantity) || newQuantity <= 0) {
        alert("Quantity must be a whole number greater than 0.");
        quantityInput.focus();
        return;
    }

    pendingInventory[index] = {
        ...pendingInventory[index],
        warehouse_location: newWarehouse,
        bin_location: newBin,
        expiry_date: newExpiry,
        quantity: newQuantity
    };

    renderPendingInventory();
    window.updatePendingInventory = updatePendingInventory;

    showMessage(
        inventoryMessage,
        "Pending item updated. Press SAVE ALL to save it to inventory.",
        "success"
    );
}

// =====================================================
// SAVE ALL INVENTORY
// =====================================================

async function saveAllInventory() {

    if (!isAdmin()) return;

    clearMessage(inventoryMessage);


    if (pendingInventory.length === 0) {

        showMessage(
            inventoryMessage,
            "There are no items to save.",
            "error"
        );

        return;
    }


    const {
        data: {
            user
        }
    } = await supabaseClient.auth.getUser();


    if (!user) {

        showMessage(
            inventoryMessage,
            "Your session has expired. Please login again.",
            "error"
        );

        return;
    }


    saveInventoryBtn.disabled = true;

    saveInventoryBtn.textContent =
        "SAVING...";


    try {

        // ---------------------------------------------
        // Prepare inventory records
        // ---------------------------------------------

        const inventoryRecords =
            pendingInventory.map(item => ({

                item_id:
                    item.item_id,

                warehouse_location:
                    item.warehouse_location,

                bin_location:
                    item.bin_location,

                expiry_date:
                    item.expiry_date,

                quantity:
                    item.quantity,

                created_by:
                    user.id

            }));


        // ---------------------------------------------
        // Insert inventory
        // ---------------------------------------------

        const {
            data: insertedInventory,
            error: inventoryError
        } = await supabaseClient
            .from("inventory")
            .insert(inventoryRecords)
            .select();


        if (inventoryError) {

            throw inventoryError;

        }


        // ---------------------------------------------
        // Create transaction records
        // ---------------------------------------------

        const transactionRecords =
            pendingInventory.map(item => ({

                item_id:
                    item.item_id,

                transaction_type:
                    "BEGINNING",

                warehouse_location:
                    item.warehouse_location,

                bin_location:
                    item.bin_location,

                expiry_date:
                    item.expiry_date,

                quantity_change:
                    item.quantity,

                reference_no:
                    "BEGINNING-INVENTORY",

                created_by:
                    user.id

            }));


        const {
            error: transactionError
        } = await supabaseClient
            .from("inventory_transactions")
            .insert(transactionRecords);


        if (transactionError) {

            throw transactionError;

        }


        // ---------------------------------------------
        // Success
        // ---------------------------------------------

        showMessage(
            inventoryMessage,
            `${pendingInventory.length} item(s) saved successfully!`,
            "success"
        );


        pendingInventory = [];

        renderPendingInventory();

        clearInventoryForm();


        await loadInventory();


        // Refresh summary if needed
        await loadInventorySummary();


    } catch (error) {

        console.error(
            "Save inventory error:",
            error
        );


        showMessage(
            inventoryMessage,
            "Error saving inventory: " +
            error.message,
            "error"
        );

    }


    saveInventoryBtn.disabled = false;

    saveInventoryBtn.textContent =
        "💾 SAVE ALL";

}


// =====================================================
// CLEAR ITEM FIELDS
// =====================================================

function clearItemFieldsOnly() {

    selectedItem = null;

    itemSearch.value = "";

    itemCode.value = "";

    itemDescription.value = "";

    category.value = "";

    binLocation.value = "";

    expiryDate.value = "";

    quantity.value = "";


    itemSuggestions.innerHTML = "";

    itemSuggestions.style.display =
        "none";

    binSuggestions.innerHTML = "";

    binSuggestions.style.display =
        "none";

}


// =====================================================
// CLEAR COMPLETE FORM
// =====================================================

function clearInventoryForm() {

    clearItemFieldsOnly();

    warehouse.value = "";

}


// =====================================================
// LOAD CURRENT INVENTORY
// =====================================================

async function loadInventory() {

    const {
        data,
        error
    } = await supabaseClient
        .from("inventory")
        .select(`
            id,
            warehouse_location,
            bin_location,
            expiry_date,
            quantity,
            item_id,
            master_items (
                item_code,
                item_description,
                category
            )
        `)
        .order("created_at", {
            ascending: false
        });


    if (error) {

        console.error(
            "Inventory load error:",
            error
        );

        if (inventoryFilterMessage) {
            inventoryFilterMessage.textContent =
                "Unable to load inventory: " + error.message;
        }

        currentInventoryData = [];
        return false;
    }


    currentInventoryData = data || [];

    updateDashboardCards(currentInventoryData);
    populateInventoryLocationFilter(currentInventoryData);
    applyInventoryFilters();
    return true;

}


// =====================================================
// DOWNLOAD CURRENT INVENTORY
// =====================================================

function downloadCurrentInventory() {

    if (!currentInventoryData.length) {
        alert("No current inventory data to download.");
        return;
    }

    const location = inventoryLocationFilter
        ? inventoryLocationFilter.value.trim().toLowerCase()
        : "";

    const search = inventorySearch
        ? inventorySearch.value.trim().toLowerCase()
        : "";

    const filtered = currentInventoryData.filter(row => {
        const item = row.master_items || {};
        const rowLocation = String(row.warehouse_location || "").toLowerCase();
        const code = String(item.item_code || "").toLowerCase();
        const description = String(item.item_description || "").toLowerCase();

        return (!location || rowLocation === location) &&
               (!search || code.includes(search) || description.includes(search));
    });

    if (!filtered.length) {
        alert("No inventory records match the current filters.");
        return;
    }

    const exportRows = filtered.map(row => {
        const item = row.master_items || {};
        return {
            "Item Code": item.item_code || "",
            "Description": item.item_description || "",
            "Category": item.category || "",
            "Warehouse": row.warehouse_location || "",
            "Bin": row.bin_location || "",
            "Expiry Date": row.expiry_date || "",
            "Quantity": Number(row.quantity || 0)
        };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Current Inventory");

    const today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `Current_Inventory_${today}.xlsx`);
}

window.downloadCurrentInventory = downloadCurrentInventory;

if (downloadInventoryBtn) {
    downloadInventoryBtn.addEventListener("click", downloadCurrentInventory);
}


// =====================================================
// CURRENT INVENTORY FILTERS
// =====================================================

function populateInventoryLocationFilter(data) {

    if (!inventoryLocationFilter) return;

    const currentValue = inventoryLocationFilter.value;

    const locations = [...new Set(
        data
            .map(row => (row.warehouse_location || "").trim())
            .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b));

    inventoryLocationFilter.innerHTML =
        `<option value="">All Locations</option>` +
        locations.map(location =>
            `<option value="${escapeHtml(location)}">${escapeHtml(location)}</option>`
        ).join("");

    if (locations.includes(currentValue)) {
        inventoryLocationFilter.value = currentValue;
    }

}


function applyInventoryFilters() {

    const location =
        inventoryLocationFilter
            ? inventoryLocationFilter.value.trim().toLowerCase()
            : "";

    const search =
        inventorySearch
            ? inventorySearch.value.trim().toLowerCase()
            : "";

    const filtered = currentInventoryData.filter(row => {

        const item = row.master_items || {};

        const rowLocation =
            String(row.warehouse_location || "").toLowerCase();

        const code =
            String(item.item_code || "").toLowerCase();

        const description =
            String(item.item_description || "").toLowerCase();

        const matchesLocation =
            !location || rowLocation === location;

        const matchesSearch =
            !search ||
            code.includes(search) ||
            description.includes(search);

        return matchesLocation && matchesSearch;

    });

    renderInventoryTable(filtered);

    if (inventoryFilterMessage) {
        if (!currentInventoryData.length) {
            inventoryFilterMessage.textContent =
                "No inventory data found.";
        } else if (!filtered.length) {
            inventoryFilterMessage.textContent =
                "No inventory found for the selected filters.";
        } else {
            inventoryFilterMessage.textContent =
                `Showing ${filtered.length} inventory record${filtered.length === 1 ? "" : "s"}.`;
        }
    }

}


// =====================================================
// CURRENT INVENTORY TABLE
// =====================================================

function getExpiryStatus(expiryValue) {
    if (!expiryValue) {
        return { key: "no-expiry", label: "No Expiry", days: null };
    }

    // Parse date-only values as local dates to avoid timezone day shifts.
    const parts = String(expiryValue).split("-").map(Number);
    let expiry;
    if (parts.length === 3 && parts.every(Number.isFinite)) {
        expiry = new Date(parts[0], parts[1] - 1, parts[2]);
    } else {
        expiry = new Date(expiryValue);
    }

    if (Number.isNaN(expiry.getTime())) {
        return { key: "no-expiry", label: "Check Date", days: null };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);
    const days = Math.round((expiry.getTime() - today.getTime()) / 86400000);

    if (days < 0) return { key: "expired", label: "Expired", days };
    if (days <= 30) return { key: "expiring", label: days === 0 ? "Expires Today" : `Expires in ${days}d`, days };
    return { key: "good", label: "Good", days };
}

function renderExpiryBadge(expiryValue) {
    const status = getExpiryStatus(expiryValue);
    const dateText = formatDate(expiryValue) || "—";
    return `<span class="expiry-cell"><span>${escapeHtml(dateText)}</span><span class="expiry-badge expiry-${status.key}">${escapeHtml(status.label)}</span></span>`;
}

function updateDashboardCards(data) {
    const rows = Array.isArray(data) ? data : [];
    const uniqueItems = new Set();
    const warehouses = new Set();
    let totalQuantity = 0;
    let expiringSoon = 0;

    rows.forEach(row => {
        const item = row.master_items || {};
        const itemKey = String(item.item_code || row.item_id || "").trim();
        if (itemKey) uniqueItems.add(itemKey.toLowerCase());

        const warehouseName = String(row.warehouse_location || "").trim();
        if (warehouseName) warehouses.add(warehouseName);

        const quantityValue = Number(row.quantity || 0);
        if (Number.isFinite(quantityValue)) totalQuantity += quantityValue;

        const status = getExpiryStatus(row.expiry_date);
        if (status.key === "expiring") expiringSoon += 1;
    });

    const setText = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    };

    setText("dashboardTotalItems", uniqueItems.size.toLocaleString());
    setText("dashboardTotalQuantity", totalQuantity.toLocaleString(undefined, { maximumFractionDigits: 2 }));
    setText("dashboardWarehouses", warehouses.size.toLocaleString());
    setText("dashboardExpiringSoon", expiringSoon.toLocaleString());
}


// =====================================================
// CURRENT INVENTORY TABLE RENDERER
// =====================================================

function renderInventoryTable(data) {

    inventoryTableBody.innerHTML = "";

    // Automatic display sorting: Item Code A-Z, earliest expiry first
    // within each item code, then Bin Location A-Z for matching expiry.
    const sortedData = [...data].sort((a, b) => {
        const itemA = a.master_items || {};
        const itemB = b.master_items || {};

        const codeCompare = String(itemA.item_code || "").localeCompare(
            String(itemB.item_code || ""),
            undefined,
            { numeric: true, sensitivity: "base" }
        );
        if (codeCompare !== 0) return codeCompare;

        const expiryA = String(a.expiry_date || "");
        const expiryB = String(b.expiry_date || "");
        if (!expiryA && expiryB) return 1;
        if (expiryA && !expiryB) return -1;

        const expiryCompare = expiryA.localeCompare(expiryB);
        if (expiryCompare !== 0) return expiryCompare;

        return String(a.bin_location || "").localeCompare(
            String(b.bin_location || ""),
            undefined,
            { numeric: true, sensitivity: "base" }
        );
    });

    sortedData.forEach(row => {

        const item = row.master_items || {};

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${escapeHtml(item.item_code || "")}</td>
            <td>${escapeHtml(item.item_description || "")}</td>
            <td>${escapeHtml(row.warehouse_location || "")}</td>
            <td>${escapeHtml(row.bin_location || "")}</td>
            <td>${renderExpiryBadge(row.expiry_date)}</td>
            <td>${Number(row.quantity || 0).toLocaleString()}</td>
            <td class="admin-only">
                ${isAdmin() ? `<div class="action-buttons">
                    <button type="button" class="edit-btn" onclick="openEditInventory('${row.id}')">✏️ Edit</button>
                    <button type="button" class="delete-btn" onclick="deleteInventory('${row.id}')">🗑️ Delete</button>
                </div>` : ""}
            </td>
        `;

        inventoryTableBody.appendChild(tr);

    });

}


// =====================================================
// EDIT / DELETE CURRENT INVENTORY
// =====================================================

function populateEditItemOptions(selectedItemId) {
    if (!editItemCode) return;

    editItemCode.innerHTML = masterItems.map(item =>
        `<option value="${escapeHtml(item.id)}">${escapeHtml(item.item_code || "")}</option>`
    ).join("");

    editItemCode.value = selectedItemId || "";
    updateEditItemDescription();
}

function updateEditItemDescription() {
    if (!editItemDescription || !editItemCode) return;
    const item = masterItems.find(x => String(x.id) === String(editItemCode.value));
    editItemDescription.value = item ? (item.item_description || "") : "";
}

function openEditInventory(id) {
    if (!isAdmin()) return;
    const row = currentInventoryData.find(x => String(x.id) === String(id));
    if (!row) return;

    populateEditItemOptions(row.item_id);
    editInventoryId.value = row.id;
    editWarehouse.value = row.warehouse_location || "";
    editBin.value = row.bin_location || "";
    editExpiry.value = row.expiry_date || "";
    editQuantity.value = row.quantity ?? 0;
    clearMessage(editInventoryMessage);
    editInventoryModal.classList.remove("hidden");
}

function closeEditInventory() {
    if (editInventoryModal) editInventoryModal.classList.add("hidden");
}

async function saveEditedInventory() {
    if (!isAdmin()) return;

    const id = editInventoryId.value;
    const itemId = editItemCode.value;
    const qty = Number(editQuantity.value);

    if (!id || !itemId || !editWarehouse.value || !editBin.value.trim() || !editExpiry.value || !Number.isFinite(qty) || qty < 0) {
        showMessage(editInventoryMessage, "Please complete all fields with valid values.", "error");
        return;
    }

    saveEditInventoryBtn.disabled = true;
    saveEditInventoryBtn.textContent = "SAVING...";

    try {
        const { error } = await supabaseClient
            .from("inventory")
            .update({
                item_id: itemId,
                warehouse_location: editWarehouse.value,
                bin_location: editBin.value.trim().toUpperCase(),
                expiry_date: editExpiry.value,
                quantity: qty
            })
            .eq("id", id);

        if (error) throw error;

        closeEditInventory();
        await loadInventory();
        await loadInventorySummary();
        alert("Inventory updated successfully.");
    } catch (error) {
        console.error("Edit inventory error:", error);
        showMessage(editInventoryMessage, "Update failed: " + (error.message || "Unknown error"), "error");
    } finally {
        saveEditInventoryBtn.disabled = false;
        saveEditInventoryBtn.textContent = "💾 SAVE CHANGES";
    }
}

async function deleteInventory(id) {
    if (!isAdmin()) return;
    const row = currentInventoryData.find(x => String(x.id) === String(id));
    if (!row) return;

    const item = row.master_items || {};
    const confirmed = window.confirm(
        `Delete this inventory record?\n\n${item.item_code || "Item"} | ${row.warehouse_location || ""} | ${row.bin_location || ""} | Qty: ${row.quantity || 0}\n\nThis deletes the inventory record only. Transaction history is preserved.`
    );
    if (!confirmed) return;

    try {
        const { error } = await supabaseClient
            .from("inventory")
            .delete()
            .eq("id", id);

        if (error) throw error;

        await loadInventory();
        await loadInventorySummary();
        alert("Inventory record deleted successfully.");
    } catch (error) {
        console.error("Delete inventory error:", error);
        alert("Delete failed: " + (error.message || "Unknown error") + "\n\nCheck your Supabase DELETE/RLS policy.");
    }
}

window.openEditInventory = openEditInventory;
window.deleteInventory = deleteInventory;

if (editItemCode) editItemCode.addEventListener("change", updateEditItemDescription);
if (closeEditModalBtn) closeEditModalBtn.addEventListener("click", closeEditInventory);
if (saveEditInventoryBtn) saveEditInventoryBtn.addEventListener("click", saveEditedInventory);
if (editInventoryModal) {
    editInventoryModal.addEventListener("click", event => {
        if (event.target === editInventoryModal) closeEditInventory();
    });
}

// =====================================================
// REFRESH / FILTER / RESET CURRENT INVENTORY
// =====================================================

if (refreshInventoryBtn) {

    refreshInventoryBtn.addEventListener(
        "click",
        loadInventory
    );

}

if (inventoryLocationFilter) {

    inventoryLocationFilter.addEventListener(
        "change",
        applyInventoryFilters
    );

}

if (inventorySearch) {

    inventorySearch.addEventListener(
        "input",
        applyInventoryFilters
    );

}


async function resetInventoryData() {

    if (!isAdmin()) return;

    const confirmed = window.confirm(
        "RESET INVENTORY DATA?\n\n" +
        "This will permanently delete ALL inventory records and ALL inventory transaction records.\n\n" +
        "Your Masterlist will NOT be deleted.\n\n" +
        "Continue?"
    );

    if (!confirmed) return;

    const secondConfirm = window.prompt(
        'Type RESET to confirm deleting all inventory data:'
    );

    if (secondConfirm !== "RESET") {
        alert("Reset cancelled.");
        return;
    }

    if (resetInventoryBtn) {
        resetInventoryBtn.disabled = true;
        resetInventoryBtn.textContent = "⏳ RESETTING...";
    }

    try {

        // Delete transaction history first.
        const {
            error: transactionError
        } = await supabaseClient
            .from("inventory_transactions")
            .delete()
            .not("id", "is", null);

        if (transactionError) {
            throw transactionError;
        }

        // Then delete all inventory rows.
        const {
            error: inventoryError
        } = await supabaseClient
            .from("inventory")
            .delete()
            .not("id", "is", null);

        if (inventoryError) {
            throw inventoryError;
        }

        currentInventoryData = [];

        if (inventorySearch) inventorySearch.value = "";
        if (inventoryLocationFilter) {
            inventoryLocationFilter.innerHTML =
                '<option value="">All Locations</option>';
            inventoryLocationFilter.value = "";
        }

        renderInventoryTable([]);

        if (inventoryFilterMessage) {
            inventoryFilterMessage.textContent =
                "Inventory has been reset. Masterlist was preserved.";
        }

        await loadInventorySummary();

        alert("Inventory reset successfully.");

    } catch (error) {

        console.error("Inventory reset error:", error);

        alert(
            "Reset failed: " +
            (error.message || "Unknown error") +
            "\n\nCheck your Supabase DELETE/RLS policies."
        );

    } finally {

        if (resetInventoryBtn) {
            resetInventoryBtn.disabled = false;
            resetInventoryBtn.textContent = "🗑️ RESET INVENTORY";
        }

    }

}

if (resetInventoryBtn) {

    resetInventoryBtn.addEventListener(
        "click",
        resetInventoryData
    );

}

// The Summary is calculated directly from the inventory table.
// Therefore resetting the Summary also resets the underlying inventory
// and transaction history, then reloads the empty Summary.
if (resetSummaryBtn) {

    resetSummaryBtn.addEventListener(
        "click",
        resetInventoryData
    );

}


// =====================================================
// INVENTORY SUMMARY
//
// GROUP BY:
// Warehouse
// Item
// Expiry Date
//
// BIN IS NOT INCLUDED
// =====================================================

function setupSummary() {

    if (!refreshSummaryBtn) return;


    refreshSummaryBtn.addEventListener(
        "click",
        loadInventorySummary
    );


    if (summaryWarehouse) {
        summaryWarehouse.addEventListener(
            "change",
            loadInventorySummary
        );
    }

}


// =====================================================
// LOAD SUMMARY
// =====================================================

async function loadInventorySummary() {

    if (!summaryTableBody) return;


    summaryTableBody.innerHTML = `
        <tr>
            <td colspan="6">
                Loading summary...
            </td>
        </tr>
    `;


    let query =
        supabaseClient
            .from("inventory")
            .select(`
                warehouse_location,
                expiry_date,
                quantity,
                item_id,
                master_items (
                    item_code,
                    item_description,
                    category
                )
            `);


    if (
        summaryWarehouse &&
        summaryWarehouse.value
    ) {

        query =
            query.eq(
                "warehouse_location",
                summaryWarehouse.value
            );

    }


    const {
        data,
        error
    } = await query;


    if (error) {

        console.error(
            "Summary error:",
            error
        );


        summaryTableBody.innerHTML = `
            <tr>
                <td colspan="6">
                    Error loading summary:
                    ${escapeHtml(error.message)}
                </td>
            </tr>
        `;

        return;
    }


    const grouped =
        groupInventoryForSummary(data || []);


    renderSummaryTable(grouped);

}


// =====================================================
// GROUP INVENTORY
// =====================================================

function groupInventoryForSummary(data) {

    const groups = {};


    data.forEach(row => {

        const item =
            row.master_items || {};


        const warehouseValue =
            row.warehouse_location || "";


        const itemCode =
            item.item_code || "";


        const expiry =
            row.expiry_date || "";


        const key =
            `${warehouseValue}||${itemCode}||${expiry}`;


        if (!groups[key]) {

            groups[key] = {

                warehouse:
                    warehouseValue,

                item_code:
                    itemCode,

                item_description:
                    item.item_description || "",

                category:
                    item.category || "",

                expiry_date:
                    expiry,

                quantity: 0

            };

        }


        groups[key].quantity +=
            Number(row.quantity || 0);

    });


    return Object.values(groups);

}


// =====================================================
// RENDER SUMMARY TABLE
// =====================================================

function renderSummaryTable(data) {

    summaryTableBody.innerHTML = "";


    if (data.length === 0) {

        summaryTableBody.innerHTML = `
            <tr>
                <td colspan="6">
                    No inventory found.
                </td>
            </tr>
        `;

        return;
    }


    // Sort
    data.sort((a, b) => {

        if (a.warehouse !== b.warehouse) {

            return a.warehouse.localeCompare(
                b.warehouse
            );

        }


        if (a.item_code !== b.item_code) {

            return a.item_code.localeCompare(
                b.item_code
            );

        }


        if (!a.expiry_date && b.expiry_date) return 1;
        if (a.expiry_date && !b.expiry_date) return -1;
        return String(a.expiry_date || "").localeCompare(
            String(b.expiry_date || "")
        );

    });


    data.forEach(row => {

        const tr =
            document.createElement("tr");


        tr.innerHTML = `
            <td>
                ${escapeHtml(
                    row.warehouse
                )}
            </td>

            <td>
                ${escapeHtml(
                    row.item_code
                )}
            </td>

            <td>
                ${escapeHtml(
                    row.item_description
                )}
            </td>

            <td>
                ${escapeHtml(
                    row.category
                )}
            </td>

            <td>
                ${renderExpiryBadge(row.expiry_date)}
            </td>

            <td>
                <strong>
                    ${Number(
                        row.quantity
                    ).toLocaleString()}
                </strong>
            </td>
        `;


        summaryTableBody.appendChild(tr);

    });

}


// =====================================================
// MASTERLIST EXCEL UPLOAD
// =====================================================

function setupMasterlist() {

    if (!uploadMasterlistBtn) return;


    uploadMasterlistBtn.addEventListener(
        "click",
        uploadMasterlist
    );

}


async function uploadMasterlist() {

    if (!isAdmin()) return;

    clearMessage(masterlistMessage);


    const file =
        masterlistFile.files[0];


    if (!file) {

        showMessage(
            masterlistMessage,
            "Please select an Excel file first.",
            "error"
        );

        return;
    }


    uploadMasterlistBtn.disabled = true;

    uploadMasterlistBtn.textContent =
        "UPLOADING...";


    try {

        const arrayBuffer =
            await file.arrayBuffer();


        const workbook =
            XLSX.read(
                arrayBuffer,
                {
                    type: "array"
                }
            );


        const firstSheetName =
            workbook.SheetNames[0];


        const worksheet =
            workbook.Sheets[firstSheetName];


        const rows =
            XLSX.utils.sheet_to_json(
                worksheet,
                {
                    defval: ""
                }
            );


        if (!rows.length) {

            throw new Error(
                "The Excel file is empty."
            );

        }


        const records =
            prepareMasterlistRecords(rows);


        if (!records.length) {

            throw new Error(
                "No valid masterlist records found."
            );

        }


        // Upsert in batches
        const batchSize = 500;


        for (
            let i = 0;
            i < records.length;
            i += batchSize
        ) {

            const batch =
                records.slice(
                    i,
                    i + batchSize
                );


            const {
                error
            } = await supabaseClient
                .from("master_items")
                .upsert(
                    batch,
                    {
                        onConflict: "item_code"
                    }
                );


            if (error) {

                throw error;

            }

        }


        showMessage(
            masterlistMessage,
            `${records.length} item(s) uploaded successfully!`,
            "success"
        );


        await loadMasterlist();


    } catch (error) {

        console.error(
            "Masterlist upload error:",
            error
        );


        showMessage(
            masterlistMessage,
            "Upload failed: " +
            error.message,
            "error"
        );

    }


    uploadMasterlistBtn.disabled = false;

    uploadMasterlistBtn.textContent =
        "📥 UPLOAD MASTERLIST";

}


// =====================================================
// PREPARE MASTERLIST
// =====================================================

function prepareMasterlistRecords(rows) {

    const records = [];


    rows.forEach(row => {

        const code =
            getColumnValue(
                row,
                [
                    "Item Code",
                    "ItemCode",
                    "item_code",
                    "ITEM CODE",
                    "Code"
                ]
            );


        const description =
            getColumnValue(
                row,
                [
                    "Item Description",
                    "Description",
                    "item_description",
                    "ITEM DESCRIPTION"
                ]
            );


        const categoryValue =
            getColumnValue(
                row,
                [
                    "Category",
                    "category",
                    "CATEGORY"
                ]
            );


        if (!code || !description) {
            return;
        }


        records.push({

            item_code:
                String(code).trim(),

            item_description:
                String(description).trim(),

            category:
                categoryValue
                    ? String(categoryValue).trim()
                    : null

        });

    });


    return records;

}


// =====================================================
// GET EXCEL COLUMN VALUE
// =====================================================

function getColumnValue(row, possibleNames) {

    for (const name of possibleNames) {

        if (
            Object.prototype.hasOwnProperty.call(
                row,
                name
            )
        ) {

            return row[name];

        }

    }


    return "";

}


// =====================================================
// HELPERS
// =====================================================

function showMessage(
    element,
    message,
    type
) {

    if (!element) return;


    element.textContent =
        message;


    element.className =
        "message " + type;

}


function clearMessage(element) {

    if (!element) return;


    element.textContent = "";

    element.className = "message";

}


function escapeHtml(value) {

    if (value === null ||
        value === undefined) {

        return "";

    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function formatDate(dateValue) {

    if (!dateValue) {
        return "";
    }


    const date =
        new Date(dateValue);


    if (isNaN(date.getTime())) {
        return dateValue;
    }


    return date.toLocaleDateString(
        "en-US",
        {
            month: "2-digit",
            day: "2-digit",
            year: "numeric"
        }
    );

}

// =====================================================
// OUTBOUND UPLOAD
// =====================================================

function normalizeOutboundDate(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "";
    }

    // JavaScript Date
    if (
        value instanceof Date &&
        !isNaN(value.getTime())
    ) {
        const year = value.getFullYear();
        const month =
            String(value.getMonth() + 1).padStart(2, "0");
        const day =
            String(value.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    // Excel serial date
    if (typeof value === "number") {

        const excelEpoch =
            new Date(Date.UTC(1899, 11, 30));

        const date =
            new Date(
                excelEpoch.getTime() +
                value * 86400000
            );

        if (!isNaN(date.getTime())) {

            const year =
                date.getUTCFullYear();

            const month =
                String(
                    date.getUTCMonth() + 1
                ).padStart(2, "0");

            const day =
                String(
                    date.getUTCDate()
                ).padStart(2, "0");

            return `${year}-${month}-${day}`;
        }
    }

    const text =
        String(value).trim();

    if (!text) {
        return "";
    }

    // YYYY-MM-DD
    if (
        /^\d{4}-\d{1,2}-\d{1,2}$/.test(text)
    ) {

        const parts =
            text.split("-");

        return `${parts[0]}-${String(parts[1]).padStart(2, "0")}-${String(parts[2]).padStart(2, "0")}`;
    }

    // MM/DD/YYYY
    if (
        /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(text)
    ) {

        const parts =
            text.split("/");

        return `${parts[2]}-${String(parts[0]).padStart(2, "0")}-${String(parts[1]).padStart(2, "0")}`;
    }

    // MM-DD-YYYY
    if (
        /^\d{1,2}-\d{1,2}-\d{4}$/.test(text)
    ) {

        const parts =
            text.split("-");

        return `${parts[2]}-${String(parts[0]).padStart(2, "0")}-${String(parts[1]).padStart(2, "0")}`;
    }

    const parsed =
        new Date(text);

    if (!isNaN(parsed.getTime())) {

        const year =
            parsed.getFullYear();

        const month =
            String(
                parsed.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                parsed.getDate()
            ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    return "";
}


// =====================================================
// GET OUTBOUND COLUMN
// =====================================================

function getOutboundColumn(row, names) {

    if (!row) {
        return "";
    }

    for (const name of names) {

        if (
            Object.prototype.hasOwnProperty.call(
                row,
                name
            )
        ) {
            return row[name];
        }
    }

    // Case-insensitive fallback
    const rowKeys =
        Object.keys(row);

    for (const name of names) {

        const foundKey =
            rowKeys.find(
                key =>
                    String(key)
                        .trim()
                        .toLowerCase() ===
                    String(name)
                        .trim()
                        .toLowerCase()
            );

        if (foundKey !== undefined) {
            return row[foundKey];
        }
    }

    return "";
}


// =====================================================
// SHOW OUTBOUND MESSAGE
// =====================================================

function showOutboundMessage(
    message,
    type = ""
) {

    if (!outboundMessage) {
        return;
    }

    outboundMessage.textContent =
        message || "";

    outboundMessage.className =
        "message";

    if (type) {
        outboundMessage.classList.add(type);
    }
}


// =====================================================
// VALIDATE OUTBOUND ROW
// =====================================================

function validateOutboundRow(row) {

    if (!row) return "Invalid row.";
    if (!row.itemCode) return "Missing Item Code.";
    if (!row.warehouse) return "Missing Warehouse.";
    if (!row.expiryDate || !/^\d{4}-\d{2}-\d{2}$/.test(row.expiryDate)) return "Missing or invalid Expiry Date.";

    if (
        row.quantity === "" ||
        row.quantity === null ||
        row.quantity === undefined ||
        !Number.isFinite(Number(row.quantity)) ||
        Number(row.quantity) <= 0
    ) return "Quantity must be greater than zero.";

    if (!row.referenceNo) return "Missing Reference No.";

    if (Array.isArray(masterItems)) {
        const itemExists = masterItems.some(item =>
            String(item.item_code || "").trim().toUpperCase() ===
            String(row.itemCode).trim().toUpperCase()
        );
        if (!itemExists) return "Item Code not found in Masterlist.";
    }

    return "";
}


// =====================================================
// OUTBOUND TABLE HEADER
// =====================================================

function setupOutboundTableHeader() {
    if (!outboundTableBody) return;
    const table = outboundTableBody.closest("table");
    const thead = table?.querySelector("thead");
    if (!thead) return;
    thead.innerHTML = `
        <tr>
            <th>Item Code</th>
            <th>Warehouse</th>
            <th>Expiry Date</th>
            <th>Quantity</th>
            <th>Reference No.</th>
            <th>Action</th>
        </tr>
    `;
}


// =====================================================
// INBOUND UPLOAD
// Required Excel columns: Item Code, Warehouse, Bin, Expiry Date, Quantity
// =====================================================
function showInboundMessage(message, type = "") {
    if (!inboundMessage) return;
    inboundMessage.textContent = message || "";
    inboundMessage.className = "message";
    if (type) inboundMessage.classList.add(type);
}

function validateInboundRow(row) {
    if (!row.itemCode) return "Item Code is required.";
    if (!masterItems.some(item => String(item.item_code || "").trim().toUpperCase() === row.itemCode)) {
        return `Item Code ${row.itemCode} was not found in Masterlist.`;
    }
    if (!row.warehouse) return "Warehouse is required.";
    if (!row.bin) return "Bin is required.";
    if (!ALL_BINS.includes(row.bin)) return `Invalid Bin ${row.bin}. Please use a valid bin location.`;
    if (!row.expiryDate || !/^\d{4}-\d{2}-\d{2}$/.test(row.expiryDate) || Number.isNaN(new Date(row.expiryDate + "T00:00:00").getTime())) return "A valid Expiry Date is required.";
    if (row.quantity === "" || !Number.isFinite(Number(row.quantity)) || Number(row.quantity) <= 0) return "Quantity must be a number greater than 0.";
    return "";
}

function renderInboundPreview() {
    if (!inboundTableBody) return;
    inboundTableBody.innerHTML = "";
    if (!pendingInbound.length) {
        inboundTableBody.innerHTML = '<tr><td colspan="5" class="empty-state">No inbound data loaded.</td></tr>';
        return;
    }
    pendingInbound.forEach((row, index) => {
        const validation = validateInboundRow(row);
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${escapeHtml(row.itemCode)}</td><td>${escapeHtml(row.warehouse)}</td><td>${escapeHtml(row.bin)}</td><td>${escapeHtml(row.expiryDate)}</td><td>${Number(row.quantity || 0).toLocaleString()}</td>`;
        if (validation) tr.title = `Excel row ${index + 2}: ${validation}`;
        inboundTableBody.appendChild(tr);
    });
}

function setupInboundUpload() {
    if (inboundUploadInitialized) return;
    if (!inboundFile || !previewInboundBtn || !inboundTableBody || !processInboundBtn) {
        console.warn("Inbound Upload elements not found. Check inbound HTML IDs.");
        return;
    }
    inboundUploadInitialized = true;
    renderInboundPreview();

    previewInboundBtn.addEventListener("click", async () => {
        if (!isAdmin()) {
            showInboundMessage("Only admin users can process inbound transactions.", "error");
            return;
        }
        const file = inboundFile.files && inboundFile.files[0];
        if (!file) {
            showInboundMessage("Please select an Excel file first.", "error");
            return;
        }
        try {
            showInboundMessage("Reading inbound file...", "info");
            const workbook = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true });
            if (!workbook.SheetNames || !workbook.SheetNames.length) throw new Error("No worksheet found.");
            const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: "", raw: true });
            if (!rows.length) {
                pendingInbound = [];
                renderInboundPreview();
                showInboundMessage("The Excel file is empty.", "error");
                return;
            }
            pendingInbound = rows.map(row => {
                const code = String(getOutboundColumn(row, ["Item Code", "ItemCode", "item_code", "ITEM CODE", "Code"]) || "").trim().toUpperCase();
                const wh = String(getOutboundColumn(row, ["Warehouse", "Warehouse Location", "warehouse_location", "LOCATION"]) || "").trim().toUpperCase();
                const bin = String(getOutboundColumn(row, ["Bin", "Bin Location", "bin_location", "BIN"]) || "").trim().toUpperCase();
                const expiry = normalizeOutboundDate(getOutboundColumn(row, ["Expiry Date", "Expiry", "expiry_date", "EXPIRY DATE"]));
                const q = getOutboundColumn(row, ["Quantity", "Qty", "QTY", "quantity"]);
                return { itemCode: code, warehouse: wh, bin, expiryDate: expiry, quantity: q === "" ? "" : Number(q) };
            });
            renderInboundPreview();
            const invalid = pendingInbound.map((row, i) => ({ rowNumber: i + 2, error: validateInboundRow(row) })).filter(x => x.error);
            if (invalid.length) showInboundMessage(`Preview loaded: ${pendingInbound.length} row(s). First issue at Excel row ${invalid[0].rowNumber}: ${invalid[0].error}`, "error");
            else showInboundMessage(`Preview successful: ${pendingInbound.length} row(s). No stock has been changed.`, "success");
        } catch (error) {
            console.error("Inbound preview error:", error);
            pendingInbound = [];
            renderInboundPreview();
            showInboundMessage("Unable to read inbound file: " + (error.message || "Unknown error"), "error");
        }
    });
    processInboundBtn.addEventListener("click", processInbound);
}

async function processInbound() {
    if (!isAdmin()) {
        showInboundMessage("Only admin users can process inbound transactions.", "error");
        return;
    }
    if (!pendingInbound.length) {
        showInboundMessage("Please upload and preview an inbound Excel file first.", "error");
        return;
    }
    const invalid = pendingInbound.map((row, i) => ({ rowNumber: i + 2, error: validateInboundRow(row) })).filter(x => x.error);
    if (invalid.length) {
        showInboundMessage(`Cannot process. Excel row ${invalid[0].rowNumber}: ${invalid[0].error}`, "error");
        return;
    }
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
        showInboundMessage("Your session has expired. Please login again.", "error");
        return;
    }
    processInboundBtn.disabled = true;
    const oldLabel = processInboundBtn.textContent;
    processInboundBtn.textContent = "PROCESSING...";
    try {
        showInboundMessage("Processing inbound and updating inventory...", "info");
        const { data: inventoryRows, error: inventoryError } = await supabaseClient
            .from("inventory")
            .select("id,item_id,warehouse_location,bin_location,expiry_date,quantity");
        if (inventoryError) throw inventoryError;
        const existingRows = inventoryRows || [];
        const planned = new Map();
        const masterByCode = new Map(masterItems.map(item => [String(item.item_code || "").trim().toUpperCase(), item]));
        const keyFor = (itemId, wh, bin, expiry) => `${itemId}||${wh}||${bin}||${expiry}`;
        existingRows.forEach(row => {
            const key = keyFor(row.item_id, String(row.warehouse_location || "").trim().toUpperCase(), String(row.bin_location || "").trim().toUpperCase(), normalizeOutboundDate(row.expiry_date));
            if (!planned.has(key)) planned.set(key, { existingId: row.id, item_id: row.item_id, warehouse_location: row.warehouse_location, bin_location: row.bin_location, expiry_date: normalizeOutboundDate(row.expiry_date), quantity: Number(row.quantity || 0), isNew: false });
            else planned.get(key).quantity += Number(row.quantity || 0);
        });
        const inboundTotals = new Map();
        pendingInbound.forEach(row => {
            const item = masterByCode.get(row.itemCode);
            const key = keyFor(item.id, row.warehouse, row.bin, row.expiryDate);
            if (!inboundTotals.has(key)) inboundTotals.set(key, { item, row, quantity: 0 });
            inboundTotals.get(key).quantity += Number(row.quantity);
            if (!planned.has(key)) planned.set(key, { item_id: item.id, warehouse_location: row.warehouse, bin_location: row.bin, expiry_date: row.expiryDate, quantity: 0, isNew: true });
            planned.get(key).quantity += Number(row.quantity);
        });
        // Save stock records first; log every inbound row afterward.
        for (const [key, incoming] of inboundTotals) {
            const target = planned.get(key);
            if (target.isNew) {
                const { data, error } = await supabaseClient.from("inventory").insert({ item_id: target.item_id, warehouse_location: target.warehouse_location, bin_location: target.bin_location, expiry_date: target.expiry_date, quantity: incoming.quantity, created_by: user.id }).select("id").single();
                if (error) throw error;
                target.existingId = data.id;
                target.isNew = false;
            } else {
                // Existing record(s) with the exact key are consolidated into one record to avoid lost quantity.
                const matches = existingRows.filter(r => String(r.item_id) === String(target.item_id) && String(r.warehouse_location || "").trim().toUpperCase() === String(target.warehouse_location || "").trim().toUpperCase() && String(r.bin_location || "").trim().toUpperCase() === String(target.bin_location || "").trim().toUpperCase() && normalizeOutboundDate(r.expiry_date) === target.expiry_date);
                const primary = matches[0];
                const otherIds = matches.slice(1).map(r => r.id);
                if (primary) {
                    const newQty = matches.reduce((sum, r) => sum + Number(r.quantity || 0), 0) + incoming.quantity;
                    const { error } = await supabaseClient.from("inventory").update({ quantity: newQty }).eq("id", primary.id);
                    if (error) throw error;
                    for (const id of otherIds) {
                        const { error: deleteError } = await supabaseClient.from("inventory").delete().eq("id", id);
                        if (deleteError) throw deleteError;
                    }
                } else {
                    const { error } = await supabaseClient.from("inventory").insert({ item_id: target.item_id, warehouse_location: target.warehouse_location, bin_location: target.bin_location, expiry_date: target.expiry_date, quantity: incoming.quantity, created_by: user.id });
                    if (error) throw error;
                }
            }
        }
        const transactionRows = pendingInbound.map(row => ({ item_id: masterByCode.get(row.itemCode).id, transaction_type: "INBOUND", warehouse_location: row.warehouse, bin_location: row.bin, expiry_date: row.expiryDate, quantity_change: Number(row.quantity), reference_no: "INBOUND-UPLOAD", created_by: user.id }));
        const { error: txError } = await supabaseClient.from("inventory_transactions").insert(transactionRows);
        if (txError) throw txError;
        const count = pendingInbound.length;
        pendingInbound = [];
        inboundFile.value = "";
        renderInboundPreview();
        await loadInventory();
        await loadInventorySummary();
        showInboundMessage(`Inbound processed successfully. ${count} row(s) added to inventory.`, "success");
    } catch (error) {
        console.error("Process inbound error:", error);
        showInboundMessage("Inbound processing failed: " + (error.message || "Unknown error") + ". Please check Current Inventory before retrying, as some rows may already have been saved.", "error");
    } finally {
        processInboundBtn.disabled = false;
        processInboundBtn.textContent = oldLabel;
    }
}


// =====================================================
// SETUP OUTBOUND UPLOAD
// =====================================================

function setupOutboundUpload() {

    if (
        !outboundFile ||
        !previewOutboundBtn
    ) {

        console.warn(
            "Outbound Upload elements not found."
        );

        return;
    }

    setupOutboundTableHeader();


    // =================================================
    // PREVIEW
    // =================================================

    previewOutboundBtn.addEventListener(
        "click",
        async function () {

            if (!isAdmin()) {

                showOutboundMessage(
                    "Only admin users can process outbound transactions.",
                    "error"
                );

                return;
            }

            const file =
                outboundFile.files[0];

            if (!file) {

                showOutboundMessage(
                    "Please select an Excel file first.",
                    "error"
                );

                return;
            }

            try {

                showOutboundMessage(
                    "Reading outbound file...",
                    "info"
                );

                const arrayBuffer =
                    await file.arrayBuffer();

                const workbook =
                    XLSX.read(
                        arrayBuffer,
                        {
                            type: "array",
                            cellDates: true
                        }
                    );

                if (
                    !workbook.SheetNames ||
                    workbook.SheetNames.length === 0
                ) {

                    throw new Error(
                        "No worksheet found."
                    );
                }

                const firstSheet =
                    workbook.Sheets[
                        workbook.SheetNames[0]
                    ];

                const rows =
                    XLSX.utils.sheet_to_json(
                        firstSheet,
                        {
                            defval: "",
                            raw: true
                        }
                    );

                if (!rows.length) {

                    showOutboundMessage(
                        "The Excel file is empty.",
                        "error"
                    );

                    pendingOutbound = [];

                    renderOutboundPreview();

                    return;
                }


                // =========================================
                // CONVERT EXCEL ROWS
                // =========================================

                pendingOutbound =
                    rows.map(row => {

                        const itemCode =
                            String(
                                getOutboundColumn(
                                    row,
                                    [
                                        "Item Code",
                                        "ItemCode",
                                        "item_code",
                                        "ITEM CODE",
                                        "Code"
                                    ]
                                ) || ""
                            )
                            .trim()
                            .toUpperCase();


                        const warehouse =
                            String(
                                getOutboundColumn(
                                    row,
                                    [
                                        "Warehouse",
                                        "Warehouse Location",
                                        "warehouse_location",
                                        "LOCATION"
                                    ]
                                ) || ""
                            )
                            .trim()
                            .toUpperCase();


                        const expiryDate =
                            normalizeOutboundDate(
                                getOutboundColumn(
                                    row,
                                    [
                                        "Expiry Date",
                                        "Expiry",
                                        "expiry_date",
                                        "EXPIRY DATE"
                                    ]
                                )
                            );


                        const quantityValue =
                            getOutboundColumn(
                                row,
                                [
                                    "Quantity",
                                    "Qty",
                                    "QTY",
                                    "quantity"
                                ]
                            );

                        const quantity =
                            quantityValue === ""
                                ? ""
                                : Number(
                                    quantityValue
                                );


                        const referenceNo =
                            String(
                                getOutboundColumn(
                                    row,
                                    [
                                        "Reference",
                                        "Reference No.",
                                        "Reference No",
                                        "Reference Number",
                                        "Ref",
                                        "REF"
                                    ]
                                ) || ""
                            )
                            .trim();


                        return {

                            itemCode,

                            warehouse,

                            expiryDate,

                            quantity,

                            referenceNo
                        };
                    });


                // =========================================
                // SHOW PREVIEW
                // =========================================

                renderOutboundPreview();


                const invalidRows =
                    pendingOutbound
                        .map(
                            (row, index) => ({
                                rowNumber:
                                    index + 2,

                                error:
                                    validateOutboundRow(
                                        row
                                    )
                            })
                        )
                        .filter(
                            row =>
                                row.error
                        );


                if (
                    invalidRows.length > 0
                ) {

                    showOutboundMessage(
                        `${pendingOutbound.length} row(s) loaded. ${invalidRows.length} row(s) need correction before processing.`,
                        "error"
                    );

                } else {

                    showOutboundMessage(
                        `${pendingOutbound.length} row(s) loaded. Please review before processing.`,
                        "success"
                    );
                }

            } catch (error) {

                console.error(
                    "Outbound preview error:",
                    error
                );

                showOutboundMessage(
                    "Unable to read outbound file: " +
                    (
                        error.message ||
                        "Unknown error"
                    ),
                    "error"
                );
            }
        }
    );


    // =================================================
    // PROCESS BUTTON
    // =================================================

    if (processOutboundBtn) {

        processOutboundBtn.addEventListener(
            "click",
            processOutbound
        );
    }


    // =================================================
    // CANCEL BUTTON
    // =================================================

    if (cancelOutboundBtn) {

        cancelOutboundBtn.addEventListener(
            "click",
            cancelOutboundUpload
        );
    }
}


// =====================================================
// RENDER OUTBOUND PREVIEW
// =====================================================

function renderOutboundPreview() {
    if (!outboundTableBody) return;
    outboundTableBody.innerHTML = "";

    if (!pendingOutbound || pendingOutbound.length === 0) {
        outboundTableBody.innerHTML = `<tr><td colspan="6" class="empty-state">No outbound data loaded.</td></tr>`;
        return;
    }

    pendingOutbound.forEach((row, index) => {
        const validation = validateOutboundRow(row);
        const tr = document.createElement("tr");
        if (validation) tr.classList.add("invalid-row");
        tr.innerHTML = `
            <td><input type="text" value="${escapeHtml(row.itemCode || "")}" data-field="itemCode" data-index="${index}" class="outbound-edit-input"></td>
            <td><input type="text" value="${escapeHtml(row.warehouse || "")}" data-field="warehouse" data-index="${index}" class="outbound-edit-input"></td>
            <td><input type="date" value="${escapeHtml(row.expiryDate || "")}" data-field="expiryDate" data-index="${index}" class="outbound-edit-input"></td>
            <td><input type="number" min="0" step="0.01" value="${Number.isFinite(Number(row.quantity)) ? row.quantity : ""}" data-field="quantity" data-index="${index}" class="outbound-edit-input"></td>
            <td><input type="text" value="${escapeHtml(row.referenceNo || "")}" data-field="referenceNo" data-index="${index}" class="outbound-edit-input"></td>
            <td><button type="button" class="outbound-remove-btn" data-remove-index="${index}">🗑 Remove</button></td>
        `;
        outboundTableBody.appendChild(tr);
    });
    setupOutboundEditing();
}


// =====================================================
// OUTBOUND EDITING
// =====================================================

function setupOutboundEditing() {

    if (!outboundTableBody) {
        return;
    }

    const inputs =
        outboundTableBody.querySelectorAll(
            ".outbound-edit-input"
        );


    inputs.forEach(input => {

        input.addEventListener(
            "input",
            function () {

                const index =
                    Number(
                        this.dataset.index
                    );

                const field =
                    this.dataset.field;

                if (
                    !pendingOutbound[index] ||
                    !field
                ) {
                    return;
                }

                let value =
                    this.value;


                if (
                    field === "itemCode" ||
                    field === "warehouse"
                ) {

                    value =
                        value
                            .trim()
                            .toUpperCase();
                }


                if (
                    field === "expiryDate"
                ) {

                    value =
                        normalizeOutboundDate(
                            value
                        );
                }


                if (
                    field === "quantity"
                ) {

                    value =
                        value === ""
                            ? ""
                            : Number(value);
                }


                if (
                    field === "referenceNo"
                ) {

                    value =
                        value.trim();
                }


                pendingOutbound[index][field] =
                    value;

                refreshOutboundRowStatus(
                    index
                );
            }
        );
    });


    const removeButtons =
        outboundTableBody.querySelectorAll(
            ".outbound-remove-btn"
        );


    removeButtons.forEach(button => {

        button.addEventListener(
            "click",
            function () {

                const index =
                    Number(
                        this.dataset.removeIndex
                    );

                removeOutboundRow(index);
            }
        );
    });
}


// =====================================================
// REFRESH ROW VALIDATION
// =====================================================

function refreshOutboundRowStatus(
    index
) {

    if (!outboundTableBody) {
        return;
    }

    const rows =
        outboundTableBody.querySelectorAll(
            "tr"
        );

    const row =
        rows[index];

    if (!row) {
        return;
    }

    const validation =
        validateOutboundRow(
            pendingOutbound[index]
        );

    if (validation === "") {

        row.classList.remove(
            "invalid-row"
        );

        row.title = "";

    } else {

        row.classList.add(
            "invalid-row"
        );

        row.title = validation;
    }
}


// =====================================================
// REMOVE OUTBOUND ROW
// =====================================================

function removeOutboundRow(index) {

    if (
        !pendingOutbound ||
        !pendingOutbound[index]
    ) {
        return;
    }

    pendingOutbound.splice(
        index,
        1
    );

    renderOutboundPreview();

    showOutboundMessage(
        pendingOutbound.length
            ? `${pendingOutbound.length} outbound row(s) remaining.`
            : "All outbound rows were removed.",
        "info"
    );
}


// =====================================================
// CANCEL OUTBOUND UPLOAD
// =====================================================

function cancelOutboundUpload() {

    pendingOutbound = [];

    if (outboundFile) {
        outboundFile.value = "";
    }

    if (outboundTableBody) {

        outboundTableBody.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="empty-state"
                >
                    No outbound data loaded.
                </td>
            </tr>
        `;
    }

    showOutboundMessage(
        "Outbound upload cancelled. No inventory was changed.",
        "info"
    );
}


// =====================================================
// PROCESS OUTBOUND
// =====================================================

async function processOutbound() {
    if (!isAdmin()) {
        showOutboundMessage("Only admin users can process outbound transactions.", "error");
        return;
    }
    if (!Array.isArray(pendingOutbound) || pendingOutbound.length === 0) {
        showOutboundMessage("Please upload and preview an outbound Excel file first.", "error");
        return;
    }

    const invalidRows = pendingOutbound.map((row, index) => ({ rowNumber: index + 2, error: validateOutboundRow(row) })).filter(row => row.error);
    if (invalidRows.length) {
        const first = invalidRows[0];
        showOutboundMessage(`Cannot process. Excel row ${first.rowNumber}: ${first.error}`, "error");
        return;
    }

    showOutboundMessage("Validating total stock and bin allocation...", "info");
    const inventoryLoaded = await loadInventory();
    if (inventoryLoaded !== true) {
        showOutboundMessage("Unable to load current inventory. Nothing was processed.", "error");
        return;
    }

    try {
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error("Your session has expired. Please login again.");

        // Group outbound demand by exact Item Code + Warehouse + Expiry Date.
        const keyFor = (itemCode, warehouse, expiryDate) =>
            `${String(itemCode || "").trim().toUpperCase()}||${String(warehouse || "").trim().toUpperCase()}||${normalizeOutboundDate(expiryDate)}`;

        const demandMap = new Map();
        for (const row of pendingOutbound) {
            const key = keyFor(row.itemCode, row.warehouse, row.expiryDate);
            const existing = demandMap.get(key) || { itemCode: row.itemCode, warehouse: row.warehouse, expiryDate: row.expiryDate, quantity: 0 };
            existing.quantity += Number(row.quantity);
            demandMap.set(key, existing);
        }

        // Aggregate stock across every bin that matches the exact item, warehouse and expiry.
        const inventoryGroups = new Map();
        for (const inv of currentInventoryData) {
            const itemCode = String(inv.master_items?.item_code || "").trim().toUpperCase();
            const warehouse = String(inv.warehouse_location || "").trim().toUpperCase();
            const expiryDate = normalizeOutboundDate(inv.expiry_date);
            const key = keyFor(itemCode, warehouse, expiryDate);
            if (!inventoryGroups.has(key)) inventoryGroups.set(key, []);
            inventoryGroups.get(key).push(inv);
        }

        // CHECK TOTAL STOCK FIRST; no database changes occur until all demand passes.
        for (const [key, demand] of demandMap) {
            const rows = inventoryGroups.get(key) || [];
            const available = rows.reduce((sum, inv) => sum + Math.max(0, Number(inv.quantity || 0)), 0);
            if (demand.quantity > available) {
                showOutboundMessage(`Insufficient total stock for ${demand.itemCode} / ${demand.warehouse} / ${demand.expiryDate}. Required: ${demand.quantity}, Available: ${available}. Nothing was processed.`, "error");
                return;
            }
        }

        // Plan deductions in ascending bin order, keeping a simulated balance so duplicate
        // outbound rows cannot over-allocate the same inventory record.
        const simulatedQty = new Map();
        const allocationPlan = [];
        for (const row of pendingOutbound) {
            let remaining = Number(row.quantity);
            const key = keyFor(row.itemCode, row.warehouse, row.expiryDate);
            const matches = (inventoryGroups.get(key) || []).slice().sort((a, b) =>
                String(a.bin_location || "").trim().toUpperCase().localeCompare(String(b.bin_location || "").trim().toUpperCase(), undefined, { numeric: true, sensitivity: "base" }) ||
                String(a.id).localeCompare(String(b.id), undefined, { numeric: true })
            );

            for (const inv of matches) {
                if (remaining <= 0) break;
                const available = simulatedQty.has(inv.id) ? simulatedQty.get(inv.id) : Math.max(0, Number(inv.quantity || 0));
                if (available <= 0) continue;
                const deduct = Math.min(remaining, available);
                allocationPlan.push({ inventoryRow: inv, deduct, referenceNo: row.referenceNo, itemCode: row.itemCode, warehouse: row.warehouse, expiryDate: row.expiryDate });
                simulatedQty.set(inv.id, available - deduct);
                remaining -= deduct;
            }
            if (remaining > 0) {
                // Defensive guard; total-stock validation above should make this unreachable.
                throw new Error(`Unable to allocate complete quantity for ${row.itemCode} / ${row.warehouse} / ${row.expiryDate}. Nothing was processed.`);
            }
        }

        showOutboundMessage(`Stock validated. Processing ${allocationPlan.length} bin allocation(s)...`, "info");
        const appliedQty = new Map();
        for (const allocation of allocationPlan) {
            const inv = allocation.inventoryRow;
            const previousApplied = appliedQty.get(inv.id) || 0;
            const newQuantity = Number(inv.quantity || 0) - previousApplied - allocation.deduct;
            if (newQuantity < 0) throw new Error(`Safety check stopped a negative quantity for ${allocation.itemCode} / ${inv.bin_location}.`);

            const { error: updateError } = await supabaseClient.from("inventory").update({ quantity: newQuantity }).eq("id", inv.id);
            if (updateError) throw updateError;
            appliedQty.set(inv.id, previousApplied + allocation.deduct);

            // Keep one OUTBOUND audit row per bin deduction, including the actual bin used.
            const { error: transactionError } = await supabaseClient.from("inventory_transactions").insert({
                item_id: inv.item_id,
                transaction_type: "OUTBOUND",
                warehouse_location: inv.warehouse_location,
                bin_location: inv.bin_location,
                expiry_date: inv.expiry_date,
                quantity_change: -allocation.deduct,
                reference_no: allocation.referenceNo,
                created_by: user.id
            });
            if (transactionError) throw transactionError;
        }

        pendingOutbound = [];
        if (outboundFile) outboundFile.value = "";
        if (outboundTableBody) outboundTableBody.innerHTML = `<tr><td colspan="6" class="empty-state">No outbound data loaded.</td></tr>`;
        showOutboundMessage("Outbound processed successfully. Stock was deducted from the lowest bin locations first, using only matching item, warehouse, and exact expiry date. Audit trail saved per bin.", "success");
        await loadInventory();
        await loadInventorySummary();
    } catch (error) {
        console.error("Outbound processing error:", error);
        showOutboundMessage(`Outbound processing failed: ${error.message || "Unknown error"}. If processing began before the error, check Current Inventory and Transaction History before retrying.`, "error");
    }
}

/* =====================================================
   WAREHOUSE INVENTORY — DARK MODE TOGGLE
===================================================== */

(function () {
    function initThemeToggle() {
        const root = document.documentElement;
        const userArea = document.querySelector(".user-area");

        if (!userArea) {
            console.warn(
                "Dark Mode: Hindi nakita ang .user-area sa HTML."
            );
            return;
        }

        // Iwasang gumawa ng duplicate button.
        if (document.getElementById("themeToggleBtn")) {
            return;
        }

        const button = document.createElement("button");
        button.id = "themeToggleBtn";
        button.type = "button";
        button.className = "theme-toggle-btn";
        button.setAttribute("aria-pressed", "false");

        function getSavedTheme() {
            try {
                return localStorage.getItem("warehouseTheme");
            } catch (error) {
                return null;
            }
        }

        function applyTheme(theme) {
            const isDark = theme === "dark";

            root.setAttribute(
                "data-theme",
                isDark ? "dark" : "light"
            );

            button.textContent = isDark
                ? "☀️ Light Mode"
                : "🌙 Dark Mode";

            button.setAttribute(
                "aria-pressed",
                String(isDark)
            );

            button.setAttribute(
                "aria-label",
                isDark
                    ? "Switch to Light Mode"
                    : "Switch to Dark Mode"
            );
        }

        const savedTheme = getSavedTheme();

        applyTheme(
            savedTheme === "dark" ? "dark" : "light"
        );

        button.addEventListener("click", function () {
            const currentlyDark =
                root.getAttribute("data-theme") === "dark";

            const nextTheme = currentlyDark
                ? "light"
                : "dark";

            applyTheme(nextTheme);

            try {
                localStorage.setItem(
                    "warehouseTheme",
                    nextTheme
                );
            } catch (error) {
                // Theme still works for this page session.
            }
        });

        // Ilagay ang toggle bago ang logout button.
        const logoutButton = userArea.querySelector(
            ".logout-btn"
        );

        if (logoutButton) {
            userArea.insertBefore(button, logoutButton);
        } else {
            userArea.appendChild(button);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initThemeToggle
        );
    } else {
        initThemeToggle();
    }
})();
