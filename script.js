// =====================================================
// WAREHOUSE INVENTORY + STOCK TRANSFER
// =====================================================

const SUPABASE_URL = "https://pdimzqvbpkveamakzcqe.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_snnK5c2-d4BtTVr_-IiLkw_H-OgTKOT";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const WAREHOUSES = ["WMECOM","WMLAZ","WMSHOPEE","WMAIN","WMBBD","OTHER"];
let masterItems = [], selectedItem = null, pendingInventory = [], transferInventory = [], currentInventoryRows = [];

const $ = id => document.getElementById(id);
const loginSection=$("loginSection"), appSection=$("appSection");
const emailInput=$("email"), passwordInput=$("password"), loginBtn=$("loginBtn"), logoutBtn=$("logoutBtn");
const loginMessage=$("loginMessage"), userEmail=$("userEmail");

const itemSearch=$("itemSearch"), itemSuggestions=$("itemSuggestions"), itemCode=$("itemCode"), itemDescription=$("itemDescription"), category=$("category");
const warehouse=$("warehouse"), binLocation=$("binLocation"), binSuggestions=$("binSuggestions"), expiryDate=$("expiryDate"), quantity=$("quantity");
const pendingInventoryTableBody=$("pendingInventoryTableBody"), inventoryMessage=$("inventoryMessage");

const transferFromWarehouse=$("transferFromWarehouse"), transferFromBin=$("transferFromBin"), transferFromBinSuggestions=$("transferFromBinSuggestions");
const transferItemSearch=$("transferItemSearch"), transferItemSuggestions=$("transferItemSuggestions");
const transferItemCode=$("transferItemCode"), transferItemDescription=$("transferItemDescription"), transferExpiry=$("transferExpiry");
const transferAvailable=$("transferAvailable"), transferToWarehouse=$("transferToWarehouse"), transferToBin=$("transferToBin"), transferToBinSuggestions=$("transferToBinSuggestions");
const transferQuantity=$("transferQuantity"), transferReference=$("transferReference"), transferStockBtn=$("transferStockBtn"), transferMessage=$("transferMessage"), transferResult=$("transferResult");

document.addEventListener("DOMContentLoaded", async ()=>{
  setupMenu(); setupLogin(); setupBeginningInventory(); setupTransfer(); setupMasterlist(); setupSummary(); setupCurrentInventoryFilter();
  fillWarehouseSelects(); await checkLogin();
});

function setupMenu(){
  document.querySelectorAll(".menu-btn").forEach(btn=>{
    btn.addEventListener("click", async ()=>{
      document.querySelectorAll(".menu-btn").forEach(b=>b.classList.remove("active"));
      document.querySelectorAll(".system-section").forEach(s=>s.classList.add("hidden"));
      btn.classList.add("active");
      const section=$(btn.dataset.section); if(section) section.classList.remove("hidden");
      if(btn.dataset.section==="masterlistSection") await loadMasterlist();
      if(btn.dataset.section==="currentStockSection") await loadInventory();
      if(btn.dataset.section==="summarySection") await loadInventorySummary();
      if(btn.dataset.section==="transferSection") await prepareTransferSection();
    });
  });
}

function setupLogin(){
  loginBtn.addEventListener("click",login);
  passwordInput.addEventListener("keydown",e=>{if(e.key==="Enter")login()});
  emailInput.addEventListener("keydown",e=>{if(e.key==="Enter")passwordInput.focus()});
  logoutBtn.addEventListener("click",logout);
}
async function login(){
  const email=emailInput.value.trim(), password=passwordInput.value;
  if(!email||!password){showMessage(loginMessage,"Please enter email and password.","error");return}
  loginBtn.disabled=true; loginBtn.textContent="LOGGING IN...";
  const {data,error}=await supabaseClient.auth.signInWithPassword({email,password});
  loginBtn.disabled=false; loginBtn.textContent="LOGIN";
  if(error){showMessage(loginMessage,error.message,"error");return}
  if(data.user)showApplication(data.user);
}
async function logout(){await supabaseClient.auth.signOut();appSection.classList.add("hidden");loginSection.classList.remove("hidden");userEmail.textContent="Not logged in";emailInput.value="";passwordInput.value=""}
async function checkLogin(){
  const {data:{session}}=await supabaseClient.auth.getSession();
  if(session?.user)showApplication(session.user);else{loginSection.classList.remove("hidden");appSection.classList.add("hidden")}
}
function showApplication(user){loginSection.classList.add("hidden");appSection.classList.remove("hidden");userEmail.textContent=user.email||"Logged in";loadMasterlist();loadInventory()}
supabaseClient.auth.onAuthStateChange((event,session)=>{if(session?.user)showApplication(session.user);else{loginSection.classList.remove("hidden");appSection.classList.add("hidden")}});

function fillWarehouseSelects(){
  [warehouse,transferFromWarehouse,transferToWarehouse,$("summaryWarehouse")].forEach((select,i)=>{
    if(!select)return;
    const first=select.options[0]?.textContent || "Select Warehouse";
    select.innerHTML=`<option value="">${escapeHtml(first)}</option>`;
    WAREHOUSES.forEach(w=>select.insertAdjacentHTML("beforeend",`<option value="${escapeHtml(w)}">${escapeHtml(w)}</option>`));
  });
}

async function loadMasterlist(){
  const {data,error}=await supabaseClient.from("master_items").select("*").order("item_code",{ascending:true});
  if(error){console.error(error);return}
  masterItems=data||[]; renderMasterlistTable();
}
function renderMasterlistTable(){
  const body=$("masterlistTableBody"); if(!body)return; body.innerHTML="";
  masterItems.forEach(item=>body.insertAdjacentHTML("beforeend",`<tr><td>${escapeHtml(item.item_code)}</td><td>${escapeHtml(item.item_description||"")}</td><td>${escapeHtml(item.category||"")}</td></tr>`));
}

function setupBeginningInventory(){
  itemSearch.addEventListener("input",()=>showItemSuggestions(itemSearch,itemSuggestions,selectBeginningItem));
  itemSearch.addEventListener("keydown",e=>{if(e.key==="Enter")selectItemByText(e,itemSearch,selectBeginningItem)});
  addInventoryRowBtn.addEventListener("click",addInventoryToPendingTable);
  saveInventoryBtn.addEventListener("click",saveAllInventory);
  clearFormBtn.addEventListener("click",clearInventoryForm);
  setupBinInput(binLocation,binSuggestions);
}
function selectBeginningItem(item){selectedItem=item;itemCode.value=item.item_code||"";itemDescription.value=item.item_description||"";category.value=item.category||"";itemSearch.value=item.item_code||"";hideSuggestions(itemSuggestions);binLocation.focus()}

function showItemSuggestions(input,box,callback){
  const q=input.value.trim().toLowerCase(); box.innerHTML="";
  if(!q){box.style.display="none";return}
  const matches=masterItems.filter(x=>(x.item_code||"").toLowerCase().includes(q)||(x.item_description||"").toLowerCase().includes(q)).slice(0,15);
  if(!matches.length){box.style.display="none";return}
  matches.forEach(item=>{
    const div=document.createElement("div");div.className="suggestion-item";
    div.innerHTML=`<div class="suggestion-code">${escapeHtml(item.item_code)}</div><div class="suggestion-description">${escapeHtml(item.item_description||"")}</div>`;
    div.addEventListener("click",()=>callback(item));box.appendChild(div);
  });box.style.display="block";
}
function selectItemByText(e,input,callback){
  const q=input.value.trim().toLowerCase();if(!q)return;
  const match=masterItems.find(x=>(x.item_code||"").toLowerCase()===q||(x.item_description||"").toLowerCase()===q);
  if(match){e.preventDefault();callback(match)}
}

function generateBinLocations(){const bins=[];for(let l=65;l<=73;l++){const letter=String.fromCharCode(l);for(let s=1;s<=5;s++)for(let n=1;n<=27;n++)bins.push(`${letter}${s}-${String(n).padStart(3,"0")}`)}return bins}
const ALL_BINS=generateBinLocations();
function setupBinInput(input,box){
  input.addEventListener("input",()=>showBinSuggestionsFor(input,box));
  input.addEventListener("keydown",e=>{
    if(e.key!=="Enter")return;
    const typed=input.value.trim().toUpperCase();if(!typed)return;
    if(ALL_BINS.includes(typed)){e.preventDefault();input.value=typed;hideSuggestions(box);return}
    const matches=ALL_BINS.filter(x=>x.startsWith(typed));
    if(matches.length===1){e.preventDefault();input.value=matches[0];hideSuggestions(box);return}
  });
}
function showBinSuggestionsFor(input,box){
  const q=input.value.trim().toUpperCase();box.innerHTML="";
  if(!q){box.style.display="none";return}
  const matches=ALL_BINS.filter(x=>x.startsWith(q)).slice(0,15);
  if(!matches.length){box.style.display="none";return}
  matches.forEach(bin=>{const d=document.createElement("div");d.className="suggestion-item";d.textContent=bin;d.onclick=()=>{input.value=bin;hideSuggestions(box)};box.appendChild(d)});
  box.style.display="block";
}
function hideSuggestions(box){box.innerHTML="";box.style.display="none"}

function addInventoryToPendingTable(){
  clearMessage(inventoryMessage);
  if(!warehouse.value){showMessage(inventoryMessage,"Please select a Warehouse Location.","error");return}
  if(!selectedItem){showMessage(inventoryMessage,"Please select an item from the Masterlist.","error");return}
  const bin=binLocation.value.trim().toUpperCase();
  if(!ALL_BINS.includes(bin)){showMessage(inventoryMessage,"Invalid Bin Location. Example: A1-001.","error");return}
  if(!expiryDate.value){showMessage(inventoryMessage,"Please enter Expiry Date.","error");return}
  const qty=Number(quantity.value);if(!quantity.value||isNaN(qty)||qty<=0){showMessage(inventoryMessage,"Please enter a valid quantity greater than 0.","error");return}
  pendingInventory.push({item_id:selectedItem.id,item_code:selectedItem.item_code,item_description:selectedItem.item_description,category:selectedItem.category||"",warehouse_location:warehouse.value,bin_location:bin,expiry_date:expiryDate.value,quantity:qty});
  renderPendingInventory();clearItemFieldsOnly();showMessage(inventoryMessage,"Item added to the table.","success");itemSearch.focus();
}
function renderPendingInventory(){
  pendingInventoryTableBody.innerHTML="";
  pendingInventory.forEach((item,i)=>pendingInventoryTableBody.insertAdjacentHTML("beforeend",`<tr><td>${escapeHtml(item.item_code)}</td><td>${escapeHtml(item.item_description)}</td><td>${escapeHtml(item.warehouse_location)}</td><td>${escapeHtml(item.bin_location)}</td><td>${formatDate(item.expiry_date)}</td><td>${Number(item.quantity).toLocaleString()}</td><td><button class="secondary-btn" onclick="removePendingInventory(${i})">REMOVE</button></td></tr>`));
}
function removePendingInventory(i){pendingInventory.splice(i,1);renderPendingInventory()}
window.removePendingInventory=removePendingInventory;

async function saveAllInventory(){
  clearMessage(inventoryMessage);if(!pendingInventory.length){showMessage(inventoryMessage,"There are no items to save.","error");return}
  const {data:{user}}=await supabaseClient.auth.getUser();if(!user){showMessage(inventoryMessage,"Your session has expired. Please login again.","error");return}
  saveInventoryBtn.disabled=true;saveInventoryBtn.textContent="SAVING...";
  try{
    const records=pendingInventory.map(x=>({item_id:x.item_id,warehouse_location:x.warehouse_location,bin_location:x.bin_location,expiry_date:x.expiry_date,quantity:x.quantity,created_by:user.id}));
    const {error}=await supabaseClient.from("inventory").insert(records);if(error)throw error;
    const tx=pendingInventory.map(x=>({item_id:x.item_id,transaction_type:"BEGINNING",warehouse_location:x.warehouse_location,bin_location:x.bin_location,expiry_date:x.expiry_date,quantity_change:x.quantity,reference_no:"BEGINNING-INVENTORY",created_by:user.id}));
    const {error:txError}=await supabaseClient.from("inventory_transactions").insert(tx);if(txError)throw txError;
    showMessage(inventoryMessage,`${pendingInventory.length} item(s) saved successfully!`,"success");pendingInventory=[];renderPendingInventory();clearInventoryForm();await loadInventory();await loadInventorySummary();
  }catch(e){console.error(e);showMessage(inventoryMessage,"Error saving inventory: "+e.message,"error")}
  finally{saveInventoryBtn.disabled=false;saveInventoryBtn.textContent="💾 SAVE ALL"}
}
function clearItemFieldsOnly(){selectedItem=null;itemSearch.value="";itemCode.value="";itemDescription.value="";category.value="";binLocation.value="";expiryDate.value="";quantity.value="";hideSuggestions(itemSuggestions);hideSuggestions(binSuggestions)}
function clearInventoryForm(){clearItemFieldsOnly();warehouse.value=""}

function setupCurrentInventoryFilter(){
  const filter=$("inventoryLocationFilter");
  if(!filter)return;
  filter.addEventListener("change",()=>{
    const selected=filter.value;
    const filtered=selected ? currentInventoryRows.filter(row=>String(row.warehouse_location||"")===selected) : currentInventoryRows;
    renderInventoryTable(filtered);
  });
}

function populateInventoryLocationFilter(data){
  const filter=$("inventoryLocationFilter");
  if(!filter)return;
  const current=filter.value;
  const locations=[...new Set((data||[]).map(row=>String(row.warehouse_location||"").trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
  filter.innerHTML=`<option value="">All Locations</option>`;
  locations.forEach(location=>filter.insertAdjacentHTML("beforeend",`<option value="${escapeHtml(location)}">${escapeHtml(location)}</option>`));
  if(locations.includes(current))filter.value=current;
}

async function loadInventory(){
  const {data,error}=await supabaseClient.from("inventory").select(`id,warehouse_location,bin_location,expiry_date,quantity,item_id,master_items(item_code,item_description,category)`).order("created_at",{ascending:false});
  if(error){console.error(error);return}
  currentInventoryRows=data||[];
  populateInventoryLocationFilter(currentInventoryRows);
  const selected=$("inventoryLocationFilter")?.value||"";
  renderInventoryTable(selected ? currentInventoryRows.filter(row=>String(row.warehouse_location||"")===selected) : currentInventoryRows);
}
function renderInventoryTable(data){
  const body=$("inventoryTableBody");if(!body)return;body.innerHTML="";
  if(!data.length){body.innerHTML='<tr><td colspan="6" class="empty-state">No inventory found for the selected location.</td></tr>';return}
  data.forEach(row=>{const item=row.master_items||{};body.insertAdjacentHTML("beforeend",`<tr><td>${escapeHtml(item.item_code||"")}</td><td>${escapeHtml(item.item_description||"")}</td><td>${escapeHtml(row.warehouse_location||"")}</td><td>${escapeHtml(row.bin_location||"")}</td><td>${formatDate(row.expiry_date)}</td><td>${Number(row.quantity||0).toLocaleString()}</td></tr>`)})
}
$("refreshInventoryBtn").addEventListener("click",loadInventory);

function setupSummary(){$("refreshSummaryBtn").addEventListener("click",loadInventorySummary);$("summaryWarehouse").addEventListener("change",loadInventorySummary)}
async function loadInventorySummary(){
  const body=$("summaryTableBody");body.innerHTML="<tr><td colspan='6'>Loading summary...</td></tr>";
  let query=supabaseClient.from("inventory").select(`warehouse_location,expiry_date,quantity,item_id,master_items(item_code,item_description,category)`);
  if($("summaryWarehouse").value)query=query.eq("warehouse_location",$("summaryWarehouse").value);
  const {data,error}=await query;if(error){body.innerHTML=`<tr><td colspan="6">Error loading summary: ${escapeHtml(error.message)}</td></tr>`;return}
  const groups={};(data||[]).forEach(r=>{const i=r.master_items||{},key=`${r.warehouse_location||""}||${i.item_code||""}||${r.expiry_date||""}`;if(!groups[key])groups[key]={warehouse:r.warehouse_location||"",item_code:i.item_code||"",item_description:i.item_description||"",category:i.category||"",expiry_date:r.expiry_date||"",quantity:0};groups[key].quantity+=Number(r.quantity||0)});
  renderSummaryTable(Object.values(groups))
}
function renderSummaryTable(data){
  const body=$("summaryTableBody");body.innerHTML="";data.sort((a,b)=>a.warehouse.localeCompare(b.warehouse)||a.item_code.localeCompare(b.item_code)||a.expiry_date.localeCompare(b.expiry_date));
  if(!data.length){body.innerHTML="<tr><td colspan='6'>No inventory found.</td></tr>";return}
  data.forEach(r=>body.insertAdjacentHTML("beforeend",`<tr><td>${escapeHtml(r.warehouse)}</td><td>${escapeHtml(r.item_code)}</td><td>${escapeHtml(r.item_description)}</td><td>${escapeHtml(r.category)}</td><td>${formatDate(r.expiry_date)}</td><td><strong>${Number(r.quantity).toLocaleString()}</strong></td></tr>`))
}

function setupTransfer(){
  setupBinInput(transferFromBin,transferFromBinSuggestions);setupBinInput(transferToBin,transferToBinSuggestions);
  transferFromWarehouse.addEventListener("change",refreshTransferSource);
  transferFromBin.addEventListener("change",refreshTransferSource);
  transferItemSearch.addEventListener("input",()=>showItemSuggestions(transferItemSearch,transferItemSuggestions,selectTransferItem));
  transferItemSearch.addEventListener("keydown",e=>{if(e.key==="Enter")selectItemByText(e,transferItemSearch,selectTransferItem)});
  transferStockBtn.addEventListener("click",executeStockTransfer);$("clearTransferBtn").addEventListener("click",clearTransferForm);
}
function selectTransferItem(item){
  transferItemSearch.value=item.item_code||"";transferItemCode.value=item.item_code||"";transferItemDescription.value=item.item_description||"";hideSuggestions(transferItemSuggestions);refreshTransferSource();
}
async function prepareTransferSection(){await loadTransferInventory();refreshTransferSource()}
async function loadTransferInventory(){
  const {data,error}=await supabaseClient.from("inventory").select(`id,warehouse_location,bin_location,expiry_date,quantity,item_id,master_items(item_code,item_description,category)`).order("created_at",{ascending:false});
  if(error){console.error("Transfer inventory load error:",error);transferInventory=[];return}transferInventory=data||[];
}
function refreshTransferSource(){
  const wh=transferFromWarehouse.value,bin=transferFromBin.value.trim().toUpperCase(),code=transferItemCode.value.trim().toLowerCase();
  if(!wh||!code){transferAvailable.textContent="0";transferExpiry.value="";return}
  const rows=transferInventory.filter(r=>(r.warehouse_location||"")===wh&&(!bin||r.bin_location===bin)&&((r.master_items?.item_code||"").toLowerCase()===code));
  const total=rows.reduce((s,r)=>s+Number(r.quantity||0),0);
  transferAvailable.textContent=total.toLocaleString();
  const expiries=[...new Set(rows.map(r=>r.expiry_date).filter(Boolean))];
  transferExpiry.value=expiries.length===1?expiries[0]:"";
  if(expiries.length>1)showMessage(transferMessage,"Multiple expiry dates exist for this item/source. Select the item/bin more specifically; transfer is blocked until one expiry is selected.","error");
  else clearMessage(transferMessage);
}
async function executeStockTransfer(){
  clearMessage(transferMessage);transferResult.classList.add("hidden");
  const fromWh=transferFromWarehouse.value,fromBin=transferFromBin.value.trim().toUpperCase(),toWh=transferToWarehouse.value,toBin=transferToBin.value.trim().toUpperCase();
  const itemCode=transferItemCode.value.trim(),qty=Number(transferQuantity.value),ref=transferReference.value.trim();
  if(!fromWh||!fromBin||!toWh||!toBin||!itemCode||!transferExpiry.value||!ref||!qty||qty<=0){showMessage(transferMessage,"Please complete FROM, TO, Item, Expiry, Transfer Quantity, and Reference No.","error");return}
  if(!ALL_BINS.includes(fromBin)||!ALL_BINS.includes(toBin)){showMessage(transferMessage,"Invalid Bin Location. Valid range is A1-001 to I5-027.","error");return}
  if(fromWh===toWh&&fromBin===toBin){showMessage(transferMessage,"FROM and TO cannot be the same warehouse/bin.","error");return}
  if(transferReference.value.trim().length<3){showMessage(transferMessage,"Please enter a valid Reference No.","error");return}
  const {data:{user}}=await supabaseClient.auth.getUser();if(!user){showMessage(transferMessage,"Your session has expired. Please login again.","error");return}
  transferStockBtn.disabled=true;transferStockBtn.textContent="TRANSFERRING...";
  try{
    await loadTransferInventory();
    const sourceRows=transferInventory.filter(r=>(r.warehouse_location||"")===fromWh&&r.bin_location===fromBin&&(r.master_items?.item_code||"").toLowerCase()===itemCode.toLowerCase()&&r.expiry_date===transferExpiry.value&&Number(r.quantity||0)>0);
    const available=sourceRows.reduce((s,r)=>s+Number(r.quantity||0),0);
    if(available<qty)throw new Error(`Insufficient stock. Available: ${available.toLocaleString()}.`);
    let remaining=qty;
    for(const row of sourceRows){
      if(remaining<=0)break;
      const take=Math.min(Number(row.quantity||0),remaining),newQty=Number(row.quantity||0)-take;
      const {error}=await supabaseClient.from("inventory").update({quantity:newQty}).eq("id",row.id);
      if(error)throw error;remaining-=take;
    }
    const destination=transferInventory.find(r=>(r.warehouse_location||"")===toWh&&r.bin_location===toBin&&r.item_id===sourceRows[0].item_id&&r.expiry_date===transferExpiry.value);
    if(destination){
      const {error}=await supabaseClient.from("inventory").update({quantity:Number(destination.quantity||0)+qty}).eq("id",destination.id);if(error)throw error;
    }else{
      const {error}=await supabaseClient.from("inventory").insert({item_id:sourceRows[0].item_id,warehouse_location:toWh,bin_location:toBin,expiry_date:transferExpiry.value,quantity:qty,created_by:user.id});if(error)throw error;
    }
    const tx=[
      {item_id:sourceRows[0].item_id,transaction_type:"TRANSFER_OUT",warehouse_location:fromWh,bin_location:fromBin,expiry_date:transferExpiry.value,quantity_change:-qty,reference_no:ref,created_by:user.id},
      {item_id:sourceRows[0].item_id,transaction_type:"TRANSFER_IN",warehouse_location:toWh,bin_location:toBin,expiry_date:transferExpiry.value,quantity_change:qty,reference_no:ref,created_by:user.id}
    ];
    const {error:txError}=await supabaseClient.from("inventory_transactions").insert(tx);if(txError)throw txError;
    showMessage(transferMessage,"Stock transfer completed successfully.","success");
    transferResult.textContent=`${qty.toLocaleString()} unit(s) transferred: ${fromWh} / ${fromBin} → ${toWh} / ${toBin} | Ref: ${ref}`;
    transferResult.classList.remove("hidden");await loadInventory();await loadInventorySummary();await loadTransferInventory();refreshTransferSource();transferQuantity.value="";
  }catch(e){console.error("Stock transfer error:",e);showMessage(transferMessage,"Transfer failed: "+e.message,"error")}
  finally{transferStockBtn.disabled=false;transferStockBtn.textContent="🔄 TRANSFER STOCK"}
}
function clearTransferForm(){
  transferFromWarehouse.value="";transferFromBin.value="";transferItemSearch.value="";transferItemCode.value="";transferItemDescription.value="";transferExpiry.value="";transferAvailable.textContent="0";transferToWarehouse.value="";transferToBin.value="";transferQuantity.value="";transferReference.value="";clearMessage(transferMessage);transferResult.classList.add("hidden");
}

function setupMasterlist(){$("uploadMasterlistBtn").addEventListener("click",uploadMasterlist)}
async function uploadMasterlist(){
  clearMessage($("masterlistMessage"));const file=$("masterlistFile").files[0];if(!file){showMessage($("masterlistMessage"),"Please select an Excel file first.","error");return}
  const btn=$("uploadMasterlistBtn");btn.disabled=true;btn.textContent="UPLOADING...";
  try{
    const wb=XLSX.read(await file.arrayBuffer(),{type:"array"}),rows=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{defval:""}),records=prepareMasterlistRecords(rows);
    if(!records.length)throw new Error("No valid masterlist records found.");
    for(let i=0;i<records.length;i+=500){const {error}=await supabaseClient.from("master_items").upsert(records.slice(i,i+500),{onConflict:"item_code"});if(error)throw error}
    showMessage($("masterlistMessage"),`${records.length} item(s) uploaded successfully!`,"success");await loadMasterlist()
  }catch(e){showMessage($("masterlistMessage"),"Upload failed: "+e.message,"error")}finally{btn.disabled=false;btn.textContent="📥 UPLOAD MASTERLIST"}
}
function prepareMasterlistRecords(rows){const out=[];rows.forEach(r=>{const code=getColumnValue(r,["Item Code","ItemCode","item_code","ITEM CODE","Code"]),desc=getColumnValue(r,["Item Description","Description","item_description","ITEM DESCRIPTION"]),cat=getColumnValue(r,["Category","category","CATEGORY"]);if(code&&desc)out.push({item_code:String(code).trim(),item_description:String(desc).trim(),category:cat?String(cat).trim():null})});return out}
function getColumnValue(row,names){for(const n of names)if(Object.prototype.hasOwnProperty.call(row,n))return row[n];return ""}

document.addEventListener("click",e=>{
  if(!e.target.closest(".search-wrapper"))document.querySelectorAll(".suggestions").forEach(hideSuggestions)
});
function showMessage(el,msg,type){if(!el)return;el.textContent=msg;el.className="message "+type}
function clearMessage(el){if(!el)return;el.textContent="";el.className="message"}
function escapeHtml(v){return v==null?"":String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}
function formatDate(v){if(!v)return "";const d=new Date(v);return isNaN(d.getTime())?v:d.toLocaleDateString("en-US",{month:"2-digit",day:"2-digit",year:"numeric"})}
