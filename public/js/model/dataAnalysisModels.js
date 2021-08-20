const socket = io()


const del_md_id = document.querySelectorAll(".selected_md_del");
const del_btn = document.querySelector(".del_btn");

let del_arr = new Array();

del_md_id.forEach((el) => {
    el.addEventListener("click", (e) => {
      console.log(el.checked)
      if(el.checked){
          del_arr.push(e.target.value)
      }
      else{
      del_arr = del_arr.filter(item => e.target.value != item)
      }
    });
  });

del_btn.addEventListener("click", (e) => {
    let status = 'stop'
    console.log(del_arr)
    del_arr.map(async(md_list) => {
         await socket.emit('모델 스케쥴러 조작', {status, md_id: md_list})
    })
});