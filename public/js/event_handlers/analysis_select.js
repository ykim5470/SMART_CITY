const analysis_select = (socket) =>{
    let al_name_mo_obj = new Object()
    socket.al_name_mo_obj('분석 모델 선택', (data)=>{
        console.log(data)
        const {al_name_mo} = data
        al_name_mo_obj = {al_name_mo}

    })
}