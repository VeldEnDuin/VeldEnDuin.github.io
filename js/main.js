;
(function($) {
    $(function(){
        var $langs = $('#lang li a')
          , $activeMenu = $('#menu li .active')
          , langLinks = $activeMenu.data('langlinks')
        ;

        $langs.each(function(){
            var $this = $(this)
              , lang = $this.data('lang')
              , link = langLinks[lang].link
            ;

            if (link) {
                $this.attr('href', link );
            }

        });
    });
})(jQuery);
