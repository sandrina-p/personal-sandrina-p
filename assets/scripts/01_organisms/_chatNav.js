var ChatNav = function() {
    var mainSections = TalkChat.mainSections,
        untilTablet = UtilFuncs.untilTablet,
        isNavReady = false;

    //it has to wait for DOM ready to make sure all elements are ready to be shown
    $(function navInit() {
        var $heyThereIntro = $('.heyThere-intro'),
            $nav = $('#chat-nav'),
            baffleBg = baffle("#btn-bg"),
            baffleTh = baffle("#btn-th"),
            bafflePr = baffle("#btn-pr");

        baffleBg
            .start()
            .text(currentText => mainSections[0]);

        baffleTh
            .start()
            .text(currentText => mainSections[1]);

        bafflePr
            .start()
            .text(currentText => mainSections[2]);


        (function showNav() {
            if($heyThereIntro.css('opacity') > "0.9") { //wtf iphone6, why the fuck you return 0.9999989867210388 on console.
                $('#chat, #theory, #background, #practice').removeClass('jsLoading');
                baffleBg.reveal(400, 450);
                baffleTh.reveal(400, 250);
                bafflePr.reveal(400, 300);
                setTimeout(function () {
                    isNavReady = true; //to trigger _hashs.js if needed
                }, 1000);
            } else {
                setTimeout(() => showNav(), 500);
            }
        })();

        setTimeout(() => navTranslate(), 1000);


        function navTranslate(thisId = null) {
            var navWidth = untilTablet ? 0 : 20, //padding
                padd = 16;

            $nav.children().each(function() {
                if (thisId && $(this).attr('id') == thisId) {
                    return;
                }

                navWidth = untilTablet ? navWidth : navWidth + 36;
                $(this).css({'transform': 'translateX('+navWidth+'px)'});
                navWidth += $(this).width();
                console.log($(this).width());
            });

            //BUG: Prevent bug on Safari. Sometimes it loads too soon. Even with timeout(),
            // without knowing the real navWidth value.
            if (navWidth < 150) {
                console.log('upps... navTranslate() was loaded too soon');
                GAcustom.sendToGA(`&ec=bug&ea=navSoon`);
                setTimeout(function () {
                    navTranslate();
                }, 250);
            } else {
                console.log('nav loaded without problems');
            }
        }

                                //FIXME i should really add a class here ._.
        $(document).on('click', '.chatSection.jsOnNav', function(){
            Hashs.set( $(this).find('.chatPart-title').text() );

            navTranslate( $(this).attr('id') );
            $(this).css({'transform': 'translate(0, 0)'});
            $(this).removeClass('jsOnNav');
            $(this).one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(e) {
                $(this).insertBefore('#chat-nav');
            });
        });

    });

    function checkIsNavReady() {
        return isNavReady;
    }

    return {
        checkIsNavReady
    }
}();
