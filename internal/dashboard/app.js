/* ================= CONFIG ================= */

const API = "https://script.google.com/macros/s/AKfycbwo78mV92MKxcGMSB52NziL7bmn0AsEplVo2rhj92O3UGk7EKl9B8OlJt9ZqbmXEE7JiQ/exec";

let SESSION_PASSWORD = "";
let CURRENT_EDIT = null;

/* ================= API HELPER ================= */

function api(data){
  data.password = SESSION_PASSWORD;
  return fetch(API,{
    method:"POST",
    body:JSON.stringify(data)
  }).then(res=>res.json());
}

/* ================= LOGIN ================= */

function login(){
  const pass = document.getElementById("loginPassword").value;
  if(!pass){ alert("Enter password"); return; }

  SESSION_PASSWORD = pass;

  api({action:"verifyLogin"}).then(res=>{
    if(res.status==="success"){
      loginScreen.style.display="none";
      sidebar.style.display="block";
      main.style.display="block";
      loadDashboard();
      loadAllTables();
    }else{
      loginError.innerText="Wrong Password";
    }
  });
}

/* ================= NAVIGATION ================= */

function showSection(id){
  document.querySelectorAll(".section").forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");

  if(id==="ledger") loadLedger();
}

/* ================= MATERIAL ================= */

function calculateMaterialTotal(){
  const qty = Number(mQty.value||0);
  const rate = Number(mRate.value||0);
  mTotal.value = qty * rate;
}

function handlePaymentMode(prefix){

  document.getElementById(prefix+"Transaction").style.display="none";
  document.getElementById(prefix+"Cheque").style.display="none";
  document.getElementById(prefix+"Bank").style.display="none";

  const mode = document.getElementById(prefix+"Mode").value;

  if(mode==="UPI"){
    document.getElementById(prefix+"Transaction").style.display="block";
  }

  if(mode==="Bank Transfer"){
    document.getElementById(prefix+"Transaction").style.display="block";
    document.getElementById(prefix+"Bank").style.display="block";
  }

  if(mode==="Cheque"){
    document.getElementById(prefix+"Cheque").style.display="block";
    document.getElementById(prefix+"Bank").style.display="block";
  }
}

function addMaterial(){

  if(!mDate.value || !mItem.value || !mQty.value || !mRate.value){
    alert("Fill required fields");
    return;
  }

  api({
    action:"addMaterial",
    date:mDate.value,
    category:mCategory.value,
    item:mItem.value,
    size:mSize.value,
    vehicle:mVehicle.value,
    qty:mQty.value,
    unit:mUnit.value,
    rate:mRate.value,
    vendor:mVendor.value,
    paidBy:mPaidBy.value,
    mode:mMode.value,
    transactionId:mTransaction.value,
    chequeNo:mCheque.value,
    bankName:mBank.value,
    remarks:mRemarks.value
  }).then(()=>{
    clearForm("material");
    loadAllTables();
    loadDashboard();
    alert("Material Added");
  });
}

/* ================= VENDOR ================= */

function addVendor(){

  if(!vDate.value || !vVendor.value || !vAmount.value){
    alert("Fill required fields");
    return;
  }

  api({
    action:"addVendor",
    date:vDate.value,
    vendor:vVendor.value,
    category:vCategory.value,
    paidBy:vPaidBy.value,
    amount:vAmount.value,
    mode:vMode.value,
    transactionId:vTransaction.value,
    chequeNo:vCheque.value,
    bankName:vBank.value,
    remarks:vRemarks.value
  }).then(()=>{
    clearForm("vendor");
    loadAllTables();
    loadDashboard();
    alert("Vendor Added");
  });
}

/* ================= SETTLEMENT ================= */

function addSettlement(){

  if(!sDate.value || !sPaidTo.value || !sAmount.value){
    alert("Fill required fields");
    return;
  }

  api({
    action:"addSettlement",
    date:sDate.value,
    paidTo:sPaidTo.value,
    paidBy:sPaidBy.value,
    amount:sAmount.value,
    mode:sMode.value,
    transactionId:sTransaction.value,
    chequeNo:sCheque.value,
    bankName:sBank.value,
    remarks:sRemarks.value
  }).then(()=>{
    clearForm("settlement");
    loadAllTables();
    loadDashboard();
    alert("Settlement Added");
  });
}

/* ================= CLEAR FORM ================= */

function clearForm(section){
  document.querySelectorAll("#"+section+" input").forEach(i=>i.value="");
}

/* ================= LOAD DASHBOARD ================= */

function loadDashboard(){
  api({action:"getDashboard"}).then(d=>{
    totalExpense.innerText="₹ "+d.totalExpense;
    totalSettled.innerText="₹ "+d.totalSettled;
    papaExpense.innerText="₹ "+d.papaExpense;
    outstandingAmount.innerText="₹ "+d.outstanding;
  });
}

/* ================= LOAD TABLES ================= */

function loadAllTables(){
  api({action:"getReport"}).then(data=>{
    renderMaterial(data.material);
    renderVendor(data.vendor);
    renderSettlement(data.settlement);
  });
}

/* ================= RENDER TABLES ================= */

function renderMaterial(data){

  let html="<table><tr><th>Date</th><th>Item</th><th>Total</th><th>Paid By</th><th>Action</th></tr>";

  data.forEach(r=>{
    html+=`<tr>
      <td>${new Date(r.date).toLocaleDateString()}</td>
      <td>${r.item}</td>
      <td>${r.total}</td>
      <td>${r.paidBy}</td>
      <td>
        <button class="btn-edit" onclick="openEdit('material',${encodeURIComponent(JSON.stringify(r))})">Edit</button>
        <button class="btn-cancel" onclick="cancelEntry('cancelMaterial','${r.id}')">Cancel</button>
      </td>
    </tr>`;
  });

  html+="</table>";
  materialTable.innerHTML=html;
}

function renderVendor(data){

  let html="<table><tr><th>Date</th><th>Vendor</th><th>Amount</th><th>Paid By</th><th>Action</th></tr>";

  data.forEach(r=>{
    html+=`<tr>
      <td>${new Date(r.date).toLocaleDateString()}</td>
      <td>${r.vendor}</td>
      <td>${r.amount}</td>
      <td>${r.paidBy}</td>
      <td>
        <button class="btn-edit" onclick="openEdit('vendor',${encodeURIComponent(JSON.stringify(r))})">Edit</button>
        <button class="btn-cancel" onclick="cancelEntry('cancelVendor','${r.id}')">Cancel</button>
      </td>
    </tr>`;
  });

  html+="</table>";
  vendorTable.innerHTML=html;
}

function renderSettlement(data){

  let html="<table><tr><th>Date</th><th>Paid To</th><th>Amount</th><th>Paid By</th><th>Action</th></tr>";

  data.forEach(r=>{
    html+=`<tr>
      <td>${new Date(r.date).toLocaleDateString()}</td>
      <td>${r.paidTo}</td>
      <td>${r.amount}</td>
      <td>${r.paidBy}</td>
      <td>
        <button class="btn-edit" onclick="openEdit('settlement',${encodeURIComponent(JSON.stringify(r))})">Edit</button>
        <button class="btn-cancel" onclick="cancelEntry('cancelSettlement','${r.id}')">Cancel</button>
      </td>
    </tr>`;
  });

  html+="</table>";
  settlementTable.innerHTML=html;
}

/* ================= EDIT ================= */

function openEdit(type,dataEncoded){

  const data = JSON.parse(decodeURIComponent(dataEncoded));
  CURRENT_EDIT = {type,data};

  let html="";

  for(let key in data){
    if(key==="id") continue;
    html+=`<input id="edit_${key}" value="${data[key]||''}">`;
  }

  editFormContainer.innerHTML=html;
  editModal.style.display="flex";
}

function saveEdit(){

  if(!CURRENT_EDIT) return;

  let updated = { id: CURRENT_EDIT.data.id };

  for(let key in CURRENT_EDIT.data){
    if(key==="id") continue;
    const el = document.getElementById("edit_"+key);
    if(el) updated[key]=el.value;
  }

  let action="";
  if(CURRENT_EDIT.type==="material") action="editMaterial";
  if(CURRENT_EDIT.type==="vendor") action="editVendor";
  if(CURRENT_EDIT.type==="settlement") action="editSettlement";

  updated.action = action;

  api(updated).then(()=>{
    closeModal();
    loadAllTables();
    loadDashboard();
  });
}

function closeModal(){
  editModal.style.display="none";
}

/* ================= CANCEL ================= */

function cancelEntry(action,id){
  if(!confirm("Are you sure?")) return;
  api({action:action,id:id}).then(()=>{
    loadAllTables();
    loadDashboard();
  });
}

/* ================= REPORT ================= */

function loadReport(){

  api({
    action:"getReport",
    from:rFrom.value,
    to:rTo.value
  }).then(data=>{

    let html="<h4>Material</h4>";
    html+=renderReportTable(data.material,"item","total");

    html+="<h4>Vendor</h4>";
    html+=renderReportTable(data.vendor,"vendor","amount");

    html+="<h4>Settlement</h4>";
    html+=renderReportTable(data.settlement,"paidTo","amount");

    reportTable.innerHTML=html;
  });
}

function renderReportTable(data,nameKey,amountKey){

  let html="<table><tr><th>Date</th><th>Name</th><th>Amount</th></tr>";

  data.forEach(r=>{
    html+=`<tr>
      <td>${new Date(r.date).toLocaleDateString()}</td>
      <td>${r[nameKey]}</td>
      <td>${r[amountKey]}</td>
    </tr>`;
  });

  html+="</table>";
  return html;
}

/* ================= LEDGER ================= */

function loadLedger(){
  api({action:"getLedger"}).then(d=>{
    let html="<table><tr><th>Person</th><th>Balance</th></tr>";
    for(let p in d){
      const cls = d[p]>=0?"green":"red";
      html+=`<tr><td>${p}</td><td class="${cls}">${d[p]}</td></tr>`;
    }
    html+="</table>";
    ledgerTable.innerHTML=html;
  });
}

/* ================= EXPORT ================= */

function exportExcel(){
  window.print(); // Simple print fallback (can upgrade to CSV if needed)
}

function exportPDF(){
  window.print();
}
