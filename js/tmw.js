function pull_donations(){
		var donation_amount = $(".PO_total");
		if (!donation_amount.length){
			window.setTimeout(pull_donations, 100);
		} else {
			$('#amount').text(donation_amount.text());
		}
	};

$(window).load(function(){
	pull_donations();
});