$(document).ready(function () {

    var modalOpen = {
        'display': 'block',
        'z-index': '1000',
        'opacity': 1
    }

    var modalClose = {
        'display': 'none',
        'z-index': '-1',
        'opacity': 0
    }

    function fixedBody() {
        $('body').css({ 'overflow': 'hidden', 'padding-right': '15px' });
    }

    function nonfixedBody() {
        $('body').css({ 'overflow': 'auto', 'padding-right': '' });
    }


    // 삭제 alert
    var deleteBtn = $('.js-delete-btn');
    deleteBtn.on('click', function () {
        var deleteModal = $('[data-layer="modal-delete"]'),
            alertCloseBtn = $('[data-role="layerClose"]');

        deleteModal.css(modalOpen);
        fixedBody();

        alertCloseBtn.on('click', function () {
            deleteModal.css(modalClose);
            nonfixedBody();
        });
    });

    // 대시보드 - 위젯 등록
    var widgetBtn = $('.js-widget-btn');
    widgetBtn.on('click', function () {
        var widgetModal = $('[data-layer="modal-widget"]'),
            alertCloseBtn = $('[data-role="layerClose"]');

        widgetModal.css(modalOpen);
        fixedBody();

        alertCloseBtn.on('click', function () {
            widgetModal.css(modalClose);
            nonfixedBody();
        });
    });

    // 사용자페이지 - 데이터 모델 등록 - 등록 버튼
    var applyBtn = $('.js-apply-btn');
    applyBtn.on('click', function () {
        var applyModal = $('[data-layer="modal-apply"]'),
            alertCloseBtn = $('[data-role="layerClose"]');

        applyModal.css(modalOpen);
        fixedBody();

        alertCloseBtn.on('click', function () {
            applyModal.css(modalClose);
            nonfixedBody();
            $(this).attr('href', 'list.html');
        });
    });

    // treeview
    
    //treeview
    $('li:not(:has(ul))').css({ cursor: 'default', 'list-style-image':'none'});

    $('.tree_img .tree_in:has(ul)')
        .css({cursor: 'pointer', 'list-style-image':'url(/img/box_plus_icon.png)'})
        .children().hide();
    $('.tree_img .tree_in:has(ul)').click(function(event){
        if(this == event.target){
            if ($(this).children().is(':hidden')) {
                $(this).css('list-style-image', 'url(/img/box_minus_icon.png)').children().slideDown();
            }
            else {
                $(this).css('list-style-image', 'url(/img/box_plus_icon.png)').children().slideUp();
            }
        }
        return false;
    });
    $('.tree_basic .tree_in:has(ul)')
        .css({cursor: 'pointer', 'list-style-image':'url(/img/plus_icon.gif)'})
        .children().hide();
    $('.tree_basic .tree_in:has(ul)').click(function(event){
        if(this == event.target){
            if ($(this).children().is(':hidden')) {
                $(this).css('list-style-image', 'url(/img/minus_icon.gif)').children().slideDown();
            }
            else {
                $(this).css('list-style-image', 'url(/img/plus_icon.gif)').children().slideUp();
            }
        }
        return false;
    });
}); //document END
