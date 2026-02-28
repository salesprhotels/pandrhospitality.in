const API = "PASTE_YOUR_EXEC_URL";

function show(id){
  document.querySelectorAll('.section').forEach(s=>s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

function toggleMode(){
  transactionBox.classList.add('hidden');
  chequeBox.classList.add('hidden');

  if(paymentMode.value === "UPI" || paymentMode.value === "Bank")
    transactionBox.classList.remove('hidden');

  if(paymentMode.value === "Cheque")
    chequeBox.classList.remove('hidden');
}

async function submitPayment(){

  if(!paymentDate.value || !paidBy.value || !vendorName.value || !amount.value || !paymentMode.value){
    alert("Fill required fields");
    return;
  }

  let base64=null, name="", type="";

  if(billFile.files.length>0){
    const file=billFile.files[0];
    name=file.name;
    type=file.type;
    base64=(await toBase64(file)).split(",")[1];
  }

  const payload={
    action:"addPayment",
    paymentDate:paymentDate.value,
    paidBy:paidBy.value,
    vendorType:vendorType.value,
    vendorName:vendorName.value,
    category:category.value,
    amount:amount.value,
    paymentMode:paymentMode.value,
    transactionId:transactionId.value,
    chequeNo:chequeNo.value,
    bankName:bankName.value,
    billBase64:base64,
    billName:name,
    billType:type,
    remarks:remarks.value
  };

  fetch(API,{method:"POST",body:JSON.stringify(payload)})
  .then(r=>r.json())
  .then(res=>{
    alert(res.status==="success"?"Payment Added":res.message);
    document.querySelectorAll("#payment input").forEach(i=>i.value="");
  });
}

async function submitMaterial(){

  if(!purchaseDate.value || !mVendor.value || !materialName.value || !quantity.value || !rate.value){
    alert("Fill required fields");
    return;
  }

  const payload={
    action:"addMaterial",
    purchaseDate:purchaseDate.value,
    vendorName:mVendor.value,
    materialName:materialName.value,
    quantity:quantity.value,
    unit:unit.value,
    rate:rate.value,
    remarks:mRemarks.value
  };

  fetch(API,{method:"POST",body:JSON.stringify(payload)})
  .then(r=>r.json())
  .then(res=>{
    alert(res.status==="success"?"Material Added":res.message);
    document.querySelectorAll("#material input").forEach(i=>i.value="");
  });
}

function toBase64(file){
  return new Promise((res,rej)=>{
    const reader=new FileReader();
    reader.readAsDataURL(file);
    reader.onload=()=>res(reader.result);
    reader.onerror=err=>rej(err);
  });
}
