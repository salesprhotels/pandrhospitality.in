/* ================= CONFIG ================= */

const API = "PASTE_YOUR_DEPLOYED_WEBAPP_URL_HERE";
let SESSION_PASSWORD = "";

/* ================= API ================= */

function api(data){
  data.password = SESSION_PASSWORD;
  return fetch(API,{
    method:"POST",
    body:JSON.stringify(data)
  }).then(res=>res.json());
}

/* ================= LOGIN ================= */

function login(){
  const pass = loginPassword.value;
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

/* ================= NAV ================= */

function showSection(id){
  document.querySelectorAll(".section").forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  if(id==="ledger") loadLedger();
}

/* ================= CONSTRUCTION MASTER ================= */

const MATERIAL_MASTER = {
  Structural: ["Cement","Sand","Bajri","Stone","Bricks","TMT Bar","Binding Wire"],
  Electrical: ["Wire","Conduit Pipe","Switch","MCB","DB Board","Light","Fan"],
  Plumbing: ["PVC Pipe","CPVC Pipe","GI Pipe","Tank","Tap","Basin"],
  Finishing: ["Paint","Putty","Primer","Tiles","Marble","Granite"],
  Furniture: ["Plywood","Laminate","Door","Window","Glass","Handle"],
  Miscellaneous: ["Other"]
};

function loadMaterialItems(){
  const category = mCategory.value;
  mItem.innerHTML = `<option value="">Select Item</option>`;

  if(MATERIAL_MASTER[category]){
    MATERIAL_MASTER[category].forEach(item=>{
      mItem.innerHTML += `<option>${item}</option>`;
    });
  }
}

/* ================= ITEM LOGIC ================= */

function handleMaterialLogic(){

  const item = mItem.value;

  // reset
  mSize.style.display="none";
  mVehicle.style.display="none";
  mUnit.value="";

  if(item==="Cement"){
    mUnit.value="Bags";
  }

  if(item==="Sand" || item==="Bajri" || item==="Stone"){
    mUnit.value="Load";
    mVehicle.style.display="block";
  }

  if(item==="Bricks"){
    mUnit.value="Nos";
  }

  if(item==="TMT Bar"){
    mUnit.value="Kg";
    mSize.style.display="block";
  }

  if(item==="Binding Wire"){
    mUnit.value="Kg";
  }

  if(item==="Paint"){
    mUnit.value="Litre";
  }

  if(item==="Tiles" || item==="Marble" || item==="Granite"){
    mUnit.value="Sqft";
  }

  if(item==="Wire"){
    mUnit.value="Meter";
  }
}

/* ================= TOTAL ================= */

function calculateMaterialTotal(){
  const qty = Number(mQty.value||0);
  const rate = Number(mRate.value||0);
  mTotal.value = qty * rate;
}

/* ================= PAYMENT MODE ================= */

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

/* ================= ADD MATERIAL ================= */

function addMaterial(){

  if(!mDate.value || !mCategory.value || !mItem.value || !mQty.value || !mRate.value){
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
    alert("Material Added");
    clearMaterialForm();
    loadAllTables();
    loadDashboard();
  });
}

function clearMaterialForm(){
  document.querySelectorAll("#material input").forEach(i=>i.value="");
  mSize.style.display="none";
  mVehicle.style.display="none";
}

/* ================= DASHBOARD ================= */

function loadDashboard(){
  api({action:"getDashboard"}).then(d=>{
    totalExpense.innerText="₹ "+d.totalExpense;
    totalSettled.innerText="₹ "+d.totalSettled;
    papaExpense.innerText="₹ "+d.papaExpense;
    outstandingAmount.innerText="₹ "+d.outstanding;
  });
}

/* ================= TABLE LOAD ================= */

function loadAllTables(){
  api({action:"getReport"}).then(data=>{
    renderMaterial(data.material);
  });
}

function renderMaterial(data){

  let html="<table><tr><th>Date</th><th>Item</th><th>Qty</th><th>Total</th><th>Paid By</th></tr>";

  data.forEach(r=>{
    html+=`<tr>
      <td>${new Date(r.date).toLocaleDateString()}</td>
      <td>${r.item}</td>
      <td>${r.total}</td>
      <td>${r.total}</td>
      <td>${r.paidBy}</td>
    </tr>`;
  });

  html+="</table>";
  materialTable.innerHTML=html;
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
