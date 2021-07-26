const socket = io()

const status_button = document.querySelectorAll('.status_btn')
const status_md_id = document.querySelector('.status_md_id')

status_button.forEach((el)=>{el.addEventListener('click', (e) => {
    var status = e.target.value
    var md_id = status_md_id.value
    socket.emit('모델 스케쥴러 조작', { status, md_id })
})})


