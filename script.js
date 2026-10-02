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

    await checkLogin();

});


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

        });

    });

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


function showApplication(user) {

    loginSection.classList.add("hidden");
    appSection.classList.remove("hidden");

    userEmail.textContent =
        user.email || "Logged in";


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

    const {
        data,
        error
    } = await supabaseClient
        .from("master_items")
        .select("*")
        .order("item_code", {
            ascending: true
        });


    if (error) {

        console.error(
            "Masterlist load error:",
            error
        );

        return;
    }


    masterItems = data || [];

    renderMasterlistTable();

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
        `;

        inventoryTableBody.appendChild(tr);

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