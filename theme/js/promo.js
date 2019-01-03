//Promo
var promo_codes = [
	{
		"code":"AYA",
		"discount": 20,
		"start_date":"2018-12-25",
		"end_date":"2018-12-30",
		
	},
];
var read_promo_param = function(){
	var pathname = window.location.pathname;
	if(pathname.match(/\/PROMO\//) !== null){
		console.log("Promo exists");
	}
}