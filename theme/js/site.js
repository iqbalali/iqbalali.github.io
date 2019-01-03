//Simplecart
//Global functions
var remove_multiples_from_basket = function(){
	simpleCart.each(function(item){
		var quant = item.get('quantity');
		if( quant > 1 ){
			item.set( "quantity", 1 )
		}
		simpleCart.update();
	});
}
var get_new_price = function(current_price, discount){
	var discount = parseFloat(current_price) * (discount/100);
	return (current_price-discount).toFixed(2);
}
var add_item_btn = function(){
	var $items = simpleCart.items();
	for(var i =0;i < $items.length;i++){
		var prod_id = $items[i].get('name');
		if( $('#'+prod_id+' .item_add').length >0 && $('#'+prod_id+' .checkout_btn')){
			$('#'+prod_id+' .item_add').hide();
			$('#'+prod_id+' .checkout_btn').show();
		}
	}
	$('#basket_quant').text(simpleCart.quantity());
	if( simpleCart.quantity() > 0){
		$('#shopping_cart_btn').addClass("has_items");
	}
};
var promo_code = function(){
	var storage_promo_code  = window.sessionStorage.getItem("p");
	if ( storage_promo_code !== null ){
		return JSON.parse(storage_promo_code);
	}else{
		return false;
	}
};
var apply_promo_to_basket_items = function(){
	//Add Promo code
	if( promo_code() ){
		simpleCart.each(function(item){
			var current_price = function(){
				//Check price agains the products list:
				var current_price_value;
				$.each(products, function(i,v){	
					if( v['id'] === item.get('name') ){
						current_price_value = v['price'];
					} 
				});
				return parseFloat( current_price_value );
			};
			
			var new_price = get_new_price( current_price(), promo_code()['discount'] );
			console.log( promo_code() );
			item.set( "price", new_price );
			simpleCart.update();
		});
	}
}
//All pages...
simpleCart.bind( 'load' , function(){
	remove_multiples_from_basket();
});
//Comic page specific
if (pageName === "comic-page"){
	//Show/Hide Add to cart buttons
	simpleCart.bind( 'afterAdd' , function( item ){
		add_item_btn();
	});
	//Apply Promo-code
	simpleCart.bind( 'load' , function(){
		add_item_btn();
		if( promo_code() ){
			//console.log("promo");
			$(".rrp-price").show();
			$("#promo_header").show();
			$.each($('.curr-price'), function(i,v){
				var curr_price = $(".rrp-price:eq("+i+")").find(".item_price").text();
				var new_price = get_new_price( curr_price, promo_code()['discount'] );
				$(v).find('.item_price').text( new_price );
			} );
		}
	});
	//Check if the current page is mentioned in the modal
	var comic_page_name = window.location.pathname.replace(/\//gi,""); 
	if( $('#email_signup .carousel-item.'+comic_page_name ).length > 0 ){
		//Remove all carousel items except for hte referenced comic
		$.each( $('#email_signup .carousel-item'), function(i, v){
			if( $(v).hasClass( comic_page_name ) ){
				$(v).addClass("active");
			}else{
				$(v).remove();
			}
		} );
		//For listed mention, move it to the top and make it bold
		$.each( $('#email_signup ul.list-of-comics .list-comic-item'),function(i, v){
			if( $(v).hasClass( comic_page_name ) ){
				$(v).addClass('b').parent().prepend(v);
			}
		});
	}
}
//Checkout page specific
if (pageName === "checkout"){
	var pp_account = {
        "prod_email":"iqbaliha@gmail.com",
        "sandbox_email":"iqbaliha-buyer-3@gmail.com"
    }
    var pp_email = pp_account['prod_email'],
        pp_sandbox = false; 
    if( window.localStorage.getItem("sandbox") === "true" ){
        pp_email = pp_account['sandbox_email'];
        pp_sandbox = true;
	}
    var custom_variables = function(){
        var c = {
            "newsletter":"true"
        };
		var email_override = window.localStorage.getItem("email");
		if( email_override !== null ){
			c["email"] = email_override;
		}
        if ( promo_code() ){
            c["promo"] = promo_code()['code'];
        }
        return JSON.stringify(c);
    };
    simpleCart({
        checkout: { 
            type: "PayPal" , 
            email: pp_email,
            // use paypal sandbox, default is false
            sandbox: pp_sandbox, 
            // http method for form, "POST" or "GET", default is "POST"
            //method: "GET" , 
            // url to return to on successful checkout, default is null
            success: "success.html" , 
            // url to return to on cancelled checkout, default is null
            cancel: "cancel.html",
            custom: custom_variables()
        } ,
        currency: "GBP",
        cartColumns: [
            //{ attr: "name" , label: "Name" } ,
            { attr: "description" , label: "Description" },
            { attr: "price" , label: "Price", view: 'currency' } ,
            //{ attr: "quantity" , label: "Qtty", view: 'quantity' },
            //{ attr: "total" , label: "SubTotal", view: 'currency' },
            { view: "remove" , text: "Remove" , label: false }
        ],
    });
	simpleCart.bind( 'beforeRemove' , function( item ){
		if( simpleCart.quantity() === 1){
			$('#empty_basket_modal').modal(checkout_modal_options);
		}
	});
	var checkout_modal_options = {backdrop: 'static', keyboard: false};
	simpleCart.bind( 'load' , function(){
		if ( params['add_item'] !== null ) {
			for (var i=0; i < products.length; i++){
				if( products[i]['id'] === params['add_item'] ){
					var set_price = products[i]['price'];
					if( promo_code() ){
						set_price = get_new_price( products[i]['price'], promo_code()['discount'] );
					}
					var	item = {
						'name': products[i]['id'],
						'description': products[i]['name'],
						'price': parseFloat( set_price )
					};
					simpleCart.add(item);
					remove_multiples_from_basket();
				}
			}
		}
		
		//Add remove icon to items
		if( $('.simpleCart_remove').length > 0 ){
			$('.simpleCart_remove').after('<i class="fa fa-close"></i>');
		}
		//If basket is empty, show modal to take user to homepage
		if( simpleCart.quantity() === 0){
			$('#empty_basket_modal').modal(checkout_modal_options);
		}
	});
}
if(pageName === "home" || pageName === "article-page"){
	simpleCart.bind( 'load' , function(){
		if( simpleCart.quantity() === 0){
			$("#shopping_cart_btn").hide();
			$('#header_share_links').show();
		}
	});
}
$("#newsletterform").validate();


$("#newsletterform").submit(function(e) {
	url = $(this).attr('action');
	data = $(this).serialize();
	// alert(url);
	//alert(data);
	  e.preventDefault();

	  $.ajax({
		   url: $(this).attr('action'),
		   type: 'post',
		   data: $(this).serialize(),
		 //xhrFields: { withCredentials: true},
		// dataType: 'json',
		/*
		   headers: {
			   'Access-Control-Allow-Origin': 'http://localhost:8000',
			   'Access-Control-Allow-Credentials':'true',

			   // 'Access-Control-Request-Headers': 'x-requested-with'
			   // 'Accept': 'application/json',
			// 'Content-Type': 'application/x-www-form-urlencoded'
		   },
		   */
		   success: function(data)
		  {
			$('#mauticform_wrapper_mildfrenzynewsletterwebsite').hide();
			$('#myModalLabel').hide();
			$('#success_message').show();
		   },
		   error: function (data) {
			$('#mauticform_wrapper_mildfrenzynewsletterwebsite').hide();
			$('#myModalLabel').hide();
			$('#failure_message').show();
		}
	 });
});
//Social share links:
var social_click_event = function( $item,  base_url){
	$item.click(function(e){
		e.preventDefault();
		window.location.href = base_url+encodeURI( $item.attr('data-share-message') );
	});
};
$.each($('a[data-share]'),function(i, v){
	if($(v).attr('data-share') === 'facebook' ){
		social_click_event( $(this),  'https://www.facebook.com/sharer/sharer.php?u=');
	}else if( $(v).attr('data-share') === 'twitter' ){
		social_click_event( $(this), 'https://twitter.com/home?status=');
	}
});


//Auto open the modal
if (params['modal'] !== undefined){
	$('#email_signup').modal()
}

$('a[data-bookmark]').click(function(e) {
    var bookmarkURL = window.location.href;
    var bookmarkTitle = document.title;

    if ('addToHomescreen' in window && addToHomescreen.isCompatible) {
      // Mobile browsers
      addToHomescreen({ autostart: false, startDelay: 0 }).show(true);
    } else if (window.sidebar && window.sidebar.addPanel) {
      // Firefox <=22
      window.sidebar.addPanel(bookmarkTitle, bookmarkURL, '');
    } else if ((window.sidebar && /Firefox/i.test(navigator.userAgent)) || (window.opera && window.print)) {
      // Firefox 23+ and Opera <=14
      $(this).attr({
        href: bookmarkURL,
        title: bookmarkTitle,
        rel: 'sidebar'
      }).off(e);
      return true;
    } else if (window.external && ('AddFavorite' in window.external)) {
      // IE Favorites
      window.external.AddFavorite(bookmarkURL, bookmarkTitle);
    } else {
      // Other browsers (mainly WebKit & Blink - Safari, Chrome, Opera 15+)
      alert('Press ' + (/Mac/i.test(navigator.platform) ? 'Cmd' : 'Ctrl') + '+D to bookmark this page.');
    }
    return false;
  });