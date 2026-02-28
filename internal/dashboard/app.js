const API_URL = "YOUR_APPS_SCRIPT_EXEC_URL";

function showSection(id){
  document.querySelectorAll('.section').forEach(sec => sec.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

async function submitPayment(){

  const fileInput = document.getElementById("billFile");
  let fileData = null;
  let fileName = "";
  let fileType = "";

  if(fileInput.files.length > 0){
    const file = fileInput.files[0];
    fileName = file.name;
    fileType = file.type;
    fileData = await toBase64(file);
  }

  const payload = {
    action:"addPayment",
    paymentDate:paymentDate.value,
    paidBy:paidBy.value,
    vendorName:vendorName.value,
    amount:amount.value,
    billFile:fileData ? fileData.split(",")[1] : null,
    billName:fileName,
    billType:fileType
  };

  fetch(API_URL,{
    method:"POST",
    body:JSON.stringify(payload)
  })
  .then(res=>res.text())
  .then(alert);
}

function toBase64(file){
  return new Promise((resolve,reject)=>{
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload=()=>resolve(reader.result);
    reader.onerror=error=>reject(error);
  });
}
