var login = document.createElement("div");
login.style.left = '500px';
login.style.top = '100px';

login.style.position = "absolute";
login.style.background = "white";
login.style.color = "black";
login.style.visibility = "visible";

login.setAttribute('class', 'login');

var nameLabel = login.appendChild(document.createElement('label'));
nameLabel.innerHTML = "Username : "; 

var username = login.appendChild(document.createElement('input'));
username.type = 'text';
username.name = 'username';
username.id = 'username';

var passwordLabel = login.appendChild(document.createElement('label'));
passwordLabel.innerHTML = "Password : "; 
var password = login.appendChild(document.createElement('input'));
password.type = 'password';
password.name = 'password';
password.id = 'password';

button = login.appendChild(document.createElement("input"));
button.type = "button";
button.value = "Enter";
button.onclick = function checkVal()
{
	var user = document.getElementById("username").value;
	var pass = document.getElementById("password").value;
	if (user === 'admin' && pass === 'admin')
	{
		login.style.visibility = "hidden";
		profile.style.visibility = "visible";
	}
	else
	{
		alert("access is not permited for " + user);
	}
};


var profile = document.createElement("div");
profile.style.left = '100px';
profile.style.top = '05px';
profile.style.position = "absolute";
var para = profile.appendChild(document.createElement("p"));
para.style.width = "1000px";
para.style.height = "1000px";
para.style.color = "black";

profile.innerHTML = 
"<h1>Jonathan Heiss<br>302892757</h1>";
var para1 = document.createElement("p");
var node1 = document.createTextNode("My name is Jonathan, and I'm a computer science student at HUJI.");
para1.appendChild(node1);
profile.appendChild(para1);
var para2 = document.createElement("p");
var node2 = document.createTextNode("On my spare time I like to swim, read and save the world");
para2.appendChild(node2);
profile.appendChild(para2);
var para3 = document.createElement("p");
var quote = document.createTextNode('A funny quote will be: "Knowledge is knowing that a tomato is a fruit, wisdom is not putting it in a fruit salad."');
para3.appendChild(quote);
profile.appendChild(para3);


var img1 = document.createElement("img");
img1.src = "images/IMG_0705.jpg"; 
img1.onmouseover = function(){img1.src = 'images/funny.jpg'};
img1.onmouseout = function(){img1.src = 'images/IMG_0705.jpg'};
profile.appendChild(img1);

logOut = profile.appendChild(document.createElement("input"));
logOut.type = "button";
logOut.value = "logOut";
logOut.onclick = function() 
{
	alert("you logged out successfully");
	login.style.visibility = "visible";
	profile.style.visibility = "hidden";
};
clac = profile.appendChild(document.createElement("input"));
clac.type = "button";
clac.value = "calculator";
clac.onclick = function() 
{
	profile.style.visibility = "hidden";
	calculator.style.visibility = "visible";
};	

profile.style.visibility = "hidden";




var calculator = document.createElement("div");
calculator.style.left = '100px';
calculator.style.top = '05px';
calculator.style.position = "absolute";

cal = calculator.appendChild(document.createElement("input"));
cal.type = "button";
cal.value = "create calculator!";
cal.onclick = function Calc()
{
	var first = calculator.appendChild(document.createElement("input"));
	first.placeholder = "Enter first num...";
	first.type = "Number";
	var second = calculator.appendChild(document.createElement("input"));
	second.type = "Number";
	second.placeholder = "Enter second num...";
	
	sum = calculator.appendChild(document.createElement("input"));
	sum.type = "button";
	sum.value = "sum";
	sum.onclick = function()
	{
		first.value = Number(first.value) + Number (second.value);
		second.value = 0;
	};
	sub = calculator.appendChild(document.createElement("input"));
	sub.type = "button";
	sub.value = "sub";
	sub.onclick  = function()
	{
		first.value = Number(first.value) - Number (second.value);
		second.value = 0;
	};
	mul = calculator.appendChild(document.createElement("input"));
	mul.type = "button";
	mul.value = "mul";
	mul.onclick = function()
	{
		first.value = Number(first.value) * Number (second.value);
		second.value = 0;
	};
	divide = calculator.appendChild(document.createElement("input"));
	divide.type = "button";
	divide.value = "divide";
	divide.onclick = function()
	{
		first.value = Number(first.value) / Number (second.value);
		second.value= 0;
	};
};



calculator.style.visibility = "hidden";

document.body.appendChild(login);
document.body.appendChild(profile);
document.body.appendChild(calculator);