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
// INITIALIZATION
// =====================================================

document.addEventListener("DOMContentLoaded", async () => {

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

    const adminMenuSections = ["inventorySection", "transferSection"];
    document.querySelectorAll(".menu-btn").forEach(btn => {
        const restricted = adminMenuSections.includes(btn.dataset.section);
        btn.classList.toggle("hidden", restricted && !isAdmin());
    });

    if (masterlistFile) masterlistFile.classList.toggle("hidden", !isAdmin());
    if (uploadMasterlistBtn) uploadMasterlistBtn.classList.toggle("hidden", !isAdmin());
    if (resetInventoryBtn) resetInventoryBtn.classList.toggle("hidden", !isAdmin());
    if (resetSummaryBtn) resetSummaryBtn.classList.toggle("hidden", !isAdmin());
}

// =====================================================
// MENU
// =====================================================

function setupMenu() {

    const menuButtons =
        document.querySelectorAll(".menu-btn");

    const sections =
        document.querySelectorAll(".system-section");


    menuButtons.forEach(button => {

        button.addEventListener("click", async () => {

            const targetSection =
                button.dataset.section;


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
// STOCK TRANSFER
// =====================================================

function fillTransferWarehouses() {
    [transferFromWarehouse, transferToWarehouse].forEach(select => {
        if (!select) return;
        select.innerHTML = '<option value="">Select Warehouse</option>';
        ["WMECOM", "WMLAZ", "WMSHOPEE", "WMAIN", "WMBBD", "OTHER"].forEach(w => {
            select.insertAdjacentHTML("beforeend", `<option value="${escapeHtml(w)}">${escapeHtml(w)}</option>`);
        });
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

    pendingInventoryTableBody.innerHTML = "";


    pendingInventory.forEach(
        (item, index) => {

            const row =
                document.createElement("tr");


            row.innerHTML = `
                <td>
                    ${escapeHtml(item.item_code)}
                </td>

                <td>
                    ${escapeHtml(
                        item.item_description
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        item.warehouse_location
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        item.bin_location
                    )}
                </td>

                <td>
                    ${formatDate(item.expiry_date)}
                </td>

                <td>
                    ${Number(item.quantity).toLocaleString()}
                </td>

                <td>
                    <button
                        type="button"
                        class="secondary-btn"
                        onclick="removePendingInventory(${index})"
                    >
                        REMOVE
                    </button>
                </td>
            `;


            pendingInventoryTableBody.appendChild(row);

        }
    );

}


// =====================================================
// REMOVE PENDING ITEM
// =====================================================

function removePendingInventory(index) {

    pendingInventory.splice(index, 1);

    renderPendingInventory();

}


// Make function available to HTML
window.removePendingInventory =
    removePendingInventory;


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

        return;
    }


    currentInventoryData = data || [];

    populateInventoryLocationFilter(currentInventoryData);
    applyInventoryFilters();

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

function renderInventoryTable(data) {

    inventoryTableBody.innerHTML = "";

    data.forEach(row => {

        const item = row.master_items || {};

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${escapeHtml(item.item_code || "")}</td>
            <td>${escapeHtml(item.item_description || "")}</td>
            <td>${escapeHtml(row.warehouse_location || "")}</td>
            <td>${escapeHtml(row.bin_location || "")}</td>
            <td>${formatDate(row.expiry_date)}</td>
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


    summaryWarehouse.addEventListener(
        "change",
        loadInventorySummary
    );

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


        return a.expiry_date.localeCompare(
            b.expiry_date
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
                ${formatDate(
                    row.expiry_date
                )}
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