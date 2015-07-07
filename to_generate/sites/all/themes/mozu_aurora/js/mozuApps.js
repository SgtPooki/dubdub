(function ($) {
    var Config = {
        'pageTabs': function(){
            if ($('body').hasClass('node-type-mozu-apps')) {
                return {
                    'menu': [
                        {
                            'id':'#node_mozu_apps_full_group_apps_left_mid_overview',
                            'desc':'Overview'
                        },
                        {
                            'id':'#node_mozu_apps_full_group_apps_left_mid_details',
                            'desc':'Details'
                        },
                        {
                            'id':'#node_mozu_apps_full_group_apps_left_mid_reviews',
                            'desc':'Reviews'
                        },
                        {
                            'id':'#node_mozu_apps_full_group_apps_left_mid_info',
                            'desc':'Partner Information'
                        },
                        {
                            'id':'#node_mozu_apps_full_group_apps_left_mid_video',
                            'desc':'Video'
                        }
                    ]
                }
            }
        },
        'checkPage': function () {
            if ($('body').hasClass('node-type-mozu-apps')) {
                return {
                    'type': 'detail',
                    'name': 'mozuApps',
                    'inc': {
                        'headerText': 'Apps Directory /',
                        'headerLink': '/ecommerce-app-center'
                    }
                };
            } else if ($('body').hasClass('page-mozu-apps')) {
                return {
                    'type': 'view',
                    'name': 'mozuApps',
                    'inc': {
                        //Nothing here yet
                    }
                };
            } else {
                return {
                    'type': 'invalid',
                    'name': 'invalid',
                    'inc': {
                        //Nothing here yet
                    }
                };
            }
        }
    };
    var Toolkit = {
        'checkMobile': function () {
            return ($(window).width() <= 400);
        }
    };
    var MozuApps = {
        'appView': {
            'addReadMore': function () {
                $.each($('.view-mozu-apps .app-item-list .app-li-item').children(), function (k, v) {
                    var targetURL = $(v).find('.AppLogoImg a').attr('href');

                    $(v).find('.longDescCont a, .shortParaCont a, .AppLogoImg a').hover(function () {
                        $(v).addClass('active');
                    }, function () {
                        $(v).removeClass('active');
                    });
                });
            }
        },
        'appDetail': {
            'appendContent': function (config) {
                $('.field-partner-name').prepend('<div class="backToView"><a href="' + config.inc.headerLink + '">' + config.inc.headerText + '</a></div>');

                var isMobile = Toolkit.checkMobile();

                var menuArray = Config.pageTabs().menu;
                var appendStr = '';
                var mainActive = '';

                if (isMobile) {
                    $.each(menuArray, function(k,v){
                        appendStr+='<option value="'+ v.id+'" data-event="'+ v.id+'">'+ v.desc+'</option>';
                    });

                    var menu = '<select name="mobileSel" class="appmenu mobileSelect"> '+appendStr+'</select>';

                } else {
                    $.each(menuArray, function(k,v){
                        if(k===0){
                            mainActive='class="active"';
                        }else{
                            mainActive='';
                        }
                        appendStr+='<li><a href="#" data-event="'+ v.id+'" '+mainActive+'>'+ v.desc+'</a></li>';
                    });
                    var menu = '<div class="appmenu detailsMenu">' +
                        '<ul>' +
                        appendStr
                        + '</ul>' +
                        '</div> ';
                }

                $('#node_mozu_apps_full_group_apps_left_top').append(menu);

                $('.appmenu > ul > li, .appmenu option').hide();
                $('#node_mozu_apps_full_group_apps_left_mid>div').each(function(k,v){
                    var currentItem = $(v).attr('id');
                    $(".appmenu li>a[data-event='#"+currentItem+"']").parent().show();
                    $(".appmenu option[data-event='#"+currentItem+"']").show();
                });

                this.menuEvent();
                this.formatAddress();
            },
            'formatAddress': function(){
                var mainDiv = $('#node_mozu_apps_full_group_apps_address');
                $('#node_mozu_apps_full_group_apps_address>div').hide();
                var newDiv = $('#node_mozu_apps_full_group_apps_address').append('<div class="parsedAddress"><div class="field-label">Partner Address: </div></div>');

                var add1 = mainDiv.find('.field-partner-address-1 .field-item').text() + '<br />';
                if(mainDiv.find('.field-partner-address-2 .field-item').text()){
                    var add2 = mainDiv.find('.field-partner-address-2 .field-item').text() + '<br />';
                }else{
                    var add2 = '';
                }
                var city = mainDiv.find('.field-partner-city .field-item').text() + ', ';
                var state = mainDiv.find('.field-partner-state .field-item').text() + ' ';
                var postal = mainDiv.find('.field-partner-postal-code .field-item').text() + '<br />';
                var country = mainDiv.find('.field-partner-country .field-item').text();


                var parsedContent = add1 + add2 + city + state + postal + country;
                newDiv.append(parsedContent);

            },
            'menuEvent': function () {
                $('#node_mozu_apps_full_group_apps_left_mid>div').hide();
                $('#node_mozu_apps_full_group_apps_left_mid>div:first-child').show();
                var that = this;
                $('#node_mozu_apps_full_group_apps_left_top .detailsMenu>ul>li').each(function (k, v) {
                    that.menuClick(k, $(v).find('a'));
                });

                $('#node_mozu_apps_full_group_apps_left_top .mobileSelect').change(function(){
                    $('#node_mozu_apps_full_group_apps_left_mid>div').hide();
                    $($(this).val()).show();
                });

            },
            'menuClick': function (k, v) {
                $(v).click(function (e) {
                    $('#node_mozu_apps_full_group_apps_left_mid>div').hide();
                    $('#node_mozu_apps_full_group_apps_left_top .detailsMenu>ul>li>a').removeClass('active');
                    var activeMenu = $(v).data('event');

                    $(activeMenu).show();
                    $(v).addClass('active');
                    e.preventDefault();
                });
            },
            'imgShowcase': {
                'init': function(){
                    $('.field-examples-of-work .field-items > div').hide();
                    $('.field-examples-of-work .field-items > div:first-child').show();
                    if (Toolkit.checkMobile()){
                        this.mobile();
                    }else{
                        this.desktop();
                    }
                },
                'desktop': function () {
                    $('#node_mozu_apps_full_group_apps_left_mid_overview>div').append('<div class="imgSelector"></div>');
                    $('.field-examples-of-work .field-items > div').each(function (k, v) {
                        var currentImg = $(v).find('img');
                        var insertedDiv = $('.field-examples-of-work .imgSelector').append('<div class="img' + k + '"></div>');
                        insertedDiv.find('.img' + k).html($(currentImg).clone());
                        insertedDiv.find('.img' + k + ' img').wrap('<a href="#"></a>');
                    });

                    $('.field-examples-of-work .imgSelector > div').each(function (k, v) {
                        $(v).find('img').removeAttr('height');
                        $(v).find('img').removeAttr('width');
                        $(v).find('img').css({'height': 'auto'});
                        $(v).find('a').click(function (e) {
                            $('.field-examples-of-work .field-items > div').hide();
                            $('.field-examples-of-work .field-items > div:nth-child(' + (k + 1) + ')').show();
                            e.preventDefault();
                        })
                    });


                    $('.field-examples-of-work .field-items > div').hide();
                    $('.field-examples-of-work .field-items > div:first-child').show();

                },
                'mobile':function(){
                    $('#node_mozu_apps_full_group_apps_left_mid_overview>div').append('<div class="imgSelectorMobile"></div>');
                    $('.field-examples-of-work .field-items > div').each(function (k, v) {
                        $('.field-examples-of-work .imgSelectorMobile').append('<a href="#" class="img'+k+' imgDot"></a>');
                    });

                    $('.field-examples-of-work .imgSelectorMobile a:first-child').addClass('active');

                    $('.field-examples-of-work .imgSelectorMobile > a').each(function (k, v) {
                        $(v).click(function (e) {
                            $('.field-examples-of-work .field-items > div').hide();
                            $('.field-examples-of-work .field-items > div:nth-child(' + (k + 1) + ')').show();
                            $('.field-examples-of-work .imgSelectorMobile a').removeClass('active');
                            $('.field-examples-of-work .imgSelectorMobile a:nth-child(' + (k + 1) + ')').addClass('active');
                            e.preventDefault();
                        })
                    });
                }
            },
            'init': function (config) {
                this.appendContent(config);
                this.imgShowcase.init();
            }
        },
        'init': function () {
            var currentPage = Config.checkPage();
            switch (currentPage.type) {
                case 'view':
                    this.appView.addReadMore();
                    break;
                case 'detail':
                    this.appDetail.init(currentPage);
                    break;
                default:
                    console.log('Invalid Config Output');
            }
            //Add open in a new window for resource uploads
            $('div.field-resources-upload div.field-item a').attr('target','_blank');

        }
    };
    MozuApps.init();
})(jQuery);

