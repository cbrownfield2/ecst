var STOCKS_TABLE = "stocksTable";

var symbolList = ["YHOO", "AAPL", "BAC", "GOOG"];
var startingBalance = 10000.0;


var time = new timeDate();
var stocks = initializeStocks();
console.log(stocks);
var portfolio = new portfolio();

function main(){
	setInterval(tick, 5); // 20 Minutes per second. 
	var count = 0;
	var dupes = 0;
	var b;
	var rollstarter = 32;
	var myarray = new Array(54);
	//Math.floor(Math.random() * 54)
	var chaos = new Array(20);
	var c;
	var R = 1.1;
	var p = 0.02;
	for(c=0; c<chaos.length;c++){
		chaos[c] = new Array(20);
	}
	
	for(c=0; c<chaos.length; c++){
		var a;
		for(a=0; a<chaos[c].length; a++){
			if(a==0){
				chaos[c][a] = p;
			}else{
			  chaos[c][a] = chaos[c][a-1]*(1-chaos[c][a-1])*R;
				chaos[c][a] = chaos[c][a].toFixed(5);
			}
		}
		R = R+0.2;
	}
	document.getElementById("chaosarray").innerHTML = chaos[0];
		document.getElementById("chaosarray1").innerHTML = chaos[1];
			document.getElementById("chaosarray2").innerHTML = chaos[2];	
			 document.getElementById("chaosarray3").innerHTML = chaos[3];
				document.getElementById("chaosarray4").innerHTML = chaos[4];
					document.getElementById("chaosarray5").innerHTML = chaos[5];
						document.getElementById("chaosarray6").innerHTML = chaos[6];
							document.getElementById("chaosarray7").innerHTML = chaos[7];
								document.getElementById("chaosarray8").innerHTML = chaos[8];
									document.getElementById("chaosarray9").innerHTML = chaos[9];
										document.getElementById("chaosarray10").innerHTML = chaos[10];	
										document.getElementById("chaosarray11").innerHTML = chaos[11];
											document.getElementById("chaosarray12").innerHTML = chaos[12];
												document.getElementById("chaosarray13").innerHTML = chaos[13];
												
												
FusionCharts.ready(function () {
    var visitChart = new FusionCharts({
        type: 'msline',
        renderAt: 'chart-container',
        width: '550',
        height: '350',
        dataFormat: 'json',
        dataSource: {
            "chart": {
                "caption": "Number of visitors last week",
                "subCaption": "Bakersfield Central vs Los Angeles Topanga",
                "captionFontSize": "14",
                "subcaptionFontSize": "14",
                "subcaptionFontBold": "0",
                "paletteColors": "#0075c2,#1aaf5d",
                "bgcolor": "#ffffff",
                "showBorder": "0",
                "showShadow": "0",
                "showCanvasBorder": "0",
                "usePlotGradientColor": "0",
                "legendBorderAlpha": "0",
                "legendShadow": "0",
                "showAxisLines": "0",
                "showAlternateHGridColor": "0",
                "divlineThickness": "1",
                "divLineIsDashed": "1",
                "divLineDashLen": "1",
                "divLineGapLen": "1",
                "xAxisName": "Day",
                "showValues": "0"               
            },
            "categories": [
                {
                    "category": [
                        { "label": "Mon" }, 
                        { "label": "Tue" }, 
                        { "label": "Wed" },
                        {
                            "vline": "true",
                            "lineposition": "0",
                            "color": "#6baa01",
                            "labelHAlign": "center",
                            "labelPosition": "0",
                            "label": "National holiday",
                            "dashed":"1"
                        },
                        { "label": "Thu" }, 
                        { "label": "Fri" }, 
                        { "label": "Sat" }, 
                        { "label": "Sun" }
                    ]
                }
            ],
            "dataset": [
                {
                    "seriesname": "Bakersfield Central",
                    "data": [
                        { "value": "15123" }, 
                        { "value": "14233" }, 
                        { "value": "25507" }, 
                        { "value": "9110" }, 
                        { "value": "15529" }, 
                        { "value": "20803" }, 
                        { "value": "19202" }
                    ]
                }, 
                {
                    "seriesname": "Los Angeles Topanga",
                    "data": [
                        { "value": "13400" }, 
                        { "value": "12800" }, 
                        { "value": "22800" }, 
                        { "value": "12400" }, 
                        { "value": "15800" }, 
                        { "value": "19800" }, 
                        { "value": "21800" }
                    ]
                }
            ], 
            "trendlines": [
                {
                    "line": [
                        {
                            "startvalue": "17022",
                            "color": "#6baa01",
                            "valueOnRight": "1",
                            "displayvalue": "Average"
                        }
                    ]
                }
            ]
        }
    }).render();
});
	
	for(b=0; b<myarray.length;b++){
		myarray[b]=0;
	}
	setInterval(roller, 100);
	function roller(){
		if(containszero(myarray) > rollstarter){
			count++;
			if(roll(myarray,count) == true){
				dupes++;
			}
			document.getElementById("counter").innerHTML = "Roll:"+count;
			document.getElementById("myarray").innerHTML = "Hero Unlocked on Roll#: "+myarray;
			document.getElementById("escost").innerHTML = "Eternity Shard Cost: "+175*count;
		}
		document.getElementById("rollstarter").innerHTML = "Stop rolling when "+rollstarter+" heros left to unlock.";
		document.getElementById("dupes").innerHTML = "Duplicates Rolled: "+dupes;
		document.getElementById("wasted").innerHTML = "Wasted Eternity Shards: "+dupes*175;
	}


	function tick(){
		document.getElementById("time").innerHTML = time.format();
		document.getElementById("wealth").innerHTML = "Wealth: $"+(portfolio.wallet.value+portfolio.wallet.balance).toFixed(4);
		document.getElementById("balance").innerHTML = "Balance: $"+portfolio.wallet.balance.toFixed(4);
		document.getElementById("value").innerHTML = "Stock Balance: $"+portfolio.wallet.value.toFixed(4);
		
		updateStockPrices();
		trade();
		updateHighLow();
		updateStocksTable();
		updateStockBalance();
		time.increment();
	}
}//END MAIN

/**
 *  OBJECT MODELS
 */
 
 function containszero(array){
 	var i;
	var c = 0;
	for(i=0; i<array.length;i++){
		if(array[i] == 0){
			c += 1;
		}
	}
	return c;
 }

 function roll(array, rollnumb){
 	var i = array.length;
	var roll = (Math.floor(Math.random() * array.length))
	if(array[roll] != 0){
		return true; //ALready has hero
	}
		array[roll] = rollnumb;
		return false; //Unlocked new hero
 }

 
function trade(){
	for(var i in stocks){
		var quantity = 150;
		if(stocks[i].price > stocks[i].peak){ //Trending Up
			if(haveBalance(stocks[i].price*quantity)){
				portfolio.buyShare(stocks[i].id, stocks[i].price, quantity);
			}
		}
	}
	for(var i in portfolio.shares){
		if((stocks[portfolio.shares[i].stock_id].price - portfolio.shares[i].bought_at) > .001){ //Sell Next Trend Up.
			portfolio.sellShare(i, stocks[portfolio.shares[i].stock_id].price);
		} else if((stocks[portfolio.shares[i].stock_id].peak - stocks[portfolio.shares[i].stock_id].price ) > .001){ //Trending Down.
					portfolio.sellShare(i, stocks[portfolio.shares[i].stock_id].price);
		}																								
	}
}

function updateHighLow(){
	for(var i in stocks){
		if(stocks[i].price > stocks[i].peak){
			stocks[i].peak = stocks[i].price;
		}
		if(stocks[i].price < stocks[i].low){
			stocks[i].low = stocks[i].price;
		}
	}
}
 
 /**
  * 9% Chance of anything happening. Then a 50/50 chance of going up or down. 
	* No AI Logic Yet.
	*/
function updateStockPrices(){
	for(var i in stocks){
		var rand1 = (Math.floor(Math.random() * 100))/100.00;
		if(rand1 < .01){
			var rand2 = (Math.floor(Math.random() * 100))/100.00;
			var change = (Math.floor(Math.random() * 100))/10000.00;
			var oldPrice = stocks[i].price;
			if(rand2 < .5){
				stocks[i].price = stocks[i].price + change;
			} else{
				stocks[i].price = stocks[i].price - change;
			}
			var newPrice = stocks[i].price;
			stocks[i].mm = (stocks[i].mm + ((oldPrice+newPrice)/2))/2;
		} else if(rand1 < .1){
			var rand2 = (Math.floor(Math.random() * 100))/100.00;
			var change = (Math.floor(Math.random() * 100))/100000.00;
			var oldPrice = stocks[i].price;
			if(rand2 < .5){
				stocks[i].price = stocks[i].price + change;
			} else{
				stocks[i].price = stocks[i].price - change;
			}
			var newPrice = stocks[i].price;
			stocks[i].mm = (stocks[i].mm + ((oldPrice+newPrice)/2))/2;
		} else {
		}
	}
}
 
/**
 * timeDate object used to track the simulation time.
 */
function timeDate(){
	this.year = 0;
	this.day = 0;
	this.hour = 0;
	this.minute = 0;
	this.increment = function(){
		this.minute++;
		if(this.minute > 59){
			this.minute = 0; 
			this.hour++;
			if(this.hour > 23){
				this.hour = 0;
				this.day++;
				if(this.day > 364){
					this.day = 0;
					this.year++;
				}
			}
		}
	};
	this.format = function(){
		if(this.hour<10){			
			if(this.minute<10){
				return "Year:"+this.year+"   Day:"+this.day+"    0"+this.hour+":0"+this.minute;
			}
			return "Year:"+this.year+"   Day:"+this.day+"    0"+this.hour+":"+this.minute;
		} else{
				if(this.minute<10){				
					return "Year:"+this.year+"   Day:"+this.day+"    "+this.hour+":0"+this.minute;
				}
				return "Year:"+this.year+"   Day:"+this.day+"    "+this.hour+":"+this.minute;
		}
	}
}


/**
 * Portfolio
 */
function portfolio(){
	this.shares = new Array();
	this.transactions = new Array();
	this.transaction_id = 0;
	this.purchase_id = 0;
	this.sell_id = 0;
	this.wallet = {
		balance: startingBalance,
		value: 0.00
	}
	this.buyShare = function(stock_id, bought_at, quantity){
		console.log("Buying "+stocks[stock_id].symbol+" @ $"+stocks[stock_id].price);
		var i;
		for(i=0; i<quantity; i++){
			var share = new Object();
			share.purchase_id = this.purchase_id;
			share.stock_id = stock_id;
			share.bought_at = bought_at;
			this.purchase_id += 1;
			stocks[stock_id].ms += 1;
			this.shares.push(share);
		}
		var transaction = new Object();
		transaction.type = 0; // Buy
		transaction.id = this.transaction_id;
		transaction.stock_id = stock_id;
		transaction.val = bought_at*quantity;
		transaction.time = time.format();
		this.transaction_id += 1;
		this.transactions.push(transaction);
		this.wallet.balance -= bought_at*quantity;
		//this.wallet.value += bought_at*quantity;
	};
	this.sellShare = function(index, sell_at){
		console.log("Selling "+stocks[this.shares[index].stock_id].symbol+" @ $"+sell_at);
		var transaction = new Object();
		transaction.type = 1; // Sell
		transaction.id = this.transaction_id;
		transaction.stock_id = this.shares[index].stock_id;
		transaction.val = sell_at;
		transaction.time = time.format();
		stocks[this.shares[index].stock_id].ms -= 1;
		this.transaction_id += 1;
		this.sell_id += 1;
		this.transactions.push(transaction);
		this.wallet.balance += sell_at;
		//this.wallet.value -= this.shares[index].bought_at;
		this.shares.splice(index, 1);
	};
}

/**
 * Stock
 */
function stock(stock_id, symbol, price, peak, low, volume, mm){
	this.id = stock_id;
	this.symbol = symbol;
	this.price = price;
	this.volume = volume;
	this.mm = price;
	this.peak = 0;
	this.low = 0;
	this.ms = 0;
}

function updateStockBalance(){
	portfolio.wallet.value = 0;
	for(var i in stocks){
		portfolio.wallet.value += stocks[i].price*stocks[i].ms;
	}
}

/**
 *  OBJECT MODELS END
 */
function initializeStocks(){
	var stocks = new Array();
	var table = document.getElementById(STOCKS_TABLE);

	for(var i in symbolList){
		//var p = (Math.floor(Math.random() * 100) + 1.00)/100.00;  
		var p = .50
		console.log(p);
		var s = new stock(Number(i), symbolList[i], p, p, p, 1000);
		stocks.push(s);
		var row = table.insertRow(Number(i)+2);
		row.id = s.symbol;
		var cell0 = row.insertCell(0);
		cell0.id = s.symbol+"stockID";
		var cell1 = row.insertCell(1);
		cell1.id = s.symbol+"symbol";
		var cell2 = row.insertCell(2);
		cell2.id = s.symbol+"price";
		var cell3 = row.insertCell(3);
		cell3.id = s.symbol+"volume";
		var cell4 = row.insertCell(4);
		cell4.id = s.symbol+"mm";
		var cell5 = row.insertCell(5);
		cell5.id = s.symbol+"ms";
		var cell6 = row.insertCell(6);
		cell6.id = s.symbol+"low";
		var cell7 = row.insertCell(7);
		cell7.id = s.symbol+"peak";
		cell0.innerHTML = s.id;
		cell1.innerHTML = s.symbol;
		cell2.innerHTML = s.price;
		cell3.innerHTML = s.volume;
		cell4.innerHTML = s.mm;
		cell5.innerHTML = s.ms;
		cell6.innerHTML = s.low;
		cell7.innerHTML = s.peak;
	}
	return stocks;
}

function updateStocksTable(){
	var table = document.getElementById(STOCKS_TABLE);
	for(var i in stocks){
		var id = stocks[i].symbol+"price";
		document.getElementById(id).innerHTML = stocks[i].price.toFixed(6);
		id = stocks[i].symbol+"mm";
		document.getElementById(id).innerHTML = stocks[i].mm.toFixed(6);
		id = stocks[i].symbol+"ms";
		document.getElementById(id).innerHTML = stocks[i].ms;
		id = stocks[i].symbol+"low";
		document.getElementById(id).innerHTML = stocks[i].low;		
		id = stocks[i].symbol+"peak";
		document.getElementById(id).innerHTML = stocks[i].peak;
	}
}

function haveBalance(cost){
	if(cost <= portfolio.wallet.balance){
		return true;
	}
	return false;
}

