var varUA = navigator.userAgent.toLowerCase();

var delay = 300;
var timer = null;
var container = [];
var ratio = 1;

$(document).ready(function (e) {
    timer = setTimeout(function () {
        $(".loader_mcard").hide();

        //D-Day 영역, 어디서 생성되는지 모름.. 지연 실행 하도록 수정
        if (typeof $(".d_day").val() != 'undefined') {
            $(".d_day").css("font-size", (parseInt($(".d_day").css("font-size").replace("px", "")) * ratio) + "px");
            setDday($("#eventDate").val());
        }

    }, delay);

   
    resizePage();

    //2023-06-16 모초 랜더링 방식 개선
    $(window).resize(function (e) {
        //location.href = location.href;
    });

    //신랑 & 신부측 혼주 보기
    $('.list_con').slideDown();
    $('.info_detail').on('click', function () {
        $(this).parent('.list_wrap').toggleClass('on');
        $('.list_con').slideToggle();
    });

    // Loop over gallery items and push it to the array
    $('#gallery').find('figure').each(function () {
        var $link = $(this).find('a'),
            item = {
                src: $link.attr('href'),
                w: $link.data('width'),
                h: $link.data('height'),
                title: $link.data('caption')
            };
        container.push(item);
    });
    //갤러리 타입03 - 썸네일 슬라이드
    var galleryThumbs = null

    if ($('.gallery-thumbs').length > 0) {
        galleryThumbs =
            new Swiper('.gallery-thumbs', {
                spaceBetween: 10,
                slidesPerView: 3,
                loop: true,
                freeMode: true,
                loopedSlides: 5, //looped slides should be the same
                watchSlidesVisibility: true,
                watchSlidesProgress: true,
            });
    }
    var galleryTop = null;
    if (galleryThumbs != null) {
        galleryTop = new Swiper('.gallery-top', {
            spaceBetween: 10,
            autoHeight: true,
            loop: true,
            loopedSlides: 5, //looped slides should be the same
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            thumbs: {
                swiper: galleryThumbs,
            },
        });
    }

    //Video 크기 조정
    if ($(document).width() < 500) {
        $(".iframe_wrap iframe").css("height", "191px");
    }

    //방명록 목록
    if ($('a.btn_guestbook_more').length > 0) {
        $('a.btn_guestbook_more').click();
    }
});



//클립보드 복사 - 안드로이드 제외 클릭 이벤트
$("a.copy_url").on('click', function (e) {
    e.preventDefault();
    copyToClipboard($(this).attr("href"));

    if (varUA.indexOf('android') > -1) {
        return false;
    } else {
       toastPopup('URL이 복사되었습니다.', 1500);
    }
});
//계좌번호 팝업
$("a.an_btn").on('click', function (e) {
    e.preventDefault();
    $('div.account_pop').hide();

    var idx = $(this).attr('data-idx');
    $('div.account_pop').each(function(i, popitem) {
        if ($(popitem).attr('data-idx') == idx) {
            $(popitem).show();
            scrollDisable();
        }
    });
});
//계좌번호 팝업 닫기
$('.btn.close').on('click', function (e) {
    e.preventDefault();
    $('div.account_pop').hide();
    scrollAble();
});
//계좌 클립보드 복사
$("a.copy_account").on('click', function (e) {
    e.preventDefault();
    var account = $(this).attr('data-account');
    var copyacc = account.replace(/-/g, "");
    copyToClipboard(copyacc);

    if (varUA.indexOf('android') > -1) {
        return false;
    } else {
        toastPopup('복사되었습니다.', 1500);
    }
});

//방명록 저장
$("#frmGuestbook").on("submit", function (e) {
    e.preventDefault();
    var form = $(this);
    var url = form.attr('action');

    $.ajax({
        cache: false,
        url: url,
        type: 'POST',
        data: form.serialize()
    }).done(function (data, textStatus, jqXHR) {
        //alert(data['message']);
        $(".write_box").find("input").val("");  //저장 후 input value 초기화
        toastPopup(data['message'], 2000);
        if (data['status'] == true) {
            $('#guestbook').html('');
            $('a.btn_guestbook_more').click();
        }
    });
});
//방명록 목록
$('a.btn_guestbook_more').on('click', function (e) {
    e.preventDefault();
    var url = $(this).attr("href");
    var lastId = 0;
    if ($('.guestbook_item').length > 0) {
        lastId = $('.guestbook_item').last().data('guestbook-id');
    }
    url += "&idx=" + lastId;

    loadGuestbook(url,'next');
});
$('a.btn_guestbook_all').on('click', function (e) {
    e.preventDefault();
    var url = $(this).attr("href");
    loadGuestbook(url,'all');
});
//방명록 목록 읽기
var loadGuestbook = function (url, type) {
    $.ajax({
        url: url,
        method: 'get',
        data: {}
    }).done(function (data, textStatus, jqXHR) {
        if (type == 'all') {
            $('#guestbook').html(data);
        }
        else {
            $('#guestbook').append(data);
        }
    });
}
//방명록 댓글 토글 이벤트
$("body").on("click", 'button.message_del', function (e) {
    e.preventDefault();
    $(this).parents('li').find(".password_check").slideToggle();
});
//방명록 댓글 삭제 이벤트
$("body").on("click", 'a.btn_delete_guestbook', function (e) {
    e.preventDefault();
    var url = $(this).attr("href");
    var password = $(this).parent().find('input[name="password"]').val();

    $.ajax({
        cache: false,
        url: url,
        type: 'POST',
        data: {
            Password: password
        }
    }).done(function (data, textStatus, jqXHR) {
        //alert(data['message']);
        toastPopup(data['message'], 2000);
        if (data['status'] == true) {
            $('#guestbook').html('');
            $('a.btn_guestbook_more').click();
        }
    });
});



//페이지 폭 조정
var resizePage = function () {
    ratio = $("#wrap").width() / 800;

    $("div.bindarea").each(function (i, divarea) {
        var areaHeight = $(divarea).height();

        $(divarea).children("div.item").each(function (j, divitem) {
            var x = parseInt($(divitem).css("top")) * ratio;
            var y = parseInt($(divitem).css("left")) * ratio;
            var w = parseInt($(divitem).css("width")) * ratio;
            var h = parseInt($(divitem).css("height")) * ratio;

            $(divitem).css("top", x + "px");
            $(divitem).css("left", y + "px");
            
            if ($(divitem).hasClass("ITC01")) {
                //Text
                $(divitem).css("width", w + "px");
                $(divitem).css("height", h + "px");

                var txt = $(divitem).children("div.text");
                var txtfontsize = parseInt($(txt).css("font-size")) * ratio;
                $(txt).css("font-size", txtfontsize + "px");


            } else if ($(divitem).hasClass("ITC02")) {
                //Image
                var img = $(divitem).children("img.img");
                w = parseInt($(img).css("width")) * ratio;
                h = parseInt($(img).css("height")) * ratio;
                $(img).css("width", w + "px");
                $(img).css("height", h + "px");

            } else if ($(divitem).hasClass("ITC03") || $(divitem).hasClass("ITC04")) {
                //Photo
                $(divitem).css("width", w + "px");
                $(divitem).css("height", h + "px");

                var img = $(divitem).children("img.img");
                $(img).css("max-width", w + "px");
                $(img).css("max-height", h + "px");
            }
        });
        //$(divarea).css("height", areaHeight * ratio + "px");

        if ($(divarea).attr("idx") == "2") {

            var totheight = 30.0;
            var imgheight = $(divarea).find('.img').outerHeight(true) + totheight;
            var txtheight = $(divarea).find('.text').outerHeight(true);

            $(divarea).css('min-height', areaHeight * ratio + "px");
            $(divarea).css('height', (imgheight + txtheight) + "px");
            $(divarea).find('.text').parent().css('height', (txtheight) + "px");

        } else if ($(divarea).attr("idx") == "19") {
            var totheight = 15.0;
            $.each($(divarea).find("div.text"), function (idx, txtItem) {
                var curHeight = $(txtItem).outerHeight(true);
                totheight += curHeight;
                $(txtItem).parent().css("height", curHeight + "px")
            });

            $(divarea).find("img.img").height(totheight + "px");
            $(divarea).css('height', totheight + "px")

        } else {
            $(divarea).find('.text', '.item').each(function () {
                $(this).data("height", $(this).outerHeight());
                $(this).data("fontSize", parseInt($(this).css("font-size")));
            });
            $(divarea).css("height", areaHeight * ratio + "px");
        }

    });

    //화환 영역
    if ($("div.flowergift").length > 0) {
        $("div.flowergift .templatearea").css("height", 224 * ratio + "px");
        $("div.flowergift .templatearea img").css("height", 224 * ratio + "px");
        $("div.flowergift .templatearea img").css("width", 800 * ratio + "px");
    }
};

//클립보드 복사
var copyToClipboard = function (text) {
    var aux = document.createElement("textarea");
    aux.value = text;
    document.body.appendChild(aux);
    aux.select();
    aux.setSelectionRange(0, 9999);
    document.execCommand("copy");
    document.body.removeChild(aux);
};

//팝업창 표시
var toastPopup = function (msg, timer) {
    var $elem = $("<p>" + msg + "</p>");

    $("div.toast").html($elem).show();

    $elem.slideToggle(100, function () {
        setTimeout(function () {
            $elem.fadeOut(function () {
                $(this).remove();
                $('div.toast').css('bottom', '');
            });
        }, timer);
        return false;
    });

    $('div.toast').stop().animate({ 'bottom': '5%' });
};

//스크롤 방지 이벤트
var scrollDisable = function () {
    $('body').addClass('scroll_off').on('scroll touchmove mousewheel');
}

//스크롤 방지해제 이벤트
var scrollAble = function () {
    $('body').removeClass('scroll_off').off('scroll touchmove mousewheel');
}

function setDday(wedding_date) {

    if (typeof $(".d_day").val() != 'undefined') {
        var today = new Date();
        var wedd_day = new Date(wedding_date);
        var distance = wedd_day - today
        var dday = Math.ceil(distance / (1000 * 60 * 60 * 24));

        if (parseInt(dday) > 0) {
            //예식일이전
            $(".d_day").text("D-" + parseInt(dday));
            $(".d_day").show();
        } else if (parseInt(dday) == 0) {
            $(".d_day").text("D-Day");
            $(".d_day").show();
            //예식일당일
        } else {
            //예식일이후
            $(".d_day").hide();
        }
    }
}