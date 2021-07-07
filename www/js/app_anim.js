// var btn = document.querySelector('.pmenu-icon');
// var menu = document.querySelector('.menu');
// function toggleMenu () {
//   menu.classList.toggle('open');
// }
// btn.addEventListener('click', toggleMenu);

$(document).ready(function(){
	
	


	
	$("#mypanel").on("panelbeforeopen",function(){
		 var menu = document.querySelector('.menu');
		menu.classList.toggle('open');
	});
	$("#mypanel").on("panelbeforeclose",function(){
	 	var menu = document.querySelector('.menu');
		menu.classList.toggle('open');
	});

});